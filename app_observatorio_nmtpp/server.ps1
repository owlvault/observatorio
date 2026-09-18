# Servidor Web local ligero para el Prototipo del Tablero NMTPP CRA (Res. CRA 1038 de 2026)
# Utiliza la clase nativa .NET HttpListener (sin dependencias de Node.js ni Python)

param(
    [int]$Port = 8081
)

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $scriptDir) { $scriptDir = (Get-Item .).FullName }

$listener = New-Object System.Net.HttpListener
$url = "http://localhost:$Port/"
$listener.Prefixes.Add($url)

try {
    $listener.Start()
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host "   OBSERVATORIO REGULATORIO CRA - PROTOTIPO NMTPP (PORT 8081)" -ForegroundColor Green
    Write-Host "   Monitoreo Marco Pequeños Prestadores Acueducto (Res. 1038 de 2026)" -ForegroundColor White
    Write-Host "   AVISO: OPERANDO CON DATOS SINTÉTICOS PARA PROTOTIPO" -ForegroundColor Yellow
    Write-Host "==================================================================" -ForegroundColor Cyan
    Write-Host "Servidor escuchando en: $url" -ForegroundColor Yellow
    Write-Host "Directorio raiz: $scriptDir" -ForegroundColor Gray
    Write-Host "Presione Ctrl+C para detener el servidor." -ForegroundColor Gray
    try {
        Start-Process $url -ErrorAction SilentlyContinue
    } catch {}

    $mimeTypes = @{
        ".html" = "text/html; charset=utf-8"
        ".css"  = "text/css; charset=utf-8"
        ".js"   = "application/javascript; charset=utf-8"
        ".json" = "application/json; charset=utf-8"
        ".csv"  = "text/csv; charset=utf-8"
        ".png"  = "image/png"
        ".jpg"  = "image/jpeg"
        ".svg"  = "image/svg+xml"
        ".ico"  = "image/x-icon"
    }

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawPath = $request.Url.LocalPath
        if ($rawPath -eq "/" -or $rawPath -eq "") {
            $rawPath = "/index.html"
        }

        $localPath = [System.IO.Path]::Combine($scriptDir, $rawPath.TrimStart('/').Replace('/', '\'))

        if ([System.IO.File]::Exists($localPath)) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $notFound = [System.Text.Encoding]::UTF8.GetBytes("<h1>404 - Archivo no encontrado</h1><p>$rawPath</p>")
            $response.StatusCode = 404
            $response.ContentType = "text/html; charset=utf-8"
            $response.ContentLength64 = $notFound.Length
            $response.OutputStream.Write($notFound, 0, $notFound.Length)
        }

        $response.Close()
    }
} catch {
    Write-Host "Error en el servidor: $_" -ForegroundColor Red
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
