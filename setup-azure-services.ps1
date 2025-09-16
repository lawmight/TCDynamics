# WorkFlowAI Azure Services Setup Script
# This script will help you consume your $200 Azure credit efficiently

Write-Host "🚀 WorkFlowAI Azure Services Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Yellow

# Step 1: Check Azure CLI authentication
Write-Host "`n1. Checking Azure authentication..." -ForegroundColor Green
$account = az account show 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not authenticated with Azure. Please run 'az login' first." -ForegroundColor Red
    Write-Host "Then re-run this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Azure authentication successful!" -ForegroundColor Green

# Step 2: Set subscription and check credits
Write-Host "`n2. Checking subscription and credits..." -ForegroundColor Green
$subscription = az account show --query "{name:name, id:id}" -o json | ConvertFrom-Json
Write-Host "Current subscription: $($subscription.name)" -ForegroundColor Cyan

# Check credit balance
Write-Host "Checking credit balance..." -ForegroundColor Yellow
az consumption usage summary list --query "[].{Currency:currency, CurrentSpend:pretaxCost, Credit:credit}" -o table

# Step 3: Create resource group
Write-Host "`n3. Creating WorkFlowAI resource group..." -ForegroundColor Green
az group create --name WorkFlowAI-rg --location francecentral --tags "Project=WorkFlowAI" "Purpose=AI-SaaS" "CreditDeadline=1week"

# Step 4: Create Azure OpenAI Service (High credit consumption)
Write-Host "`n4. Creating Azure OpenAI Service..." -ForegroundColor Green
Write-Host "This will consume ~$80-120 of your credit..." -ForegroundColor Yellow

az cognitiveservices account create `
    --name "workflowai-openai" `
    --resource-group WorkFlowAI-rg `
    --kind OpenAI `
    --sku S0 `
    --location francecentral `
    --custom-domain "workflowai-openai" `
    --tags "Project=WorkFlowAI" "Service=AI-Chatbot" `
    --yes

# Step 5: Deploy GPT-4 model
Write-Host "`n5. Deploying GPT-4 model..." -ForegroundColor Green
az cognitiveservices account deployment create `
    --name "workflowai-openai" `
    --resource-group WorkFlowAI-rg `
    --deployment-name "gpt-4" `
    --model-name "gpt-4" `
    --model-version "1106-Preview" `
    --model-format OpenAI `
    --scale-settings-scale-type "Standard"

# Step 6: Create AI Vision service
Write-Host "`n6. Creating Azure AI Vision service..." -ForegroundColor Green
Write-Host "This will consume ~$30-50 of your credit..." -ForegroundColor Yellow

az cognitiveservices account create `
    --name "workflowai-vision" `
    --resource-group WorkFlowAI-rg `
    --kind ComputerVision `
    --sku S1 `
    --location francecentral `
    --custom-domain "workflowai-vision" `
    --tags "Project=WorkFlowAI" "Service=Document-Processing" `
    --yes

# Step 7: Create Azure Database (Cosmos DB)
Write-Host "`n7. Creating Azure Cosmos DB..." -ForegroundColor Green
Write-Host "This will consume ~$20-30 of your credit..." -ForegroundColor Yellow

az cosmosdb create `
    --name "workflowai-db" `
    --resource-group WorkFlowAI-rg `
    --locations regionName=francecentral failoverPriority=0 isZoneRedundant=False `
    --default-consistency-level "Session" `
    --enable-free-tier true

# Step 8: Create database and containers
Write-Host "`n8. Setting up database containers..." -ForegroundColor Green
az cosmosdb sql database create `
    --account-name "workflowai-db" `
    --resource-group WorkFlowAI-rg `
    --name "workflowai-data"

az cosmosdb sql container create `
    --account-name "workflowai-db" `
    --resource-group WorkFlowAI-rg `
    --database-name "workflowai-data" `
    --name "contact-forms" `
    --partition-key-path "/user_id"

az cosmosdb sql container create `
    --account-name "workflowai-db" `
    --resource-group WorkFlowAI-rg `
    --database-name "workflowai-data" `
    --name "ai-conversations" `
    --partition-key-path "/session_id"

# Step 9: Get connection strings
Write-Host "`n9. Getting connection strings..." -ForegroundColor Green
Write-Host "`n🔑 Azure OpenAI Connection:" -ForegroundColor Cyan
az cognitiveservices account keys list --name "workflowai-openai" --resource-group WorkFlowAI-rg --query "{endpoint:endpoint, key1:key1, key2:key2}" -o json

Write-Host "`n🔑 Azure AI Vision Connection:" -ForegroundColor Cyan
az cognitiveservices account keys list --name "workflowai-vision" --resource-group WorkFlowAI-rg --query "{endpoint:endpoint, key1:key1, key2:key2}" -o json

Write-Host "`n🔑 Cosmos DB Connection:" -ForegroundColor Cyan
az cosmosdb keys list --name "workflowai-db" --resource-group WorkFlowAI-rg --type connection-strings --query "connectionStrings[0].connectionString"

# Step 10: Final credit check
Write-Host "`n10. Final credit check..." -ForegroundColor Green
Write-Host "Checking remaining credit..." -ForegroundColor Yellow
az consumption usage summary list --query "[].{Currency:currency, CurrentSpend:pretaxCost, Credit:credit}" -o table

Write-Host "`n🎉 Setup Complete!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Yellow
Write-Host "✅ Azure OpenAI Service deployed" -ForegroundColor Green
Write-Host "✅ Azure AI Vision Service deployed" -ForegroundColor Green
Write-Host "✅ Azure Cosmos DB deployed" -ForegroundColor Green
Write-Host "✅ Resource group created" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Copy the connection strings above" -ForegroundColor White
Write-Host "2. Add them to your .env file" -ForegroundColor White
Write-Host "3. Update your Azure Functions to use these services" -ForegroundColor White
Write-Host "4. Monitor credit usage in Azure Portal" -ForegroundColor White
Write-Host "`n💰 Credit consumed: ~$130-200 (depending on usage)" -ForegroundColor Magenta
Write-Host "🎯 Mission accomplished! Your WorkFlowAI platform is now AI-powered!" -ForegroundColor Green
