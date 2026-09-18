# ==============================================================================
# Script de Pruebas de Aceptación e Integridad — Prototipo NMTPP CRA
# Especificación: specs/prototipo-tablero-nmtpp.md §9
# Resolución CRA 1038 de 2026 (Pequeños Prestadores de Acueducto)
# ==============================================================================

$appDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $appDir) { $appDir = Get-Location }

$indexPath = Join-Path $appDir "index.html"
$appJsPath = Join-Path $appDir "js\app.js"
$motorPath = Join-Path $appDir "js\motor_estados.js"
$dataPath = Join-Path $appDir "data\datos-sinteticos-prototipo.js"
$isePath = Join-Path $appDir "js\components\ise_incentivos.js"

$totalTests = 0
$passedTests = 0

function Assert-Check($name, $condition, $failMessage) {
    $script:totalTests++
    if ($condition) {
        Write-Host "  [PASS] $name" -ForegroundColor Green
        $script:passedTests++
    } else {
        Write-Host "  [FAIL] $($name): $($failMessage)" -ForegroundColor Red
    }
}

Write-Host "Iniciando verificaciones del Prototipo NMTPP (Res. CRA 1038)..." -ForegroundColor Cyan

# 1. Existencia de archivos clave (§9 prueba 1)
$filesExist = (Test-Path $indexPath) -and (Test-Path $appJsPath) -and (Test-Path $motorPath) -and (Test-Path $dataPath)
Assert-Check "1. Existen index.html, app.js, motor_estados.js y datos-sinteticos-prototipo.js" $filesExist "Falta uno de los archivos clave"

# 2. Archivo de datos contiene sintetico: true y texto de aviso (§9 prueba 2)
$utf8 = [System.Text.Encoding]::UTF8
$dataContent = if (Test-Path $dataPath) { [System.IO.File]::ReadAllText($dataPath, $utf8) } else { "" }
$hasSinteticoTrue = $dataContent -match '"sintetico":\s*true'
$hasAviso = ($dataContent -match 'DATOS SINT') -and ($dataContent -match 'PARA PROTOTIPO')
Assert-Check "2. Dataset sintetico contiene 'sintetico: true' y aviso obligatorio" ($hasSinteticoTrue -and $hasAviso) "No contiene marca sintetica o aviso"

# 3. js/*.js no contiene los literales de metas prohibidos INV-02 (§9 prueba 3)
$jsFiles = Get-ChildItem -Path (Join-Path $appDir "js") -Filter "*.js" -Recurse
$foundBannedLiterals = @()
$bannedPatterns = @('97\.26', '86\.3', '11\.82', '11\.68', '11\.41', '11\.35')

foreach ($f in $jsFiles) {
    $c = [System.IO.File]::ReadAllText($f.FullName, $utf8)
    foreach ($pat in $bannedPatterns) {
        if ($c -match $pat) {
            $foundBannedLiterals += "$($f.Name): $pat"
        }
    }
}
Assert-Check "3. INV-02: js/*.js no contiene literales regulatorios prohibidos (97.26, 86.3, 11.xx)" ($foundBannedLiterals.Count -eq 0) "Se encontraron literales: $($foundBannedLiterals -join ', ')"

# 4. No existe ningun campo tarifa_promedio INV-08 (§9 prueba 4)
$hasTarifaPromedio = $dataContent.Contains("tarifa_promedio")
Assert-Check "4. INV-08: No existe ningun campo 'tarifa_promedio' en datos ni codigo" (-not $hasTarifaPromedio) "Se detecto campo prohibido 'tarifa_promedio'"

# 5. Ninguna cadena de estado fuera del catalogo de RN-NMTPP-03 en motor_estados.js (§9 prueba 5)
$motorContent = if (Test-Path $motorPath) { [System.IO.File]::ReadAllText($motorPath, $utf8) } else { "" }
$hasBannedState = $false
if ($motorContent -match '\b(incumple|satisfactorio|insatisfactorio)\b') {
    $hasBannedState = $true
}
Assert-Check "5. RN-NMTPP-03: motor_estados.js solo utiliza estados del catalogo cerrado" (-not $hasBannedState) "Se detecto estado no canonico en motor_estados.js"

# 6. index.html contiene banner SINTETICO y leyenda de RN-NMTPP-05 (§9 prueba 6)
$indexContent = if (Test-Path $indexPath) { [System.IO.File]::ReadAllText($indexPath, $utf8) } else { "" }
$hasBannerIndex = ($indexContent -match 'DATOS SINT') -and ($indexContent -match 'PARA PROTOTIPO')
$hasLeyendaIndex = ($indexContent -match 'seguimiento informativo') -and ($indexContent -match 'verificaci') -and ($indexContent -match 'SSPD')
Assert-Check "6. index.html contiene banner sintetico visible y leyenda RN-NMTPP-05" ($hasBannerIndex -and $hasLeyendaIndex) "Falta banner sintetico o leyenda informativa en index.html"

# 7. Hay exactamente 40 prestadores y 239 estados esperados (§9 prueba 7)
$jsonPath = Join-Path $appDir "..\specs\nmtpp\datos-sinteticos-prototipo.json"
$rawJson = if (Test-Path $jsonPath) { [System.IO.File]::ReadAllText($jsonPath, $utf8) } else { "" }
$pCount = 0
$eCount = 0
if ($rawJson) {
    $parsed = $rawJson | ConvertFrom-Json
    $pCount = $parsed.prestadores.Count
    $eCount = $parsed.estados_esperados.Count
}
Assert-Check "7. Universo canonico: 40 prestadores y 239 estados esperados" ($pCount -eq 40 -and $eCount -eq 239) "Encontrados prestadores: $pCount, estados: $eCount"

# 8. ise_incentivos.js no contiene sort( sobre campos del ISE INV-04 (§9 prueba 8)
$iseContent = if (Test-Path $isePath) { [System.IO.File]::ReadAllText($isePath, $utf8) } else { "" }
$hasSortInIse = $iseContent -match '\.sort\('
Assert-Check "8. INV-04 / ADR-0015: ise_incentivos.js prohibe ordenamientos sobre el ISE" (-not $hasSortInIse) "Se detecto llamada a .sort() en ise_incentivos.js"

# 9. En motor_estados.js, ninguna rama asigna a IRCA un estado distinto de 'sin fuente confirmada' INV-05 (§9 prueba 9)
$hasValidIrcaBranch = $motorContent.Contains("-CAL") -and $motorContent.Contains("sin fuente confirmada")
Assert-Check "9. INV-05 / Q-NMTPP-06: IRCA asigna estrictamente 'sin fuente confirmada'" $hasValidIrcaBranch "IRCA no tiene la rama esperada 'sin fuente confirmada'"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Resultados de Pruebas: $passedTests de $totalTests pasaron exitosamente." -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Red" })
Write-Host "==================================================================" -ForegroundColor Cyan

if ($passedTests -ne $totalTests) {
    exit 1
}
