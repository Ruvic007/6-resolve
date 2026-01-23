export const getBarConfig = (data) => ({
  data: {
    labels: data.consommationParUsages.labels,
    datasets: [{
      label: "Consommation (kWh)",
      data: [
        data.consommationParUsages.data.chauffage || 0,
        data.consommationParUsages.data.eclairage || 0,
        data.consommationParUsages.data.climatisation || 0,
      ],
      backgroundColor: ["#10b981", "#fbbf24", "#6b7280"],
      borderWidth: 1,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { title: { display: true, text: "Consommation par Usages", font: { size: 16 } }, legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { callback: v => v + ' kWh' } } }
  }
});

export const getDonutConfig = (data) => ({
  data: {
    labels: ["Électricité", "Gaz"],
    datasets: [{
      data: [data.repartitionCouts.electricite, data.repartitionCouts.gaz],
      backgroundColor: ["#10b981", "#fbbf24"],
      hoverOffset: 8,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        title: { display: true, text: "Répartition des Coûts (%)", font: { size: 16 } },
        legend: { position: "bottom" }
    },
    cutout: '60%',
  }
});