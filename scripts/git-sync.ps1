# LyaCodeX - Teste de integridade + sincronizacao Git
# Uso:
#   .\scripts\git-sync.ps1 -TestOnly   -> so testa
#   .\scripts\git-sync.ps1 -DryRun     -> simula sem enviar
#   .\scripts\git-sync.ps1             -> testa + commit + push

param(
  [switch]$DryRun,
  [switch]$TestOnly,
  [string]$Message = ""
)

$ErrorActionPreference = "Stop"
$ProjectDir = "E:\GitHub\LyaCodeX"
$Remote     = "origin"
$Branch     = "main"

$script:PASS  = 0
$script:FAIL  = 0
$script:WARNS = 0

function Write-Pass([string]$msg) {
  Write-Host "  OK  $msg" -ForegroundColor Green
  $script:PASS++
}
function Write-Fail([string]$msg) {
  Write-Host "  ERR $msg" -ForegroundColor Red
  $script:FAIL++
}
function Write-Warn([string]$msg) {
  Write-Host "  WAR $msg" -ForegroundColor Yellow
  $script:WARNS++
}
function Write-Step([string]$msg) {
  Write-Host ""
  Write-Host "  --- $msg" -ForegroundColor Cyan
}

Set-Location $ProjectDir

Write-Host ""
Write-Host "  LyaCodeX - Teste de integridade + Git Sync" -ForegroundColor Green
Write-Host "  Se voce pensa, voce executa." -ForegroundColor DarkGreen
Write-Host "  Projeto: $ProjectDir" -ForegroundColor Gray
if ($DryRun)   { Write-Host "  MODO: DRY RUN (nada sera enviado)" -ForegroundColor Yellow }
if ($TestOnly) { Write-Host "  MODO: TEST ONLY (sem commit/push)"  -ForegroundColor Yellow }
Write-Host ""

# ================================================
# TESTE 1 - Sem referencias ao nome antigo
# ================================================
Write-Step "TESTE 1 - Nomenclatura (sem nome antigo)"

$OLD_TERMS = @(
  "LyaCodex-II",
  "LyaCodex II",
  "lyacodex-ii",
  "lyacodex_ii_backend",
  "@lyacode/lyacodex-ii",
  "lyacodex-trial",
  "trial.lyacodex.ai"
)

$SRC_DIRS = @(
  "src-tauri\src",
  "backend\src",
  "frontend\src",
  "engine\src",
  "shared",
  "docs",
  "scripts"
)

foreach ($term in $OLD_TERMS) {
  $found = $false

  foreach ($dir in $SRC_DIRS) {
    $fullDir = Join-Path $ProjectDir $dir
    if (-not (Test-Path $fullDir)) { continue }

    $hits = Get-ChildItem -Path $fullDir -Recurse -File `
      -Include "*.ts","*.tsx","*.rs","*.json","*.md","*.toml","*.ps1" |
      Select-String -Pattern ([regex]::Escape($term)) -List -ErrorAction SilentlyContinue

    if ($hits) { $found = $true; break }
  }

  if (-not $found) {
    $rootHits = Get-ChildItem -Path $ProjectDir -MaxDepth 1 -File `
      -Include "*.json","*.md","*.toml" |
      Select-String -Pattern ([regex]::Escape($term)) -List -ErrorAction SilentlyContinue
    if ($rootHits) { $found = $true }
  }

  if ($found) {
    Write-Fail "Referencia antiga encontrada: $term"
  } else {
    Write-Pass "Sem: $term"
  }
}

# ================================================
# TESTE 2 - Arquivos criticos existem
# ================================================
Write-Step "TESTE 2 - Arquivos criticos existem"

