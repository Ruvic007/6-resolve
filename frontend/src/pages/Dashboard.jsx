import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import "../Dashboard.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

import { useDashboardData } from "../hooks/useDashboardData";
import { getBarConfig, getDonutConfig } from "../utils/chartConfigs";
import { MetricCard } from "../components/DashboardWidgets";
import { SimulationPanel } from "../components/SimulationPanel";

// Enregistrement ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export function Dashboard() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const { state } = useLocation();

  const currentId = companyId || state?.companyId;
  const { data, loading, error } = useDashboardData(currentId);

  if (loading) {
    return (
      <div className="app-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error === "no_company") {
    return (
      <div className="app-container">
        <div className="dashboard-empty-state">
          <div className="empty-icon">📋</div>
          <h2>Aucun audit sélectionné</h2>
          <p>Complétez un audit énergétique pour voir votre dashboard personnalisé.</p>
          <button className="btn-primary" onClick={() => navigate("/audit")}>
            Commencer un audit
          </button>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="app-container">
        <div className="dashboard-empty-state error">
          <div className="empty-icon">⚠️</div>
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const defaultData = {
    company_name: "Données de démonstration",
    metrics: {
      coutTotal: 0,
      consommationTotale: 0,
      impactCarbone: 0,
      energieRenouvelable: 0
    },
    consommationParUsages: {
      labels: ["Électricité", "Gaz", "Autres"],
      data: { electricite: 0, gaz: 0, autres: 0 }
    },
    repartitionCouts: { electricite: 50, gaz: 50 },
    detailsBatiment: [],
    simulationPV: null
  };

  const finalData = data || defaultData;
  const barConfig = getBarConfig(finalData);
  const donutConfig = getDonutConfig(finalData);

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-logo">🌱</span>
          <h1 className="app-title">EcoPulse</h1>
        </div>
        <div className="app-header-center">
          <span className="company-badge">{finalData.company_name || `Entreprise #${currentId}`}</span>
        </div>
        <div className="app-header-right">
          <button className="btn-icon" onClick={() => navigate("/audit")} title="Nouvel audit">
            ➕
          </button>
          <button className="btn-icon" onClick={() => navigate("/historique")} title="Historique">
            📜
          </button>
        </div>
      </header>

      {/* Main App Content */}
      <main className="app-main">
        {/* Section: Métriques clés */}
        <section className="app-section">
          <h2 className="section-title">Vue d'ensemble</h2>
          <div className="metrics-grid">
            <MetricCard icon="💰" label="Coût Annuel" value={`${finalData.metrics?.coutTotal || 0} €`} colorClass="blue" />
            <MetricCard icon="⚡" label="Consommation" value={`${finalData.metrics?.consommationTotale || 0} kWh`} colorClass="yellow" />
            <MetricCard icon="☁️" label="Carbone" value={`${finalData.metrics?.impactCarbone || 0} tCO₂e`} colorClass="grey" />
            <MetricCard icon="🌿" label="Renouvelable" value={`${finalData.metrics?.energieRenouvelable || 0} %`} colorClass="green" />
          </div>
        </section>

        {/* Section: Graphiques */}
        <section className="app-section">
          <h2 className="section-title">Analyse de consommation</h2>
          <div className="charts-grid">
            <div className="chart-card">
              <Bar {...barConfig} />
            </div>
            <div className="chart-card">
              <Doughnut {...donutConfig} />
            </div>
          </div>
        </section>

        {/* Section: Simulations */}
        <section className="app-section">
          <h2 className="section-title">Simulations d'optimisation</h2>
          <SimulationPanel simulationPV={finalData.simulationPV} />
        </section>

        {/* Section: Recommandations (placeholder) */}
        <section className="app-section">
          <h2 className="section-title">Recommandations</h2>
          <div className="recommendations-panel">
            <div className="recommendations-placeholder">
              <div className="placeholder-icon">💡</div>
              <h3>Recommandations personnalisées</h3>
              <p>Basées sur votre audit, des recommandations d'optimisation énergétique seront bientôt disponibles ici.</p>
              <div className="placeholder-features">
                <span className="feature-tag">Priorités d'action</span>
                <span className="feature-tag">ROI estimé</span>
                <span className="feature-tag">Impact carbone</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Détails du bâtiment */}
        <section className="app-section">
          <h2 className="section-title">Informations du bâtiment</h2>
          <div className="building-info-card">
            {(finalData.detailsBatiment || []).length > 0 ? (
              <div className="building-info-grid">
                {finalData.detailsBatiment.map((item, index) => (
                  <div key={index} className="building-info-item">
                    <span className="info-label">{item.label}</span>
                    <span className="info-value">{item.value || "—"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">Aucune information disponible</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
