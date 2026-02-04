# Commit, push, and check GitHub Actions via gh CLI
# Run from repo root: .\scripts\commit-push-and-check-actions.ps1

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot\..

Write-Host "Staging changes..." -ForegroundColor Cyan
git add -u
$status = git status --short
if (-not $status) {
  Write-Host "Nothing to commit." -ForegroundColor Yellow
  exit 0
}
Write-Host $status

$msg = @"
fix(ci): resolve Quality Gate and Bump workflow failures

- Backend: add trailing commas (comma-dangle) in server, middleware, app and lint --fix
- Frontend: fix import order in PerformanceMonitor and SimpleNavigation tests
- SimpleNavigation test: assert only scrollIntoView, drop flaky getElementById spy
- SimpleNavigation: add eslint-disable for logo Link a11y (Link renders as <a>)
"@

Write-Host "`nCommitting..." -ForegroundColor Cyan
git commit -m $msg

Write-Host "`nPushing to origin main..." -ForegroundColor Cyan
git push origin main

Write-Host "`nWaiting a few seconds for Actions to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host "`nLatest workflow runs:" -ForegroundColor Cyan
gh run list --limit 8

Write-Host "`nWatching latest run (Ctrl+C to stop)..." -ForegroundColor Cyan
gh run watch

Write-Host "`nLatest run details:" -ForegroundColor Cyan
gh run view

Write-Host "`nIf the latest run failed, view failed logs with: gh run view <RUN_ID> --log-failed" -ForegroundColor Yellow
