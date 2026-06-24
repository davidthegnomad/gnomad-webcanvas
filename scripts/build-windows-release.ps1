# Production Windows NSIS installer (Windows Alpha channel).
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path) | Out-Null
Set-Location ..

$extra = @()
if (-not $env:TAURI_SIGNING_PRIVATE_KEY) {
    $extra = @("--config", '{"bundle":{"createUpdaterArtifacts":false}}')
}

Write-Host "Building Gnomad Webcanvas for Windows (NSIS)…"
npx tauri build --ci --config src-tauri/tauri.windows.conf.json @extra

Write-Host ""
Write-Host "Installers:"
Get-ChildItem -Path "src-tauri/target/release/bundle/nsis" -Filter "*.exe" -ErrorAction SilentlyContinue
