# GitHub Actions Manager
# Script to trigger and monitor GitHub Actions workflows

param(
    [Parameter(Position=0)]
    [ValidateSet('list', 'trigger', 'status', 'watch', 'cancel')]
    [string]$Action = 'list',
    
    [Parameter(Position=1)]
    [string]$Workflow = '',
    
    [string]$Branch = 'main',
    [string]$Ref = '',
    [switch]$Wait,
    [switch]$Follow,
    [hashtable]$Inputs = @{}
)

# Get the script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Change to project root
Set-Location $ProjectRoot

# Get repository info
$repoInfo = gh repo view --json nameWithOwner,defaultBranchRef
if (-not $repoInfo) {
    Write-Host "[ERROR] Not a GitHub repository or not authenticated with GitHub CLI" -ForegroundColor Red
    Write-Host "   Run: gh auth login" -ForegroundColor Yellow
    exit 1
}

$repo = ($repoInfo | ConvertFrom-Json).nameWithOwner
$defaultBranch = ($repoInfo | ConvertFrom-Json).defaultBranchRef.name

if ([string]::IsNullOrWhiteSpace($Branch)) {
    $Branch = $defaultBranch
}

Write-Host "[REPO] Repository: $repo" -ForegroundColor Cyan
Write-Host "[BRANCH] Branch: $Branch" -ForegroundColor Gray
Write-Host ""

function List-Workflows {
    Write-Host "[LIST] Available Workflows:" -ForegroundColor Cyan
    Write-Host ""
    
    $workflows = gh workflow list --json name,id,state,path | ConvertFrom-Json
    
    if ($workflows.Count -eq 0) {
        Write-Host "   No workflows found" -ForegroundColor Yellow
        return
    }
    
    foreach ($wf in $workflows) {
        $statusIcon = ''
        switch ($wf.state) {
            'active' { $statusIcon = '[OK]' }
            'disabled_inactivity' { $statusIcon = '[PAUSED]' }
            'disabled_manually' { $statusIcon = '[STOPPED]' }
            default { $statusIcon = '[?]' }
        }
        Write-Host "   $statusIcon $($wf.name)" -ForegroundColor White
        Write-Host "      ID: $($wf.id) | Path: $($wf.path)" -ForegroundColor Gray
    }
    Write-Host ""
}

