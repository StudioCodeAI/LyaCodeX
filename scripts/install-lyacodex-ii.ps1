param(
  [string]$InstallDir   = "$env:LOCALAPPDATA\LyaCodeX",
  [switch]$BuildFromSource,
  [switch]$Launch,
  [switch]$SkipAliases
)

$ErrorActionPreference = "Stop"
$ScriptDir   = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..")

function Write-Step([string]$msg) {
  Write-Host "  [LyaCodeX] $msg" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "  LyaCodeX — Instalador principal" -ForegroundColor Green
Write-Host "  Se você pensa, você executa." -ForegroundColor DarkGreen
Write-Host ""
Write-Step "Projeto: $ProjectRoot"

# ── Build opcional ───────────────────────────────────────────────
if ($BuildFromSource) {
  Write-Step "Compilando a partir do código-fonte..."
  Push-Location $ProjectRoot
  try {
    npm install
    npm run tauri -- build
  } finally {
    Pop-Location
  }
}

# ── Localizar instalador gerado pelo Tauri ───────────────────────
$BundleRoot = Join-Path $ProjectRoot "src-tauri\target\release\bundle"

$NsisInstaller = Get-ChildItem -LiteralPath $BundleRoot -Recurse -Filter "*.exe" -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -match "\\nsis\\" } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

$MsiInstaller = Get-ChildItem -LiteralPath $BundleRoot -Recurse -Filter "*.msi" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($NsisInstaller) {
  Write-Step "Instalador NSIS encontrado: $($NsisInstaller.FullName)"
  Start-Process -FilePath $NsisInstaller.FullName -Wait
} elseif ($MsiInstaller) {
  Write-Step "Instalador MSI encontrado: $($MsiInstaller.FullName)"
  Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $MsiInstaller.FullName -Wait
} else {
  # Instalação portable
  Write-Step "Nenhum instalador Tauri encontrado. Instalando modo portable..."

  $candidates = @(
    (Join-Path $ProjectRoot "src-tauri\target\release\lyacodex.exe"),
    (Join-Path $ProjectRoot "src-tauri\target\release\lyacodex_desktop.exe")
  )
  $ReleaseExe = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1

  if (!$ReleaseExe) {
    Write-Step "Compilando binário release..."
    Push-Location $ProjectRoot
    try { npm run tauri -- build } finally { Pop-Location }
    $ReleaseExe = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  }

  if (!$ReleaseExe) {
    throw "Não foi possível localizar ou compilar lyacodex.exe."
  }

  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
  Copy-Item -LiteralPath $ReleaseExe -Destination (Join-Path $InstallDir "lyacodex.exe") -Force
  Write-Step "Portable instalado em: $InstallDir"
}

# ── Instalar aliases ─────────────────────────────────────────────
if (!$SkipAliases) {
  Write-Step "Configurando aliases no terminal..."
  $aliasScript = Join-Path $ScriptDir "install-aliases.ps1"
  if (Test-Path $aliasScript) {
    & $aliasScript -InstallDir $InstallDir -NoConfirm
  } else {
    Write-Step "⚠️  install-aliases.ps1 não encontrado. Rode manualmente para criar aliases."
  }
}

# ── Abrir após instalação ─────────────────────────────────────────
if ($Launch) {
  $exe = Join-Path $InstallDir "lyacodex.exe"
  if (Test-Path $exe) {
    Write-Step "Iniciando LyaCodeX..."
    Start-Process -FilePath $exe
  }
}

Write-Host ""
Write-Host "  ✅ Instalação concluída!" -ForegroundColor Green
Write-Host "  Abra um novo terminal e use: lya, lcx ou lyacodex" -ForegroundColor Cyan
Write-Host ""
