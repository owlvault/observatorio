"""
Detector de Variación de Esquema Físico (Schema Drift Detector - RF-SUI-06)
Observatorio Regulatorio CRA
"""

import hashlib
import json
from typing import List, Tuple, Dict, Any
from ..models import SchemaColumn, SchemaFingerprint


def extract_schema_fingerprint(cursor_description: List[Any]) -> SchemaFingerprint:
    """
    Extrae la firma estructural de columnas a partir de cursor.description de Oracle.
    cursor_description retorna tuplas: (name, type, display_size, internal_size, precision, scale, null_ok)
    """
    columns: List[SchemaColumn] = []
    sig_elements: List[str] = []

    for col in cursor_description:
        col_name = str(col[0]).upper()
        # En oracledb o cx_Oracle, col[1] es el tipo de dato
        type_name = getattr(col[1], "__name__", str(col[1]))
        null_ok = bool(col[6]) if len(col) > 6 else True

        columns.append(SchemaColumn(name=col_name, type_name=type_name, nullable=null_ok))
        sig_elements.append(f"{col_name}:{type_name}:{int(null_ok)}")

    canonical_str = ";".join(sig_elements)
    fingerprint = hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

    return SchemaFingerprint(columns=columns, fingerprint_sha256=fingerprint)


def compare_schemas(
    current: SchemaFingerprint, 
    expected: SchemaFingerprint
) -> Tuple[bool, List[str]]:
    """
    Compara dos firmas de esquema.
    Retorna (is_identical, lista_de_diferencias).
    """
    if current.fingerprint_sha256 == expected.fingerprint_sha256:
        return True, []

    differences: List[str] = []
    curr_map: Dict[str, SchemaColumn] = {c.name: c for c in current.columns}
    exp_map: Dict[str, SchemaColumn] = {c.name: c for c in expected.columns}

    # Columnas agregadas
    for name in curr_map:
        if name not in exp_map:
            differences.append(f"COLUMNA_NUEVA: '{name}' (tipo {curr_map[name].type_name})")

    # Columnas eliminadas
    for name in exp_map:
        if name not in curr_map:
            differences.append(f"COLUMNA_ELIMINADA: '{name}'")

    # Columnas con cambio de tipo
    for name in curr_map:
        if name in exp_map and curr_map[name].type_name != exp_map[name].type_name:
            differences.append(
                f"CAMBIO_TIPO: '{name}' era {exp_map[name].type_name} -> ahora {curr_map[name].type_name}"
            )

    return False, differences
