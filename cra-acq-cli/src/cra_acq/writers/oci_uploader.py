"""
Publicador y Cargador a OCI Object Storage (Zona Cruda Inmutable)
Observatorio Regulatorio CRA
"""

import os
from pathlib import Path
from typing import Dict, Optional
from ..config import settings


class OCIObjectStorageUploader:
    """Administra la subida segura de archivos Parquet al Bucket de la zona cruda en OCI."""
    def __init__(self, bucket_name: Optional[str] = None):
        self.bucket_name = bucket_name or settings.oci_bucket_name
        self._client = None
        self._is_mock = False
        self._init_client()

    def _init_client(self):
        """Inicializa el cliente OCI si existe configuración; de lo contrario activa modo local/fallback."""
        config_path = Path(settings.oci_config_file).expanduser()
        if config_path.exists():
            try:
                import oci
                config = oci.config.from_file(file_location=str(config_path), profile_name=settings.oci_profile)
                self._client = oci.object_storage.ObjectStorageClient(config)
                self._namespace = self._client.get_namespace().data
                return
            except Exception:
                pass
        
        # Modo Fallback / Local Staging
        self._is_mock = True

    def upload_file(
        self,
        local_file: Path,
        object_name: str,
        metadata_headers: Dict[str, str]
    ) -> str:
        """
        Sube un archivo Parquet a OCI Object Storage con cabeceras de metadatos opc-meta-*.
        Retorna la URI del objeto.
        """
        if not self._is_mock and self._client:
            import oci
            # OCI requiere que las cabeceras personalizadas no lleven el prefijo opc-meta- en el dict
            oci_meta = {
                k.replace("opc-meta-", ""): v 
                for k, v in metadata_headers.items()
            }
            with open(local_file, "rb") as f:
                self._client.put_object(
                    namespace_name=self._namespace,
                    bucket_name=self.bucket_name,
                    object_name=object_name,
                    put_object_body=f,
                    opc_meta=oci_meta
                )
            return f"oci://{self.bucket_name}@{self._namespace}/{object_name}"
        else:
            # Modo Local Staging: Simula almacenamiento inmutable localmente
            target_path = settings.storage_local_dir / object_name
            target_path.parent.mkdir(parents=True, exist_ok=True)
            import shutil
            shutil.copy2(local_file, target_path)
            return f"file://{target_path.resolve()}"
