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
import "../App.css";

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
      try {
        setLoading(true);
        setError(null);
        
        const apiUrl = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(
          `${apiUrl}/api/dashboard/${currentCompanyId || "latest"}`
        );

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setDashboardData(data);
        
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
              dashboardData.consommationParUsages.data.chauffage || 0,
              dashboardData.consommationParUsages.data.eclairage || 0,
              dashboardData.consommationParUsages.data.climatisation || 0,
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
        max: 1200,
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
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des données du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="dashboard-container">
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
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div 
          className="sidebar-icon active" 
          onClick={() => handleNavigation("/dashboard")}
          title="Dashboard"
        >
          🏠
        </div>
        <div 
          className="sidebar-icon" 
          onClick={() => handleNavigation("/audit")}
          title="Audit"
        >
          📋
        </div>
        <div 
          className="sidebar-icon" 
          onClick={() => handleNavigation("/settings")}
          title="Paramètres"
        >
          ⚙️
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <span className="header-logo">🌱</span>
            <h1 className="header-title">ECO-DASH</h1>
            <h2 className="header-subtitle">
              Synthèse Énergétique: {currentCompanyId ? `Company ${currentCompanyId}` : 'Junior'}
            </h2>
          </div>
          <div className="header-right">
            <button className="header-icon-btn" title="Notifications">🔔</button>
            <button className="header-icon-btn" title="Profil">👤</button>
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-content">
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

          {/* Détails et Actions */}
          <div className="details-actions-grid">
            <div className="details-card">
              <h3 className="card-title">Détails du Bâtiment</h3>
              <div className="details-table">
                {finalData.detailsBatiment.map((item, index) => (
                  <div key={index} className="details-row">
                    <span className="details-label">{item.label}</span>
                    <span className="details-value">{item.value || "—"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="actions-card">
              <h3 className="card-title">Actions Prioritaires</h3>
              <div className="actions-list">
                {finalData.actionsPrioritaires.map((action) => (
                  <div key={action.id} className="action-item">
                    <span className="action-icon">{action.icon}</span>
                    <div className="action-content">
                      <div className="action-titre">{action.titre}</div>
                      <div className={`action-statut ${action.couleur}`}>
                        {action.statut}
                      </div>
                    </div>
                    <span className="action-arrow">▼</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}