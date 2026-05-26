# ═══════════════════════════════════════════════════════════════
#   LyaCodeX — Instalador de aliases no terminal
#   Cria: lyacodex, lcx, LCX, lya, Lya no PATH do Windows
#
#   Uso:
#     .\scripts\install-aliases.ps1
#     .\scripts\install-aliases.ps1 -Uninstall
#     .\scripts\install-aliases.ps1 -InstallDir "C:\Tools\LyaCodeX"
# ═══════════════════════════════════════════════════════════════

param(
  [string]$InstallDir   = "$env:LOCALAPPDATA\LyaCodeX",
  [string]$ExeSource    = "",        # Caminho do .exe compilado (auto-detectado se vazio)
  [switch]$Uninstall,
  [switch]$NoConfirm
)

$ErrorActionPreference = "Stop"
$ScriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Resolve-Path (Join-Path $ScriptDir "..")

# Aliases que serão criados (todos apontam para o mesmo .exe)
$ALIASES = @("lyacodex", "lcx", "lya")
# Nota: Windows é case-insensitive no PATH, então
# LyaCodex, LYACODEX, LCX e Lya funcionam automaticamente.

function Write-Step([string]$msg) {
  Write-Host "  [LyaCodeX] $msg" -ForegroundColor Cyan
}
function Write-Ok([string]$msg) {
  Write-Host "  ✅ $msg" -ForegroundColor Green
}
function Write-Warn([string]$msg) {
  Write-Host "  ⚠️  $msg" -ForegroundColor Yellow
}
function Write-Fail([string]$msg) {
  Write-Host "  ❌ $msg" -ForegroundColor Red
}

# ── Banner ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ██╗  ██╗   ██╗ █████╗  ██████╗ ██████╗ ██████╗ ███████╗██╗  ██╗" -ForegroundColor Green
Write-Host "  ██║  ╚██╗ ██╔╝██╔══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝╚██╗██╔╝" -ForegroundColor Green
Write-Host "  ██║   ╚████╔╝ ███████║██║     ██║   ██║██║  ██║█████╗   ╚███╔╝ " -ForegroundColor Green
Write-Host "  ██║    ╚██╔╝  ██╔══██║██║     ██║   ██║██║  ██║██╔══╝   ██╔██╗ " -ForegroundColor Green
Write-Host "  ███████╗██║   ██║  ██║╚██████╗╚██████╔╝██████╔╝███████╗██╔╝ ██╗" -ForegroundColor Green
Write-Host "  ╚══════╝╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝" -ForegroundColor Green
Write-Host ""
Write-Host "  Se você pensa, você executa." -ForegroundColor DarkGreen
Write-Host ""

