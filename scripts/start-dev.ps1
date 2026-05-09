param(
    [int]$BackendPort = 8081,
    [int]$FrontendPort = 5173
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

function Test-PortListening {
    param([int]$Port)
    return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Wait-HttpOk {
    param(
        [string]$Url,
        [int]$TimeoutSeconds = 45
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return
            }
        } catch {
            Start-Sleep -Seconds 1
        }
    } while ((Get-Date) -lt $deadline)

    throw "Timed out waiting for $Url"
}

if (-not (Test-PortListening -Port $BackendPort)) {
    $backendOut = Join-Path $backendDir "backend-run.log"
    $backendErr = Join-Path $backendDir "backend-run.err.log"
    Start-Process -FilePath "mvn" `
        -ArgumentList @("spring-boot:run", "-Dspring-boot.run.profiles=dev") `
        -WorkingDirectory $backendDir `
        -RedirectStandardOutput $backendOut `
        -RedirectStandardError $backendErr `
        -WindowStyle Hidden
}

Wait-HttpOk -Url "http://localhost:$BackendPort/api/events"

if (-not (Test-PortListening -Port $FrontendPort)) {
    $frontendOut = Join-Path $frontendDir "frontend-run.log"
    $frontendErr = Join-Path $frontendDir "frontend-run.err.log"
    Start-Process -FilePath "npm" `
        -ArgumentList @("run", "dev", "--", "--host", "localhost", "--port", "$FrontendPort") `
        -WorkingDirectory $frontendDir `
        -RedirectStandardOutput $frontendOut `
        -RedirectStandardError $frontendErr `
        -WindowStyle Hidden
}

Write-Host "Backend:  http://localhost:$BackendPort"
Write-Host "Frontend: http://localhost:$FrontendPort"
Write-Host "Backend logs:  $backendDir\backend-run.log"
Write-Host "Frontend logs: $frontendDir\frontend-run.log"
