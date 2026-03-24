import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  TrendingUp,
  DollarSign,
  Shield,
  BarChart3,
  CheckCircle,
  Calculator,
  Thermometer,
  Droplets,
  Zap,
  Factory,
  Home,
  Leaf,
  Gauge
} from "lucide-react";
import "../Solar.css"; 

export default function GeoThermiq() {
  const navigate = useNavigate();

  // État du simulateur
  const [surface, setSurface] = useState(100); // m² de terrain/disponible
  const [typeGeothermie, setTypeGeothermie] = useState("vertical"); // vertical ou horizontal
  const [besoinChauffage, setBesoinChauffage] = useState(50000); // kWh/an

  // Validation des entrées
  const validSurface = Math.max(0, surface || 0);
  const validBesoin = Math.max(0, besoinChauffage || 0);

  // Rendement et production selon le type
  const getCop = () => {
    return typeGeothermie === "vertical" ? 4.2 : 3.5; // Coefficient de Performance
  };

  const getPrixM2 = () => {
    return typeGeothermie === "vertical" ? 350 : 180; // €/m²
  };

  const cop = getCop();
  const prixM2 = getPrixM2();

  // Calculs
  const puissanceInstallee = validSurface * 0.1; // 10 kW pour 100m² (approximation)
  const productionThermique = puissanceInstallee * 2000; // kWh/an (2000h de fonctionnement)
  const energieElectriqueConsommee = productionThermique / cop;
  const energieEconomisee = productionThermique - energieElectriqueConsommee;

  const tauxCouverture = Math.min(0.9, (productionThermique / validBesoin)).toFixed(2);

  const prixGaz = 0.09; // €/kWh
  const economiesAnnuelles = Number((energieEconomisee * prixGaz).toFixed(0));

  const coutInstallation = validSurface * prixM2;
  const tauxSubvention = 0.35; // 35% via MaPrimeRénov' + aides locales
  const montantSubvention = coutInstallation * tauxSubvention;
  const resteACharge = coutInstallation - montantSubvention;

  const roi = resteACharge > 0 && economiesAnnuelles > 0
    ? (resteACharge / economiesAnnuelles).toFixed(1)
    : "0";

  const aides = [
    {
      title: "MaPrimeRénov' Copropriété",
      description: "Jusqu'à 10 000€ selon les revenus et la performance"
    },
    {
      title: "Fonds Chaleur (ADEME)",
      description: "Subvention pour projets de géothermie collective"
    },
    {
      title: "Certificats d'Économies d'Énergie (CEE)",
      description: "Prime variable selon les économies générées"
    },
    {
      title: "Éco-PTZ (Prêt à Taux Zéro)",
      description: "Financement jusqu'à 30 000€ sans intérêts"
    }
  ];

  const applications = [
    {
      icon: <Building size={24} />,
      title: "Bureaux et commerces",
      desc: "Chauffage et climatisation basse consommation"
    },
    {
      icon: <Home size={24} />,
      title: "Logements collectifs",
      desc: "Réseau de chaleur pour copropriétés"
    },
    {
      icon: <Factory size={24} />,
      title: "Sites industriels",
      desc: "Processus industriels et chauffage des locaux"
    }
  ];

  const avantages = [
    { icon: <Leaf size={18} />, text: "Énergie renouvelable et locale" },
    { icon: <Gauge size={18} />, text: "Rendement stable toute l'année" },
    { icon: <Shield size={18} />, text: "Durée de vie > 25 ans" },
    { icon: <CheckCircle size={18} />, text: "Éligible à MaPrimeRénov'" }
  ];

  return (
    <div className="thermal-container">
      {/* HEADER */}
      <div className="thermal-header">
        <button onClick={() => navigate("/")} className="back-button">
          <ArrowLeft size={20} />
          Retour
        </button>

        <div className="thermal-title">
          <Thermometer size={32} />
          <div>
            <h1>Solution Géothermie</h1>
            <p>Puisez l'énergie du sous-sol pour chauffer et refroidir vos bâtiments</p>
          </div>
        </div>
      </div>

      {/* BADGE TYPE D'INSTALLATION */}
      <div className="thermal-type-badge">
        <Zap size={20} />
        <span>Type d'installation : </span>
        <select
          value={typeGeothermie}
          onChange={(e) => setTypeGeothermie(e.target.value)}
          className="type-select"
        >
          <option value="vertical">Sondes géothermiques verticales (forage profond)</option>
          <option value="horizontal">Capteurs horizontaux (faible profondeur)</option>
        </select>
      </div>

      {/* SECTION APPLICATIONS */}
      <div className="thermal-applications">
        <h2>🏢 Applications pour PME et collectivités</h2>
        <div className="thermal-grid-3">
          {applications.map((app, index) => (
            <div key={index} className="thermal-card">
              {app.icon}
              <h3>{app.title}</h3>
              <p>{app.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SIMULATEUR */}
      <div className="thermal-simulator">
        <h2><Calculator size={22} /> Simulation rapide</h2>

        <div className="sim-inputs">
          <div>
            <label>Surface disponible (m²)</label>
            <input
              type="number"
              value={surface}
              onChange={(e) => setSurface(Number(e.target.value))}
              min="0"
              step="20"
            />
            <small>
              {typeGeothermie === "vertical" 
                ? "≈ 100-150 m² par sonde" 
                : "≈ 1.5-2x la surface chauffée"}
            </small>
          </div>

          <div>
            <label>Besoins thermiques annuels (kWh)</label>
            <input
              type="number"
              value={besoinChauffage}
              onChange={(e) => setBesoinChauffage(Number(e.target.value))}
              min="0"
              step="5000"
            />
          </div>
        </div>

        <div className="sim-results">
          <div className="result-card">
            <BarChart3 size={20} />
            <p>Production estimée</p>
            <h3>{productionThermique.toLocaleString('fr-FR')} kWh/an</h3>
          </div>

          <div className="result-card">
            <DollarSign size={20} />
            <p>Économies annuelles</p>
            <h3>{economiesAnnuelles.toLocaleString('fr-FR')} €</h3>
          </div>

          <div className="result-card">
            <Gauge size={20} />
            <p>Coefficient de performance (COP)</p>
            <h3>{cop}</h3>
          </div>

          <div className="result-card highlight">
            <TrendingUp size={20} />
            <p>ROI après subventions</p>
            <h3>{roi} ans</h3>
          </div>
        </div>

        <div className="investment-details">
          <div className="detail-item">
            <span>Investissement brut :</span>
            <strong>{coutInstallation.toLocaleString('fr-FR')} €</strong>
          </div>
          <div className="detail-item">
            <span>Subvention estimée (35%) :</span>
            <strong className="positive">{montantSubvention.toLocaleString('fr-FR')} €</strong>
          </div>
          <div className="detail-item total">
            <span>Reste à charge :</span>
            <strong>{resteACharge.toLocaleString('fr-FR')} €</strong>
          </div>
        </div>
      </div>

      {/* AIDES */}
      <div className="thermal-aides">
        <h2>💰 Aides disponibles 2026</h2>
        <div className="thermal-grid-3">
          {aides.map((aide, index) => (
            <div key={index} className="thermal-card">
              <CheckCircle size={20} />
              <h3>{aide.title}</h3>
              <p>{aide.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AVANTAGES TECHNIQUES */}
      <div className="thermal-advantages">
        <h2>✨ Points forts de la géothermie</h2>
        <div className="advantages-grid">
          {avantages.map((avantage, index) => (
            <div key={index} className="advantage-item">
              {avantage.icon}
              <span>{avantage.text}</span>
            </div>
          ))}
          <div className="advantage-item">
            <CheckCircle size={18} color="#2c7a4d" />
            <span>Stable toute l'année (température constante du sol)</span>
          </div>
          <div className="advantage-item">
            <CheckCircle size={18} color="#2c7a4d" />
            <span>Peut assurer climatisation réversible en été</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="thermal-cta">
        <Leaf size={28} />
        <h3>Prêt à exploiter l'énergie du sous-sol ?</h3>
        <button onClick={() => navigate("/dashboard")}>
          Étudier mon projet géothermique
        </button>
      </div>
    </div>
  );
}