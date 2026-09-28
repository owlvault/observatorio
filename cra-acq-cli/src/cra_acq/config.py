"""
Módulo de Configuración Global de cra-acq-cli
Observatorio Regulatorio CRA
"""

import os
from pathlib import Path
from pydantic import BaseModel, Field

# Rutas base
PACKAGE_DIR = Path(__file__).resolve().parent.parent.parent
QUERIES_DIR = PACKAGE_DIR / "queries" / "sui"
DEFAULT_STORAGE_DIR = PACKAGE_DIR / "storage_local_raw"


class Settings(BaseModel):
    # OCI Configuration
    oci_bucket_name: str = Field(default="cra-observatorio-raw")
    oci_compartment_id: str = Field(default="cmp-observatorio-regulatorio")
    oci_config_file: str = Field(default="~/.oci/config")
    oci_profile: str = Field(default="DEFAULT")
    
    # Oracle SUI Configuration
    sui_oracle_host: str = Field(default=os.getenv("SUI_ORACLE_HOST", "sui.sspd.gov.co"))
    sui_oracle_port: int = Field(default=int(os.getenv("SUI_ORACLE_PORT", "1521")))
    sui_oracle_service: str = Field(default=os.getenv("SUI_ORACLE_SERVICE", "<SERVICIO_SUI>"))
    sui_oracle_arraysize: int = Field(default=5000)
    
    # Autonomous Database (raw_control) Configuration
    adb_tns_name: str = Field(default=os.getenv("ADB_TNS_NAME", "cra_observatorio_high"))
    adb_user: str = Field(default=os.getenv("ADB_USER", "raw_control"))
    
    # Operational chunking defaults
    default_chunk_provider_size: int = Field(default=200)
    max_vpn_session_hours: int = Field(default=4)
    storage_local_dir: Path = Field(default=DEFAULT_STORAGE_DIR)


# Catálogo de mapeo de Dominios a Archivos SQL
DOMAIN_QUERY_MAP = {
    "CATASTRO_PRESTADORES_APS": "SUI_EXT_01_PRESTADORES_APS.sql",
    "BALANCE_HIDRICO": "SUI_EXT_02_BALANCE_HIDRICO.sql",
    "COMERCIAL_SUSCRIPTORES": "SUI_EXT_03_COMERCIAL_SUSCRIPTORES.sql",
    "CALIDAD_AGUA": "SUI_EXT_04_CALIDAD_AGUA.sql",
}

settings = Settings()
