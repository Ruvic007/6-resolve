import { useState } from "react";
import { Sun, Thermometer, Globe, Zap, BarChart3, DollarSign, Leaf, Clock, Construction, Ruler, ChevronDown, ChevronUp, MapPin, Layers, Calculator } from "lucide-react";

// Fonction pour formater les nombres avec séparateur de milliers
const formatNumber = (num) => {
  if (num === null || num === undefined || num === "—") return "—";
  return Number(num).toLocaleString("fr-FR");
};

export function SimulationPanel({ simulationPV, simulationThermique }) {
  const [activeTab, setActiveTab] = useState("pv");

  const SIMULATION_TABS = [
    { id: "pv", label: "Solaire PV", icon: Sun, available: true, hasData: !!simulationPV },
    { id: "thermique", label: "Solaire Thermique", icon: Thermometer, available: true, hasData: !!simulationThermique },
    { id: "geothermique", label: "Géothermique", icon: Globe, available: false, hasData: false },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "pv":
        return <SimulationPV data={simulationPV} />;
      case "thermique":
        return <SimulationThermique data={simulationThermique} />;
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
              {tab.available && !tab.hasData && <span className="tab-badge no-data">N/A</span>}
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

// --- Dropdown détail coût ---
function CostBreakdown({ detail, type }) {
  const [open, setOpen] = useState(false);

  if (!detail) return null;

  const isPV = type === "pv";

  const lignes = isPV ? [
    { icon: <Layers size={13} />, label: "Surface de toit totale", value: `${formatNumber(detail.surface_toit_m2)} m²` },
    { icon: <Layers size={13} />, label: "Surface panneaux (60 % du toit)", value: `${formatNumber(detail.surface_panneaux_m2)} m²` },
    { icon: <Zap size={13} />,    label: "Rendement des panneaux", value: detail.puissance_par_m2 },
    { icon: <Zap size={13} />,    label: "Puissance installée", value: `${formatNumber(detail.puissance_kw)} kWc` },
    { icon: <MapPin size={13} />, label: "Région", value: detail.region },
    { icon: <Sun size={13} />,    label: "Ensoleillement régional", value: detail.ensoleillement },
    { icon: <DollarSign size={13} />, label: "Prix unitaire", value: detail.prix_par_kw },
  ] : [
    { icon: <Layers size={13} />, label: "Surface de toit totale", value: `${formatNumber(detail.surface_toit_m2)} m²` },
    { icon: <Layers size={13} />, label: "Surface capteurs (10 % du toit)", value: `${formatNumber(detail.surface_capteurs_m2)} m²` },
    { icon: <MapPin size={13} />, label: "Région", value: detail.region },
    { icon: <Sun size={13} />,    label: "Rendement régional", value: detail.rendement_region },
    { icon: <DollarSign size={13} />, label: "Palier tarifaire", value: detail.palier_tarif },
    { icon: <DollarSign size={13} />, label: "Prix au m²", value: detail.prix_par_m2 },
  ];

  return (
    <div className="cost-breakdown">
      <button className="cost-breakdown-toggle" onClick={() => setOpen(!open)}>
        <Calculator size={14} />
        <span>Détail du calcul du coût d'{isPV ? "installation photovoltaïque" : "installation thermique"}</span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="cost-breakdown-body">
          <div className="cost-breakdown-lines">
            {lignes.map((l, i) => (
              <div className="cost-breakdown-line" key={i}>
                <span className="cb-icon">{l.icon}</span>
                <span className="cb-label">{l.label}</span>
                <span className="cb-value">{l.value}</span>
              </div>
            ))}
          </div>
          <div className="cost-breakdown-formula">
            <Calculator size={12} />
            <span>{detail.formule} = {detail.resultat_cout ? `${formatNumber(detail.resultat_cout)} €` : "Calcul en cours"}</span>
          </div>
        </div>
      )}
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
        <div className="detail-row estimation">
          <span className="detail-label"><DollarSign size={14} /> Coût d'installation estimé</span>
          <span className="detail-value">{data.prix_installation ? `${formatNumber(data.prix_installation)} €` : "À calculer"}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label"><Clock size={14} /> Retour sur investissement</span>
          <span className="detail-value">{data.roi_annees ? `${data.roi_annees} ans` : "—"}</span>
        </div>
      </div>

      <CostBreakdown detail={data.detail_cout} type="pv" />
    </div>
  );
}

function SimulationThermique({ data }) {
  if (!data) {
    return (
      <div className="simulation-empty">
        <Thermometer size={40} strokeWidth={1.5} />
        <h4>Simulation non disponible</h4>
        <p>Les données de simulation thermique ne sont pas encore calculées pour ce bâtiment.</p>
      </div>
    );
  }

  return (
    <div className="simulation-pv">
      <div className="simulation-grid">
        <div className="simulation-stat">
          <Ruler size={20} className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{formatNumber(data.surface_m2 || 0)} m²</span>
            <span className="stat-label">Surface capteurs</span>
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
        <div className="detail-row estimation">
          <span className="detail-label"><DollarSign size={14} /> Coût d'installation estimé</span>
          <span className="detail-value">{data.prix_installation ? `${formatNumber(data.prix_installation)} €` : "À calculer"}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label"><Clock size={14} /> Retour sur investissement</span>
          <span className="detail-value">{data.roi_annees ? `${data.roi_annees} ans` : "—"}</span>
        </div>
      </div>

      <CostBreakdown detail={data.detail_cout} type="thermique" />
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
