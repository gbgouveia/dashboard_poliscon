// Configuração global do Chart.js para manter o padrão corporativo/glassmorphism
Chart.defaults.color = '#475569';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
Chart.defaults.plugins.tooltip.titleColor = '#F8FAFC';
Chart.defaults.plugins.tooltip.bodyColor = '#E2E8F0';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.legend.labels.usePointStyle = true;

const chartInstances = {};

export function renderLineChart(ctxId, labels, dataSet, labelName) {
    if (chartInstances[ctxId]) chartInstances[ctxId].destroy();
    
    const ctx = document.getElementById(ctxId).getContext('2d');
    
    // Gradient para a linha
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(255, 168, 33, 0.5)'); // Gold alpha
    gradient.addColorStop(1, 'rgba(255, 168, 33, 0.0)');

    chartInstances[ctxId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: labelName,
                data: dataSet,
                borderColor: '#FFA821', // Gold Main
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#FCD6A6', // Gold Light
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#FCD6A6',
                fill: true,
                tension: 0.4 // Suavidade da curva
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }
                },
                x: {
                    grid: { display: false, drawBorder: false }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
        }
    });
}

export function renderBarChart(ctxId, labels, previsto, realizado) {
    if (chartInstances[ctxId]) chartInstances[ctxId].destroy();
    
    const ctx = document.getElementById(ctxId).getContext('2d');

    chartInstances[ctxId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Previsto',
                    data: previsto,
                    backgroundColor: 'rgba(148, 163, 184, 0.5)',
                    borderRadius: 4,
                    barPercentage: 0.6,
                },
                {
                    label: 'Realizado',
                    data: realizado,
                    backgroundColor: '#FFA821',
                    borderRadius: 4,
                    barPercentage: 0.6,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false }
                },
                x: {
                    grid: { display: false, drawBorder: false }
                }
            }
        }
    });
}

export function renderDoughnutChart(ctxId, labels, dataSet) {
    if (chartInstances[ctxId]) chartInstances[ctxId].destroy();
    
    const ctx = document.getElementById(ctxId).getContext('2d');

    chartInstances[ctxId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataSet,
                backgroundColor: [
                    '#FFA821',
                    '#10B981',
                    '#FCD6A6',
                    '#EF4444',
                    '#B67500'
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%', // Estilo rosca fina
            plugins: {
                legend: { position: 'right' }
            }
        }
    });
}

export function renderGaugeChart(ctxId, value) {
    if (chartInstances[ctxId]) chartInstances[ctxId].destroy();
    
    const ctx = document.getElementById(ctxId).getContext('2d');
    
    let color = '#EF4444'; // Vermelho < 70
    if (value >= 70 && value < 90) color = '#F59E0B'; // Amarelo
    if (value >= 90) color = '#10B981'; // Verde

    chartInstances[ctxId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Realizado', 'Faltante'],
            datasets: [{
                data: [value, 100 - value],
                backgroundColor: [color, 'rgba(255,255,255,0.1)'],
                borderWidth: 0,
                circumference: 180, // Metade
                rotation: 270 // Começa na esquerda
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}
