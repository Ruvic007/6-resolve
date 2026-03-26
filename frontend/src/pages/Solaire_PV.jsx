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
  AlertTriangle,
  MapPin,
  Thermometer,
  Battery,
  Wrench,
  FileText,
  HelpCircle,
  Leaf,
  Compass,
  CloudSun
} from "lucide-react";
import "../Solar.css"; 
import { useDashboardData } from "../hooks/useDashboardData";

// ─── Données d'ensoleillement par zone (source : CRE / données réelles) ────
const SOLAR_ZONES = [
  {
    zone: "Zone 1 – DOM-TOM",
    regions: ["Guadeloupe", "Martinique", "Réunion", "Guyane", "Mayotte"],
    production: "> 1 400 kWh/kWc",
    productionFactor: 1400,
    color: "#f59e0b",
    label: "⭐⭐⭐⭐⭐ Excellent"
  },
  {
    zone: "Zone 2 – Grand Sud",
    regions: ["PACA", "Occitanie", "Corse"],
    production: "1 200 – 1 400 kWh/kWc",
    productionFactor: 1300,
    color: "#f97316",
    label: "⭐⭐⭐⭐ Très bon"
  },
  {
    zone: "Zone 3 – Centre & Ouest",
    regions: ["Auvergne-Rhône-Alpes", "Pays de la Loire", "Nouvelle-Aquitaine"],
    production: "1 000 – 1 200 kWh/kWc",
    productionFactor: 1100,
    color: "#84cc16",
    label: "⭐⭐⭐ Bon"
  },
  {
    zone: "Zone 4 – Nord & Ouest",
    regions: ["Bretagne", "Normandie", "Hauts-de-France", "Grand Est"],
    production: "800 – 1 000 kWh/kWc",
    productionFactor: 900,
    color: "#22d3ee",
    label: "⭐⭐ Correct"
  }
];

// ─── Recommandations techniques générales ───────────────────────────────────
const TECHNICAL_TIPS = [
  {
    icon: "Compass",
    title: "Orientation & inclinaison",
    detail: "Exposition plein Sud idéale. Inclinaison optimale : 30°–35° en France métropolitaine. Une orientation Sud-Est ou Sud-Ouest réduit le rendement de seulement 5–10%."
  },
  {
    icon: "Thermometer",
    title: "Chaleur & ventilation",
    detail: "Au-delà de 25°C, un panneau perd ~0,5% de rendement par degré. Prévoir une lame d'air de 10–15 cm sous les modules pour la ventilation naturelle."
  },
  {
    icon: "CloudSun",
    title: "Panneaux monocristallins",
    detail: "Rendement de 20–24% vs 15–17% pour le polycristallin. Recommandés en zones peu ensoleillées et sur toitures à faible surface."
  },
  {
    icon: "Zap",
    title: "Certification RGE obligatoire",
    detail: "L'installateur doit être certifié RGE QualiPV (ou Qualifelec SPV1/2/3) pour bénéficier de la prime à l'autoconsommation et du tarif de rachat EDF OA."
  }
];

