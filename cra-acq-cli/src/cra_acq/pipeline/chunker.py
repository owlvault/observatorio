"""
Gestor de Segmentación y Puntos de Control (RF-SUI-10 - Checkpointing & Resumability)
Observatorio Regulatorio CRA
"""

import json
from pathlib import Path
from typing import List, Tuple, Optional
from ..models import IngestionCheckpoint


class CheckpointManager:
    """Administra el guardado y recuperación de puntos de control locales y remotos."""
    def __init__(self, batch_id: str, state_dir: Path):
        self.batch_id = batch_id
        self.state_dir = state_dir
        self.state_dir.mkdir(parents=True, exist_ok=True)
        self.checkpoint_file = self.state_dir / f"checkpoint_{batch_id}.json"

    def save_checkpoint(
        self,
        domain_name: str,
        reporting_period: str,
        chunk_sequence: int,
        last_provider_id: Optional[int],
        records_in_chunk: int,
        is_completed: bool = False
    ) -> IngestionCheckpoint:
        """Persiste el punto de control alcanzado."""
        chk = IngestionCheckpoint(
            batch_id=self.batch_id,
            domain_name=domain_name,
            reporting_period=reporting_period,
            last_provider_id=last_provider_id,
            chunk_sequence=chunk_sequence,
            records_in_chunk=records_in_chunk,
            is_completed=is_completed
        )
        self.checkpoint_file.write_text(chk.model_dump_json(indent=2), encoding="utf-8")
        return chk

    def load_latest_checkpoint(self) -> Optional[IngestionCheckpoint]:
        """Carga el último punto de control guardado para este batch."""
        if not self.checkpoint_file.exists():
            return None
        data = json.loads(self.checkpoint_file.read_text(encoding="utf-8"))
        return IngestionCheckpoint(**data)

    def clear(self):
        """Elimina el archivo de checkpoint tras completar con éxito."""
        if self.checkpoint_file.exists():
            self.checkpoint_file.unlink()


def generate_provider_chunks(
    min_id: int, 
    max_id: int, 
    chunk_size: int = 200,
    start_from_id: Optional[int] = None
) -> List[Tuple[int, int, int]]:
    """
    Genera intervalos de prestadores (chunk_seq, min_range, max_range).
    Si start_from_id está presente, reanuda desde ese punto.
    """
    chunks: List[Tuple[int, int, int]] = []
    current_start = start_from_id + 1 if start_from_id is not None else min_id
    seq = 1

    while current_start <= max_id:
        current_end = min(current_start + chunk_size - 1, max_id)
        chunks.append((seq, current_start, current_end))
        current_start = current_end + 1
        seq += 1

    return chunks
