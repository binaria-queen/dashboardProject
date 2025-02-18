
fetch('data/dados.txt')
  .then(response => response.text()) // Lê o arquivo como texto
  .then(data => {
    const linhas = data.split('\n'); // Divide por linha

    const labels = []; // Decidir se UF, ano, setor, etc.
    const valores = []; // Decidir se população, valor de mercado, etc.

    linhas.forEach(linha => {
      const colunas = linha.split('\t'); // Divide os dados pela tabulação

      if (colunas.length >= 11) { // Garante que há colunas suficientes para evitar erros
        const uf = colunas[1]; // UF (Exemplo: "BA", "SP", etc.)
        const setor = colunas[6]; // Nome do Setor Econômico
        const valor = parseFloat(colunas[9]); // Valor numérico para o gráfico

        labels.push(`${uf} - ${setor}`); // Nome no eixo X
        valores.push(valor); // Valor numérico para o eixo Y
      }
    });

    // Criar o gráfico usando Chart.js
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar', // Tipo de gráfico (barras)
      data: {
        labels: labels, // UF + Setor Econômico
        datasets: [{
          label: 'Valor Econômico',
          data: valores,
          backgroundColor: 'rgba(54, 162, 235, 0.5)', // Cor das barras
          borderColor: 'rgba(54, 162, 235, 1)', // Cor da borda
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
  })
  .catch(error => console.error('Erro ao carregar o arquivo:', error));