$REQUIRED_FILES = @(
  "package.json",
  "src-tauri\Cargo.toml",
  "src-tauri\tauri.conf.json",
  "src-tauri\capabilities\default.json",
  "src-tauri\src\main.rs",
  "src-tauri\src\lib.rs",
  "backend\Cargo.toml",
  "backend\src\lib.rs",
  "backend\src\providers.rs",
  "frontend\src\App.tsx",
  "frontend\src\components\RuntimeChatPanel.tsx",
  "frontend\src\components\SkillCatalogPanel.tsx",
  "frontend\src\components\HybridModePanel.tsx",
  "frontend\src\state\settingsStore.ts",
  "frontend\src\runtime\environment.ts",
  "frontend\src\runtime\localEngineClient.ts",
  "frontend\src\runtime\browserProviderGateway.ts",
  "docs\AI_RULES.md",
  "docs\ARCHITECTURE.md",
  "docs\ROADMAP.md",
  "PLANO_EM_DISCUSSAO.md",
  ".gitignore",
  "scripts\install-aliases.ps1"
)

foreach ($rel in $REQUIRED_FILES) {
  $full = Join-Path $ProjectDir $rel
  if (Test-Path $full) {
    Write-Pass "Existe: $rel"
  } else {
    Write-Fail "FALTANDO: $rel"
  }
}

# Tenta tambem com acento (nome original do arquivo)
$planoAcento = Join-Path $ProjectDir "PLANO_EM_DISCUSSAO.md"
$planoSemAcento = Join-Path $ProjectDir "PLANO_EM_DISCUSS`u00c3O.md"
if (-not (Test-Path $planoAcento)) {
  if (Test-Path $planoSemAcento) {
    Write-Pass "Existe: PLANO_EM_DISCUSSAO.md (com acento)"
  }
}

# ================================================
# TESTE 3 - Nome correto nos arquivos-chave
# ================================================
Write-Step "TESTE 3 - Nome LyaCodeX correto"

function Test-Contains {
  param([string]$file, [string]$pattern, [string]$label)
  $full = Join-Path $ProjectDir $file
  if (-not (Test-Path $full)) {
    Write-Fail "$label - arquivo nao encontrado: $file"
    return
  }
  $content = Get-Content $full -Raw -ErrorAction SilentlyContinue
  if ($content -match [regex]::Escape($pattern)) {
    Write-Pass "$label"
  } else {
    Write-Fail "$label - padrao nao encontrado: $pattern"
  }
}

Test-Contains "package.json"              "@lyacodex/lyacodex"    "package.json name"
Test-Contains "backend\Cargo.toml"        "lyacodex_backend"      "backend crate name"
Test-Contains "src-tauri\Cargo.toml"      "lyacodex_backend"      "desktop dep name"
Test-Contains "src-tauri\tauri.conf.json" "LyaCodeX"              "productName"
Test-Contains "src-tauri\tauri.conf.json" "com.luiscard.lyacodex" "identifier"
Test-Contains "src-tauri\src\lib.rs"      "lyacodex_backend"      "lib.rs import"
Test-Contains "docs\AI_RULES.md"          "LyaCodeX"              "AI_RULES titulo"

# ================================================
# TESTE 4 - Sem secrets nos fontes
# ================================================
Write-Step "TESTE 4 - Sem secrets nos fontes"

$SECRET_PATTERNS = @("sk-proj", "AIzaSy", "api_key =", "password =")

foreach ($pattern in $SECRET_PATTERNS) {
  $hits = Get-ChildItem -Path $ProjectDir -Recurse -File -Include "*.ts","*.tsx","*.rs" |
    Where-Object {
      $_.FullName -notmatch "\\node_modules\\" -and
      $_.FullName -notmatch "\\target\\"
    } |
    Select-String -Pattern ([regex]::Escape($pattern)) -List -ErrorAction SilentlyContinue

  if ($hits) {
    Write-Warn "Possivel secret encontrado '$pattern' em: $($hits[0].Filename)"
  } else {
    Write-Pass "Sem: $pattern"
  }
}

# ================================================
# TESTE 5 - Sem subpasta fantasma
# ================================================
Write-Step "TESTE 5 - Sem subpasta fantasma"

