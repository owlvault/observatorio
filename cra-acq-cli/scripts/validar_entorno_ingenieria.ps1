<#
.SYNOPSIS
    Script de verificación previa de entorno y red para Ingeniería de la CRA.
.DESCRIPTION
    Valida prerrequisitos de la estación: túnel VPN, conectividad TCP a Oracle SUI,
    virtualenv de Python y ejecución del diagnóstico automatizado.
#>

param (
    [string]$SuiHost = "<HOST_SUI>",
    [int]$SuiPort = 1521
)

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " OBSERVATORIO REGULATORIO CRA - VALIDACIÓN DE ENTORNO PARA INGENIERÍA" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan

# 1. Validar Python
Write-Host "`n[1/4] Verificando instalación de Python..." -ForegroundColor Yellow
$py = Get-Command python -ErrorAction SilentlyContinue
if ($null -eq $py) {
    Write-Host "[-] ERROR: Python no está instalado en el PATH." -ForegroundColor Red
    exit 1
}
$pyVer = python --version
Write-Host "[+] Python detectado: $pyVer" -ForegroundColor Green

# 2. Validar entorno virtual
Write-Host "`n[2/4] Verificando entorno virtual cra-acq-cli..." -ForegroundColor Yellow
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Split-Path -Parent $scriptDir
$venvPy = Join-Path $projectDir ".venv\Scripts\python.exe"

if (-not (Test-Path $venvPy)) {
    Write-Host "[-] ERROR: No se encontró .venv en $projectDir" -ForegroundColor Red
    Write-Host "    Ejecute: python -m venv .venv; .venv\Scripts\pip install -e ." -ForegroundColor Yellow
    exit 1
}
Write-Host "[+] Entorno virtual operativo en $venvPy" -ForegroundColor Green

# 3. Validar conectividad TCP al listener Oracle del SUI
Write-Host "`n[3/4] Probando socket TCP hacia Oracle SUI ($SuiHost:$SuiPort)..." -ForegroundColor Yellow
$tcpTest = Test-NetConnection -ComputerName $SuiHost -Port $SuiPort -WarningAction SilentlyContinue

if ($tcpTest.TcpTestSucceeded) {
    Write-Host "[+] Conectividad TCP con SUI: EXITOSA (Túnel VPN activo y enrutado)." -ForegroundColor Green
} else {
    Write-Host "[-] ADVERTENCIA: No se pudo abrir socket TCP con $SuiHost:$SuiPort." -ForegroundColor Red
    Write-Host "    Asegúrese de que el cliente VPN (FortiClient/Cisco) tenga la sesión abierta." -ForegroundColor Yellow
}

# 4. Ejecutar diagnóstico de componentes
Write-Host "`n[4/4] Ejecutando diagnóstico profundo de base de datos y OCI..." -ForegroundColor Yellow
& $venvPy (Join-Path $scriptDir "diagnostico_ingenieria_sui_oci.py")

Write-Host "`n[OK] Verificación finalizada." -ForegroundColor Cyan
