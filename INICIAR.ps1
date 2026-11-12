$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCommand) { throw 'Se necesita Node.js 22.12 o superior.' }
$astroEntry = Join-Path $PSScriptRoot 'node_modules/astro/bin/astro.mjs'
if (-not (Test-Path -LiteralPath $astroEntry)) {
  throw 'Primero instalá las dependencias con pnpm install. Consultá README.md.'
}
& $nodeCommand.Source $astroEntry dev --host 127.0.0.1
