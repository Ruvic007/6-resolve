export const getBarConfig = (data) => ({
  data: {
    labels: data?.consommationParUsages?.labels || ["Électricité", "Gaz", "Autres"],
    datasets: [{
      label: "Consommation (kWh)",
      data: [
        data?.consommationParUsages?.data?.electricite || 0,
        data?.consommationParUsages?.data?.gaz || 0,
        data?.consommationParUsages?.data?.autres || 0,
      ],
      backgroundColor: ["rgba(16,185,129,0.85)", "rgba(251,191,36,0.85)", "rgba(107,114,128,0.85)"],
      borderColor:     ["#10b981", "#fbbf24", "#6b7280"],
      borderWidth: 2,
      borderRadius: 6,
      borderSkipped: false,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Consommation par Usages",
        font: { size: 16, weight: "bold" },
        padding: { bottom: 16 },
      },
      legend: { display: false },
      // ✅ Valeurs affichées au-dessus des barres
      datalabels: {
        anchor: "end",
        align: "end",
        formatter: (v) => v.toLocaleString("fr-FR") + " kWh",
        font: { weight: "bold", size: 12 },
        color: "#374151",
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y.toLocaleString("fr-FR")} kWh`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 13 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: {
          callback: (v) => v.toLocaleString("fr-FR") + " kWh",
          font: { size: 12 },
        },
      },
    },
    layout: { padding: { top: 24 } }, // espace pour les datalabels
  },
});

export const getDonutConfig = (data) => {
  const elec = data?.repartitionCouts?.electricite || 50;
  const gaz  = data?.repartitionCouts?.gaz || 50;
  const total = elec + gaz;

  return {
    data: {
      labels: ["Électricité", "Gaz"],
      datasets: [{
        data: [elec, gaz],
        backgroundColor: ["rgba(16,185,129,0.85)", "rgba(251,191,36,0.85)"],
        borderColor:     ["#10b981", "#fbbf24"],
        borderWidth: 2,
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Répartition des Coûts (%)",
          font: { size: 16, weight: "bold" },
          padding: { bottom: 12 },
        },
        legend: {
          position: "bottom",
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10,
          },
        },
        // ✅ Valeurs + % affichés dans/sur les parts
        datalabels: {
          formatter: (v) => {
            const pct = ((v / total) * 100).toFixed(1);
            return `${pct}%\n${v.toLocaleString("fr-FR")} €`;
          },
          color: "#fff",
          font: { weight: "bold", size: 13 },
          textAlign: "center",
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return ` ${ctx.label} : ${ctx.parsed.toLocaleString("fr-FR")} € (${pct}%)`;
            },
          },
        },
      },
      cutout: "60%",
      animation: { animateRotate: true, animateScale: true },
    },
  };
};