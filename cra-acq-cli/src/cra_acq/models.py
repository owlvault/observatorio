"""
Modelos de Datos y Entidades de Control para cra-acq-cli
Observatorio Regulatorio CRA
"""

from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class BatchStatus(str, Enum):
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    PARTIAL = "PARTIAL"
    FAILED = "FAILED"


class ExecutionMode(str, Enum):
    OPERATOR_ASSISTED = "OPERATOR_ASSISTED"
    UNATTENDED_DAEMON = "UNATTENDED_DAEMON"


class IngestionBatch(BaseModel):
    batch_id: str
    source_id: str = "SUI_ORACLE"
    execution_mode: ExecutionMode = ExecutionMode.OPERATOR_ASSISTED
    operator_user_id: str
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    batch_status: BatchStatus = BatchStatus.RUNNING
    total_datasets: int = 0
    total_records: int = 0
    error_summary: Optional[str] = None


class IngestionCheckpoint(BaseModel):
    checkpoint_id: Optional[int] = None
    batch_id: str
    domain_name: str
    reporting_period: str
    last_provider_id: Optional[int] = None
    chunk_sequence: int
    records_in_chunk: int
    saved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_completed: bool = False


class RawDatasetMetadata(BaseModel):
    dataset_id: str
    batch_id: str
    source_id: str
    domain_name: str
    reporting_period: str
    query_id: str
    query_text_sha256: str
    schema_fingerprint: str
    object_storage_uri: str
    file_sha256: str
    record_count: int
    byte_size: int
    ingested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_superseded: bool = False
    custom_metadata: Dict[str, str] = Field(default_factory=dict)


class SchemaColumn(BaseModel):
    name: str
    type_name: str
    nullable: bool = True


class SchemaFingerprint(BaseModel):
    columns: List[SchemaColumn]
    fingerprint_sha256: str


class RetransmissionCheckResult(BaseModel):
    is_retransmission: bool
    is_identical: bool
    previous_dataset_id: Optional[str] = None
    previous_sha256: Optional[str] = None
    current_sha256: str
    notes: Optional[str] = None
