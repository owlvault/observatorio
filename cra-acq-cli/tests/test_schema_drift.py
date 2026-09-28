"""
Pruebas Unitarias: Detección de Variación de Esquema (RF-SUI-06)
"""

from cra_acq.pipeline.schema_drift import extract_schema_fingerprint, compare_schemas


def test_schema_drift_detection():
    # Esquema inicial (esperado)
    desc_base = [
        ("PROVIDER_ID", "NUMBER", None, None, None, None, False),
        ("WATER_PRODUCED_M3", "NUMBER", None, None, None, None, True),
        ("WATER_BILLED_M3", "NUMBER", None, None, None, None, True),
    ]
    fp_base = extract_schema_fingerprint(desc_base)

    # Caso 1: Esquema idéntico
    is_same, diffs = compare_schemas(fp_base, fp_base)
    assert is_same is True
    assert len(diffs) == 0

    # Caso 2: El SUI agregó una columna nueva (DRIFT)
    desc_drift_add = desc_base + [("COLUMNA_NUEVA_SUI", "VARCHAR2", None, None, None, None, True)]
    fp_drift = extract_schema_fingerprint(desc_drift_add)
    
    is_same, diffs = compare_schemas(fp_drift, fp_base)
    assert is_same is False
    assert any("COLUMNA_NUEVA" in d for d in diffs)

    # Caso 3: El SUI eliminó una columna
    desc_drift_del = desc_base[:2]
    fp_drift_del = extract_schema_fingerprint(desc_drift_del)
    is_same, diffs = compare_schemas(fp_drift_del, fp_base)
    assert is_same is False
    assert any("COLUMNA_ELIMINADA" in d for d in diffs)