# ── Desinstalar ──────────────────────────────────────────────────
if ($Uninstall) {
  Write-Step "Removendo LyaCodeX e aliases do sistema..."

  # Remove do PATH
  $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
  $newPath = ($currentPath -split ";") | Where-Object { $_ -ne $InstallDir } | Join-String -Separator ";"
  [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
  Write-Ok "PATH atualizado (InstallDir removido)"

  # Remove arquivos
  if (Test-Path $InstallDir) {
    Remove-Item -Recurse -Force $InstallDir
    Write-Ok "Pasta $InstallDir removida"
  }

  # Remove atalho da área de trabalho
  $desktop = [Environment]::GetFolderPath("Desktop")
  foreach ($alias in $ALIASES) {
    $lnk = Join-Path $desktop "$alias.lnk"
    if (Test-Path $lnk) { Remove-Item $lnk -Force }
  }
  Write-Ok "Atalhos da área de trabalho removidos"

  Write-Host ""
  Write-Ok "LyaCodeX desinstalado com sucesso."
  exit 0
}

# ── Localizar o .exe ─────────────────────────────────────────────
if ($ExeSource -eq "") {
  # Procura no target/release primeiro
  $candidates = @(
    (Join-Path $ProjectDir "src-tauri\target\release\lyacodex.exe"),
    (Join-Path $ProjectDir "src-tauri\target\release\lyacodex_desktop.exe"),
    (Join-Path $InstallDir "lyacodex.exe")
  )
  foreach ($c in $candidates) {
    if (Test-Path $c) { $ExeSource = $c; break }
  }
}

if ($ExeSource -eq "" -or !(Test-Path $ExeSource)) {
  Write-Warn "Binário lyacodex.exe não encontrado. Compilando agora..."
  Write-Step "Executando: npm run tauri build"
  Push-Location $ProjectDir
  try {
    npm install
    npm run tauri build
  } finally {
    Pop-Location
  }

  # Tenta novamente
  $ExeSource = Join-Path $ProjectDir "src-tauri\target\release\lyacodex.exe"
  if (!(Test-Path $ExeSource)) {
    $ExeSource = Join-Path $ProjectDir "src-tauri\target\release\lyacodex_desktop.exe"
  }
  if (!(Test-Path $ExeSource)) {
    Write-Fail "Build falhou. Verifique os erros acima."
    exit 1
  }
}

Write-Ok "Binário encontrado: $ExeSource"

# ── Criar pasta de instalação ────────────────────────────────────
Write-Step "Criando pasta de instalação: $InstallDir"
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

# Copia o exe principal
$mainExe = Join-Path $InstallDir "lyacodex.exe"
Copy-Item -Force $ExeSource $mainExe
Write-Ok "lyacodex.exe instalado"

# ── Criar batch wrappers para cada alias ─────────────────────────
# Batch files são case-insensitive no Windows — lcx.bat responde a lcx, LCX, Lcx
Write-Step "Criando aliases: $($ALIASES -join ' | ')"

foreach ($alias in $ALIASES) {
  $batPath = Join-Path $InstallDir "$alias.bat"
  $content = "@echo off`r`n`"$mainExe`" %*`r`n"
  [System.IO.File]::WriteAllText($batPath, $content, [System.Text.Encoding]::ASCII)
  Write-Ok "Alias criado: $alias  →  $alias.bat"
}

# ── Adicionar ao PATH do usuário ──────────────────────────────────
Write-Step "Adicionando $InstallDir ao PATH do usuário..."

$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User") -split ";"
if ($InstallDir -notin $currentPath) {
  $newPath = ($currentPath + $InstallDir) -join ";"
  [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
  Write-Ok "PATH atualizado. Abra um novo terminal para usar os aliases."
} else {
  Write-Ok "PATH já contém $InstallDir"
}

# ── Atalho na área de trabalho ────────────────────────────────────
Write-Step "Criando atalho na área de trabalho..."
$desktop = [Environment]::GetFolderPath("Desktop")
$shell = New-Object -ComObject WScript.Shell
$lnk = $shell.CreateShortcut((Join-Path $desktop "LyaCodeX.lnk"))
$lnk.TargetPath      = $mainExe
$lnk.WorkingDirectory = $InstallDir
$lnk.Description     = "LyaCodeX — Se você pensa, você executa."
$lnk.Save()
Write-Ok "Atalho criado na área de trabalho"

# ── Atualizar PATH na sessão atual ────────────────────────────────
$env:PATH = "$InstallDir;$env:PATH"

# ── Resultado final ───────────────────────────────────────────────
Write-Host ""
Write-Host "  ═══════════════════════════════════════════" -ForegroundColor Green
Write-Host "   ✅  LyaCodeX instalado com sucesso!" -ForegroundColor Green
Write-Host "  ═══════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Aliases disponíveis (abra um novo terminal):" -ForegroundColor White
Write-Host ""
Write-Host "    lyacodex          → abre a interface desktop" -ForegroundColor Cyan
Write-Host "    LyaCodex          → mesmo (Windows é case-insensitive)" -ForegroundColor Cyan
Write-Host "    LYACODEX          → mesmo" -ForegroundColor Cyan
Write-Host "    lcx               → atalho curto" -ForegroundColor Cyan
Write-Host "    LCX               → atalho curto maiúsculo" -ForegroundColor Cyan
Write-Host "    lya               → atalho mais curto" -ForegroundColor Cyan
Write-Host "    Lya               → alias amigável" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Exemplos de uso:" -ForegroundColor White
Write-Host "    lya wake" -ForegroundColor DarkCyan
Write-Host "    lcx status" -ForegroundColor DarkCyan
Write-Host "    lyacodex skills coding --lang pt-BR" -ForegroundColor DarkCyan
Write-Host "    lya chat ""como faço um loop em Rust?""" -ForegroundColor DarkCyan
Write-Host "    lcx aliases" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "  Se você pensa, você executa." -ForegroundColor DarkGreen
Write-Host ""

# ── Testar na sessão atual ────────────────────────────────────────
if (!$NoConfirm) {
  $test = Read-Host "  Testar agora? (lyacodex aliases) [S/N]"
  if ($test -eq "S" -or $test -eq "s") {
    Write-Host ""
    & $mainExe aliases
  }
}
