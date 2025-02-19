let chartInstance = null; // Definição global (corrigido!)

document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        processarTexto(text);
    };
    reader.readAsText(file);
});

function processarTexto(text) {
    console.log("Arquivo carregado!");
    const lines = text.trim().split(/\r?\n/);
    console.log("Número de linhas lidas:", lines.length);

    const comercioMap = new Map();

    lines.forEach((line) => {
        const cols = line.split("\t").map((col) => col.trim());

        if (cols.length >= 10) {  // Garante que há pelo menos 10 colunas
            let nomeComercio = cols[6] || "Desconhecido";
            let valor = parseFloat(cols[9]?.replace(",", ".")) || 0;

            if (comercioMap.has(nomeComercio)) {
                comercioMap.set(nomeComercio, comercioMap.get(nomeComercio) + valor);
            } else {
                comercioMap.set(nomeComercio, valor);
            }
        }
    });

    const comercioArray = Array.from(comercioMap.entries())
        .map(([nome, valor]) => ({ nome, valor }))
        .sort((a, b) => b.valor - a.valor)  // Ordena do maior para o menor
        .slice(0, 10);  // Pega os 10 maiores

    const labels = comercioArray.map(item => item.nome);
    const data = comercioArray.map(item => item.valor);

    console.log("Registros processados:", labels.length);

    if (labels.length === 0) {
        document.getElementById("status").innerText = "Erro ao ler o arquivo. Verifique o formato!";
    } else {
        document.getElementById("status").innerText = "";
        gerarGrafico(labels, data);
    }
}

function gerarGrafico(labels, data) {
    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = document.getElementById("grafico").getContext("2d");

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Total de Vendas",
                    data: data,
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                }
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(...data) * 1.2,
                    ticks: {
                        stepSize: 10,
                    },
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 10,
                    },
                },
            },
        },
    });
}
