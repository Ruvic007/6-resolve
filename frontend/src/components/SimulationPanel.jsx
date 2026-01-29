import { useState } from "react";
import { Sun, Thermometer, Globe, Zap, BarChart3, DollarSign, Leaf, Clock, Construction } from "lucide-react";

// Fonction pour formater les nombres avec séparateur de milliers
const formatNumber = (num) => {
  if (num === null || num === undefined || num === "—") return "—";
  return Number(num).toLocaleString("fr-FR");
};

const SIMULATION_TABS = [
  { id: "pv", label: "Solaire", icon: Sun, available: true },
  { id: "thermique", label: "Thermique", icon: Thermometer, available: false },
  { id: "geothermique", label: "Géothermique", icon: Globe, available: false },
];

export function SimulationPanel({ simulationPV }) {
  const [activeTab, setActiveTab] = useState("pv");

  const renderContent = () => {
    switch (activeTab) {
      case "pv":
        return <SimulationPV data={simulationPV} />;
      default:
        return <SimulationComingSoon type={SIMULATION_TABS.find(t => t.id === activeTab)?.label} />;
    }
  };

  return (
    <div className="simulation-panel">
      <div className="simulation-tabs">
        {SIMULATION_TABS.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`simulation-tab ${activeTab === tab.id ? "active" : ""} ${!tab.available ? "disabled" : ""}`}
              onClick={() => tab.available && setActiveTab(tab.id)}
              disabled={!tab.available}
            >
              <TabIcon size={16} />
              <span className="tab-label">{tab.label}</span>
              {!tab.available && <span className="tab-badge">Bientôt</span>}
            </button>
          );
        })}
      </div>
      <div className="simulation-content">
        {renderContent()}
      </div>
    </div>
  );
}

function SimulationPV({ data }) {
  if (!data) {
    return (
      <div className="simulation-empty">
        <Sun size={40} strokeWidth={1.5} />
        <h4>Simulation non disponible</h4>
        <p>Les données de simulation photovoltaïque ne sont pas encore calculées pour ce bâtiment.</p>
      </div>
    );
  }

  return (
    <div className="simulation-pv">
      <div className="simulation-grid">
        <div className="simulation-stat">
          <Zap size={20} className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{formatNumber(data.puissance_kw || 0)} kW</span>
            <span className="stat-label">Puissance installée</span>
          </div>
        </div>
        <div className="simulation-stat">
          <BarChart3 size={20} className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{formatNumber(data.production_kwh || 0)} kWh</span>
            <span className="stat-label">Production annuelle</span>
          </div>
        </div>
        <div className="simulation-stat highlight">
          <DollarSign size={20} className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{formatNumber(data.economies_annuelles || 0)} €/an</span>
            <span className="stat-label">Économies annuelles</span>
          </div>
        </div>
        <div className="simulation-stat">
          <Leaf size={20} className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{formatNumber(data.reduction_co2_kg || 0)} kg</span>
            <span className="stat-label">CO₂ évité / an</span>
          </div>
        </div>
      </div>

      <div className="simulation-details">
        <div className="detail-row">
          <span className="detail-label"><Clock size={14} /> Retour sur investissement</span>
          <span className="detail-value">{data.roi_annees || "—"} ans</span>
        </div>
        <div className="detail-row estimation">
          <span className="detail-label"><DollarSign size={14} /> Estimation des coûts d'installation</span>
          <span className="detail-value">{formatNumber(data.cout_installation) || "À calculer"} €</span>
        </div>
      </div>
    </div>
  );
}

function SimulationComingSoon({ type }) {
  return (
    <div className="simulation-coming-soon">
      <Construction size={40} strokeWidth={1.5} />
      <h4>Simulation {type}</h4>
      <p>Cette simulation sera bientôt disponible.</p>
    </div>
  );
}

export default SimulationPanel;
