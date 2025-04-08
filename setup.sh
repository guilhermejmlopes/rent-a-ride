#!/bin/bash

# VARIÁVEIS
RESOURCE_GROUP="resource-group-rent-a-ride"
LOCATION="uksouth"
APP_NAME="rent-a-ride-app"
PLAN_NAME="plan-rent-a-ride"
COSMOS_ACCOUNT="cosmosdbrentaride"  
COSMOS_DB="rent-a-ride"
STORAGE_ACCOUNT="storagerentaride$RANDOM" 
CONTAINER_NAME="blob-rent-a-ride"
GITHUB_REPO="https://github.com/joaoPires04/rent-a-ride.git"  # URL do repositório GitHub
BRANCH="main"  # O branch que queres usar

# Cria o Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Cria o App Service Plan (grátis, Linux)
az appservice plan create \
  --name $PLAN_NAME \
  --resource-group $RESOURCE_GROUP \
  --sku F1 \
  --is-linux

# Cria a Web App PHP (runtime direto, sem Docker)
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $PLAN_NAME \
  --name $APP_NAME \
  --runtime "PHP|8.2"

# Associa o repositório GitHub à Web App para deploy contínuo
az webapp deployment source config \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --repo-url $GITHUB_REPO \
  --branch $BRANCH \
  --manual-integration

# Mostra o Git remoto para deploy
DEPLOYMENT_URL=$(az webapp deployment source config-local-git \
  --name $APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query url --output tsv)

echo "Git: $DEPLOYMENT_URL"

# Cria a conta CosmosDB (serverless, MongoDB API)
az cosmosdb create \
  --name $COSMOS_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --locations regionName=$LOCATION failoverPriority=0 \
  --kind MongoDB \
  --default-consistency-level Eventual 

# Cria base de dados MongoDB
az cosmosdb mongodb database create \
  --account-name $COSMOS_ACCOUNT \
  --name $COSMOS_DB \
  --resource-group $RESOURCE_GROUP

# Cria Storage Account (tem de ser única globalmente)
az storage account create \
  --name $STORAGE_ACCOUNT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku Standard_LRS

# Cria container Blob
az storage container create \
  --account-name $STORAGE_ACCOUNT \
  --name $CONTAINER_NAME \
  --public-access off

# Resultado final
echo "Setup concluído com sucesso!"
echo "Web App: https://$APP_NAME.azurewebsites.net"
