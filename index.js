const express = require('express');
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const app = express();
const session = require('express-session');

app.use(session({
    secret: 'segredo-super-seguro', // muda isto para algo mais seguro em produção
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, sameSite: 'lax' }                                  // em desenvolvimento
//  cookie: { secure: process.env.NODE_ENV === 'production', sameSite: 'lax' }  // em produção
}));
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Cosmos DB Config
const { CosmosClient } = require('@azure/cosmos');
const endpoint = "https://cosmos-rent-a-ride.documents.azure.com:443/";
const key = "gGZKSspnBakRE7tHb0iBZfVI0FhfHH7VvPnPQMNgTEx1CQrvqpgiTiWD42qNtwhyFtTvM3tBTQcKACDbthFVoQ==";
const client = new CosmosClient({ endpoint, key });

const databaseId = "rent-a-ride";
const carrosContainer = client.database(databaseId).container("carros");
const tiposCarroContainer = client.database(databaseId).container("tipos_carro");
const tiposCombustivelContainer = client.database(databaseId).container("tipos_combustivel");
const utilizadoresContainer = client.database(databaseId).container("utilizadores");

// Endpoint - Todos os carros
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

        const carro = carros[0];

        const [tiposCarroData, tiposCombustivelData] = await Promise.all([
            tiposCarroContainer.items.query("SELECT * FROM c").fetchAll(),
            tiposCombustivelContainer.items.query("SELECT * FROM c").fetchAll()
        ]);

        const tipoCarro = tiposCarroData.resources.find(t => t.id === carro.tipo);
        const tipoCombustivel = tiposCombustivelData.resources.find(c => c.id === carro.tipo_combustivel);

        // Substitui os IDs pelos nomes
        carro.tipo = tipoCarro ? tipoCarro.nome : carro.tipo;
        carro.tipo_combustivel = tipoCombustivel ? tipoCombustivel.nome : carro.tipo_combustivel;

        return res.json(carro);
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
            req.session.user = {
                id: utilizador.id,
                nome: utilizador.nome,
                username: utilizador.username
            };

            return res.json({ success: true, nome: utilizador.nome });
        } else {
            return res.status(401).json({ message: "Palavra-passe incorreta." });
        }
    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ message: "Erro interno." });
    }
});

// Endpoint - Carro por ID
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
        // Ordenar os carros por ordem alfabética (modelo)
        carros.sort((a, b) => a.modelo.localeCompare(b.modelo));
        res.json(carros);
    } catch (error) {
        console.error('Erro ao obter carros:', error);
        res.status(500).send('Erro ao obter carros');
    }
});

// Endpoint - Perfil
app.get('/perfil', (req, res) => {
    if (req.session.user) {
        res.json({ autenticado: true, utilizador: req.session.user });
    } else {
        res.status(401).json({ autenticado: false, message: "Não autenticado." });
    }
});

// Endpoint - Logout
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Erro ao terminar sessão." });
        }
        res.json({ message: "Sessão terminada." });
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor a correr em http://localhost:${port}`);
});
