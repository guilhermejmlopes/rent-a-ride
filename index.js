const express = require('express');
const path = require('path');
require('dotenv').config();
// const { CosmosClient } = require('@azure/cosmos');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/*
// Cosmos DB Config
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const client = new CosmosClient({ endpoint, key });

const databaseId = "rent-a-ride";
const carrosContainer = client.database(databaseId).container("carros");
const tiposCarroContainer = client.database(databaseId).container("tipos_carro");
const tiposCombustivelContainer = client.database(databaseId).container("tipos_combustivel");
const utilizadoresContainer = client.database(databaseId).container("utilizadores");

// Endpoint - Todos os carros
app.get('/carros', async (req, res) => {
    try {
        const carrosQuery = { query: "SELECT * FROM carros" };
        const tiposCarroQuery = { query: "SELECT * FROM tipos_carro" };
        const tiposCombustivelQuery = { query: "SELECT * FROM tipos_combustivel" };

        const { resources: carros } = await carrosContainer.items.query(carrosQuery).fetchAll();
        const { resources: tiposCarro } = await tiposCarroContainer.items.query(tiposCarroQuery).fetchAll();
        const { resources: combustiveis } = await tiposCombustivelContainer.items.query(tiposCombustivelQuery).fetchAll();

        for (let carro of carros) {
            const tipo = tiposCarro.find(t => t.id === carro.tipo);
            const combustivel = combustiveis.find(c => c.id === carro.combustivel);
            if (tipo) carro.tipo = tipo.nome;
            if (combustivel) carro.combustivel = combustivel.nome;
        }

        res.json(carros);
    } catch (error) {
        console.error('Erro ao obter carros:', error);
        res.status(500).send('Erro ao obter carros');
    }
});

// Endpoint - Carro por ID
app.get('/carros/:id', async (req, res) => {
    const { id } = req.params;

    const query = {
        query: "SELECT * FROM c WHERE c.id = @id",
        parameters: [{ name: "@id", value: id }]
    };

    try {
        const { resources: carros } = await carrosContainer.items.query(query).fetchAll();

        if (carros.length === 0) {
            return res.status(404).json({ message: "Carro não encontrado" });
        }

        return res.json(carros[0]);
    } catch (error) {
        console.error("Erro ao buscar carro:", error);
        return res.status(500).json({ message: "Erro interno." });
    }
});

// Endpoint - Tipos de carro
app.get('/tipos_carro', async (req, res) => {
    try {
        const tiposCarroQuery = { query: "SELECT * FROM tipos_carro" };
        const { resources: tiposCarros } = await tiposCarroContainer.items.query(tiposCarroQuery).fetchAll();
        res.json(tiposCarros);
    } catch (error) {
        console.error('Erro ao obter tipos de carro:', error);
        res.status(500).send('Erro ao obter tipos de carro');
    }
});

// Endpoint - Login
app.post('/login', async (req, res) => {
    const { user, pwd } = req.body;

    try {
        const query = {
            query: "SELECT * FROM c WHERE c.username = @user",
            parameters: [{ name: "@user", value: user }]
        };

        const { resources: utilizadores } = await utilizadoresContainer.items.query(query).fetchAll();

        if (utilizadores.length === 0) {
            return res.status(401).json({ message: "Utilizador não encontrado." });
        }

        const utilizador = utilizadores[0];

        if (utilizador.password === pwd) {
            return res.json({ success: true, nome: utilizador.nome });
        } else {
            return res.status(401).json({ message: "Palavra-passe incorreta." });
        }
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: "Erro interno." });
    }
});
*/

// O index.html será servido automaticamente por express.static

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor a correr em http://localhost:${port}`);
});