$GHOST_DIRS = @("LyaCodeX", "LyaCodex-II", "LyaCode")
foreach ($ghost in $GHOST_DIRS) {
  $full = Join-Path $ProjectDir $ghost
  if (Test-Path $full) {
    Write-Warn "Subpasta fantasma detectada: $ghost"
  } else {
    Write-Pass "Sem subpasta: $ghost"
  }
}

# ================================================
# TESTE 6 - .gitignore adequado
# ================================================
Write-Step "TESTE 6 - .gitignore adequado"

$GITIGNORE = Join-Path $ProjectDir ".gitignore"
$IGNORE_REQUIRED = @("node_modules", "target/", "dist/", ".env", "vault.json")
$ignoreContent = Get-Content $GITIGNORE -Raw -ErrorAction SilentlyContinue

foreach ($entry in $IGNORE_REQUIRED) {
  if ($ignoreContent -match [regex]::Escape($entry)) {
    Write-Pass ".gitignore contem: $entry"
  } else {
    Write-Fail ".gitignore NAO contem: $entry"
  }
}

# ================================================
# RESULTADO
# ================================================
Write-Host ""
Write-Host "  =======================================" -ForegroundColor Cyan

$cor = "Green"
if ($script:FAIL -gt 0)  { $cor = "Red" }
elseif ($script:WARNS -gt 0) { $cor = "Yellow" }

Write-Host "  Resultado: $($script:PASS) OK | $($script:FAIL) ERR | $($script:WARNS) WAR" -ForegroundColor $cor
Write-Host "  =======================================" -ForegroundColor Cyan

if ($TestOnly) {
  Write-Host ""
  if ($script:FAIL -gt 0) {
    Write-Host "  Corrija os erros antes de sincronizar." -ForegroundColor Red
  } else {
    Write-Host "  Tudo OK! Rode sem -TestOnly para sincronizar." -ForegroundColor Green
  }
  exit $(if ($script:FAIL -gt 0) { 1 } else { 0 })
}

if ($script:FAIL -gt 0) {
  Write-Host ""
  Write-Host "  Ha erros criticos. Corrija antes de sincronizar." -ForegroundColor Red
  exit 1
}

# ================================================
# GIT - Commit e push
# ================================================
Write-Step "GIT - Status atual"

$gitStatus = git status --short 2>&1
if (-not $gitStatus) {
  Write-Host "  Nenhuma alteracao pendente. Repositorio ja esta sincronizado." -ForegroundColor Gray
  exit 0
}

Write-Host ""
$gitStatus | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
Write-Host ""

if ($Message -eq "") {
  $date = Get-Date -Format "yyyy-MM-dd HH:mm"
  $Message = "LyaCodeX: sincronizacao $date"
}

if ($DryRun) {
  Write-Host "  [DRY RUN] Seria executado:" -ForegroundColor Yellow
  Write-Host "    git rm -r --cached ." -ForegroundColor Gray
  Write-Host "    git add -A" -ForegroundColor Gray
  Write-Host "    git commit -m `"$Message`"" -ForegroundColor Gray
  Write-Host "    git push $Remote $Branch --force-with-lease" -ForegroundColor Gray
  exit 0
}

Write-Step "GIT - Limpando cache e sincronizando"

git rm -r --cached . --quiet 2>&1 | Out-Null
Write-Pass "Cache git limpo"

git add -A
Write-Pass "git add -A"

git commit -m $Message
Write-Pass "Commit: $Message"

Write-Host "  Enviando para $Remote/$Branch..." -ForegroundColor Cyan
git push $Remote $Branch --force-with-lease

Write-Host ""
Write-Host "  =======================================" -ForegroundColor Green
Write-Host "  Sincronizado com sucesso!" -ForegroundColor Green
Write-Host "  Remote: $(git remote get-url $Remote)" -ForegroundColor Gray
Write-Host "  Branch: $Branch" -ForegroundColor Gray
Write-Host "  Commit: $(git log --oneline -1)" -ForegroundColor Gray
Write-Host "  =======================================" -ForegroundColor Green
Write-Host ""
