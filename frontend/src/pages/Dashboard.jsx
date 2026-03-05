import React from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Bar, Doughnut } from "react-chartjs-2";
import "../Dashboard.css";
import "../SubventionsPanel.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { DollarSign, Zap, Cloud, Leaf, ClipboardList, AlertTriangle, RefreshCw, BarChart2, ScrollText, Plus } from "lucide-react";

import { useDashboardData } from "../hooks/useDashboardData";
import { getBarConfig, getDonutConfig } from "../utils/chartConfigs";
import { SimulationPanel } from "../components/SimulationPanel";
import { SubventionsPanel } from "../components/SubventionsPanel";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Fonction pour formater les nombres avec séparateur de milliers
const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return Number(num).toLocaleString("fr-FR");
};

function MetricCard({ icon: Icon, label, value, colorClass }) {
  return (
    <div className={`metric-card ${colorClass}`}>
      <div className={`metric-icon ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div className="metric-info">
        <span className="metric-label">{label}</span>
        <span className="metric-value">{value}</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const { state } = useLocation();
  const { user } = useUser();

  const paramId = companyId || state?.companyId;
  const { data, loading, error, currentCompanyId } = useDashboardData(paramId, user?.id);

  const fetchSubventions = async () => {
    setShowModal(true);
    setLoadingSubventions(true);
    try {
      // L'URL complète combine les deux préfixes
      const response = await fetch("http://localhost:8000/api/subventions/");
      
      if (response.ok) {
        const jsonData = await response.json();
        // On stocke jsonData.data car l'API renvoie { status: "...", data: [...] }
        fetchSubventions(jsonData.data); 
      } else {
        console.error("Erreur API subventions");
      }
    } catch (err) {
      console.error("Erreur connexion backend:", err);
    } finally {
      setLoadingSubventions(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error === "no_audit") {
    return (
      <div className="dashboard-page">
        <div className="dashboard-empty-state">
          <ClipboardList size={48} strokeWidth={1.5} />
          <h2>Bienvenue sur votre Dashboard</h2>
          <p>Vous n'avez pas encore réalisé d'audit énergétique. Commencez dès maintenant pour analyser vos consommations.</p>
          <div className="empty-state-actions">
            <button className="btn-primary" onClick={() => navigate("/audit")}>
              <Plus size={18} /> Faire mon premier audit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-empty-state">
          <AlertTriangle size={48} strokeWidth={1.5} />
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            <RefreshCw size={16} /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  const defaultData = {
    company_name: "Données de démonstration",
    metrics: { coutTotal: 0, consommationTotale: 0, impactCarbone: 0, energieRenouvelable: 0 },
    consommationParUsages: { labels: ["Électricité", "Gaz", "Autres"], data: { electricite: 0, gaz: 0, autres: 0 } },
    repartitionCouts: { electricite: 50, gaz: 50 },
    detailsBatiment: [],
    simulationPV: null
  };

  const finalData = data || defaultData;
  const barConfig = getBarConfig(finalData);
  const donutConfig = getDonutConfig(finalData);

  return (
    <div className="dashboard-page">
      {/* Barre d'info entreprise */}
      <div className="dashboard-topbar">
        <span className="topbar-company">{finalData.company_name || `Entreprise #${currentCompanyId}`}</span>
        <div className="topbar-actions">
          <button className="btn-secondary-small" onClick={() => navigate("/historique")}>
            <ScrollText size={16} /> Voir l'historique
          </button>
          <button className="btn-primary-small" onClick={() => navigate("/audit")}>
            <Plus size={16} /> Nouvel audit
          </button>
        </div>
      </div>

      {/* Métriques */}
      <section className="dashboard-section">
        <h2 className="section-title">Vue d'ensemble</h2>
        <div className="metrics-grid">
          <MetricCard icon={DollarSign} label="Coût Annuel" value={`${formatNumber(finalData.metrics?.coutTotal || 0)} €`} colorClass="blue" />
          <MetricCard icon={Zap} label="Consommation" value={`${formatNumber(finalData.metrics?.consommationTotale || 0)} kWh`} colorClass="yellow" />
          <MetricCard icon={Cloud} label="Carbone" value={`${formatNumber(finalData.metrics?.impactCarbone || 0)} tCO₂e`} colorClass="grey" />
          <MetricCard icon={Leaf} label="Renouvelable" value={`${formatNumber(finalData.metrics?.energieRenouvelable || 0)} %`} colorClass="green" />
        </div>
      </section>

      {/* Graphiques */}
      <section className="dashboard-section">
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

      {/* Simulations */}
      <section className="dashboard-section">
        <h2 className="section-title">Simulations d'optimisation</h2>
        <SimulationPanel simulationPV={finalData.simulationPV} simulationThermique={finalData.simulationThermique} />
      </section>
      
<div className="recommendations-wrapper">

  {/* Onglet vers les générales */}
  <section className="dashboard-section recommendations-tab">
    <div className="recommendations-card">
      <h2 className="section-title">Recommandations générales</h2>
      <p>Consultez nos recommandations générales d'optimisation énergétique</p>
      <button 
        className="primary-btn"
        onClick={() => navigate("/recommendations")} 
      >
        Voir les recommandations générales
      </button>
    </div>
  </section>

  {/* Onglet vers les recommandations personnalisées */}
<section className="dashboard-section recommendations-tab">
  <div className="recommendations-card">
    <div className="solutions-buttons"></div>
    <h2 className="section-title">Recommandations personnalisées</h2>

    <p>
      Accédez à des solutions adaptées à votre profil énergétique et à votre
      type d'installation. Sélectionnez la technologie correspondant à votre projet :
    </p>
    <div className="solutions-buttons">
    <button 
      className="primary-btn"
      onClick={() => navigate("/Solar_PV")} 
    >
      Solutions Solaire Photovoltaïque
    </button>    

    <button 
      className="primary-btn"
      onClick={() => navigate("/Solar_Ther")} 
    >
      Solutions Solaire Thermique
    </button>  

    <button 
      className="primary-btn"
      onClick={() => navigate("/Geothermique")} 
    >
      Solutions Géothermiques
    </button>  
    </div>
    </div>
</section>

</div>

      {/* Aides financières */}
      <section className="dashboard-section">
        <h2 className="section-title">Aides financières disponibles</h2>
        <SubventionsPanel />
      </section>

      {/* Benchmark */}
      <section className="dashboard-section">
        <h2 className="section-title">Benchmark sectoriel</h2>
        {finalData.benchmark ? (
          <div className="benchmark-content">
            <div className="benchmark-gauge-card">
              <div className="benchmark-gauge">
                <div
                  className={`gauge-fill ${
                    finalData.benchmark.pourcentage <= 80 ? 'excellent' :
                    finalData.benchmark.pourcentage <= 100 ? 'good' :
                    finalData.benchmark.pourcentage <= 120 ? 'average' : 'poor'
                  }`}
                  style={{ width: `${Math.min(finalData.benchmark.pourcentage, 150) / 1.5}%` }}
                />
                <div className="gauge-marker" style={{ left: '66.67%' }} />
              </div>
              <div className="benchmark-value">
                <span className="benchmark-percentage">{finalData.benchmark.pourcentage}%</span>
                <span className="benchmark-label">de la moyenne sectorielle</span>
              </div>
              <div className={`benchmark-status ${
                finalData.benchmark.pourcentage <= 80 ? 'excellent' :
                finalData.benchmark.pourcentage <= 100 ? 'good' :
                finalData.benchmark.pourcentage <= 120 ? 'average' : 'poor'
              }`}>
                {finalData.benchmark.pourcentage <= 80 ? 'Excellent ! Vous consommez bien moins que la moyenne' :
                 finalData.benchmark.pourcentage <= 100 ? 'Bien ! Vous consommez moins que la moyenne' :
                 finalData.benchmark.pourcentage <= 120 ? 'Attention : Légèrement au-dessus de la moyenne' :
                 'À améliorer : Consommation supérieure à la moyenne'}
              </div>
            </div>
            <div className="benchmark-details">
              <div className="benchmark-detail-item">
                <span className="detail-label">Secteur</span>
                <span className="detail-value">{finalData.benchmark.secteur || "Non spécifié"}</span>
              </div>
              <div className="benchmark-detail-item">
                <span className="detail-label">Moyenne du secteur</span>
                <span className="detail-value">{formatNumber(finalData.benchmark.moyenne_secteur)} kWh/m²/an</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card benchmark-card">
            <BarChart2 size={32} strokeWidth={1.5} className="benchmark-icon" />
            <h3>Comparaison avec votre secteur</h3>
            <p>Les données de benchmark seront disponibles après votre premier audit.</p>
          </div>
        )}
      </section>

      {/* Détails bâtiment */}
      <section className="dashboard-section">
        <h2 className="section-title">Informations du bâtiment</h2>
        <div className="card">
          {(finalData.detailsBatiment || []).length > 0 ? (
            <div className="building-grid">
              {finalData.detailsBatiment.map((item, index) => (
                <div key={index} className="building-item">
                  <span className="building-label">{item.label}</span>
                  <span className="building-value">{item.value || "—"}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">Aucune information disponible</p>
          )}
        </div>
      </section>
    </div>
  );
}
