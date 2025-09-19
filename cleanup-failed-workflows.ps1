# GitHub Failed Workflows Cleanup Script
# Requires a GitHub Personal Access Token

param(
    [Parameter(Mandatory=$true)]
    [string]$Repository,  # Format: "owner/repo"
    
    [Parameter(Mandatory=$true)]
    [string]$Token  # GitHub Personal Access Token
)

# GitHub API base URL
$apiBase = "https://api.github.com"

# Headers for API requests
$headers = @{
    "Authorization" = "token $Token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "PowerShell-Script"
}

Write-Host "Fetching failed workflow runs for repository: $Repository" -ForegroundColor Green

try {
    # Get all workflow runs
    $workflowRunsUrl = "$apiBase/repos/$Repository/actions/runs?per_page=100"
    $response = Invoke-RestMethod -Uri $workflowRunsUrl -Headers $headers -Method Get
    
    # Filter failed runs
    $failedRuns = $response.workflow_runs | Where-Object { $_.conclusion -eq "failure" }
    
    Write-Host "Found $($failedRuns.Count) failed workflow runs" -ForegroundColor Yellow
    
    if ($failedRuns.Count -eq 0) {
        Write-Host "No failed workflow runs found!" -ForegroundColor Green
        exit 0
    }
    
    # Ask for confirmation
    $confirmation = Read-Host "Do you want to delete all $($failedRuns.Count) failed workflow runs? (y/N)"
    
    if ($confirmation -ne "y" -and $confirmation -ne "Y") {
        Write-Host "Operation cancelled." -ForegroundColor Red
        exit 0
    }
    
    # Delete failed runs
    $deletedCount = 0
    foreach ($run in $failedRuns) {
        try {
            $deleteUrl = "$apiBase/repos/$Repository/actions/runs/$($run.id)"
            Invoke-RestMethod -Uri $deleteUrl -Headers $headers -Method Delete
            $deletedCount++
            Write-Host "Deleted run: $($run.id) - $($run.head_commit.message)" -ForegroundColor Green
        }
        catch {
            Write-Host "Failed to delete run $($run.id): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "Successfully deleted $deletedCount out of $($failedRuns.Count) failed workflow runs" -ForegroundColor Green
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure your repository name is in format 'owner/repo' and your token has 'actions:write' permission" -ForegroundColor Yellow
}
