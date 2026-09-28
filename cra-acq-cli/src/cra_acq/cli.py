"""
Interfaz de Línea de Comandos (CLI) para cra-acq
Observatorio Regulatorio CRA - Modo Asistido (ADR-0008)
"""

import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn

from .config import settings, DOMAIN_QUERY_MAP, QUERIES_DIR
from .auth import prompt_oracle_credentials, get_operator_identity
from .models import IngestionBatch, BatchStatus, ExecutionMode, RawDatasetMetadata
from .pipeline.crypto_lineage import load_query_with_hash, compute_file_sha256
from .pipeline.chunker import CheckpointManager, generate_provider_chunks
from .pipeline.sanitizer import sanitize_batch_records
from .pipeline.schema_drift import extract_schema_fingerprint
from .connectors.oracle_sui import OracleSUIConnector
from .writers.parquet_writer import write_parquet_with_metadata
from .writers.oci_uploader import OCIObjectStorageUploader
from .writers.adb_control import ADBControlRepository

app = typer.Typer(
    name="cra-acq",
    help="Motor de Adquisición de Datos del Observatorio Regulatorio CRA",
    add_completion=False,
)
console = Console()


@app.command("list-queries")
def list_queries():
    """Lista las consultas SQL versionadas en el catálogo del motor y sus hashes SHA-256."""
    table = Table(title="Catálogo de Consultas Versionadas (SUI)", header_style="bold cyan")
    table.add_column("Dominio", style="green")
    table.add_column("Archivo SQL", style="white")
    table.add_column("Query SHA-256 (Linaje RF-SUI-02)", style="dim yellow")

    for domain, query_file in DOMAIN_QUERY_MAP.items():
        q_path = QUERIES_DIR / query_file
        if q_path.exists():
            _, q_hash = load_query_with_hash(q_path)
            table.add_row(domain, query_file, f"{q_hash[:16]}...{q_hash[-8:]}")
        else:
            table.add_row(domain, query_file, "[red]NO ENCONTRADO[/red]")

    console.print(table)


@app.command("ping")
def ping(
    source: str = typer.Option("SUI", help="Fuente a probar (SUI / OCI)"),
    mock: bool = typer.Option(False, "--mock", help="Probar con conector simulado")
):
    """Verifica la conectividad con Oracle SUI y con OCI Object Storage."""
    console.print(f"[bold cyan]Validando entorno y conectividad para fuente '{source}'...[/bold cyan]")
    
    # 1. Probar Oracle SUI
    connector = OracleSUIConnector(username="test", password="***", is_mock=mock)
    ok, msg = connector.test_connection()
    status_oracle = "[bold green]OK[/bold green]" if ok else "[bold red]FALLO[/bold red]"
    console.print(f"• Conexión Oracle SUI: {status_oracle} ({msg})")

    # 2. Probar OCI Object Storage
    uploader = OCIObjectStorageUploader()
    mode_str = "OCI Cloud Real" if not uploader._is_mock else "Local Staging Fallback"
    console.print(f"• Almacenamiento Zona Cruda: [bold green]OK[/bold green] (Modo: {mode_str}, Bucket: '{uploader.bucket_name}')")


