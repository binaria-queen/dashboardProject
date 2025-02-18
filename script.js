document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        processarTexto(text);
    };
    reader.readAsText(file);
});

function processarTexto(text) {
    console.log("Arquivo carregado!");
    const lines = text.trim().split(/\r?\n/); // Garante compatibilidade com Windows/Linux
    console.log("Número de linhas lidas:", lines.length);

    const labels = [];
    const data1 = [];
    const data2 = [];

    lines.forEach((line, index) => {
        const cols = line.split("\t").map(col => col.trim());
    
        console.log(`Linha ${index + 1}: "${line}"`);
        console.log(`Colunas (${cols.length}):`, cols);
    
        if (cols.length >= 11) {  // Ajuste aqui para 11 ao invés de 12
            let nomeComercio = cols[6]?.trim();
            let valor1 = parseFloat(cols[9]?.replace(',', '.')) || 0;
            let valor2 = parseFloat(cols[10]?.replace(',', '.')) || 0;
    
            labels.push(nomeComercio);
            data1.push(valor1);
            data2.push(valor2);
        } else {
            console.warn(`Linha ${index + 1} ignorada: menos colunas do que o esperado`);
        }
    });

    console.log("Registros processados:", labels.length);

    if (labels.length === 0) {
        document.getElementById("status").innerText = "Erro ao ler o arquivo. Verifique o formato!";
    } else {
        document.getElementById("status").innerText = "";
        gerarGrafico(labels, data1, data2);
    }
}


let chartInstance = null; // Variável global para armazenar a instância do gráfico

function gerarGrafico(labels, data1, data2) {
    if (chartInstance) {
        chartInstance.destroy(); // Destroi o gráfico anterior se já existir
    }

    const ctx = document.getElementById("grafico").getContext("2d");
    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Valor 1",
                    data: data1,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
                {
                    label: "Valor 2",
                    data: data2,
                    backgroundColor: "rgba(255, 99, 132, 0.6)",
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        },
    });
}

