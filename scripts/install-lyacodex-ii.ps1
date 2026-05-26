param(
  [string]$InstallDir = "$env:LOCALAPPDATA\LyaCodex-II",
  [switch]$BuildFromSource,
  [switch]$Launch
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host "[LyaCodex II] $Message"
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Resolve-Path (Join-Path $ScriptDir "..")
$InstallerRoot = Join-Path $ProjectRoot "src-tauri\target\release\bundle"

Write-Step "Project root: $ProjectRoot"

if ($BuildFromSource) {
  Write-Step "Building desktop installer from source."
  Push-Location $ProjectRoot
  try {
    npm install
    npm run tauri -- build
  } finally {
    Pop-Location
  }
}

$NsisInstaller = Get-ChildItem -LiteralPath $InstallerRoot -Recurse -Filter "*.exe" -ErrorAction SilentlyContinue |
  Where-Object { $_.FullName -match "\\nsis\\" } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

$MsiInstaller = Get-ChildItem -LiteralPath $InstallerRoot -Recurse -Filter "*.msi" -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($NsisInstaller) {
  Write-Step "Running NSIS installer: $($NsisInstaller.FullName)"
  Start-Process -FilePath $NsisInstaller.FullName -Wait
} elseif ($MsiInstaller) {
  Write-Step "Running MSI installer: $($MsiInstaller.FullName)"
  Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $MsiInstaller.FullName -Wait
} else {
  Write-Step "No desktop installer was found. Installing portable release binary."
  $ReleaseExe = Join-Path $ProjectRoot "src-tauri\target\release\lyacodex_ii_desktop.exe"

  if (!(Test-Path -LiteralPath $ReleaseExe)) {
    Write-Step "Release binary not found. Building it now."
    Push-Location (Join-Path $ProjectRoot "src-tauri")
    try {
      cargo build --release
    } finally {
      Pop-Location
    }
  }

  if (!(Test-Path -LiteralPath $ReleaseExe)) {
    throw "Could not find or build lyacodex_ii_desktop.exe."
  }

  New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
  Copy-Item -LiteralPath $ReleaseExe -Destination (Join-Path $InstallDir "LyaCodex-II.exe") -Force

  $ShortcutPath = Join-Path ([Environment]::GetFolderPath("Desktop")) "LyaCodex II.lnk"
  $Shell = New-Object -ComObject WScript.Shell
  $Shortcut = $Shell.CreateShortcut($ShortcutPath)
  $Shortcut.TargetPath = Join-Path $InstallDir "LyaCodex-II.exe"
  $Shortcut.WorkingDirectory = $InstallDir
  $Shortcut.Description = "LyaCodex II Runtime"
  $Shortcut.Save()

  Write-Step "Portable install completed at $InstallDir"
}

if ($Launch) {
  $InstalledExe = Join-Path $InstallDir "LyaCodex-II.exe"
  if (Test-Path -LiteralPath $InstalledExe) {
    Write-Step "Launching LyaCodex II."
    Start-Process -FilePath $InstalledExe
  }
}

Write-Step "Done."
