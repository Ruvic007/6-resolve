import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import {
  Sun,
  ArrowLeft,
  Building,
  TrendingUp,
  DollarSign,
  Shield,
  BarChart3,
  CheckCircle,
  Calculator,
  Zap,
  Loader2,
  AlertTriangle
} from "lucide-react";
import "../Solar.css"; 
import { useDashboardData } from "../hooks/useDashboardData";

export default function SolarPV() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams();
  const { getToken } = useAuth();

  // Récupération de l'ID entreprise (depuis les params, state ou stockage)
  const paramId = companyId || location.state?.companyId;
  
  // Récupération des données dashboard
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = 
    useDashboardData(paramId, getToken);

  // États pour les valeurs du simulateur
  const [power, setPower] = useState(100);
  const [consumption, setConsumption] = useState(180000);
  const [hasDataFromDashboard, setHasDataFromDashboard] = useState(false);

  // Mise à jour des valeurs du simulateur avec les données du dashboard
  useEffect(() => {
    if (dashboardData && dashboardData.metrics) {
      const dashboardConsumption = dashboardData.metrics.consommationTotale;
      
      if (dashboardConsumption && dashboardConsumption > 0) {
        // Utiliser la consommation réelle du dashboard
        setConsumption(Math.round(dashboardConsumption));
        setHasDataFromDashboard(true);
        
        // Suggestion automatique de puissance basée sur la consommation
        // Formule simple : puissance recommandée = consommation annuelle / 1100
        const suggestedPower = Math.round(dashboardConsumption / 1100);
        // Limiter la puissance recommandée entre 10 et 500 kWc
        const clampedPower = Math.min(500, Math.max(10, suggestedPower));
        setPower(clampedPower);
      }
    }
  }, [dashboardData]);

  // Validation des entrées
  const validPower = Math.max(0, power || 0);
  const validConsumption = Math.max(0, consumption || 0);

  // Calculs avec valeurs sécurisées
  const production = validPower * 1100;
  const autoconsumptionRate = Math.min(0.9, Math.max(0.4, 
    Math.min(1, validConsumption > 0 ? production / validConsumption : 0.7)
  ));
  const autoconsumed = Math.min(production, production * autoconsumptionRate);
  const surplus = Math.max(0, production - autoconsumed);

  const electricityPrice = 0.20;
  const resalePrice = 0.05;

  const annualSavings = Number(
    (autoconsumed * electricityPrice + surplus * resalePrice).toFixed(0)
  );

  // Estimation plus précise selon la puissance
  const estimatedInvestment = validPower * (validPower < 100 ? 1300 : 1100);
  
  // Calcul du ROI en tenant compte des aides
  const baseRoi = estimatedInvestment > 0 && annualSavings > 0 
    ? (estimatedInvestment / annualSavings).toFixed(1) 
    : "0";
  
  // Ajustement du ROI avec les aides
  const adjustedRoi = (Number(baseRoi) * 0.7).toFixed(1);

  // Calcul du taux d'autoconsommation
  const selfConsumptionRate = validConsumption > 0 
    ? Math.min(100, Math.round((autoconsumed / validConsumption) * 100))
    : 0;

  // Calcul des économies sur 20 ans
  const twentyYearSavings = annualSavings * 20;

  // Données pour l'affichage du contexte
  const hasConsumptionData = dashboardData?.metrics?.consommationTotale > 0;

  // Aides disponibles (personnalisées selon le contexte)
  const aides = [
    {
      title: "Prime à l'autoconsommation",
      description: `Versée sur 5 ans pour installations ≤ 100 kWc (jusqu'à ${Math.round(validPower * 160).toLocaleString('fr-FR')} €)`
    },
    {
      title: "Obligation d'achat (surplus)",
      description: `Tarif garanti sur 20 ans à ${resalePrice} €/kWh`
    },
    {
      title: "TVA récupérable",
      description: "TVA 20% récupérable pour entreprises (environ " + 
        `${Math.round(estimatedInvestment * 0.2).toLocaleString('fr-FR')} € d'économie)`
    },
    {
      title: "Amortissements accélérés",
      description: "Possibilité d'amortissement sur 5 ans au lieu de 20"
    }
  ];

  // Message personnalisé selon les données
  const getPersonalizedMessage = () => {
    if (!hasConsumptionData) {
      return "Pour une simulation plus précise, réalisez d'abord un audit énergétique pour connaître votre consommation réelle.";
    }
    
    if (selfConsumptionRate >= 80) {
      return "🎉 Excellente compatibilité ! Votre profil de consommation est parfaitement adapté au solaire photovoltaïque.";
    } else if (selfConsumptionRate >= 50) {
      return "✅ Bonne compatibilité. L'installation solaire vous apportera des économies significatives.";
    } else {
      return "ℹ️ Compatibilité modérée. Envisagez d'optimiser votre autoconsommation (stockage, pilotage des usages).";
    }
  };

  if (dashboardLoading) {
    return (
      <div className="pv-container">
        <div className="dashboard-loading">
          <Loader2 size={48} className="spinner" />
          <p>Récupération de vos données énergétiques...</p>
        </div>
      </div>
    );
  }

  if (dashboardError && dashboardError !== "no_audit") {
    return (
      <div className="pv-container">
        <div className="error-state">
          <AlertTriangle size={48} />
          <h3>Erreur de chargement</h3>
          <p>{dashboardError}</p>
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pv-container">
      {/* HEADER */}
      <div className="pv-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="pv-title">
          <Sun size={32} />
          <div>
            <h1>Solution Solaire Photovoltaïque</h1>
            <p>Optimisez votre autoconsommation et sécurisez vos coûts énergétiques</p>
          </div>
        </div>
      </div>

      {/* CONTEXTE DASHBOARD */}
      {hasConsumptionData && dashboardData && (
        <div className="pv-context-card">
          <h3>📊 Basé sur votre audit du {new Date(dashboardData.audit_date || Date.now()).toLocaleDateString('fr-FR')}</h3>
          <div className="context-grid">
            <div className="context-item">
              <span className="context-label">Consommation annuelle</span>
              <span className="context-value">{dashboardData.metrics.consommationTotale.toLocaleString('fr-FR')} kWh</span>
            </div>
            <div className="context-item">
              <span className="context-label">Coût énergétique</span>
              <span className="context-value">{dashboardData.metrics.coutTotal.toLocaleString('fr-FR')} €/an</span>
            </div>
            <div className="context-item">
              <span className="context-label">Impact carbone</span>
              <span className="context-value">{dashboardData.metrics.impactCarbone.toLocaleString('fr-FR')} tCO₂e</span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION STRATÉGIQUE */}
      <div className="pv-strategy">
        <h2>🎯 Pourquoi investir ?</h2>
        <div className="pv-grid-3">
          <div className="pv-card">
            <TrendingUp size={24} />
            <h3>Réduction des coûts</h3>
            <p>Diminuez votre facture jusqu'à 40–60%</p>
            {hasConsumptionData && (
              <p className="card-stats">
                Économie potentielle: ~{Math.round(annualSavings).toLocaleString('fr-FR')} €/an
              </p>
            )}
          </div>

          <div className="pv-card">
            <Shield size={24} />
            <h3>Sécurisation long terme</h3>
            <p>Tarif garanti 20 ans pour le surplus</p>
            {hasConsumptionData && (
              <p className="card-stats">
                Sur 20 ans: ~{Math.round(twentyYearSavings).toLocaleString('fr-FR')} €
              </p>
            )}
          </div>

          <div className="pv-card">
            <Building size={24} />
            <h3>Valorisation PME</h3>
            <p>Améliorez votre image RSE et vos appels d'offres</p>
          </div>
        </div>
      </div>

      {/* SIMULATEUR */}
      <div className="pv-simulator">
        <h2><Calculator size={22}/> Simulation personnalisée</h2>
        
        <p className="sim-info">
          {hasDataFromDashboard 
            ? "✅ Simulation basée sur vos données de consommation réelles" 
            : "ℹ️ Simulation basée sur des valeurs moyennes. Un audit vous donnera une estimation plus précise."}
        </p>

        <div className="sim-inputs">
          <div>
            <label>Puissance installée (kWc)</label>
            <input
              type="number"
              value={power}
              onChange={(e) => setPower(Number(e.target.value))}
              min="0"
              step="1"
            />
            {hasDataFromDashboard && (
              <small className="input-hint">
                Suggestion basée sur votre consommation: {Math.round(dashboardData.metrics.consommationTotale / 1100)} kWc
              </small>
            )}
          </div>

          <div>
            <label>Consommation annuelle (kWh)</label>
            <input
              type="number"
              value={consumption}
              onChange={(e) => setConsumption(Number(e.target.value))}
              min="0"
              step="1000"
              readOnly={hasDataFromDashboard}
              className={hasDataFromDashboard ? "readonly-input" : ""}
            />
            {hasDataFromDashboard && (
              <small className="input-hint">
                Donnée réelle issue de votre audit
              </small>
            )}
          </div>
        </div>

        <div className="sim-results">
          <div className="result-card">
            <BarChart3 size={20} />
            <p>Production estimée</p>
            <h3>{production.toLocaleString('fr-FR')} kWh/an</h3>
            <small>{Math.round(production / validConsumption * 100)}% de votre conso</small>
          </div>

          <div className="result-card">
            <DollarSign size={20} />
            <p>Gain annuel estimé</p>
            <h3>{annualSavings.toLocaleString('fr-FR')} €</h3>
            <small>Taux d'autoconsommation: {Math.round(autoconsumptionRate * 100)}%</small>
          </div>

          <div className="result-card">
            <TrendingUp size={20} />
            <p>ROI estimé</p>
            <h3>{adjustedRoi} ans</h3>
            <small>Avec aides: {baseRoi} ans sans aides</small>
          </div>
        </div>

        <div className="personalized-message">
          <p>{getPersonalizedMessage()}</p>
          {selfConsumptionRate > 0 && selfConsumptionRate < 50 && (
            <button 
              className="btn-secondary"
              onClick={() => navigate("/recommendations")}
            >
              Voir les solutions d'optimisation
            </button>
          )}
        </div>
      </div>

      {/* AIDES */}
      <div className="pv-aides">
        <h2>💰 Aides disponibles 2026</h2>
        <div className="pv-grid-3">
          {aides.map((aide, index) => (
            <div key={index} className="pv-card">
              <CheckCircle size={20} />
              <h3>{aide.title}</h3>
              <p>{aide.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="pv-cta">
        <Zap size={28} />
        <h3>Prêt à lancer votre projet photovoltaïque ?</h3>
        <button onClick={() => navigate("/dashboard")}>
          Créer mon plan solaire
        </button>
      </div>
    </div>
  );
}