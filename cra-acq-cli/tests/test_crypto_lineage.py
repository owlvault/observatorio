"""
Pruebas Unitarias: Motor de Cripto-Linaje (RF-SUI-02)
"""

from cra_acq.pipeline.crypto_lineage import normalize_sql_text, compute_query_hash, compute_bytes_hash


def test_normalize_sql_ignores_comments_and_whitespace():
    sql1 = """
    -- Consulta de prueba
    SELECT id, nombre /* comentario */
    FROM tabla
    WHERE activo = 1
    """
    sql2 = "SELECT id, nombre FROM tabla WHERE activo = 1"
    
    assert normalize_sql_text(sql1) == normalize_sql_text(sql2)
    assert compute_query_hash(sql1) == compute_query_hash(sql2)


def test_bytes_hash_stability():
    payload = b"TEST_OBSERVATORIO_CRA_DATA"
    h1 = compute_bytes_hash(payload)
    h2 = compute_bytes_hash(payload)
    assert h1 == h2
    assert len(h1) == 64
