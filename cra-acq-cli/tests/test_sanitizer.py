"""
Pruebas Unitarias: Sanitizador de Datos Personales (RN-SUI-04)
"""

from cra_acq.pipeline.sanitizer import sanitize_batch_records, is_restricted_column


def test_restricted_column_matching():
    assert is_restricted_column("CEDULA_SUSCRIPTOR") is True
    assert is_restricted_column("DIRECCION_PREDIO") is True
    assert is_restricted_column("NUIS") is True
    assert is_restricted_column("TELEFONO_CONTACTO") is True
    assert is_restricted_column("PROVIDER_ID") is False
    assert is_restricted_column("WATER_PRODUCED_M3") is False


def test_sanitize_batch_records_removes_sensitive_data():
    columns = ["PROVIDER_ID", "NOMBRE_SUSCRIPTOR", "CEDULA", "WATER_BILLED_M3"]
    rows = [
        (101, "Juan Perez", "10203040", 45.5),
        (102, "Maria Gomez", "50607080", 12.0),
    ]

    clean_cols, clean_rows, scrubbed = sanitize_batch_records(columns, rows)

    assert scrubbed == 2
    assert clean_cols == ["PROVIDER_ID", "WATER_BILLED_M3"]
    assert len(clean_rows) == 2
    assert clean_rows[0] == (101, 45.5)
    assert clean_rows[1] == (102, 12.0)