export default function SolarPV() {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyId } = useParams();
  const { getToken } = useAuth();

  // Récupération de l'ID entreprise
  const paramId = companyId || location.state?.companyId;
  
  // Récupération des données dashboard
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = 
    useDashboardData(paramId, getToken);

  // États pour les valeurs du simulateur
  const [power, setPower] = useState(100);
  const [consumption, setConsumption] = useState(180000);
  const [hasDataFromDashboard, setHasDataFromDashboard] = useState(false);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(2); // Par défaut Zone 3

  // Données d'ensoleillement par région en France (kWh/m²/an) - détaillées
  const solarIrradianceData = {
    "iledefrance": { name: "Île-de-France", irradiance: 1250, color: "#fbbf24", description: "Ensoleillement moyen", zoneIndex: 2 },
    "paca": { name: "Provence-Alpes-Côte d'Azur", irradiance: 1700, color: "#f59e0b", description: "Très bon ensoleillement", zoneIndex: 1 },
    "occitanie": { name: "Occitanie", irradiance: 1650, color: "#f59e0b", description: "Très bon ensoleillement", zoneIndex: 1 },
    "nouvelleaquitaine": { name: "Nouvelle-Aquitaine", irradiance: 1550, color: "#fbbf24", description: "Bon ensoleillement", zoneIndex: 2 },
    "auvergnerhonealpes": { name: "Auvergne-Rhône-Alpes", irradiance: 1450, color: "#fbbf24", description: "Bon ensoleillement", zoneIndex: 2 },
    "grandest": { name: "Grand Est", irradiance: 1300, color: "#fbbf24", description: "Ensoleillement moyen", zoneIndex: 3 },
    "normandie": { name: "Normandie", irradiance: 1150, color: "#fcd34d", description: "Ensoleillement modéré", zoneIndex: 3 },
    "bretagne": { name: "Bretagne", irradiance: 1200, color: "#fcd34d", description: "Ensoleillement modéré", zoneIndex: 3 },
    "hautsdefrance": { name: "Hauts-de-France", irradiance: 1150, color: "#fcd34d", description: "Ensoleillement modéré", zoneIndex: 3 },
    "centre": { name: "Centre-Val de Loire", irradiance: 1350, color: "#fbbf24", description: "Ensoleillement moyen", zoneIndex: 2 },
    "bourgognefranchecomte": { name: "Bourgogne-Franche-Comté", irradiance: 1350, color: "#fbbf24", description: "Ensoleillement moyen", zoneIndex: 2 },
    "paysdelaloire": { name: "Pays de la Loire", irradiance: 1300, color: "#fbbf24", description: "Ensoleillement moyen", zoneIndex: 2 },
    "corse": { name: "Corse", irradiance: 1800, color: "#f59e0b", description: "Excellent ensoleillement", zoneIndex: 0 }
  };

  const [selectedRegion, setSelectedRegion] = useState("centre");
  const currentRegion = solarIrradianceData[selectedRegion];
  const currentZone = SOLAR_ZONES[currentRegion?.zoneIndex] || SOLAR_ZONES[2];

  // Mise à jour des valeurs du simulateur avec les données du dashboard
  useEffect(() => {
    if (dashboardData && dashboardData.metrics) {
      const dashboardConsumption = dashboardData.metrics.consommationTotale;
      
      if (dashboardConsumption && dashboardConsumption > 0) {
        setConsumption(Math.round(dashboardConsumption));
        setHasDataFromDashboard(true);
        
        const suggestedPower = Math.round(dashboardConsumption / 1100);
        const clampedPower = Math.min(500, Math.max(10, suggestedPower));
        setPower(clampedPower);
      }
    }
  }, [dashboardData]);

  // Validation des entrées
  const validPower = Math.max(0, power || 0);
  const validConsumption = Math.max(0, consumption || 0);

  // Calculs avec prise en compte de l'ensoleillement régional
  const productionPerKw = currentRegion?.irradiance || 1250;
  const production = validPower * productionPerKw;
  
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

  const estimatedInvestment = validPower * (validPower < 100 ? 1300 : 1100);
  
  const baseRoi = estimatedInvestment > 0 && annualSavings > 0 
    ? (estimatedInvestment / annualSavings).toFixed(1) 
    : "0";
  
  const adjustedRoi = (Number(baseRoi) * 0.7).toFixed(1);
  const selfConsumptionRate = validConsumption > 0 
    ? Math.min(100, Math.round((autoconsumed / validConsumption) * 100))
    : 0;
  const twentyYearSavings = annualSavings * 20;
  const hasConsumptionData = dashboardData?.metrics?.consommationTotale > 0;

  // CO2 évité (en tonnes)
  const co2Avoided = (production * 0.055).toFixed(1);

  // Recommandations techniques personnalisées (fusion avec TECHNICAL_TIPS)
  const getTechnicalRecommendations = () => {
    const recommendations = [];
    
    // Recommandations basées sur la puissance
    if (validPower < 36) {
      recommendations.push({
        title: "Installation sur toiture",
        description: "Pour une puissance inférieure à 36 kWc, privilégiez une installation en toiture avec des panneaux de dernière génération (rendement > 21%).",
        icon: "Building"
      });
    } else {
      recommendations.push({
        title: "Installation au sol",
        description: "Pour les grandes puissances (> 36 kWc), envisagez une installation au sol avec structures fixes ou suiveurs solaires.",
        icon: "MapPin"
      });
    }
    
    // Recommandation de stockage
    if (selfConsumptionRate < 60 && validPower > 20) {
      recommendations.push({
        title: "Solution de stockage",
        description: `Votre taux d'autoconsommation est de ${selfConsumptionRate}%. L'ajout d'une batterie de stockage (5-10 kWh) pourrait augmenter votre autoconsommation de 20 à 30%.`,
        icon: "Battery"
      });
    }
    
    // Optimisation pour ensoleillement modéré
    if (currentRegion?.irradiance < 1300) {
      recommendations.push({
        title: "Optimisation pour ensoleillement modéré",
        description: `Dans votre région (${currentRegion.name}), optez pour des panneaux à haut rendement (monocristallins) et une inclinaison optimale (30-35°) pour maximiser la production.`,
        icon: "Thermometer"
      });
    }
    
    // Ajout des recommandations techniques générales
    TECHNICAL_TIPS.forEach(tip => {
      recommendations.push({
        title: tip.title,
        description: tip.detail,
        icon: tip.icon
      });
    });
    
    return recommendations;
  };

  const technicalRecommendations = getTechnicalRecommendations();

  // Aides financières complètes (France)
  const aides = [
    {
      title: "Prime à l'autoconsommation",
      description: `Versée sur 5 ans pour installations ≤ 100 kWc (jusqu'à ${Math.round(validPower * 160).toLocaleString('fr-FR')} €)`,
      details: "Prime dégressive selon la puissance : 160€/kWc pour < 9kWc, 100€/kWc pour 9-36kWc, 80€/kWc pour 36-100kWc",
      eligible: validPower <= 100
    },
    {
      title: "Obligation d'achat (surplus)",
      description: `Tarif garanti sur 20 ans à ${resalePrice} €/kWh pour la revente du surplus`,
      details: "Contrat avec EDF OA ou ELENO, tarifs révisés annuellement",
      eligible: true
    },
    {
      title: "TVA récupérable",
      description: "TVA 20% récupérable pour entreprises (environ " + 
        `${Math.round(estimatedInvestment * 0.2).toLocaleString('fr-FR')} € d'économie)`,
      details: "Sous réserve d'activité imposable à la TVA",
      eligible: true
    },
    {
      title: "Amortissements accélérés",
      description: "Possibilité d'amortissement dérogatoire sur 5 ans (au lieu de 20-25 ans)",
      details: "Dispositif fiscal favorable pour les entreprises soumises à l'IS",
      eligible: true
    },
    {
      title: "Ademe - Fonds Chaleur",
      description: "Subvention jusqu'à 30% du coût HT pour les installations > 100 kWc",
      details: "Sous conditions de performance énergétique et d'usage",
      eligible: validPower > 100
    },
    {
      title: "Certificats d'Économies d'Énergie (CEE)",
      description: "Prime énergie selon la puissance installée",
      details: "Jusqu'à 100€/kWc selon les opérateurs",
      eligible: true
    }
  ];

  // Message sur l'ensoleillement
  const getSolarMessage = () => {
    if (currentRegion.irradiance >= 1650) {
      return "☀️ Excellente ressource solaire ! Votre région bénéficie d'un ensoleillement exceptionnel.";
    } else if (currentRegion.irradiance >= 1400) {
      return "☀️ Bonne ressource solaire. Le projet est rentable dans votre région.";
    } else if (currentRegion.irradiance >= 1150) {
      return "🌤️ Ensoleillement modéré. Le projet reste rentable avec une optimisation technique.";
    } else {
      return "🌧️ Ensoleillement limité. Une étude technique approfondie est recommandée.";
    }
  };

  // Map des icônes pour les recommandations techniques
  const getIconComponent = (iconName) => {
    const icons = {
      Building: Building,
      MapPin: MapPin,
      Battery: Battery,
      Thermometer: Thermometer,
      Wrench: Wrench,
      Compass: Compass,
      CloudSun: CloudSun,
      Zap: Zap
    };
    return icons[iconName];
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

      {/* SECTION ENSOLEILLEMENT RÉGIONAL AVEC ZONES */}
      <div className="pv-region-section">
        <h2><MapPin size={24} /> Ensoleillement selon votre région</h2>
        
        {/* Affichage des zones d'ensoleillement */}
        <div className="zones-grid">
          {SOLAR_ZONES.map((zone, index) => (
            <div 
              key={index} 
              className={`zone-card ${currentZone?.zone === zone.zone ? 'active' : ''}`}
              style={{ borderColor: zone.color }}
            >
              <div className="zone-header" style={{ backgroundColor: zone.color }}>
                <span className="zone-label">{zone.label}</span>
              </div>
              <h4>{zone.zone}</h4>
              <p className="zone-production">{zone.production}</p>
              <small>{zone.regions.slice(0, 3).join(", ")}...</small>
            </div>
          ))}
        </div>

        <div className="region-selector">
          <label>Localisation de votre installation :</label>
          <select 
            value={selectedRegion} 
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="region-select"
          >
            {Object.entries(solarIrradianceData).map(([key, region]) => (
              <option key={key} value={key}>{region.name}</option>
            ))}
          </select>
        </div>
        
        <div className="solar-card" style={{ borderLeftColor: currentRegion.color }}>
          <div className="solar-info">
            <div className="solar-value">
              <Sun size={32} />
              <span className="irradiance-value">{currentRegion.irradiance} kWh/m²/an</span>
              <span className="irradiance-label">Rayonnement solaire</span>
            </div>
            <div className="solar-description">
              <p>{currentRegion.description}</p>
              <p className="solar-message">{getSolarMessage()}</p>
              <div className="zone-badge" style={{ backgroundColor: currentZone.color }}>
                {currentZone.label}
              </div>
            </div>
          </div>
          <div className="solar-impact">
            <strong>Impact sur la production :</strong>
            <p>Pour {validPower} kWc installés, production estimée à <strong>{production.toLocaleString('fr-FR')} kWh/an</strong><br />
            (soit {Math.round(production / validConsumption * 100)}% de votre consommation)</p>
            <p className="production-reference">Référence : {currentZone.production}</p>
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
            <Leaf size={24} />
            <h3>Impact environnemental</h3>
            <p>Réduction de votre empreinte carbone</p>
            <p className="card-stats">
              ~{co2Avoided} tCO₂ évitées par an
            </p>
          </div>
        </div>
      </div>

      {/* RECOMMANDATIONS TECHNIQUES */}
      <div className="pv-recommendations">
        <h2><Wrench size={24} /> Recommandations techniques</h2>
        <div className="recommendations-grid">
          {technicalRecommendations.map((rec, index) => {
            const IconComponent = getIconComponent(rec.icon);
            return (
              <div key={index} className="recommendation-card">
                {IconComponent && <IconComponent size={24} />}
                <h3>{rec.title}</h3>
                <p>{rec.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AIDES FINANCIÈRES */}
      <div className="pv-aides">
        <h2>💰 Aides financières disponibles 2026</h2>
        <div className="aides-grid">
          {aides.map((aide, index) => (
            <div key={index} className={`aide-card ${!aide.eligible ? 'not-eligible' : ''}`}>
              <CheckCircle size={20} className={aide.eligible ? 'eligible' : ''} />
              <h3>{aide.title}</h3>
              <p>{aide.description}</p>
              <small>{aide.details}</small>
              {!aide.eligible && <span className="badge">Sous conditions</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ÉTAPES DU PROJET */}
      <div className="pv-steps">
        <h2><FileText size={24} /> Les 5 étapes de votre projet solaire</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Étude de faisabilité</h3>
            <p>Analyse technique, financière et réglementaire</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Recherche de financement</h3>
            <p>Subventions, prêts verts, autofinancement</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Démarches administratives</h3>
            <p>Déclaration préalable, demande de raccordement Enedis</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Installation</h3>
            <p>Choix d'un installateur RGE QualiPV certifié</p>
          </div>
          <div className="step-card">
            <div className="step-number">5</div>
            <h3>Mise en service & suivi</h3>
            <p>Raccordement au réseau, suivi de production</p>
          </div>
        </div>
      </div>

      {/* CTA FINAL */}
      <div className="pv-cta">
        <Zap size={28} />
        <div>
          <h3>Prêt à lancer votre projet photovoltaïque ?</h3>
          <p>Contactez un expert certifié pour un accompagnement personnalisé</p>
        </div>
        <button onClick={() => navigate("/contact")}>
          Demander un devis gratuit
        </button>
      </div>
    </div>
  );
}