import React, { useState } from "react";

const SIMULATION_TABS = [
  { id: "pv", label: "Panneaux Solaires", icon: "☀️", available: true },
  { id: "isolation", label: "Isolation", icon: "🏠", available: false },
  { id: "chauffage", label: "Chauffage", icon: "🔥", available: false },
  { id: "eclairage", label: "Éclairage LED", icon: "💡", available: false },
];

export function SimulationPanel({ simulationPV }) {
  const [activeTab, setActiveTab] = useState("pv");

  const renderSimulationContent = () => {
    switch (activeTab) {
      case "pv":
        return <SimulationPV data={simulationPV} />;
      case "isolation":
        return <SimulationComingSoon type="Isolation thermique" />;
      case "chauffage":
        return <SimulationComingSoon type="Système de chauffage" />;
      case "eclairage":
        return <SimulationComingSoon type="Éclairage LED" />;
      default:
        return null;
    }
  };

  return (
    <div className="simulation-panel">
      <div className="simulation-tabs">
        {SIMULATION_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`simulation-tab ${activeTab === tab.id ? "active" : ""} ${!tab.available ? "disabled" : ""}`}
            onClick={() => tab.available && setActiveTab(tab.id)}
            disabled={!tab.available}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
            {!tab.available && <span className="tab-badge">Bientôt</span>}
          </button>
        ))}
      </div>
      <div className="simulation-content">
        {renderSimulationContent()}
      </div>
    </div>
  );
}

function SimulationPV({ data }) {
  if (!data) {
    return (
      <div className="simulation-empty">
        <div className="empty-icon">☀️</div>
        <h4>Simulation non disponible</h4>
        <p>Les données de simulation photovoltaïque ne sont pas encore calculées pour ce bâtiment.</p>
      </div>
    );
  }

  return (
    <div className="simulation-pv">
      <div className="simulation-header">
        <h4>Simulation Panneaux Photovoltaïques</h4>
        <span className="simulation-status active">Disponible</span>
      </div>

      <div className="simulation-grid">
        <div className="simulation-stat">
          <span className="stat-icon">⚡</span>
          <div className="stat-content">
            <span className="stat-value">{data.puissance_kw || 0} kW</span>
            <span className="stat-label">Puissance installée</span>
          </div>
        </div>

        <div className="simulation-stat">
          <span className="stat-icon">📊</span>
          <div className="stat-content">
            <span className="stat-value">{data.production_kwh || 0} kWh</span>
            <span className="stat-label">Production annuelle</span>
          </div>
        </div>

        <div className="simulation-stat highlight">
          <span className="stat-icon">💰</span>
          <div className="stat-content">
            <span className="stat-value">{data.economies_annuelles || 0} €/an</span>
            <span className="stat-label">Économies annuelles</span>
          </div>
        </div>

        <div className="simulation-stat">
          <span className="stat-icon">🌱</span>
          <div className="stat-content">
            <span className="stat-value">{data.reduction_co2_kg || 0} kg</span>
            <span className="stat-label">CO₂ évité / an</span>
          </div>
        </div>
      </div>

      <div className="simulation-details">
        <div className="detail-row">
          <span className="detail-label">Retour sur investissement</span>
          <span className="detail-value">{data.roi_annees || "—"} ans</span>
        </div>
        <div className="detail-row estimation">
          <span className="detail-label">Estimation des coûts d'installation</span>
          <span className="detail-value">{data.cout_installation || "À calculer"} €</span>
        </div>
      </div>
    </div>
  );
}

function SimulationComingSoon({ type }) {
  return (
    <div className="simulation-coming-soon">
      <div className="coming-soon-content">
        <div className="coming-soon-icon">🚧</div>
        <h4>Simulation {type}</h4>
        <p>Cette simulation sera bientôt disponible.</p>
        <p className="coming-soon-hint">Nous travaillons activement sur cette fonctionnalité pour vous aider à optimiser votre consommation énergétique.</p>
      </div>
    </div>
  );
}

export default SimulationPanel;
