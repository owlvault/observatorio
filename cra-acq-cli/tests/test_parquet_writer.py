"""
Pruebas Unitarias: Escritura Parquet con Metadatos Criptográficos Incrustados
"""

import pyarrow.parquet as pq
from cra_acq.writers.parquet_writer import write_parquet_with_metadata


def test_write_parquet_with_metadata(tmp_path):
    output_file = tmp_path / "test_chunk.parquet"
    columns = ["PROVIDER_ID", "WATER_PRODUCED_M3", "WATER_BILLED_M3"]
    rows = [
        (101, 1000.50, 680.20),
        (102, 2500.00, 1800.00),
    ]
    meta = {
        "opc-meta-query-hash": "abcd1234efgh5678",
        "opc-meta-operator": "test_operator",
        "opc-meta-period": "2026-08"
    }

    fpath, rec_count, byte_sz, sha256 = write_parquet_with_metadata(
        output_path=output_file,
        column_names=columns,
        rows=rows,
        metadata_headers=meta
    )

    assert fpath.exists()
    assert rec_count == 2
    assert byte_sz > 0
    assert len(sha256) == 64

    # Validar lectura con PyArrow y presencia de metadatos incrustados
    table = pq.read_table(output_file)
    assert len(table) == 2
    assert table.column_names == columns
    
    file_meta = table.schema.metadata
    assert b"opc-meta-query-hash" in file_meta
    assert file_meta[b"opc-meta-query-hash"] == b"abcd1234efgh5678"
    assert file_meta[b"opc-meta-operator"] == b"test_operator"
