# Script de verificación de integridad y reglas de negocio para el MVP NMT CRA
# Ruta relativa al script: la suite corre en cualquier copia del repositorio
$appDir = $PSScriptRoot
$jsonPath = Join-Path $appDir "data\datos_nmt_prestadores_1032.json"
$csvPath = Join-Path $appDir "data\datos_nmt_prestadores_1032.csv"
$indexPath = Join-Path $appDir "index.html"
$cssPath = Join-Path $appDir "css\styles.css"
$appJsPath = Join-Path $appDir "js\app.js"

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

Write-Host "Iniciando verificaciones del MVP NMT CRA..." -ForegroundColor Cyan

# 1. Existencia de archivos clave
Assert-Check "index.html existe" (Test-Path $indexPath) "No se encontró index.html"
Assert-Check "styles.css existe" (Test-Path $cssPath) "No se encontró styles.css"
Assert-Check "app.js existe" (Test-Path $appJsPath) "No se encontró app.js"
Assert-Check "Dataset JSON existe" (Test-Path $jsonPath) "No se encontró el JSON"
Assert-Check "Dataset CSV existe" (Test-Path $csvPath) "No se encontró el CSV"

# 2. Integridad del Dataset JSON
$data = Get-Content $jsonPath -Raw | ConvertFrom-Json
Assert-Check "Dataset tiene metadata y prestadores" ($data.metadata -ne $null -and $data.prestadores -ne $null) "Falta metadata o prestadores"
Assert-Check "Total de prestadores es 188" ($data.prestadores.Count -eq 188) "Esperados 188, encontrados $($data.prestadores.Count)"

$s1Count = ($data.prestadores | Where-Object { $_.segmento_cra -eq "Segmento 1" }).Count
$s2Count = ($data.prestadores | Where-Object { $_.segmento_cra -eq "Segmento 2" }).Count
$s3Count = ($data.prestadores | Where-Object { $_.segmento_cra -eq "Segmento 3" }).Count
$s4Count = ($data.prestadores | Where-Object { $_.segmento_cra -eq "Segmento 4" }).Count

Assert-Check "Segmento 1 tiene 12 prestadores" ($s1Count -eq 12) "Encontrados: $s1Count"
Assert-Check "Segmento 2 tiene 28 prestadores" ($s2Count -eq 28) "Encontrados: $s2Count"
Assert-Check "Segmento 3 tiene 45 prestadores" ($s3Count -eq 45) "Encontrados: $s3Count"
Assert-Check "Segmento 4 tiene 103 prestadores" ($s4Count -eq 103) "Encontrados: $s4Count"

# 3. Verificación de Regla RN-PORTAL-04 (Desagregación por estrato, nunca promedio)
$hasTarifaPromedio = $false
foreach ($p in $data.prestadores) {
    if ($p.nmt_tracking.variacion_tarifaria_transicion.PSObject.Properties['tarifa_promedio'] -ne $null) {
        $hasTarifaPromedio = $true
        break
    }
}
Assert-Check "Regla RN-PORTAL-04: No existe campo 'tarifa_promedio'" (-not $hasTarifaPromedio) "Se detectó campo prohibido de tarifa promedio"

# 4. Verificación de Ciclo Regulatorio OCDE (E0 a E9)
$etapasOcde = $data.metadata.ciclo_regulatorio_ocde
Assert-Check "Ciclo OCDE tiene exactamente 10 etapas E0 a E9" ($etapasOcde.Count -eq 10) "Encontradas $($etapasOcde.Count) etapas"
Assert-Check "Fase inicial es E0" ($etapasOcde[0].codigo -eq "E0") "Primera etapa no es E0"
Assert-Check "Fase final es E9 (AIR Ex-Post)" ($etapasOcde[9].codigo -eq "E9") "Última etapa no es E9"

# 5. Verificación de Banners de Trazabilidad de Vacíos (RF-NMT-12)
$vacios = @($data.metadata.trazabilidad_vacios_normativos)
Assert-Check "Trazabilidad de vacios incluye Q-NMT-01" (@($vacios | Where-Object { $_.id -eq "Q-NMT-01" }).Count -gt 0) "Falta Q-NMT-01"
Assert-Check "Trazabilidad de vacios incluye Q-NMT-02" (@($vacios | Where-Object { $_.id -eq "Q-NMT-02" }).Count -gt 0) "Falta Q-NMT-02"

# 6. Verificación de CSV
$csvLines = Get-Content $csvPath
Assert-Check "CSV tiene encabezado y 188 filas de datos" ($csvLines.Count -eq 189) "Encontradas $($csvLines.Count) líneas en CSV"

# 7. Verificación del Módulo de Impacto Regulatorio OCDE
$impactoJsPath = Join-Path $appDir "js\components\impacto_ocde.js"
Assert-Check "impacto_ocde.js existe" (Test-Path $impactoJsPath) "No se encontró impacto_ocde.js"

