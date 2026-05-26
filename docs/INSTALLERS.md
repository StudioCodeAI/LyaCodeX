# Installers

LyaCodex II supports two Windows install paths.

## Desktop Installer

Build the Tauri installers:

```powershell
npm run tauri -- build
```

Generated artifacts are written under:

```text
src-tauri\target\release\bundle
```

The Tauri config currently targets NSIS and MSI.

## PowerShell Installer

Use the project installer script:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-lyacodex-ii.ps1
```

Useful flags:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-lyacodex-ii.ps1 -BuildFromSource
powershell -ExecutionPolicy Bypass -File scripts\install-lyacodex-ii.ps1 -Launch
```

Behavior:

- if a Tauri NSIS or MSI installer exists, it runs it;
- otherwise, it builds or copies the release executable as a portable local install;
- it creates a desktop shortcut for the portable path.
