# Commit/push backend tsconfig fix and trigger Bump workflow
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

Write-Host "Staging apps/backend/tsconfig.json..." -ForegroundColor Cyan
git add apps/backend/tsconfig.json
$status = git status --short
if (-not $status) {
  Write-Host "Nothing to commit." -ForegroundColor Yellow
  exit 0
}
Write-Host $status

Write-Host "`nCommitting..." -ForegroundColor Cyan
git commit -m "fix(backend): set module ES2020 in tsconfig so type-check allows import.meta"

Write-Host "`nPushing to origin main..." -ForegroundColor Cyan
git push origin main

Write-Host "`nTriggering Bump dev dependencies workflow..." -ForegroundColor Cyan
gh workflow run "Bump dev dependencies (Cursor headless)" --ref main

Write-Host "Waiting 10s for run to appear..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

$runs = gh run list --workflow "Bump dev dependencies (Cursor headless)" --limit 1 --json databaseId,status --jq ".[0].databaseId"
if ($runs) {
  Write-Host "`nWatching run $runs ..." -ForegroundColor Cyan
  gh run watch $runs --exit-status
} else {
  Write-Host "No run found. Check: gh run list --workflow 'Bump dev dependencies (Cursor headless)'" -ForegroundColor Yellow
}
