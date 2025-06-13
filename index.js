const express = require('express');
const path = require('path');
require('dotenv').config();
const { CosmosClient } = require('@azure/cosmos');
const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());

// Configurações do CosmosDB
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const client = new CosmosClient({ endpoint, key });

// Base de dados
const databaseId = "rent-a-ride";
// Containers
const carrosContainerId = "carros";
const tiposCarroContainerId = "tipos_carro";
const tiposCombustivelContainerId = "tipos_combustivel";
const utilizadoresContainerId = "utilizadores";

const carrosContainer = client.database(databaseId).container(carrosContainerId);
const tiposCarroContainer = client.database(databaseId).container(tiposCarroContainerId);
const tiposCombustivelContainer = client.database(databaseId).container(tiposCombustivelContainerId);
const utilizadoresContainer = client.database(databaseId).container(utilizadoresContainerId);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/imagens', express.static(path.join(__dirname, 'imagens')));

// Endpoint - /carros
app.get('/carros', async (req, res) => {
    try {
        const carrosQuery = { query: "SELECT * FROM carros" };
        const tiposCarroQuery = { query: "SELECT * FROM tipos_carro" };
        const tiposCombustivelQuery = { query: "SELECT * FROM tipos_combustivel" };

        const { resources: carros } = await carrosContainer.items.query(carrosQuery).fetchAll();
        const { resources: tiposCarro } = await tiposCarroContainer.items.query(tiposCarroQuery).fetchAll();
        const { resources: combustiveis } = await tiposCombustivelContainer.items.query(tiposCombustivelQuery).fetchAll();

        for (let carro of carros) {
            const tipo = tiposCarro.find(tipo => tipo.id === carro.tipo);
            if (tipo)
                carro.tipo = tipo.nome;
        }

        res.json(carros);
    } catch (error) {
        console.error('Erro ao obter carros:', error);
        res.status(500).send('Erro ao obter carros');
    }
});

// Endpoint - /tipos_carro
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

// Body parser
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint - /login
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

app.get('/carros', async (req, res) => {
    const { id } = req.query;

    // Aqui você busca o carro na sua base de dados
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


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});