function Trigger-Workflow {
    param(
        [string]$WorkflowName,
        [string]$BranchName,
        [hashtable]$InputParams
    )
    
    if ([string]::IsNullOrWhiteSpace($WorkflowName)) {
        Write-Host "[ERROR] Workflow name is required" -ForegroundColor Red
        Write-Host "   Usage: .\github-actions.ps1 trigger [workflow-name]" -ForegroundColor Yellow
        Write-Host "   Example: .\github-actions.ps1 trigger 'Quality Gate'" -ForegroundColor Yellow
        return
    }
    
    Write-Host "[TRIGGER] Triggering workflow: $WorkflowName" -ForegroundColor Cyan
    Write-Host "   Branch: $BranchName" -ForegroundColor Gray
    
    # Build input parameters
    $inputArgs = @()
    if ($InputParams.Count -gt 0) {
        Write-Host "   Inputs:" -ForegroundColor Gray
        foreach ($key in $InputParams.Keys) {
            $value = $InputParams[$key]
            $inputArgs += "--raw-field", "$key=$value"
            Write-Host "      $key = $value" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    
    # Trigger the workflow
    $runInfo = gh workflow run $WorkflowName `
        --ref $BranchName `
        $inputArgs `
        --json databaseId,url,status,createdAt `
        2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to trigger workflow" -ForegroundColor Red
        Write-Host $runInfo -ForegroundColor Red
        return
    }
    
    $run = $runInfo | ConvertFrom-Json
    
    Write-Host "[SUCCESS] Workflow triggered successfully!" -ForegroundColor Green
    Write-Host "   Run ID: $($run.databaseId)" -ForegroundColor White
    Write-Host "   URL: $($run.url)" -ForegroundColor Blue
    Write-Host "   Status: $($run.status)" -ForegroundColor Yellow
    Write-Host ""
    
    if ($Wait -or $Follow) {
        Write-Host "[WAIT] Waiting for workflow to complete..." -ForegroundColor Cyan
        Watch-Workflow -RunId $run.databaseId -Follow:$Follow
    } else {
        Write-Host "[TIP] Use 'status' to check workflow status" -ForegroundColor Gray
        Write-Host "   Or use -Wait flag to wait for completion" -ForegroundColor Gray
    }
    
    return $run.databaseId
}

function Get-WorkflowStatus {
    param(
        [string]$WorkflowName = '',
        [int]$Limit = 5
    )
    
    Write-Host "[STATUS] Workflow Run Status:" -ForegroundColor Cyan
    Write-Host ""
    
    if ([string]::IsNullOrWhiteSpace($WorkflowName)) {
        # Get all recent workflow runs
        $runs = gh run list --limit $Limit --json databaseId,name,status,conclusion,workflowName,createdAt,url,headBranch | ConvertFrom-Json
    } else {
        # Get runs for specific workflow
        $runs = gh run list --workflow $WorkflowName --limit $Limit --json databaseId,name,status,conclusion,workflowName,createdAt,url,headBranch | ConvertFrom-Json
    }
    
    if ($runs.Count -eq 0) {
        Write-Host "   No workflow runs found" -ForegroundColor Yellow
        return
    }
    
    foreach ($run in $runs) {
        $statusIcon = switch ($run.status) {
            'completed' { 
                switch ($run.conclusion) {
                    'success' { '[OK]' }
                    'failure' { '[FAIL]' }
                    'cancelled' { '[CANCEL]' }
                    'skipped' { '[SKIP]' }
                    default { '[?]' }
                }
            }
            'in_progress' { '[RUNNING]' }
            'queued' { '[QUEUED]' }
            'waiting' { '[WAIT]' }
            default { '[?]' }
        }
        
        $conclusion = if ($run.conclusion) { "($($run.conclusion))" } else { "" }
        $time = [DateTimeOffset]::Parse($run.createdAt).LocalDateTime.ToString("yyyy-MM-dd HH:mm:ss")
        
        Write-Host "   $statusIcon $($run.workflowName) #$($run.databaseId)" -ForegroundColor White
        Write-Host "      Status: $($run.status) $conclusion" -ForegroundColor Gray
        Write-Host "      Branch: $($run.headBranch) | Started: $time" -ForegroundColor Gray
        Write-Host "      URL: $($run.url)" -ForegroundColor Blue
        Write-Host ""
    }
}

function Watch-Workflow {
    param(
        [long]$RunId,
        [switch]$Follow
    )
    
    if (-not $RunId) {
        Write-Host "❌ Error: Run ID is required" -ForegroundColor Red
        return
    }
    
    Write-Host "[WATCH] Watching workflow run #$RunId..." -ForegroundColor Cyan
    Write-Host ""
    
    $checkInterval = 5 # seconds
    $maxWait = 3600 # 1 hour max
    $elapsed = 0
    
    while ($elapsed -lt $maxWait) {
        $run = gh run view $RunId --json status,conclusion,url,createdAt,updatedAt | ConvertFrom-Json
        
        $statusIcon = switch ($run.status) {
            'completed' { 
                switch ($run.conclusion) {
                    'success' { '[OK]' }
                    'failure' { '[FAIL]' }
                    'cancelled' { '[CANCEL]' }
                    'skipped' { '[SKIP]' }
                    default { '[?]' }
                }
            }
            'in_progress' { '[RUNNING]' }
            'queued' { '[QUEUED]' }
            'waiting' { '[WAIT]' }
            default { '[?]' }
        }
        
        $elapsedTime = [DateTimeOffset]::Parse($run.updatedAt) - [DateTimeOffset]::Parse($run.createdAt)
        $elapsedSeconds = [math]::Round($elapsedTime.TotalSeconds)
        
        Write-Host "`r   $statusIcon Status: $($run.status) | Elapsed: ${elapsedSeconds}s" -NoNewline -ForegroundColor Yellow
        
        if ($run.status -eq 'completed') {
            Write-Host ""
            Write-Host ""
            Write-Host "[DONE] Workflow completed!" -ForegroundColor $(if ($run.conclusion -eq 'success') { 'Green' } else { 'Red' })
            Write-Host "   Conclusion: $($run.conclusion)" -ForegroundColor White
            Write-Host "   URL: $($run.url)" -ForegroundColor Blue
            Write-Host ""
            
            if ($run.conclusion -ne 'success') {
                Write-Host "[LOGS] View logs:" -ForegroundColor Yellow
                Write-Host "   gh run view $RunId --log" -ForegroundColor Gray
            }
            
            return
        }
        
        Start-Sleep -Seconds $checkInterval
        $elapsed += $checkInterval
    }
    
    Write-Host ""
    Write-Host "[TIMEOUT] Maximum wait time exceeded" -ForegroundColor Yellow
    Write-Host "   Run is still in progress. Check status manually:" -ForegroundColor Gray
    Write-Host "   gh run view $RunId" -ForegroundColor Gray
}

function Cancel-Workflow {
    param(
        [long]$RunId
    )
    
    if (-not $RunId) {
        Write-Host "❌ Error: Run ID is required" -ForegroundColor Red
        Write-Host "   Usage: .\github-actions.ps1 cancel [run-id]" -ForegroundColor Yellow
        return
    }
    
    Write-Host "[CANCEL] Cancelling workflow run #$RunId..." -ForegroundColor Yellow
    
    gh run cancel $RunId
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Workflow cancelled successfully" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to cancel workflow" -ForegroundColor Red
    }
}

# Main execution
switch ($Action) {
    'list' {
        List-Workflows
    }
    'trigger' {
        $runId = Trigger-Workflow -WorkflowName $Workflow -BranchName $Branch -InputParams $Inputs
    }
    'status' {
        Get-WorkflowStatus -WorkflowName $Workflow
    }
    'watch' {
        if ([string]::IsNullOrWhiteSpace($Workflow)) {
            Write-Host "[ERROR] Run ID is required for watch action" -ForegroundColor Red
            Write-Host "   Usage: .\github-actions.ps1 watch [run-id]" -ForegroundColor Yellow
        } else {
            Watch-Workflow -RunId ([long]$Workflow) -Follow:$Follow
        }
    }
    'cancel' {
        if ([string]::IsNullOrWhiteSpace($Workflow)) {
            Write-Host "[ERROR] Run ID is required for cancel action" -ForegroundColor Red
            Write-Host "   Usage: .\github-actions.ps1 cancel [run-id]" -ForegroundColor Yellow
        } else {
            Cancel-Workflow -RunId ([long]$Workflow)
        }
    }
}
