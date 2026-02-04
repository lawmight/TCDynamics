# Commit, push, trigger "Bump dev dependencies (Cursor headless)", and watch result.
# Run from repo root: .\scripts\commit-push-and-run-bump-workflow.ps1
# Optional: .\scripts\commit-push-and-run-bump-workflow.ps1 -Message "your commit message"

param(
  [string]$Message = "chore: commit and trigger bump dev deps workflow"
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

Write-Host "Staging all changes..." -ForegroundColor Cyan
git add -A
$status = git status --short
if (-not $status) {
  Write-Host "Nothing to commit." -ForegroundColor Yellow
  Write-Host "Triggering Bump dev dependencies workflow only..." -ForegroundColor Cyan
  gh workflow run "Bump dev dependencies (Cursor headless)" --ref main
  Start-Sleep -Seconds 10
  $runId = gh run list --workflow "Bump dev dependencies (Cursor headless)" --limit 1 --json databaseId --jq ".[0].databaseId"
  if ($runId) { gh run watch $runId --exit-status }
  exit 0
}

Write-Host $status
Write-Host "`nCommitting..." -ForegroundColor Cyan
git commit -m $Message

Write-Host "`nPushing to origin main..." -ForegroundColor Cyan
git push origin main

Write-Host "`nTriggering Bump dev dependencies workflow..." -ForegroundColor Cyan
gh workflow run "Bump dev dependencies (Cursor headless)" --ref main

Write-Host "Waiting 10s for run to appear..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

$runId = gh run list --workflow "Bump dev dependencies (Cursor headless)" --limit 1 --json databaseId,status --jq ".[0].databaseId"
if ($runId) {
  Write-Host "`nWatching run $runId (pass/fail)..." -ForegroundColor Cyan
  gh run watch $runId --exit-status
  if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBump dev dependencies workflow: PASSED" -ForegroundColor Green
  } else {
    Write-Host "`nBump dev dependencies workflow: FAILED" -ForegroundColor Red
    Write-Host "View failed logs: gh run view $runId --log-failed" -ForegroundColor Yellow
  }
} else {
  Write-Host "No run found. Check: gh run list --workflow 'Bump dev dependencies (Cursor headless)'" -ForegroundColor Yellow
}
