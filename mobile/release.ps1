<#
.SYNOPSIS
    Builds a new TriStellar HRIS app release for in-app updates.

.DESCRIPTION
    Bumps the build number in pubspec.yaml, builds the signed release APK, and writes
    dist\TriStellar-HRIS.apk plus dist\latest.json (version, checksum, release notes).
    Upload BOTH files to the site's public/downloads/ folder; installed apps then offer
    the update the next time they are opened.

    Usage (from the mobile folder):
        powershell -ExecutionPolicy Bypass -File .\release.ps1 -Version 1.2.0 -Notes "What changed"
    Add -Required to make every older version update before it can be used.
#>

param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^\d+\.\d+\.\d+$')]
    [string] $Version,

    [string] $Notes = '',

    [switch] $Required,

    [string] $SiteUrl = 'https://mistyrose-rook-580675.hostingersite.com'
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$pubspec = Join-Path $root 'pubspec.yaml'
$dist = Join-Path $root 'dist'
$latestPath = Join-Path $dist 'latest.json'

if (-not (Test-Path (Join-Path $root 'android\key.properties'))) {
    throw 'android\key.properties is missing. Restore the release key backup before building, or updates will not install over existing apps.'
}

# Next build number = current + 1 (installed apps compare build numbers).
$content = Get-Content $pubspec -Raw
if ($content -notmatch '(?m)^version:\s*[\d.]+\+(\d+)\s*$') { throw 'Could not read the version in pubspec.yaml.' }
$build = [int]$Matches[1] + 1
Write-Host "1/3 Building version $Version (build $build)..." -ForegroundColor Cyan

Push-Location $root
try {
    $env:JAVA_TOOL_OPTIONS = '-Djava.net.preferIPv4Stack=true'
    flutter build apk --release --build-name=$Version --build-number=$build --dart-define=API_URL=$SiteUrl
    if ($LASTEXITCODE -ne 0) { throw 'flutter build failed.' }
} finally {
    Pop-Location
}

# Record the new version only once the build succeeded, so a failed attempt does not skip a number.
$content = $content -replace '(?m)^version:\s*.+$', "version: $Version+$build"
[IO.File]::WriteAllText($pubspec, $content)

Write-Host '2/3 Copying the APK...' -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $dist | Out-Null
$apk = Join-Path $dist 'TriStellar-HRIS.apk'
Copy-Item (Join-Path $root 'build\app\outputs\flutter-apk\app-release.apk') $apk -Force

Write-Host '3/3 Writing latest.json...' -ForegroundColor Cyan
$minBuild = 1
if (Test-Path $latestPath) {
    $previous = Get-Content $latestPath -Raw | ConvertFrom-Json
    if ($previous.min_build) { $minBuild = [int]$previous.min_build }
}
if ($Required) { $minBuild = $build }

$release = [ordered]@{
    version = $Version
    build = $build
    min_build = $minBuild
    url = "$SiteUrl/downloads/TriStellar-HRIS.apk?v=$build"
    sha256 = (Get-FileHash $apk -Algorithm SHA256).Hash.ToLower()
    notes = $Notes
    released_at = (Get-Date).ToString('yyyy-MM-dd HH:mm')
}
[IO.File]::WriteAllText($latestPath, ($release | ConvertTo-Json))

$size = [math]::Round((Get-Item $apk).Length / 1MB, 1)
Write-Host "Done: version $Version (build $build), $size MB" -ForegroundColor Green
Write-Host "Upload BOTH files to public/downloads/ on Hostinger:" -ForegroundColor Green
Write-Host "  $apk"
Write-Host "  $latestPath"
