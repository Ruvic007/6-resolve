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
  Flame,
  Thermometer,
  Droplets,
  Zap,
  Factory
} from "lucide-react";
import "../Solar.css";

export default function SolarThermal() {
  const navigate = useNavigate();

  const [surface, setSurface] = useState(50);
  const [besoinEcs, setBesoinEcs] = useState(20000);
  const [typeInstallation, setTypeInstallation] = useState("cesc"); // cesc ou ssc

  // Validation des entrées
  const validSurface = Math.max(0, surface || 0);
  const validBesoin = Math.max(0, besoinEcs || 0);

  // Calculs avec valeurs sécurisées
  const productionParM2 = typeInstallation === "cesc" ? 500 : 450; // kWh/m²/an
  const productionTotale = validSurface * productionParM2;
  
  const tauxCouverture = Math.min(
    0.7,
    (productionTotale / validBesoin) * 0.8
  ).toFixed(2);
  
  const energieEconomisee = validBesoin * tauxCouverture;
  
  const prixEnergie = 0.09; // Prix moyen du gaz/électricité pour chauffage (€/kWh)
  const economiesAnnuelles = Number(
    (energieEconomisee * prixEnergie).toFixed(0)
  );

  const coutInstallation = validSurface * (typeInstallation === "cesc" ? 1100 : 1300);
  const tauxSubvention = 0.4; // 40% via Fonds Chaleur
  const montantSubvention = coutInstallation * tauxSubvention;
  const resteACharge = coutInstallation - montantSubvention;
  
  const roi = resteACharge > 0 && economiesAnnuelles > 0 
    ? (resteACharge / economiesAnnuelles).toFixed(1) 
    : "0";

  const aides = [
    {
      title: "Fonds Chaleur (ADEME)",
      description: "Subvention 40-60% pour projets de chaleur renouvelable"
    },
    {
      title: "Certificats d'Économies d'Énergie (CEE)",
      description: "Prime complémentaire selon les économies générées"
    },
    {
      title: "Aides régionales",
      description: "Nombreuses régions proposent des aides cumulables"
    }
  ];

  const applications = [
    {
      icon: <Droplets size={24} />,
      title: "Eau Chaude Sanitaire",
      desc: "Hôtels, restaurants, campings, santé"
    },
    {
      icon: <Flame size={24} />,
      title: "Chauffage (SSC)",
      desc: "Bureaux, commerces, bâtiments tertiaires"
    },
    {
      icon: <Factory size={24} />,
      title: "Procédés industriels",
      desc: "Nettoyage, séchage, préchauffage"
    }
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
          <Sun size={32} />
          <div>
            <h1>Solution Solaire Thermique</h1>
            <p>Produisez votre chaleur proprement et réduisez vos factures énergétiques</p>
          </div>
        </div>
      </div>

      {/* BADGE TYPE D'INSTALLATION */}
      <div className="thermal-type-badge">
        <Thermometer size={20} />
        <span>Installation : </span>
        <select 
          value={typeInstallation} 
          onChange={(e) => setTypeInstallation(e.target.value)}
          className="type-select"
        >
          <option value="cesc">Chauffe-eau Solaire Collectif (CESC)</option>
          <option value="ssc">Système Solaire Combiné (SSC) - Chauffage + ECS</option>
        </select>
      </div>

      {/* SECTION APPLICATIONS */}
      <div className="thermal-applications">
        <h2>🎯 Applications pour PME</h2>
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
        <h2><Calculator size={22}/> Simulation rapide</h2>

        <div className="sim-inputs">
          <div>
            <label>Surface de capteurs (m²)</label>
            <input
              type="number"
              value={surface}
              onChange={(e) => setSurface(Number(e.target.value))}
              min="0"
              step="5"
            />
          </div>

          <div>
            <label>Besoins thermiques annuels (kWh)</label>
            <input
              type="number"
              value={besoinEcs}
              onChange={(e) => setBesoinEcs(Number(e.target.value))}
              min="0"
              step="1000"
            />
          </div>
        </div>

        <div className="sim-results">
          <div className="result-card">
            <BarChart3 size={20} />
            <p>Production estimée</p>
            <h3>{productionTotale.toLocaleString('fr-FR')} kWh/an</h3>
          </div>

          <div className="result-card">
            <DollarSign size={20} />
            <p>Économies annuelles</p>
            <h3>{economiesAnnuelles.toLocaleString('fr-FR')} €</h3>
          </div>

          <div className="result-card">
            <Thermometer size={20} />
            <p>Taux de couverture</p>
            <h3>{(tauxCouverture * 100).toFixed(0)}%</h3>
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
            <span>Subvention estimée (40%) :</span>
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
        <h2>✨ Points forts du solaire thermique</h2>
        <div className="advantages-grid">
          <div className="advantage-item">
            <CheckCircle size={18} color="#e67e22" />
            <span>Rendement 3 à 4 fois supérieur au photovoltaïque</span>
          </div>
          <div className="advantage-item">
            <CheckCircle size={18} color="#e67e22" />
            <span>Durée de vie : 25-30 ans</span>
          </div>
          <div className="advantage-item">
            <CheckCircle size={18} color="#e67e22" />
            <span>Subventions Fonds Chaleur très attractives</span>
          </div>
          <div className="advantage-item">
            <CheckCircle size={18} color="#e67e22" />
            <span>Idéal pour sites avec consommation constante</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="thermal-cta">
        <Flame size={28} />
        <h3>Prêt à décarboner votre chauffage ?</h3>
        <button onClick={() => navigate("/dashboard")}>
          Étudier mon projet thermique
        </button>
      </div>

    </div>
  );
}