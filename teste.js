const { CosmosClient } = require('@azure/cosmos');

// Credenciais e configurações
const endpoint = "https://cosmos-gabriel-guilherme-joao.documents.azure.com";
const key = "oXcKbbJ0MmHSx9T6KKktpZi25dtJCuLvUm2mSj9H1bIPOPxaTRCAjeChGCub1PDUjL74JPhTeZ0oACDbTxTy0g==";
const client = new CosmosClient({ endpoint, key });
const databaseId = "aluguer_carros";
const containerId = "carros";

// Função para executar a query
async function runQuery() {
  const container = client.database(databaseId).container(containerId);

  const querySpec = {
    query: "SELECT * FROM c"
  };

  try {
    const { resources: results } = await container.items.query(querySpec).fetchAll();
    console.log("Resultados encontrados:");

    results.forEach(carro => {
      const id = carro.id;
      const tipo = carro.tipo;
      const modelo = carro.modelo;
      const n_km = carro.n_km;
      const ano = carro.ano;
      const cor = carro.cor;
      const preco_base = carro.preco_base;
      const n_lugares = carro.n_lugares;
      const tipo_combustivel = carro.tipo_combustivel;
      const esta_disponivel = carro.esta_disponivel;
      const imagem = carro.imagem;

      // Apenas para fins de debug
      console.log(`ID: ${id}`);
      console.log(`Tipo: ${tipo}`);
      console.log(`Modelo: ${modelo}`);
      console.log(`Quilómetros: ${n_km}`);
      console.log(`Ano: ${ano}`);
      console.log(`Cor: ${cor}`);
      console.log(`Preço Base: ${preco_base}`);
      console.log(`Nº de Lugares: ${n_lugares}`);
      console.log(`Tipo de Combustível: ${tipo_combustivel}`);
      console.log(`Disponível: ${esta_disponivel}`);
      console.log(`Imagem: ${imagem}`);
      console.log('--------------------------');
    });

  } catch (error) {
    console.error("Erro ao executar a query:", error);
  }
}

runQuery();
