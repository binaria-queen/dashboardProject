document.addEventListener("DOMContentLoaded", function() {
  fetch('data/dados.txt')
  .then(response => response.text())
  .then(data => parseDataAsync(data))
  .then(parsedData => {
      // Limitei a 1000 registros para não sobrecarregar o gráfico
      const limit = 1000;
      parsedData.categorias = parsedData.categorias.slice(0, limit); 
      parsedData.valores = parsedData.valores.slice(0, limit); 

      console.log("Categorias (Estados):", parsedData.categorias);
      console.log("Valores:", parsedData.valores);
      
      // Agrega os dados por estado e categoria
      const estadosAgrupados = agruparPorEstadoCategoria(parsedData);
      
      // Análise adicional para encontrar o comércio mais forte por estado
      const comercioFortePorEstado = getComercioForte(estadosAgrupados);
      
      // Encontra as categorias menos vendidas por estado
      const comercioFracoPorEstado = getComercioFraco(estadosAgrupados);
      
      createCharts(estadosAgrupados, comercioFortePorEstado, comercioFracoPorEstado); // Passa também os dados agregados
  })
  .catch(error => console.error("Erro ao carregar os dados:", error));

  async function parseDataAsync(data) {
      const linhas = data.split('\n'); // Divide o conteúdo em linhas
      const categorias = []; // Agora representando os estados
      const valores = [];
      const estadosComercio = {}; // Para armazenar os dados de comércio por estado e categoria

      for (let i = 0; i < linhas.length; i++) {
          const campos = linhas[i].split('\t'); // Divide a linha por tabulação

          if (campos.length > 10) {
              const estado = campos[3]; // coluna de ESTADO
              const categoria = campos[6]; // TIPO DE COMÉRCIO na coluna 7
              const valor1 = parseFloat(campos[8]); // O valor 1 (assumindo que está no índice 8)

              // Verifica se o valor1 é um número válido
              if (!isNaN(valor1)) {
                  categorias.push(estado); // Adiciona o estado (categoria)
                  valores.push(valor1); // Adiciona o valor correspondente
                  
                  // Organizando os valores por estado e categoria de comércio
                  if (!estadosComercio[estado]) {
                      estadosComercio[estado] = {};
                  }
                  if (!estadosComercio[estado][categoria]) {
                      estadosComercio[estado][categoria] = 0;
                  }
                  estadosComercio[estado][categoria] += valor1;
              }
          }
      }

      // Agora estamos retornando categorias (estados), valores e os dados de comércio por estado
      return { categorias, valores, estadosComercio };
  }

  // Função para agregar os dados por estado e categoria
  function agruparPorEstadoCategoria(parsedData) {
      const estadosAgrupados = {
          categorias: [], // Estados
          valores: [], // Valores totais dos estados
          comerciosPorEstado: {} // Comercios por estado
      };

      for (const estado in parsedData.estadosComercio) {
          let totalPorEstado = 0;
          let comerciosEstado = parsedData.estadosComercio[estado];

         
          for (const categoria in comerciosEstado) {
              if (!estadosAgrupados.categorias.includes(estado)) {
                  estadosAgrupados.categorias.push(estado); // Estado
              }
              totalPorEstado += comerciosEstado[categoria]; // Soma os valores de cada categoria de comércio para o estado

              // Armazena os comercios por estado
              if (!estadosAgrupados.comerciosPorEstado[estado]) {
                  estadosAgrupados.comerciosPorEstado[estado] = [];
              }
              estadosAgrupados.comerciosPorEstado[estado].push({
                  categoria: categoria,
                  valor: comerciosEstado[categoria]
              });
          }

          estadosAgrupados.valores.push(totalPorEstado); 
      }

      return estadosAgrupados;
  }

  
  function getComercioForte(estadosAgrupados) {
      const comercioFortePorEstado = {};

      // Para cada estado, encontra a categoria com o maior valor
      for (const estado in estadosAgrupados.comerciosPorEstado) {
          const comercios = estadosAgrupados.comerciosPorEstado[estado];
          let comercioForte = null;
          let maiorValor = 0;

          for (const comercio of comercios) {
              if (comercio.valor > maiorValor) {
                  maiorValor = comercio.valor;
                  comercioForte = comercio.categoria;
              }
          }
          comercioFortePorEstado[estado] = { categoria: comercioForte, valor: maiorValor }; // Armazena o comércio mais forte por estado com o valor
      }

      return comercioFortePorEstado;
  }

 
  function getComercioFraco(estadosAgrupados) {
      const comercioFracoPorEstado = {};

      // Para cada estado, encontra a categoria com o menor valor
      for (const estado in estadosAgrupados.comerciosPorEstado) {
          const comercios = estadosAgrupados.comerciosPorEstado[estado];
          let comercioFraco = null;
          let menorValor = Infinity;

          for (const comercio of comercios) {
              if (comercio.valor < menorValor) {
                  menorValor = comercio.valor;
                  comercioFraco = comercio.categoria;
              }
          }
          comercioFracoPorEstado[estado] = { categoria: comercioFraco, valor: menorValor }; // Armazena o comércio mais fraco por estado com o valor
      }

      return comercioFracoPorEstado;
  }

  
function createCharts(data, comercioFortePorEstado) {
  // 1. Gráfico de Barras - Valor Total por Estado
  const ctxBarra = document.getElementById('graficoBarra').getContext('2d');
  new Chart(ctxBarra, {
      type: 'bar',
      data: {
          labels: data.categorias, // Estados no eixo X
          datasets: [{
              label: 'Valor Total',
              data: data.valores, // Valores no eixo Y
              backgroundColor: '#4e73df',
              borderColor: '#4e73df',
              borderWidth: 1
          }]
      },
      options: {
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });

  // 2. Gráfico de Linha - Evolução das Categorias Menos Vendidas por Estado
  const ctxLinha = document.getElementById('graficoLinha').getContext('2d');
  
  
  const estadosLinha = Object.keys(comercioFortePorEstado);
  const categoriasMenosVendidas = estadosLinha.map(estado => comercioFortePorEstado[estado].categoria); // Menos vendidas por estado
  const valoresMenosVendidos = estadosLinha.map(estado => comercioFortePorEstado[estado].valor); // Menor valor por estado

  new Chart(ctxLinha, {
      type: 'line',
      data: {
          labels: estadosLinha, // Estados no eixo X
          datasets: [{
              label: 'Evolução das Categorias Menos Vendidas',
              data: valoresMenosVendidos, // Valores das categorias menos vendidas
              borderColor: '#e74c3c', // Cor para linha
              fill: false
          }]
      },
      options: {
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });

  // 3. Gráfico de Pizza - Comércio Mais Forte por Estado
  const estados = Object.keys(comercioFortePorEstado);
  const comerciosMaisFortes = estados.map(estado => comercioFortePorEstado[estado].categoria); // Categoria mais forte por estado
  const valoresComercioForte = estados.map(estado => comercioFortePorEstado[estado].valor); // Valor da categoria mais forte por estado

  // Criar rótulos combinados para mostrar "Estado - Categoria"
  const rotulosCompletos = estados.map(estado => {
      const categoria = comercioFortePorEstado[estado].categoria;
      const valor = comercioFortePorEstado[estado].valor;
      return `${estado} (${valor.toFixed(2)})`; //  estado e o valor total
  });

  const ctxPizza = document.getElementById('graficoPizza').getContext('2d');
  new Chart(ctxPizza, {
      type: 'pie',
      data: {
          labels: rotulosCompletos, //  estados e os valores
          datasets: [{
              label: 'Comércio Mais Forte por Estado',
              data: valoresComercioForte, // Valores das categorias mais fortes
              backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f1c40f', '#e74c3c'],
          }]
      },
      options: {
          responsive: true,
          tooltips: {
              callbacks: {
                  
                  label: function(tooltipItem, data) {
                      const index = tooltipItem.index;
                      const estado = data.labels[index].split(' ')[0]; // Pega o estado do rótulo
                      const categoria = comercioFortePorEstado[estado].categoria; // Categoria correspondente
                      const valor = tooltipItem.raw; // Valor da fatia
                      return `${estado} - ${categoria}: ${valor.toFixed(2)}`; // Exibe estado, categoria e o valor
                  }
              }
          }
      }
  });
}




});
