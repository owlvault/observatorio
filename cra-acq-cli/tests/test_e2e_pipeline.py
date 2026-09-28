"""
Prueba de Integración Extremo a Extremo (E2E) con Typer CliRunner
"""

from typer.testing import CliRunner
from cra_acq.cli import app

runner = CliRunner()


def test_cli_list_queries():
    result = runner.invoke(app, ["list-queries"])
    assert result.exit_code == 0
    assert "BALANCE_HIDRICO" in result.stdout
    assert "SUI_EXT_02_BALANCE" in result.stdout


def test_cli_ping():
    result = runner.invoke(app, ["ping", "--mock"])
    assert result.exit_code == 0
    assert "Conexión Oracle SUI: OK" in result.stdout
    assert "Almacenamiento Zona Cruda: OK" in result.stdout


def test_cli_run_mock_pipeline():
    result = runner.invoke(app, [
        "run",
        "--domain", "BALANCE_HIDRICO",
        "--period", "2026-08",
        "--chunk-size", "50",
        "--min-p", "100",
        "--max-p", "199",
        "--mock"
    ])
    assert result.exit_code == 0
    assert "Extracción Finalizada con Éxito" in result.stdout
    assert "BALANCE_HIDRICO / 2026-08" in result.stdout
    assert "raw_control.raw_dataset" in result.stdout
