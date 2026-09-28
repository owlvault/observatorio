"""
Sanitizador de Privacidad y Supresión Temprana de PII (RN-SUI-04)
Observatorio Regulatorio CRA
"""

import re
from typing import List, Dict, Any, Tuple

# Patrones de columnas restringidas que contienen datos personales o sensibles de ciudadanos
RESTRICTED_COLUMN_PATTERNS = [
    r"^CEDULA.*",
    r".*DOCUMENTO_IDENTIDAD.*",
    r".*NOMBRE_SUSCRIPTOR.*",
    r".*NOMBRE_USUARIO.*",
    r".*DIRECCION_PREDIO.*",
    r".*DIRECCION_SUSCRIPTOR.*",
    r".*TELEFONO.*",
    r".*CELULAR.*",
    r".*CORREO.*",
    r".*EMAIL.*",
    r"^NUIS$",             # Número Único de Identificación de Suscriptor individual
    r".*CHIP_CATASTRAL.*",
    r".*MATRICULA_INMOBILIARIA.*",
]


def is_restricted_column(column_name: str) -> bool:
    """Verifica si el nombre de una columna coincide con patrones de datos personales regulados."""
    norm_name = column_name.strip().upper()
    for pattern in RESTRICTED_COLUMN_PATTERNS:
        if re.match(pattern, norm_name):
            return True
    return False


def sanitize_batch_records(
    column_names: List[str], 
    rows: List[Tuple[Any, ...]]
) -> Tuple[List[str], List[Tuple[Any, ...]], int]:
    """
    Filtra en memoria cualquier columna que contenga datos sensibles no regulatorios.
    Retorna (clean_column_names, clean_rows, num_sanitized_columns).
    """
    clean_indices: List[int] = []
    clean_columns: List[str] = []
    suppressed_count = 0

    for idx, col in enumerate(column_names):
        if is_restricted_column(col):
            suppressed_count += 1
        else:
            clean_indices.append(idx)
            clean_columns.append(col)

    if suppressed_count == 0:
        return column_names, rows, 0

    clean_rows: List[Tuple[Any, ...]] = []
    for row in rows:
        clean_row = tuple(row[i] for i in clean_indices)
        clean_rows.append(clean_row)

    return clean_columns, clean_rows, suppressed_count
