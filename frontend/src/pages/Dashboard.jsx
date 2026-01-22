import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

import { useDashboardData } from "../hooks/useDashboardData";
import { getBarConfig, getDonutConfig } from "../utils/chartConfigs";
import { MetricCard, ActionItem, SidebarIcon } from "../components/DashboardWidgets";
import "../App.css";

// Enregistrement ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export function Dashboard() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const { state } = useLocation();
  const currentId = companyId || state?.companyId;

  const { data, loading, error } = useDashboardData(currentId);

  if (loading) return <div className="dashboard-loading"><div className="loading-spinner" /></div>;

  const barConfig = getBarConfig(data);
  const donutConfig = getDonutConfig(data);

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <SidebarIcon icon="🏠" title="Dashboard" active onClick={() => navigate("/dashboard")} />
        <SidebarIcon icon="📋" title="Audit" onClick={() => navigate("/audit")} />
        <SidebarIcon icon="⚙️" title="Paramètres" onClick={() => navigate("/settings")} />
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <span className="header-logo">🌱</span>
            <h1 className="header-title">EcoPulse-Dashboard</h1>
            <h2 className="header-subtitle">ID: {currentId || 'Latest'}</h2>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="metrics-grid">
            <MetricCard icon="💰" label="Coût Annuel" value={`${data.metrics.coutTotal} €`} colorClass="blue" />
            <MetricCard icon="⚡" label="Consommation" value={`${data.metrics.consommationTotale} kWh`} colorClass="yellow" />
            <MetricCard icon="☁️" label="Carbone" value={`${data.metrics.impactCarbone} tCO₂e`} colorClass="grey" />
            <MetricCard icon="🌿" label="Renouvelable" value={`${data.metrics.energieRenouvelable} %`} colorClass="green" />
          </div>

          <div className="charts-grid">
            <div className="chart-card"><Bar {...barConfig} /></div>
            <div className="chart-card"><Doughnut {...donutConfig} /></div>
          </div>

          <div className="details-actions-grid">
            <div className="details-card">
              <h3 className="card-title">Bâtiment</h3>
              {data.detailsBatiment.map((d, i) => (
                <div key={i} className="details-row">
                  <span>{d.label}</span><b>{d.value || "—"}</b>
                </div>
              ))}
            </div>
            <div className="actions-card">
              <h3 className="card-title">Actions</h3>
              {data.actionsPrioritaires.map(a => <ActionItem key={a.id} action={a} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}