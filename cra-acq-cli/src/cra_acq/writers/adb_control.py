"""
Repositorio y Controlador del Esquema raw_control en Autonomous Database (ADB)
Observatorio Regulatorio CRA
"""

import json
from pathlib import Path
from typing import Optional, Dict, Any
from ..models import (
    IngestionBatch, 
    IngestionCheckpoint, 
    RawDatasetMetadata, 
    RetransmissionCheckResult,
    BatchStatus
)
from ..config import settings


class ADBControlRepository:
    """Administra el registro de auditoría, lotes y datasets en el esquema raw_control."""
    def __init__(self, connection=None, local_audit_dir: Optional[Path] = None):
        self.conn = connection
        self.local_audit_dir = local_audit_dir or (settings.storage_local_dir / "audit_log")
        self.local_audit_dir.mkdir(parents=True, exist_ok=True)
        self.datasets_index_file = self.local_audit_dir / "raw_datasets_index.json"
        self._init_local_index()

    def _init_local_index(self):
        if not self.datasets_index_file.exists():
            self.datasets_index_file.write_text("{}", encoding="utf-8")

    def _read_local_index(self) -> Dict[str, Any]:
        return json.loads(self.datasets_index_file.read_text(encoding="utf-8"))

    def _write_local_index(self, data: Dict[str, Any]):
        self.datasets_index_file.write_text(json.dumps(data, indent=2), encoding="utf-8")

    def create_batch(self, batch: IngestionBatch):
        """Registra un nuevo lote de ingesta."""
        if self.conn:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO raw_control.ingestion_batch 
                    (batch_id, source_id, execution_mode, operator_user_id, started_at, batch_status)
                    VALUES (:1, :2, :3, :4, :5, :6)
                """, (
                    batch.batch_id, batch.source_id, batch.execution_mode.value,
                    batch.operator_user_id, batch.started_at, batch.batch_status.value
                ))
                self.conn.commit()
        else:
            # Registro local
            batch_file = self.local_audit_dir / f"batch_{batch.batch_id}.json"
            batch_file.write_text(batch.model_dump_json(indent=2), encoding="utf-8")

    def update_batch(self, batch_id: str, status: BatchStatus, total_records: int, error_summary: Optional[str] = None):
        """Actualiza el estado de finalización del lote."""
        if self.conn:
            with self.conn.cursor() as cur:
                cur.execute("""
                    UPDATE raw_control.ingestion_batch 
                    SET batch_status = :1, completed_at = CURRENT_TIMESTAMP, 
                        total_records = :2, error_summary = :3
                    WHERE batch_id = :4
                """, (status.value, total_records, error_summary, batch_id))
                self.conn.commit()
        else:
            batch_file = self.local_audit_dir / f"batch_{batch_id}.json"
            if batch_file.exists():
                batch_data = json.loads(batch_file.read_text(encoding="utf-8"))
                batch_data["batch_status"] = status.value
                batch_data["total_records"] = total_records
                batch_data["error_summary"] = error_summary
                batch_file.write_text(json.dumps(batch_data, indent=2), encoding="utf-8")

    def record_raw_dataset(self, dataset: RawDatasetMetadata):
        """Registra un dataset Parquet inmutable y actualiza el índice."""
        if self.conn:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO raw_control.raw_dataset
                    (dataset_id, batch_id, source_id, domain_name, reporting_period,
                     query_id, query_text_sha256, schema_fingerprint, object_storage_uri,
                     file_sha256, record_count, byte_size, is_superseded)
                    VALUES (:1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12, :13)
                """, (
                    dataset.dataset_id, dataset.batch_id, dataset.source_id, dataset.domain_name,
                    dataset.reporting_period, dataset.query_id, dataset.query_text_sha256,
                    dataset.schema_fingerprint, dataset.object_storage_uri, dataset.file_sha256,
                    dataset.record_count, dataset.byte_size, int(dataset.is_superseded)
                ))
                self.conn.commit()

        # Mantener índice local para verificación rápida de retransmisiones
        idx = self._read_local_index()
        key = f"{dataset.source_id}_{dataset.domain_name}_{dataset.reporting_period}"
        idx[key] = {
            "dataset_id": dataset.dataset_id,
            "file_sha256": dataset.file_sha256,
            "record_count": dataset.record_count,
            "uri": dataset.object_storage_uri
        }
        self._write_local_index(idx)

    def check_retransmission(self, source_id: str, domain_name: str, reporting_period: str, current_sha256: str) -> RetransmissionCheckResult:
        """
        Compara la huella SHA-256 del nuevo dataset contra el último activo del mismo periodo.
        Detecta si es una carga idéntica o una retransmisión de datos rectificados.
        """
        idx = self._read_local_index()
        key = f"{source_id}_{domain_name}_{reporting_period}"
        
        if key not in idx:
            return RetransmissionCheckResult(
                is_retransmission=False,
                is_identical=False,
                current_sha256=current_sha256,
                notes="Carga inicial para este periodo."
            )

        prev = idx[key]
        if prev["file_sha256"] == current_sha256:
            return RetransmissionCheckResult(
                is_retransmission=False,
                is_identical=True,
                previous_dataset_id=prev["dataset_id"],
                previous_sha256=prev["file_sha256"],
                current_sha256=current_sha256,
                notes="Ingesta sin cambios detectada. Datos idénticos."
            )
        else:
            return RetransmissionCheckResult(
                is_retransmission=True,
                is_identical=False,
                previous_dataset_id=prev["dataset_id"],
                previous_sha256=prev["file_sha256"],
                current_sha256=current_sha256,
                notes=f"Retransmisión detectada: el hash cambió respecto al dataset {prev['dataset_id']}."
            )
