"""
Módulo de Autenticación Segura en Memoria (ADR-0008 § 6)
Observatorio Regulatorio CRA
"""

import getpass
import os
from typing import Tuple, Optional
from rich.prompt import Prompt


class MemoryCredentials:
    """Almacena credenciales de sesión en memoria volátil exclusivamente durante la ejecución."""
    def __init__(self, username: str, password: str):
        self.username = username
        self._password = password

    @property
    def password(self) -> str:
        return self._password

    def clear(self):
        self._password = ""


def get_operator_identity() -> str:
    """Obtiene el identificador de red/sistema del operador actual."""
    return os.getenv("CRA_OPERATOR_USER") or os.getenv("USERNAME") or os.getenv("USER") or "operator_cra"


def prompt_oracle_credentials(default_user: Optional[str] = None) -> MemoryCredentials:
    """
    Solicita interactivamente las credenciales de acceso al SUI de la SSPD.
    Garantía de diseño: La contraseña NUNCA se persiste en disco ni se imprime en logs.
    """
    detected_user = default_user or os.getenv("SUI_ORACLE_USER") or get_operator_identity()
    user = Prompt.ask("[bold cyan]Usuario de Consulta SUI Oracle[/bold cyan]", default=detected_user)
    password = getpass.getpass("Contraseña SUI Oracle (no se mostrará en pantalla): ")
    
    if not password:
        raise ValueError("La contraseña de consulta de Oracle SUI no puede estar vacía.")
        
    return MemoryCredentials(username=user, password=password)
