# Monitor GitHub Actions and Vercel Deployments
# This script polls until all deployments complete

$ErrorActionPreference = "Continue"

Write-Host "Starting deployment monitoring..." -ForegroundColor Cyan
Write-Host ""

# GitHub Actions monitoring
Write-Host "Checking GitHub Actions..." -ForegroundColor Yellow
$ghRuns = gh run list --branch main --limit 5 --json databaseId,status,conclusion,name,createdAt,url 2>$null | ConvertFrom-Json

if ($ghRuns -and $ghRuns.Count -gt 0) {
    Write-Host "Found $($ghRuns.Count) workflow run(s)" -ForegroundColor Green
    foreach ($run in $ghRuns) {
        Write-Host "  - $($run.name): $($run.status) ($($run.conclusion))" -ForegroundColor $(if ($run.status -eq "completed" -and $run.conclusion -eq "success") { "Green" } elseif ($run.status -eq "completed") { "Red" } else { "Yellow" })
        Write-Host "    URL: $($run.url)" -ForegroundColor Gray
    }

    # Monitor the latest run
    $latestRun = $ghRuns[0]
    if ($latestRun.status -ne "completed") {
        Write-Host ""
        Write-Host "⏳ Monitoring GitHub Actions run: $($latestRun.name)..." -ForegroundColor Yellow
        $runId = $latestRun.databaseId

        while ($true) {
            Start-Sleep -Seconds 10
            $status = gh run view $runId --json status,conclusion -q '.status + ":" + ( .conclusion // "" )' 2>$null
            if ($status) {
                Write-Host "  Status: $status" -ForegroundColor $(if ($status -like "completed:success") { "Green" } elseif ($status -like "completed:*") { "Red" } else { "Yellow" })

                if ($status -like "completed:*") {
                    Write-Host "  GitHub Actions completed!" -ForegroundColor Green
                    gh run view $runId --log > "gh-run-$runId.log" 2>$null
                    Write-Host "  Logs saved to: gh-run-$runId.log" -ForegroundColor Cyan
                    break
                }
            } else {
                Write-Host "  WARNING: Could not fetch status (gh CLI may not be configured)" -ForegroundColor Yellow
                break
            }
        }
    }
} else {
    Write-Host "WARNING: No GitHub Actions runs found for 'main' branch" -ForegroundColor Yellow
    Write-Host "   Workflows are configured to trigger on 'main' branch" -ForegroundColor Gray
}

Write-Host ""

# Vercel monitoring
Write-Host "Checking Vercel deployments..." -ForegroundColor Yellow

try {
    $vercelDeploys = vercel ls --limit 5 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Vercel CLI is configured" -ForegroundColor Green
        Write-Host "$vercelDeploys" -ForegroundColor Gray

        # Try to get JSON output for parsing
        $deployJson = vercel ls --json --limit 3 2>$null | ConvertFrom-Json
        if ($deployJson) {
            Write-Host ""
            Write-Host "Latest deployments:" -ForegroundColor Cyan
            foreach ($deploy in $deployJson) {
                $state = $deploy.state
                $url = $deploy.url
                $created = $deploy.created
                $color = if ($state -eq "READY") { "Green" } elseif ($state -eq "ERROR") { "Red" } else { "Yellow" }
                Write-Host "  - $url : $state (created: $created)" -ForegroundColor $color
            }
        }
    } else {
        Write-Host "WARNING: Vercel CLI error or not configured" -ForegroundColor Yellow
        Write-Host "   Run 'vercel login' to authenticate" -ForegroundColor Gray
    }
} catch {
    Write-Host "WARNING: Could not check Vercel deployments: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Monitoring complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Tips:" -ForegroundColor Cyan
Write-Host "  - GitHub Actions: https://github.com/lawmight/TCDynamics/actions" -ForegroundColor Gray
Write-Host "  - Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor Gray
Write-Host "  - Re-run this script to check status again" -ForegroundColor Gray
