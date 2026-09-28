"""
Motor de Cripto-Linaje e Integridad SHA-256 (RF-SUI-02, ADR-0006)
Observatorio Regulatorio CRA
"""

import hashlib
import re
from pathlib import Path
from typing import Tuple


def normalize_sql_text(sql_text: str) -> str:
    """
    Normaliza el texto SQL eliminando comentarios y colapsando espacios en blanco
    para que cambios cosméticos no alteren la huella criptográfica de linaje.
    """
    # Eliminar comentarios de bloque /* ... */
    clean_sql = re.sub(r"/\*.*?\*/", "", sql_text, flags=re.DOTALL)
    # Eliminar comentarios de línea -- ...
    clean_sql = re.sub(r"--.*?$", "", clean_sql, flags=re.MULTILINE)
    # Colapsar espacios y saltos de línea
    clean_sql = re.sub(r"\s+", " ", clean_sql).strip()
    return clean_sql


def compute_query_hash(sql_text: str) -> str:
    """Calcula la huella SHA-256 canónica de la consulta SQL ejecutada."""
    normalized = normalize_sql_text(sql_text)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def compute_bytes_hash(data_bytes: bytes) -> str:
    """Calcula el checksum SHA-256 de un bloque de bytes."""
    return hashlib.sha256(data_bytes).hexdigest()


def compute_file_sha256(file_path: Path, chunk_size: int = 65536) -> str:
    """Calcula el checksum SHA-256 de un archivo en disco leyendo en streaming."""
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(chunk_size):
            hasher.update(chunk)
    return hasher.hexdigest()


def load_query_with_hash(query_path: Path) -> Tuple[str, str]:
    """Carga un archivo SQL y retorna una tupla (sql_text, query_hash_sha256)."""
    if not query_path.exists():
        raise FileNotFoundError(f"Archivo de consulta no encontrado: {query_path}")
    raw_sql = query_path.read_text(encoding="utf-8")
    query_hash = compute_query_hash(raw_sql)
    return raw_sql, query_hash
