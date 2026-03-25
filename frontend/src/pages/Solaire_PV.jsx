import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Zap
} from "lucide-react";
import "../Solar.css";
import "../Dashboard.css";

export default function SolarPV() {
  const navigate = useNavigate();

  const [power, setPower] = useState(100);
  const [consumption, setConsumption] = useState(180000);

  // Validation des entrées
  const validPower = Math.max(0, power || 0);
  const validConsumption = Math.max(0, consumption || 0);

  // Calculs avec valeurs sécurisées
  const production = validPower * 1100;
  const autoconsumptionRate = 0.7;
  const autoconsumed = production * autoconsumptionRate;
  const surplus = production - autoconsumed;

  const electricityPrice = 0.20;
  const resalePrice = 0.05;

  const annualSavings = Number(
    (autoconsumed * electricityPrice + surplus * resalePrice).toFixed(0)
  );

  const estimatedInvestment = validPower * 1200;
  const roi = estimatedInvestment > 0 && annualSavings > 0 
    ? (estimatedInvestment / annualSavings).toFixed(1) 
    : "0";

  const aides = [
    {
      title: "Prime à l'autoconsommation",
      description: "Versée sur 5 ans pour installations ≤ 100 kWc"
    },
    {
      title: "Obligation d'achat (surplus)",
      description: "Tarif garanti sur 20 ans"
    },
    {
      title: "TVA récupérable",
      description: "TVA 20% récupérable pour entreprises"
    }
  ];

  return (
    <div className="pv-container dashboard-page">
      {/* HEADER */}
      <div className="pv-header">
        <button onClick={() => navigate("/dashboard")} className="back-button">
          <ArrowLeft size={20} />
          Retour au dashboard
        </button>
        <div className="pv-title">
          <Sun size={32} />
          <div>
            <h1>Solution Solaire Photovoltaïque</h1>
            <p>Optimisez votre autoconsommation et sécurisez vos coûts énergétiques</p>
          </div>
        </div>
      </div>

      {/* SECTION STRATÉGIQUE */}
      <section className="dashboard-section">
        <h2 className="section-title">Pourquoi investir ?</h2>
        <div className="pv-grid-3">
          <div className="pv-card">
            <TrendingUp size={24} />
            <h3>Réduction des coûts</h3>
            <p>Diminuez votre facture jusqu'à 40–60%</p>
          </div>
          <div className="pv-card">
            <Shield size={24} />
            <h3>Sécurisation long terme</h3>
            <p>Tarif garanti 20 ans pour le surplus</p>
          </div>
          <div className="pv-card">
            <Building size={24} />
            <h3>Valorisation PME</h3>
            <p>Améliorez votre image RSE et vos appels d'offres</p>
          </div>
        </div>
      </section>

      {/* SIMULATEUR */}
      <section className="dashboard-section">
        <h2 className="section-title"><Calculator size={22}/> Simulation rapide</h2>
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
          </div>
          <div>
            <label>Consommation annuelle (kWh)</label>
            <input
              type="number"
              value={consumption}
              onChange={(e) => setConsumption(Number(e.target.value))}
              min="0"
              step="1000"
            />
          </div>
        </div>
        <div className="sim-results">
          <div className="result-card">
            <BarChart3 size={20} />
            <p>Production estimée</p>
            <h3>{production.toLocaleString('fr-FR')} kWh/an</h3>
          </div>
          <div className="result-card">
            <DollarSign size={20} />
            <p>Gain annuel estimé</p>
            <h3>{annualSavings.toLocaleString('fr-FR')} €</h3>
          </div>
          <div className="result-card">
            <TrendingUp size={20} />
            <p>ROI estimé</p>
            <h3>{roi} ans</h3>
          </div>
        </div>
      </section>

      {/* AIDES */}
      <section className="dashboard-section">
        <h2 className="section-title">Aides disponibles 2026</h2>
        <div className="pv-grid-3">
          {aides.map((aide, index) => (
            <div key={index} className="pv-card">
              <CheckCircle size={20} />
              <h3>{aide.title}</h3>
              <p>{aide.description}</p>
            </div>
          ))}
        </div>
      </section>

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