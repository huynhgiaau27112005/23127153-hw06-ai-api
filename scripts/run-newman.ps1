# HW06 Newman runner - Student 23127153
param(
    [string]$Folder = "",
    [string]$Report = "reports/newman-report.html",
    [switch]$FailOneTest,
    [switch]$Bail
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..."
    npm install
}

& "e:\DISK D\NOTES FOR CLASS\NAM 3\HOC KY III\TESTING\HOMEWORKS\scripts\reset-eshop-api.ps1" -Port 3010 | Out-Null

$collection = "postman/23127153_EShop_API.postman_collection.json"
$environment = "postman/eshop-local.postman_environment.json"

New-Item -ItemType Directory -Force -Path (Split-Path $Report) | Out-Null

$newmanArgs = @(
    "run", $collection,
    "-e", $environment,
    "-r", "cli,htmlextra",
    "--reporter-htmlextra-export", $Report,
    "--reporter-htmlextra-title", "HW06 API Tests 23127153",
    "--reporter-htmlextra-showEnvironmentData",
    "--reporter-htmlextra-logs"
)

if ($Folder) {
    $newmanArgs += @("--folder", $Folder)
}

if ($Bail -or $FailOneTest) {
    $newmanArgs += @("--bail")
}

Write-Host "Running: npx newman $($newmanArgs -join ' ')"
npx newman @newmanArgs
exit $LASTEXITCODE
