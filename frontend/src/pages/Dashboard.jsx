import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import "../Dashboard.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

import { useDashboardData } from "../hooks/useDashboardData";
import { getBarConfig, getDonutConfig } from "../utils/chartConfigs";
import { MetricCard, SidebarIcon } from "../components/DashboardWidgets";

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
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des données du dashboard...</p>
      </div>
    );
  }

  // Cas spécial: pas de company_id fourni
  if (error === "no_company") {
    return (
      <div className="dashboard-error">
        <div className="error-icon">📋</div>
        <h3>Aucun audit sélectionné</h3>
        <p>Vous devez d'abord compléter un audit énergétique pour voir votre dashboard.</p>
        <button className="retry-btn" onClick={() => navigate("/audit")}>
          Commencer un audit
        </button>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="dashboard-error">
        <div className="error-icon">⚠️</div>
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </div>
    );
  }

  // Données par défaut si pas de données
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
    <div className="dashboard-container">
      {/* Sidebar */}
      {/*
        <aside className="dashboard-sidebar">
          <SidebarIcon icon="🏠" title="Dashboard" active onClick={() => navigate("/dashboard")} />
          <SidebarIcon icon="📋" title="Audit" onClick={() => navigate("/audit")} />
          <SidebarIcon icon="📜" title="Historique" onClick={() => navigate("/historique")} />
        </aside>
      */}

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="header-title">Dashboard Energetique</h1>
          </div>
          <div className="header-right">
            <span className="company-name">{finalData.company_name || `Entreprise ${currentId}`}</span>
          </div>
        </header>

        {/* Content */}
        <div className="dashboard-content">
          {/* Métriques */}
          <div className="metrics-grid">
            <MetricCard icon="💰" label="Coût Annuel" value={`${finalData.metrics?.coutTotal || 0} €`} colorClass="blue" />
            <MetricCard icon="⚡" label="Consommation" value={`${finalData.metrics?.consommationTotale || 0} kWh`} colorClass="yellow" />
            <MetricCard icon="☁️" label="Carbone" value={`${finalData.metrics?.impactCarbone || 0} tCO₂e`} colorClass="grey" />
            <MetricCard icon="🌿" label="Renouvelable" value={`${finalData.metrics?.energieRenouvelable || 0} %`} colorClass="green" />
          </div>

          {/* Graphiques */}
          <div className="charts-grid">
            <div className="chart-card"><Bar {...barConfig} /></div>
            <div className="chart-card"><Doughnut {...donutConfig} /></div>
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
      </main>
    </div>
  );
}