$indexContent = Get-Content $indexPath -Raw
Assert-Check "index.html incluye script impacto_ocde.js" ($indexContent -match 'js/components/impacto_ocde\.js') "Falta script impacto_ocde.js en index.html"
Assert-Check "index.html contiene contenedor de 5 Dimensiones OCDE" ($indexContent -match 'id="ocde-dimensions-grid"') "Falta ocde-dimensions-grid"
Assert-Check "index.html contiene Matriz AIR Scorecard" ($indexContent -match 'id="air-scorecard-tbody"') "Falta air-scorecard-tbody"
Assert-Check "index.html contiene Radar de 12 Principios OCDE" ($indexContent -match 'id="chart-radar-ocde"') "Falta chart-radar-ocde"
Assert-Check "index.html contiene Calculadora de Asequibilidad" ($indexContent -match 'id="calc-consumo-slider"') "Falta calc-consumo-slider"
Assert-Check "index.html contiene Modal de Dictamen Ejecutivo AIR" ($indexContent -match 'id="modal-air-report"') "Falta modal-air-report"

$impactoContent = Get-Content $impactoJsPath -Raw
Assert-Check "impacto_ocde.js define umbral de asequibilidad OCDE (3.0%)" ($impactoContent -match 'umbralAsequibilidadOCDE_pct:\s*3\.0') "Falta umbral 3.0%"
Assert-Check "impacto_ocde.js contiene los 12 principios de gobernanza del agua" ($impactoContent -match 'P12\.\s*Monitoreo\s*AIR\s*Ex-Post') "Faltan principios OCDE"

# 8. Verificación de Integración de Pequeños Prestadores (Res. CRA 1038 de 2026)
$dataNmtppPath = Join-Path $appDir "data\datos-sinteticos-prototipo.js"
$motorEstadosPath = Join-Path $appDir "js\motor_estados.js"
Assert-Check "datos-sinteticos-prototipo.js existe" (Test-Path $dataNmtppPath) "No se encontró data_nmtpp.js"
Assert-Check "motor_estados.js existe" (Test-Path $motorEstadosPath) "No se encontró motor_estados.js"
Assert-Check "index.html incluye data/datos-sinteticos-prototipo.js" ($indexContent -match 'data/datos-sinteticos-prototipo\.js') "Falta script data_nmtpp.js en index.html"
Assert-Check "index.html incluye script motor_estados.js" ($indexContent -match 'js/motor_estados\.js') "Falta script motor_estados.js en index.html"
Assert-Check "index.html contiene pestaña Pequeños Prestadores (Res. 1038)" ($indexContent -match 'id="tab-btn-nmtpp"') "Falta tab-btn-nmtpp"
Assert-Check "index.html contiene contenedor pane-nmtpp" ($indexContent -match 'id="pane-nmtpp"') "Falta pane-nmtpp"
Assert-Check "index.html contiene subpaneles NMTPP (resumen, hitos, nivel servicio, ise)" ($indexContent -match 'id="tab-resumen"' -and $indexContent -match 'id="tab-calendario"' -and $indexContent -match 'id="tab-nivel-servicio"' -and $indexContent -match 'id="tab-ise-incentivos"') "Faltan subpaneles NMTPP"
Assert-Check "index.html contiene Modal de Perfil de Pequeño Prestador" ($indexContent -match 'id="modal-perfil-prestador"') "Falta modal-perfil-prestador"

# 9. Verificación de Directorio Universal y Régimen Dual (1032 + 1038)
Assert-Check "index.html contiene selector de ámbito en directorio" ($indexContent -match 'id="btn-ambito-todos"' -and $indexContent -match 'id="btn-ambito-1032"' -and $indexContent -match 'id="btn-ambito-1038"') "Falta selector de ámbito en directorio"
Assert-Check "styles.css contiene clases para badges de régimen normativo" ($indexContent -match 'regime-badge' -or (Get-Content $cssPath -Raw) -match '\.regime-badge') "Falta .regime-badge en estilos"

# 10. Verificación del Linaje de Fuentes de 3 Tiers (Context Lake v2)
Assert-Check "index.html contiene franja de linaje de fuentes de 3 Tiers" ($indexContent -match 'class="source-feasibility-strip"') "Falta source-feasibility-strip"
Assert-Check "index.html define Tier 1 SUI Oracle, Tier 2 SURICATA y Tier 3 Externa" ($indexContent -match 'Tier 1' -and $indexContent -match 'Tier 2' -and $indexContent -match 'Tier 3') "Faltan tiers de fuentes en index.html"


