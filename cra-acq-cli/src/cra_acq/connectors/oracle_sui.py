"""
Conector Seguro a la Base Oracle del SUI (SSPD)
Observatorio Regulatorio CRA
"""

import time
from typing import List, Tuple, Any, Optional, Dict
from ..config import settings


class OracleSUIConnector:
    """Administra la conexión y ejecución segura de consultas sobre la base Oracle del SUI."""
    def __init__(
        self,
        username: str,
        password: str,
        host: Optional[str] = None,
        port: Optional[int] = None,
        service_name: Optional[str] = None,
        is_mock: bool = False
    ):
        self.username = username
        self.password = password
        self.host = host or settings.sui_oracle_host
        self.port = port or settings.sui_oracle_port
        self.service_name = service_name or settings.sui_oracle_service
        self.is_mock = is_mock
        self._connection = None

    def connect(self):
        """Establece conexión con el listener Oracle vía VPN."""
        if self.is_mock:
            return self

        import oracledb
        dsn = f"{self.host}:{self.port}/{self.service_name}"
        # Modo thin nativo de oracledb no requiere Oracle Instant Client instalado
        self._connection = oracledb.connect(
            user=self.username,
            password=self.password,
            dsn=dsn
        )
        return self

    def test_connection(self) -> Tuple[bool, str]:
        """Prueba de conectividad física con el servidor de la SSPD."""
        if self.is_mock:
            return True, "Conexión simulada (Modo MOCK / Pruebas Offline activa)."

        try:
            self.connect()
            with self._connection.cursor() as cur:
                cur.execute("SELECT 1 FROM DUAL")
                row = cur.fetchone()
                if row and row[0] == 1:
                    return True, "Conexión exitosa a Oracle SUI (SSPD)."
                return False, "Respuesta inesperada al consultar DUAL."
        except Exception as e:
            return False, f"Fallo al conectar a Oracle SUI: {str(e)}"
        finally:
            self.close()

    def execute_chunk_query(
        self,
        sql_query: str,
        params: Dict[str, Any],
        max_retries: int = 3
    ) -> Tuple[List[str], List[Tuple[Any, ...]]]:
        """
        Ejecuta una consulta SQL acotada con parámetros vinculados y reintentos exponenciales.
        Retorna (column_names, rows).
        """
        if self.is_mock:
            return self._generate_mock_data(params)

        attempt = 0
        last_error = None

        while attempt < max_retries:
            try:
                if not self._connection:
                    self.connect()

                with self._connection.cursor() as cur:
                    cur.arraysize = settings.sui_oracle_arraysize
                    cur.execute(sql_query, params)
                    
                    column_names = [col[0] for col in cur.description]
                    rows = cur.fetchall()
                    return column_names, rows

            except Exception as e:
                last_error = e
                attempt += 1
                backoff = (2 ** attempt) * 2
                time.sleep(backoff)
                # Forzar reconexión en siguiente intento
                self.close()

        raise RuntimeError(f"Error tras {max_retries} reintentos en consulta SUI: {str(last_error)}")

    def _generate_mock_data(self, params: Dict[str, Any]) -> Tuple[List[str], List[Tuple[Any, ...]]]:
        """Genera datos sintéticos para validación de pipelines, testing y desarrollo offline."""
        min_p = params.get("min_provider_id", 100)
        max_p = params.get("max_provider_id", 120)
        period = params.get("period_id", "2026-08")
        
        column_names = [
            "PROVIDER_ID", "SERVICE_AREA_ID", "REPORTING_PERIOD", 
            "WATER_PRODUCED_M3", "WATER_SUPPLIED_M3", "WATER_BILLED_M3",
            "HAS_MACROMETERING", "MICROMETERING_PCT", "FILING_DATE_SUI"
        ]
        
        rows = []
        for pid in range(min_p, max_p + 1):
            aps_id = f"APS-{pid:04d}-01"
            v_prod = 50000.0 + (pid * 100.0)
            v_fact = v_prod * 0.68  # IANC ~ 32%
            rows.append((
                pid, aps_id, period, v_prod, v_prod * 0.95, v_fact, 1, 98.5, "2026-09-05"
            ))
            
        return column_names, rows

    def close(self):
        """Cierra el pool/conexión Oracle."""
        if self._connection:
            try:
                self._connection.close()
            except Exception:
                pass
            self._connection = None
