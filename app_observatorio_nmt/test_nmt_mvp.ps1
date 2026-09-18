# Script de verificación de integridad y reglas de negocio para el MVP NMT CRA
$appDir = "c:\Users\ccarvajalino\OneDrive - CRA\Aplicaciones\Observatorio\CRA_Observatorio_Regulatorio_Context_Lake\app_observatorio_nmt"
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

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Resultados: $passedTests de $totalTests pruebas pasaron exitosamente." -ForegroundColor $(if ($passedTests -eq $totalTests) { "Green" } else { "Yellow" })
Write-Host "==========================================" -ForegroundColor Cyan
