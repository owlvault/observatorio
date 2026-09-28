"""
Script de Diagnóstico Automatizado de Conectividad e Infraestructura para Ingeniería
Observatorio Regulatorio CRA - Verificación de Conexión SUI & OCI ADB
"""

import socket
import sys
import os
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

console = Console()

# Asegurar path de imports
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "src"))

from cra_acq.config import settings


def test_tcp_port(host: str, port: int, timeout: int = 5) -> bool:
    """Verifica apertura de socket TCP hacia el listener de la base de datos."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except Exception:
        return False


def run_diagnostics():
    console.print(Panel.fit(
        "[bold cyan]OBSERVATORIO REGULATORIO CRA — DIAGNÓSTICO DE INFRAESTRUCTURA & CONECTIVIDAD[/bold cyan]\n"
        "[dim]Herramienta de verificación pre-vuelo para Ingeniería de Sistemas y DBAs[/dim]",
        border_style="cyan"
    ))

    table = Table(title="Resultados de Verificación de Componentes", header_style="bold magenta")
    table.add_column("Componente / Enlace", style="white")
    table.add_column("Destino / Parámetro", style="dim cyan")
    table.add_column("Resultado", style="bold")
    table.add_column("Detalle Técnico / Recomendación", style="yellow")

    # 1. Enlace TCP a Oracle SUI
    sui_host = settings.sui_oracle_host
    sui_port = settings.sui_oracle_port
    sui_tcp_ok = test_tcp_port(sui_host, sui_port)
    
    if sui_tcp_ok:
        table.add_row(
            "1. Red TCP a SUI Oracle",
            f"{sui_host}:{sui_port}",
            "[green]CONECTADO[/green]",
            "Socket TCP establecido con éxito a través del túnel VPN."
        )
    else:
        table.add_row(
            "1. Red TCP a SUI Oracle",
            f"{sui_host}:{sui_port}",
            "[red]FALLO (TIMEOUT)[/red]",
            "No hay ruta de red. Verifique que la VPN site-to-person esté activa y enrutada."
        )

    # 2. Conexión de Sesión a Oracle SUI
    oracle_session_ok = False
    oracle_err = "No evaluado por falta de red TCP"
    if sui_tcp_ok:
        try:
            import oracledb
            user = os.getenv("SUI_ORACLE_USER", "<USUARIO_SUI>")
            pwd = os.getenv("SUI_ORACLE_PASSWORD", "")
            if not pwd:
                oracle_err = "Variable SUI_ORACLE_PASSWORD no configurada en entorno"
            else:
                dsn = f"{sui_host}:{sui_port}/{settings.sui_oracle_service}"
                with oracledb.connect(user=user, password=pwd, dsn=dsn) as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT banner FROM v$version WHERE ROWNUM = 1")
                        row = cur.fetchone()
                        oracle_session_ok = True
                        oracle_err = f"Autenticado: {row[0] if row else 'Oracle DB'}"
        except Exception as e:
            oracle_err = f"Fallo ORA: {str(e)}"

    if oracle_session_ok:
        table.add_row("2. Sesión Oracle SUI", user, "[green]AUTENTICADO[/green]", oracle_err)
    else:
        table.add_row("2. Sesión Oracle SUI", "Credencial SUI", "[red]NO AUTENTICADO[/red]", oracle_err)

    # 3. Verificación de Tablas Maestras en SUI
    tables_to_check = [
        "SUI_AAA.EMPRESAS_PRESTADORAS",
        "SUI_AAA.AREAS_PRESTACION_SERVICIO",
        "SUI_AAA.CAR_BALANCE_HIDRICO",
        "SUI_AAA.CAR_COMERCIAL_RESUMEN"
    ]
    if oracle_session_ok:
        try:
            with conn.cursor() as cur:
                visible = []
                for tbl in tables_to_check:
                    try:
                        cur.execute(f"SELECT 1 FROM {tbl} WHERE ROWNUM = 1")
                        visible.append(tbl)
                    except Exception:
                        pass
                if len(visible) == len(tables_to_check):
                    table.add_row("3. Catálogo Físico SUI", f"{len(visible)}/{len(tables_to_check)} tablas", "[green]COMPLETO[/green]", "Tablas operativas accesibles en modo lectura.")
                else:
                    table.add_row("3. Catálogo Físico SUI", f"{len(visible)}/{len(tables_to_check)} tablas", "[yellow]PARCIAL[/yellow]", f"Solo se observan: {', '.join(visible)}")
        except Exception as e:
            table.add_row("3. Catálogo Físico SUI", "Consulta", "[red]ERROR[/red]", str(e))
    else:
        table.add_row("3. Catálogo Físico SUI", "N/A", "[dim]OMITIDO[/dim]", "Requiere autenticación previa en SUI.")

    # 4. Verificación de Autonomous Database (ADB) - Esquema raw_control
    adb_ok = False
    adb_msg = ""
    try:
        import oracledb
        wallet_loc = os.getenv("TNS_ADMIN")
        adb_user = settings.adb_user
        adb_pwd = os.getenv("ADB_PASSWORD", "")
        if not wallet_loc or not Path(wallet_loc).exists():
            adb_msg = "Directorio TNS_ADMIN (Wallet) no configurado o no existe."
        elif not adb_pwd:
            adb_msg = "ADB_PASSWORD no definida en entorno."
        else:
            with oracledb.connect(user=adb_user, password=adb_pwd, dsn=settings.adb_tns_name, config_dir=wallet_loc, wallet_location=wallet_loc) as conn_adb:
                with conn_adb.cursor() as cur_adb:
                    cur_adb.execute("SELECT table_name FROM user_tables")
                    adb_tables = {r[0] for r in cur_adb.fetchall()}
                    expected_tables = {"INGESTION_SOURCE", "INGESTION_BATCH", "INGESTION_CHECKPOINT", "RAW_DATASET", "RAW_CHANGE_LOG"}
                    missing = expected_tables - adb_tables
                    if not missing:
                        adb_ok = True
                        adb_msg = "Esquema raw_control desplegado con las 5 tablas de control operativas."
                    else:
                        adb_msg = f"Faltan tablas por desplegar: {', '.join(missing)}"
    except Exception as e:
        adb_msg = f"Fallo al conectar a ADB: {str(e)}"

    if adb_ok:
        table.add_row("4. OCI Autonomous DB", f"{settings.adb_user}@{settings.adb_tns_name}", "[green]OPERATIVO[/green]", adb_msg)
    else:
        table.add_row("4. OCI Autonomous DB", settings.adb_tns_name, "[red]INCOMPLETO[/red]", adb_msg)

    # 5. Verificación de OCI Object Storage
    oci_ok = False
    oci_msg = ""
    config_file = Path(settings.oci_config_file).expanduser()
    if config_file.exists():
        try:
            import oci
            config = oci.config.from_file(file_location=str(config_file), profile_name=settings.oci_profile)
            client = oci.object_storage.ObjectStorageClient(config)
            ns = client.get_namespace().data
            b_info = client.get_bucket(namespace_name=ns, bucket_name=settings.oci_bucket_name).data
            oci_ok = True
            oci_msg = f"Namespace: {ns} | Bucket: {b_info.name} | Tier: {b_info.storage_tier}"
        except Exception as e:
            oci_msg = f"Fallo OCI API: {str(e)}"
    else:
        oci_msg = f"Archivo de configuración {settings.oci_config_file} no encontrado (Modo Local Staging activo)."

    if oci_ok:
        table.add_row("5. OCI Object Storage", settings.oci_bucket_name, "[green]CONECTADO[/green]", oci_msg)
    else:
        table.add_row("5. OCI Object Storage", settings.oci_bucket_name, "[yellow]FALLBACK LOCAL[/yellow]", oci_msg)

    console.print(table)
    console.print("\n[dim]Ejecute este script periódicamente en la estación antes de cada ciclo mensual de ingesta.[/dim]")


if __name__ == "__main__":
    run_diagnostics()