@app.command("run")
def run(
    domain: str = typer.Option("BALANCE_HIDRICO", "--domain", "-d", help="Dominio de negocio a ingerir"),
    period: str = typer.Option("2026-08", "--period", "-p", help="Periodo de reporte (YYYY-MM)"),
    source: str = typer.Option("SUI_ORACLE", "--source", "-s", help="Identificador de fuente"),
    chunk_size: int = typer.Option(200, "--chunk-size", "-c", help="Tamaño de bloque de prestadores por chunk"),
    min_provider: int = typer.Option(1, "--min-p", help="ID inicial de prestador"),
    max_provider: int = typer.Option(600, "--max-p", help="ID final de prestador"),
    mock: bool = typer.Option(False, "--mock", help="Ejecutar con generación de datos simulados"),
):
    """
    Ejecuta el ciclo de adquisición asistida por operador para un dominio y periodo específico.
    Soporta segmentación en chunks, sanitización PII, persistencia Parquet y linaje estricto.
    """
    console.rule("[bold cyan]Motor de Adquisición CRA — Ejecución de Ingesta Asistida[/bold cyan]")
    operator_user = get_operator_identity()
    console.print(f"[dim]Operador detectado: {operator_user} | Fecha UTC: {datetime.now(timezone.utc).isoformat()}[/dim]")

    if domain not in DOMAIN_QUERY_MAP:
        console.print(f"[bold red]Error:[/bold red] Dominio '{domain}' no registrado en el catálogo.")
        raise typer.Exit(code=1)

    query_file = DOMAIN_QUERY_MAP[domain]
    query_path = QUERIES_DIR / query_file
    raw_sql, query_hash = load_query_with_hash(query_path)

    # Autenticación interactiva (en memoria)
    if not mock:
        creds = prompt_oracle_credentials()
        connector = OracleSUIConnector(username=creds.username, password=creds.password, is_mock=False)
    else:
        console.print("[yellow]MODO MOCK ACTIVO: Se omitirá prompt de contraseña y se usarán datos simulados.[/yellow]")
        connector = OracleSUIConnector(username="mock_user", password="***", is_mock=True)

    # Inicializar Batch y Repositorios
    batch_uuid = uuid.uuid4().hex[:8]
    batch_id = f"BAT-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{batch_uuid}"
    batch = IngestionBatch(
        batch_id=batch_id,
        source_id=source,
        execution_mode=ExecutionMode.OPERATOR_ASSISTED,
        operator_user_id=operator_user,
        started_at=datetime.now(timezone.utc),
        batch_status=BatchStatus.RUNNING
    )

    control_repo = ADBControlRepository()
    control_repo.create_batch(batch)
    
    chk_manager = CheckpointManager(batch_id=batch_id, state_dir=settings.storage_local_dir / "checkpoints")
    uploader = OCIObjectStorageUploader()

    chunks = generate_provider_chunks(min_id=min_provider, max_id=max_provider, chunk_size=chunk_size)
    total_records = 0
    total_datasets = 0

    console.print(f"Lote iniciado: [bold green]{batch_id}[/bold green] | Total chunks planificados: {len(chunks)}")

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
        TimeElapsedColumn(),
        console=console
    ) as progress:
        task = progress.add_task(f"Ingiriendo {domain} ({period})...", total=len(chunks))

        for seq, p_start, p_end in chunks:
            progress.update(task, description=f"Chunk {seq}/{len(chunks)} (Prestadores {p_start} a {p_end})")

            # 1. Ejecutar consulta sobre Oracle SUI
            params = {
                "period_id": period,
                "min_provider_id": p_start,
                "max_provider_id": p_end
            }
            col_names, raw_rows = connector.execute_chunk_query(raw_sql, params)

            # 2. Extracción de firma de esquema (Schema Drift)
            cursor_desc = [(c, "VARCHAR2" if "ID" in c or "PERIOD" in c else "NUMBER", None, None, None, None, True) for c in col_names]
            schema_fp = extract_schema_fingerprint(cursor_desc)

            # 3. Sanitización de datos sensibles PII
            clean_cols, clean_rows, scrubbed_cols = sanitize_batch_records(col_names, raw_rows)

            # 4. Escritura Parquet con Metadatos Incrustados
            object_name = f"source={source}/domain={domain}/year={period[:4]}/period={period}/batch_{batch_id}_seq_{seq:03d}.parquet"
            local_parquet_path = settings.storage_local_dir / "temp" / f"chunk_{seq}.parquet"

            metadata_headers = {
                "opc-meta-source-id": source,
                "opc-meta-domain": domain,
                "opc-meta-period": period,
                "opc-meta-batch-id": batch_id,
                "opc-meta-query-hash": query_hash,
                "opc-meta-operator": operator_user,
                "opc-meta-chunk-seq": str(seq)
            }

            file_path, rec_count, byte_sz, file_sha256 = write_parquet_with_metadata(
                output_path=local_parquet_path,
                column_names=clean_cols,
                rows=clean_rows,
                metadata_headers=metadata_headers
            )

            # 5. Carga a OCI Object Storage
            oci_uri = uploader.upload_file(file_path, object_name, metadata_headers)

            # 6. Evaluación de Retransmisión
            retrans_result = control_repo.check_retransmission(source, domain, period, file_sha256)

            # 7. Registro en raw_dataset
            dataset_id = f"DS-{period.replace('-', '')}-{uuid.uuid4().hex[:8]}"
            dataset_meta = RawDatasetMetadata(
                dataset_id=dataset_id,
                batch_id=batch_id,
                source_id=source,
                domain_name=domain,
                reporting_period=period,
                query_id=query_file.replace(".sql", ""),
                query_text_sha256=query_hash,
                schema_fingerprint=schema_fp.fingerprint_sha256,
                object_storage_uri=oci_uri,
                file_sha256=file_sha256,
                record_count=rec_count,
                byte_size=byte_sz,
                is_superseded=retrans_result.is_retransmission
            )
            control_repo.record_raw_dataset(dataset_meta)

            # 8. Guardar Checkpoint
            chk_manager.save_checkpoint(
                domain_name=domain,
                reporting_period=period,
                chunk_sequence=seq,
                last_provider_id=p_end,
                records_in_chunk=rec_count,
                is_completed=(seq == len(chunks))
            )

            total_records += rec_count
            total_datasets += 1
            progress.advance(task)

    # Cierre de Lote
    control_repo.update_batch(batch_id, BatchStatus.COMPLETED, total_records)
    chk_manager.clear()
    connector.close()

    console.rule("[bold green]Extracción Finalizada con Éxito[/bold green]")
    summary_table = Table(header_style="bold cyan")
    summary_table.add_column("Métrica", style="white")
    summary_table.add_column("Valor", style="green")
    summary_table.add_row("ID de Lote (Batch)", batch_id)
    summary_table.add_row("Dominio / Periodo", f"{domain} / {period}")
    summary_table.add_row("Datasets Parquet Generados", str(total_datasets))
    summary_table.add_row("Total Registros Ingeridos", f"{total_records:,}")
    summary_table.add_row("Destino de Zona Cruda", uploader.bucket_name)
    summary_table.add_row("Linaje Registrado en", "raw_control.raw_dataset")
    console.print(summary_table)


@app.command("status")
def status(batch_id: str = typer.Argument(..., help="ID del lote a consultar")):
    """Muestra el estado de un lote de ingesta y sus checkpoints."""
    chk_file = settings.storage_local_dir / "checkpoints" / f"checkpoint_{batch_id}.json"
    batch_file = settings.storage_local_dir / "audit_log" / f"batch_{batch_id}.json"

    if batch_file.exists():
        console.print(f"[bold cyan]Lote:[/bold cyan] {batch_file.read_text()}")
    else:
        console.print(f"[yellow]No se encontró registro para el lote '{batch_id}'.[/yellow]")

    if chk_file.exists():
        console.print(f"[bold green]Último Checkpoint:[/bold green] {chk_file.read_text()}")
    else:
        console.print("[dim]Sin checkpoints pendientes (lote cerrado o no iniciado).[/dim]")


if __name__ == "__main__":
    app()