# 11. Invariantes del componente Res. 1038 (specs/prototipo-tablero-nmtpp.md §2 y §9)
#     Antes vivían en app_observatorio_nmtpp/test_nmtpp_prototipo.ps1; el prototipo se integró en este portal.
$utf8 = [System.Text.Encoding]::UTF8
$ppDataPath = Join-Path $appDir "data\datos-sinteticos-prototipo.js"
$ppMotorPath = Join-Path $appDir "js\motor_estados.js"
$ppIsePath = Join-Path $appDir "js\components\nmtpp\ise_incentivos.js"
$ppData = if (Test-Path $ppDataPath) { [System.IO.File]::ReadAllText($ppDataPath, $utf8) } else { "" }
$ppMotor = if (Test-Path $ppMotorPath) { [System.IO.File]::ReadAllText($ppMotorPath, $utf8) } else { "" }

Assert-Check "NMTPP-1. Existen app_nmtpp.js, motor_estados.js y datos-sinteticos-prototipo.js" ((Test-Path (Join-Path $appDir "js\app_nmtpp.js")) -and (Test-Path $ppMotorPath) -and (Test-Path $ppDataPath)) "Falta un archivo clave del componente Res. 1038"
Assert-Check "NMTPP-2. Dataset sintetico marcado 'sintetico: true' con aviso obligatorio" (($ppData -match '"sintetico":\s*true') -and ($ppData -match 'DATOS SINT') -and ($ppData -match 'PARA PROTOTIPO')) "No contiene marca sintetica o aviso"

# INV-02: el codigo de la Res. 1038 no contiene metas literales (los datos de la 1032 quedan fuera del barrido)
$ppCode = @(Get-ChildItem -Path (Join-Path $appDir "js\components\nmtpp") -Filter "*.js") + @(Get-Item (Join-Path $appDir "js\app_nmtpp.js"), (Get-Item $ppMotorPath))
$found = @()
foreach ($f in $ppCode) {
    $c = [System.IO.File]::ReadAllText($f.FullName, $utf8)
    foreach ($pat in @('97\.26', '86\.3', '11\.82', '11\.68', '11\.41', '11\.35')) { if ($c -match $pat) { $found += "$($f.Name): $pat" } }
}
Assert-Check "NMTPP-3. INV-02: sin literales regulatorios en el codigo Res. 1038" ($found.Count -eq 0) "Literales: $($found -join ', ')"
Assert-Check "NMTPP-4. INV-08: no existe 'tarifa_promedio' en el dataset sintetico" (-not $ppData.Contains("tarifa_promedio")) "Se detecto 'tarifa_promedio'"
Assert-Check "NMTPP-5. RN-NMTPP-03: motor_estados.js solo usa el catalogo cerrado de estados" (-not ($ppMotor -match '\b(incumple|satisfactorio|insatisfactorio)\b')) "Estado no canonico en motor_estados.js"
$idx = [System.IO.File]::ReadAllText($indexPath, $utf8)
Assert-Check "NMTPP-6. INV-01 / RN-NMTPP-05: banner sintetico y leyenda informativa en index.html" (($idx -match 'DATOS SINT') -and ($idx -match 'PARA PROTOTIPO') -and ($idx -match '(?i)seguimiento informativo') -and ($idx -match 'SSPD')) "Falta banner sintetico o leyenda"
$ppJson = Join-Path $appDir "..\specs\nmtpp\datos-sinteticos-prototipo.json"
$pp = if (Test-Path $ppJson) { [System.IO.File]::ReadAllText($ppJson, $utf8) | ConvertFrom-Json } else { $null }
Assert-Check "NMTPP-7. Universo canonico: 40 prestadores y 239 estados esperados" ($pp -and $pp.prestadores.Count -eq 40 -and $pp.estados_esperados.Count -eq 239) "Universo distinto al canonico"
Assert-Check "NMTPP-8. INV-04 / ADR-0015: ise_incentivos.js no ordena el ISE" (-not ([System.IO.File]::ReadAllText($ppIsePath, $utf8) -match '\.sort\(')) "Se detecto .sort() en ise_incentivos.js"
Assert-Check "NMTPP-9. INV-05 / Q-NMTPP-06: IRCA solo en 'sin fuente confirmada'" ($ppMotor.Contains("-CAL") -and $ppMotor.Contains("sin fuente confirmada")) "IRCA sin la rama esperada"
Assert-Check "NMTPP-10. Copia de datos igual a specs/nmtpp (no editada a mano)" ((Get-FileHash $ppDataPath).Hash -eq (Get-FileHash (Join-Path $appDir "..\specs\nmtpp\datos-sinteticos-prototipo.js")).Hash) "data/datos-sinteticos-prototipo.js difiere del generado en specs/nmtpp"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Resultados: $passedTests de $totalTests pruebas pasaron exitosamente." -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })
Write-Host "==========================================" -ForegroundColor Cyan

if ($passedTests -ne $totalTests) { exit 1 }
