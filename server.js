const express = require('express');
const path = require('path');
require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');
const app = express();
const port = 3000;

// Configurações do CosmosDB
const endpoint = "https://cosmos-gabriel-guilherme-joao.documents.azure.com";
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });

// Nome da base de dados
const databaseId = "aluguer_carros";

// Nome do container dos carros
const carrosContainerId = "carros";

// Nome do container dos tipos de carro
const tiposContainerId = "tipos_carro";

// Nome do container dos tipos de combustivel
const combustiveisId = "tipos_combustivel";

// Conexão ao container dos carros
const carrosContainer = client.database(databaseId).container(carrosContainerId);

// Conexão ao container dos tipos
const tiposContainer = client.database(databaseId).container(tiposContainerId);

// Conexão ao container dos combustiveis
const combustivelContainer = client.database(databaseId).container(combustiveisId);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/imagens', express.static(path.join(__dirname, 'imagens')));

// endpoint - /carros
app.get('/carros', async (req, res) => {

  // Query para obter todos os carros
  const queryCarros = {
    query: "SELECT * FROM c"
  };

  // Query para obter todos os tipos
  const tiposQuery = {
    query: "SELECT * FROM c"
  };

  const combustiveisQuery = {
    query: "SELECT * FROM c"
  };

  // Obter todos os carros
  const { resources: carros } = await carrosContainer.items.query(queryCarros).fetchAll();
    
  // Obter todos os tipos de carros
  const { resources: tipos } = await tiposContainer.items.query(tiposQuery).fetchAll();

  // Obter todos os tipos de combustivel
  const { resources: combustiveis } = await combustivelContainer.items.query(combustiveisQuery).fetchAll();

  // Associar o nome do tipo ao carro seu carro
  for (let carro of carros) {
    const tipo = tipos.find(tipo => tipo.id === carro.tipo);
    if (tipo) {
      carro.tipo = tipo.nome;
    }
  }

  // Associar o nome do combustivel ao carro
  for (let carro of carros) {
    const combustivel = combustiveis.find(combustivel => combustivel.id === carro.tipo_combustivel);
    if (combustivel) {
      carro.tipo_combustivel = combustivel.nome;
    }
  }

  // Enviar a resposta como json para o frontend
  res.json(carros);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor ativo em http://localhost:${port}`);
});
