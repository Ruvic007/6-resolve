import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import "../Dashboard.css";

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Données de démonstration
const DEMO_DATA = {
  metrics: {
    coutTotal: 787,
    consommationTotale: 956,
    impactCarbone: 11,
    energieRenouvelable: 0,
  },
  consommationParUsages: {
    labels: ["Chauffage", "Éclairage", "Climatisation"],
    data: {
      chauffage: 650,
      eclairage: 250,
      climatisation: 56,
    },
  },
  repartitionCouts: {
    electricite: 70,
    gaz: 30,
  },
  detailsBatiment: [
    { label: "Bâtiment name", value: "" },
    { label: "Aux liets", value: "22 m²" },
    { label: "Bâtiment", value: "70 m²" },
    { label: "Condition", value: "Brosis Canside" },
  ],
  actionsPrioritaires: [
    {
      id: 1,
      titre: "Isolation comble",
      statut: "Complet",
      couleur: "green",
      icon: "💡",
    },
    {
      id: 2,
      titre: "Isolation corrátle",
      statut: "En cours",
      couleur: "orange",
      icon: "💡",
    },
    {
      id: 3,
      titre: "Conversion mantiaire",
      statut: "Planifié",
      couleur: "red",
      icon: "⭐",
    },
    {
      id: 4,
      titre: "Ponlectivite glonitaire",
      statut: "Terminé",
      couleur: "green",
      icon: "⭐",
    },
  ],
};

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer l'ID de la company depuis les paramètres ou la location state
  const currentCompanyId = companyId || location.state?.companyId;

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Si pas de company_id, ne pas faire d'appel API
      if (!currentCompanyId) {
        setLoading(false);
        setError("no_company");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const apiUrl = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(
          `${apiUrl}/api/dashboard/${currentCompanyId}`
        );

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.status === "success" && result.data) {
          setDashboardData(result.data);
        } else {
          throw new Error(result.message || "Données invalides");
        }
        
      } catch (err) {
        console.error("Erreur API:", err);
        setError(err.message);
        // Fallback sur les données de démonstration
        setDashboardData(DEMO_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentCompanyId]);

  // Configuration du graphique bar chart
  const barChartData = {
    labels: dashboardData?.consommationParUsages?.labels || DEMO_DATA.consommationParUsages.labels,
    datasets: [
      {
        label: "Consommation (kWh)",
        data: dashboardData?.consommationParUsages?.data
          ? [
              dashboardData.consommationParUsages.data.electricite || 0,
              dashboardData.consommationParUsages.data.gaz || 0,
              dashboardData.consommationParUsages.data.autres || 0,
            ]
          : [650, 250, 56],
        backgroundColor: ["#10b981", "#fbbf24", "#6b7280"],
        borderColor: ["#0d966b", "#d97706", "#4b5563"],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Consommation par Usages",
        font: {
          size: 16,
          weight: "bold",
        },
        color: "#1f2937",
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        max: 5000,
        ticks: {
          callback: function(value) {
            return value + ' kWh';
          }
        },
      },
    },
  };

  // Configuration du donut chart
  const donutChartData = {
    labels: ["Électricité", "Gaz"],
    datasets: [
      {
        data: dashboardData?.repartitionCouts
          ? [
              dashboardData.repartitionCouts.electricite || 0,
              dashboardData.repartitionCouts.gaz || 0,
            ]
          : [70, 30],
        backgroundColor: ["#10b981", "#fbbf24"],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      title: {
        display: true,
        text: "Répartition des Coûts (%)",
        font: {
          size: 16,
          weight: "bold",
        },
        color: "#1f2937",
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    },
    cutout: '60%',
  };

  // Navigation handlers
  const handleNavigation = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des données du dashboard...</p>
        </div>
      </div>
    );
  }

  // Cas spécial: pas de company_id fourni
  if (error === "no_company") {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-error">
          <div className="error-icon">📋</div>
          <h3>Aucun audit sélectionné</h3>
          <p>Vous devez d'abord compléter un audit énergétique pour voir votre dashboard.</p>
          <button
            className="retry-btn"
            onClick={() => navigate("/audit")}
          >
            Commencer un audit
          </button>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-error">
          <div className="error-icon">⚠️</div>
          <h3>Erreur de chargement</h3>
          <p>{error}</p>
          <button
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const finalData = dashboardData || DEMO_DATA;

  return (
    <div className="dashboard-wrapper">
      {/* Header Dashboard */}
      <div className="dashboard-header-simple">
        <h1 className="dashboard-title">
          📊 Dashboard Énergétique - {finalData.company_name || (currentCompanyId ? `Entreprise ${currentCompanyId}` : 'Données de démonstration')}
        </h1>
        {error && !dashboardData && (
          <div className="dashboard-warning">
            ⚠️ Utilisation des données de démonstration
          </div>
        )}
      </div>

      {/* Content */}
      <div className="dashboard-content-clean">
          {/* Métriques */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon blue">💰</div>
              <div className="metric-info">
                <div className="metric-label">Coût Total Annuel</div>
                <div className="metric-value">
                  {finalData.metrics.coutTotal} €
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon yellow">⚡</div>
              <div className="metric-info">
                <div className="metric-label">Consommation Totale</div>
                <div className="metric-value">
                  {finalData.metrics.consommationTotale} kWh
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon grey">☁️</div>
              <div className="metric-info">
                <div className="metric-label">Impact Carbone</div>
                <div className="metric-value">
                  {finalData.metrics.impactCarbone} tCO₂e
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-icon green">🌿</div>
              <div className="metric-info">
                <div className="metric-label">Énergie Renouvelable</div>
                <div className="metric-value">
                  {finalData.metrics.energieRenouvelable} %
                </div>
              </div>
            </div>
          </div>

          {/* Graphiques */}
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-container">
                <Bar data={barChartData} options={barChartOptions} />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-container">
                <Doughnut data={donutChartData} options={donutChartOptions} />
              </div>
            </div>
          </div>

          {/* Détails et Simulation PV */}
          <div className="details-actions-grid">
            <div className="details-card">
              <h3 className="card-title">Détails du Bâtiment</h3>
              <div className="details-table">
                {(finalData.detailsBatiment || []).map((item, index) => (
                  <div key={index} className="details-row">
                    <span className="details-label">{item.label}</span>
                    <span className="details-value">{item.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="actions-card">
              <h3 className="card-title">Simulation Panneaux Solaires</h3>
              {finalData.simulationPV ? (
                <div className="details-table">
                  <div className="details-row">
                    <span className="details-label">Puissance installée</span>
                    <span className="details-value">{finalData.simulationPV.puissance_kw || 0} kW</span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Production annuelle</span>
                    <span className="details-value">{finalData.simulationPV.production_kwh || 0} kWh</span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Économies annuelles</span>
                    <span className="details-value">{finalData.simulationPV.economies_annuelles || 0} €</span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Réduction CO2</span>
                    <span className="details-value">{finalData.simulationPV.reduction_co2_kg || 0} kg/an</span>
                  </div>
                  <div className="details-row">
                    <span className="details-label">Retour sur investissement</span>
                    <span className="details-value">{finalData.simulationPV.roi_annees || "—"} ans</span>
                  </div>
                </div>
              ) : (
                <p className="no-data">Aucune simulation disponible</p>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}