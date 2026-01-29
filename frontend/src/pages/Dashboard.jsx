import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Bar, Doughnut } from "react-chartjs-2";
import "../Dashboard.css";
import "../SubventionsModal.css";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import { DollarSign, Zap, Cloud, Leaf, ClipboardList, AlertTriangle, RefreshCw, BarChart2, ScrollText, Plus } from "lucide-react";

import { useDashboardData } from "../hooks/useDashboardData";
import { getBarConfig, getDonutConfig } from "../utils/chartConfigs";
import { SimulationPanel } from "../components/SimulationPanel";

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

  const [showModal, setShowModal] = useState(false);
  const [subventions, setSubventions] = useState([]);
  const [loadingSubventions, setLoadingSubventions] = useState(false);

  const paramId = companyId || state?.companyId;
  const { data, loading, error, currentCompanyId } = useDashboardData(paramId, user?.id);

  const fetchSubventions = async () => {
    setShowModal(true);
    setLoadingSubventions(true);
    try {
      // 1. L'URL complète combine les deux préfixes
      const response = await fetch("http://localhost:8000/api/subventions/");
      
      if (response.ok) {
        const jsonData = await response.json();
        // 2. IMPORTANT : On stocke jsonData.data car votre API renvoie { status: "...", data: [...] }
        setSubventions(jsonData.data); 
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
        <SimulationPanel simulationPV={finalData.simulationPV} />
      </section>

      {/* Recommandations */}
      <section className="dashboard-section">
        <h2 className="section-title">Recommandations</h2>
        <div className="card recommendations-card">
          <Leaf size={32} strokeWidth={1.5} className="recommendations-icon" />
          <h3>Recommandations personnalisées</h3>
          <p>Des recommandations d'optimisation énergétique seront bientôt disponibles ici.</p>
          <div className="tag-list">
            <span className="tag">Priorités d'action</span>
            <span className="tag">ROI estimé</span>
            <span className="tag">Impact carbone</span>
          </div>
        </div>
      </section>

      {/* Benchmark */}
      <section className="dashboard-section">
        <h2 className="section-title">Benchmark sectoriel</h2>
        <div className="card benchmark-card">
          <BarChart2 size={32} strokeWidth={1.5} className="benchmark-icon" />
          <h3>Comparaison avec votre secteur</h3>
          <p>Comparez vos performances énergétiques avec d'autres entreprises de votre secteur d'activité.</p>
          <div className="tag-list">
            <span className="tag">Consommation moyenne</span>
            <span className="tag">Classement</span>
            <span className="tag">Tendances</span>
          </div>
        </div>
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
      
      <div className="subventions-banner-card" onClick={fetchSubventions}>
        <div className="banner-content">
          <h3>Boostez votre transition énergétique</h3>
          <p>Découvrez toutes les aides financières disponibles.</p>
        </div>
        <button className="banner-btn">Voir la liste</button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Catalogue des Aides ({subventions.length})</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {loadingSubventions ? (
                <div className="loading-spinner" style={{margin: '20px auto'}}></div>
              ) : subventions.length > 0 ? (
                <div className="subventions-list">
                  {subventions.map((sub, index) => (
                    <div key={sub.id || index} className="subvention-card">
                      <div className="sub-card-header">
                        <div className="sub-badges">
                          <span className="badge-org">{sub.organisme}</span>
                          <span className="badge-cat">{sub.categorie}</span>
                        </div>
                        <h4 className="sub-title">{sub.nom}</h4>
                      </div>
                      
                      <p className="sub-description">{sub.description}</p>
                      
                      <div className="sub-footer">
                        <div className="sub-amount">
                          <span className="amount-label">Aide max : </span>
                          <span className="amount-value">{sub.aide_max}</span>
                        </div>
                        <a href={sub.url} target="_blank" rel="noopener noreferrer" className="sub-btn">
                          Voir l'offre ↗
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Aucune aide disponible pour le moment.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
