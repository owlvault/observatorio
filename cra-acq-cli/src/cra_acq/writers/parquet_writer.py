"""
Escritor de Archivos Apache Parquet con Metadatos Criptográficos Incrustados
Observatorio Regulatorio CRA
"""

import hashlib
from pathlib import Path
from typing import List, Tuple, Any, Dict
import pyarrow as pa
import pyarrow.parquet as pq
from ..pipeline.crypto_lineage import compute_file_sha256


def write_parquet_with_metadata(
    output_path: Path,
    column_names: List[str],
    rows: List[Tuple[Any, ...]],
    metadata_headers: Dict[str, str]
) -> Tuple[Path, int, int, str]:
    """
    Serializa los registros a Apache Parquet e incrusta los metadatos de linaje en el esquema.
    Retorna (file_path, record_count, byte_size, file_sha256).
    """
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Preparar datos columnares para PyArrow
    num_cols = len(column_names)
    col_data: Dict[str, List[Any]] = {col: [] for col in column_names}

    for row in rows:
        for i in range(num_cols):
            col_data[column_names[i]].append(row[i] if i < len(row) else None)

    # Crear tabla Arrow
    arrow_table = pa.Table.from_pydict(col_data)

    # Preparar metadatos binarios de esquema
    custom_metadata = {
        key.encode("utf-8"): str(val).encode("utf-8")
        for key, val in metadata_headers.items()
    }
    
    # Fusionar con metadatos de la tabla existente si los hubiera
    existing_meta = arrow_table.schema.metadata or {}
    existing_meta.update(custom_metadata)
    arrow_table = arrow_table.replace_schema_metadata(existing_meta)

    # Escribir Parquet comprimido con Snappy
    pq.write_table(
        arrow_table,
        output_path,
        compression="snappy",
        use_dictionary=True,
        flavor="spark"
    )

    record_count = len(rows)
    byte_size = output_path.stat().st_size
    file_sha256 = compute_file_sha256(output_path)

    return output_path, record_count, byte_size, file_sha256
