import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
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
  Gauge,
  Loader2,
  AlertTriangle,
  MapPin,
  Wrench,
  FileText,
  Compass,
  CloudSun
} from "lucide-react";
import "../GeoTher.css";
import { useDashboardData } from "../hooks/useDashboardData";

// ─── Données géothermiques par zone (source : BRGM / ADEME) ────
const GEO_ZONES = [
  {
    zone: "Zone 1 – Grand Est & Bassin Parisien",
    regions: ["Île-de-France", "Grand Est", "Bourgogne-Franche-Comté"],
    potential: "Très élevé",
    cop: 4.5,
    color: "#2c7a4d",
    label: "⭐⭐⭐⭐⭐ Exceptionnel",
    description: "Ressources géothermiques exceptionnelles, nappes profondes accessibles"
  },
  {
    zone: "Zone 2 – Sud-Ouest & Centre",
    regions: ["Nouvelle-Aquitaine", "Occitanie", "Auvergne-Rhône-Alpes"],
    potential: "Élevé",
    cop: 4.0,
    color: "#3b9b62",
    label: "⭐⭐⭐⭐ Très bon",
    description: "Bon potentiel géothermique, nombreux aquifères"
  },
  {
    zone: "Zone 3 – Nord & Bretagne",
    regions: ["Hauts-de-France", "Normandie", "Bretagne", "Pays de la Loire"],
    potential: "Modéré",
    cop: 3.5,
    color: "#10b981",
    label: "⭐⭐⭐ Bon",
    description: "Potentiel correct, privilégier les sondes verticales"
  },
  {
    zone: "Zone 4 – Massif Central & Alpes",
    regions: ["Auvergne", "Rhône-Alpes", "Provence-Alpes-Côte d'Azur"],
    potential: "Variable",
    cop: 3.8,
    color: "#6ee7b7",
    label: "⭐⭐⭐ Bon",
    description: "Géologie complexe, études de sol indispensables"
  }
];

// ─── Recommandations techniques géothermiques ──────────────────────────────
const GEO_TECHNICAL_TIPS = [
  {
    icon: "Compass",
    title: "Étude géologique préalable",
    detail: "Une étude de sol (forage test, analyse thermique) est indispensable pour dimensionner correctement l'installation et garantir la rentabilité du projet."
  },
  {
    icon: "Thermometer",
    title: "Sondes verticales vs horizontales",
    detail: "Les sondes verticales (80-150m) offrent un meilleur rendement (COP 4-5) mais coûtent plus cher. Les capteurs horizontaux sont moins coûteux mais nécessitent une grande surface de terrain."
  },
  {
    icon: "Gauge",
    title: "Pompe à chaleur haute performance",
    detail: "Choisissez une PAC certifiée Eurovent ou NF PAC, avec compresseur à variation de vitesse pour optimiser la consommation électrique."
  },
  {
    icon: "Zap",
    title: "Certification RGE obligatoire",
    detail: "L'installateur doit être certifié RGE QualiPAC ou Qualifelec pour bénéficier des aides (MaPrimeRénov', CEE)."
  }
];

export default function GeoThermiq() {
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
  const [surface, setSurface] = useState(100);
  const [typeGeothermie, setTypeGeothermie] = useState("vertical");
  const [besoinChauffage, setBesoinChauffage] = useState(50000);
  const [hasDataFromDashboard, setHasDataFromDashboard] = useState(false);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("centre");

  // Données géothermiques par région détaillées
  const geoRegionalData = {
    "iledefrance": { name: "Île-de-France", zoneIndex: 0, cop: 4.5, description: "Très fort potentiel géothermique" },
    "grandest": { name: "Grand Est", zoneIndex: 0, cop: 4.5, description: "Très fort potentiel géothermique" },
    "bourgognefranchecomte": { name: "Bourgogne-Franche-Comté", zoneIndex: 0, cop: 4.3, description: "Fort potentiel" },
    "nouvelleaquitaine": { name: "Nouvelle-Aquitaine", zoneIndex: 1, cop: 4.2, description: "Bon potentiel" },
    "occitanie": { name: "Occitanie", zoneIndex: 1, cop: 4.0, description: "Bon potentiel" },
    "auvergnerhonealpes": { name: "Auvergne-Rhône-Alpes", zoneIndex: 1, cop: 4.0, description: "Bon potentiel" },
    "hautsdefrance": { name: "Hauts-de-France", zoneIndex: 2, cop: 3.6, description: "Potentiel modéré" },
    "normandie": { name: "Normandie", zoneIndex: 2, cop: 3.5, description: "Potentiel modéré" },
    "bretagne": { name: "Bretagne", zoneIndex: 2, cop: 3.5, description: "Potentiel modéré" },
    "paysdelaloire": { name: "Pays de la Loire", zoneIndex: 2, cop: 3.7, description: "Potentiel modéré" },
    "paca": { name: "Provence-Alpes-Côte d'Azur", zoneIndex: 3, cop: 3.9, description: "Potentiel variable" },
    "corse": { name: "Corse", zoneIndex: 3, cop: 4.0, description: "Potentiel intéressant" },
    "centre": { name: "Centre-Val de Loire", zoneIndex: 0, cop: 4.2, description: "Bon potentiel" }
  };

  const currentGeoRegion = geoRegionalData[selectedRegion];
  const currentZone = GEO_ZONES[currentGeoRegion?.zoneIndex] || GEO_ZONES[1];

  // Mise à jour des valeurs avec les données du dashboard
  useEffect(() => {
    if (dashboardData && dashboardData.metrics) {
      const dashboardConsumption = dashboardData.metrics.consommationTotale;
      
      if (dashboardConsumption && dashboardConsumption > 0) {
        setBesoinChauffage(Math.round(dashboardConsumption));
        setHasDataFromDashboard(true);
        
        // Suggestion de surface basée sur la consommation
        const suggestedSurface = Math.round(dashboardConsumption / 500);
        const clampedSurface = Math.min(500, Math.max(50, suggestedSurface));
        setSurface(clampedSurface);
      }
    }
  }, [dashboardData]);

  // Validation des entrées
  const validSurface = Math.max(0, surface || 0);
  const validBesoin = Math.max(0, besoinChauffage || 0);

  // Rendement et production selon le type et la zone
  const getCop = () => {
    const baseCop = typeGeothermie === "vertical" ? 4.2 : 3.5;
    const zoneFactor = currentZone?.cop / 4.0 || 1;
    return (baseCop * zoneFactor).toFixed(1);
  };

  const getPrixM2 = () => {
    return typeGeothermie === "vertical" ? 350 : 180;
  };

  const cop = parseFloat(getCop());
  const prixM2 = getPrixM2();

  // Calculs
  const puissanceInstallee = validSurface * 0.1;
  const productionThermique = puissanceInstallee * 2000;
  const energieElectriqueConsommee = productionThermique / cop;
  const energieEconomisee = productionThermique - energieElectriqueConsommee;

  const tauxCouverture = Math.min(0.9, (productionThermique / validBesoin)).toFixed(2);

  const prixEnergie = 0.09;
  const economiesAnnuelles = Number((energieEconomisee * prixEnergie).toFixed(0));

  const coutInstallation = validSurface * prixM2;
  const tauxSubvention = 0.35;
  const montantSubvention = coutInstallation * tauxSubvention;
  const resteACharge = coutInstallation - montantSubvention;

  const roi = resteACharge > 0 && economiesAnnuelles > 0
    ? (resteACharge / economiesAnnuelles).toFixed(1)
    : "0";

  // CO2 évité (en tonnes) - 200g CO2/kWh pour le fioul/gaz
  const co2Avoided = ((energieEconomisee * 0.2) / 1000).toFixed(1);

  const hasConsumptionData = dashboardData?.metrics?.consommationTotale > 0;

  // Recommandations techniques personnalisées
  const getTechnicalRecommendations = () => {
    const recommendations = [];
    
    recommendations.push({
      title: "Dimensionnement optimal",
      description: `Pour votre besoin de ${validBesoin.toLocaleString('fr-FR')} kWh/an, une puissance de ${Math.round(puissanceInstallee)} kW est recommandée.`,
      icon: "Gauge"
    });
    
    if (typeGeothermie === "vertical") {
      recommendations.push({
        title: "Forage profond",
        description: `Prévoyez ${Math.ceil(validSurface / 150)} sondes verticales de 80-120m de profondeur.`,
        icon: "MapPin"
      });
    } else {
      recommendations.push({
        title: "Capteurs horizontaux",
        description: `Prévoyez ${Math.ceil(validSurface / 50)} circuits de capteurs horizontaux sur une surface de ${validSurface * 1.5} m².`,
        icon: "MapPin"
      });
    }
    
    // Ajout des recommandations techniques générales
    GEO_TECHNICAL_TIPS.forEach(tip => {
      recommendations.push({
        title: tip.title,
        description: tip.detail,
        icon: tip.icon
      });
    });
    
    return recommendations;
  };

  const technicalRecommendations = getTechnicalRecommendations();

  // Aides financières complètes
  const aides = [
    {
      title: "MaPrimeRénov' Copropriété",
      description: `Jusqu'à ${Math.round(coutInstallation * 0.35).toLocaleString('fr-FR')} € selon les revenus et la performance`,
      details: "Prime forfaitaire ou proportionnelle selon le gain énergétique",
      eligible: true
    },
    {
      title: "Fonds Chaleur (ADEME)",
      description: "Subvention pour projets de géothermie collective jusqu'à 30%",
      details: "Pour les installations > 50 kW, études de faisabilité obligatoires",
      eligible: puissanceInstallee > 50
    },
    {
      title: "Certificats d'Économies d'Énergie (CEE)",
      description: `Prime de ${Math.round(economiesAnnuelles * 5).toLocaleString('fr-FR')} € minimum`,
      details: "Selon les économies d'énergie générées",
      eligible: true
    },
    {
      title: "Éco-PTZ (Prêt à Taux Zéro)",
      description: "Financement jusqu'à 30 000€ sans intérêts",
      details: "Sous conditions de ressources et de performance énergétique",
      eligible: true
    },
    {
      title: "TVA réduite à 5.5%",
      description: "Taux réduit pour les travaux de rénovation énergétique",
      details: "Sous condition d'installateur RGE",
      eligible: true
    }
  ];

  // Message personnalisé selon la zone
  const getGeoMessage = () => {
    if (currentZone.cop >= 4.3) {
      return "🔥 Excellente zone géothermique ! Le potentiel de votre région est exceptionnel.";
    } else if (currentZone.cop >= 3.8) {
      return "🔥 Bon potentiel géothermique. Le projet est très rentable dans votre région.";
    } else {
      return "ℹ️ Potentiel modéré. Une étude de sol approfondie est recommandée pour optimiser le projet.";
    }
  };

  // Map des icônes
  const getIconComponent = (iconName) => {
    const icons = {
      Building: Building,
      MapPin: MapPin,
      Gauge: Gauge,
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

        <div className="geo-title" style={{ background: "linear-gradient(135deg, #2c7a4d, #1f5a3a)" }}>
          <Thermometer size={32} />
          <div>
            <h1>Solution Géothermie</h1>
            <p>Puisez l'énergie du sous-sol pour chauffer et refroidir vos bâtiments</p>
          </div>
        </div>
      </div>

      {/* SECTION POTENTIEL GÉOTHERMIQUE PAR ZONE */}
      <div className="pv-region-section">
        <h2><MapPin size={24} /> Potentiel géothermique par région</h2>
        
        {/* Affichage des zones géothermiques */}
        <div className="zones-grid">
          {GEO_ZONES.map((zone, index) => (
            <div 
              key={index} 
              className={`zone-card ${currentZone?.zone === zone.zone ? 'active' : ''}`}
              style={{ borderColor: zone.color }}
            >
              <div className="zone-header" style={{ backgroundColor: zone.color }}>
                <span className="zone-label">{zone.label}</span>
              </div>
              <h4>{zone.zone}</h4>
              <p className="zone-production">COP: {zone.cop}</p>
              <small>{zone.regions.slice(0, 2).join(", ")}...</small>
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
            {Object.entries(geoRegionalData).map(([key, region]) => (
              <option key={key} value={key}>{region.name}</option>
            ))}
          </select>
        </div>
        
        <div className="solar-card" style={{ borderLeftColor: currentZone.color }}>
          <div className="solar-info">
            <div className="solar-value">
              <Thermometer size={32} />
              <span className="irradiance-value">{currentZone.cop}</span>
              <span className="irradiance-label">COP moyen</span>
            </div>
            <div className="solar-description">
              <p>{currentZone.description}</p>
              <p className="solar-message">{getGeoMessage()}</p>
              <div className="zone-badge" style={{ backgroundColor: currentZone.color }}>
                {currentZone.label}
              </div>
            </div>
          </div>
          <div className="solar-impact">
            <strong>Impact sur le rendement :</strong>
            <p>Pour votre région, un COP de <strong>{cop}</strong> est attendu<br />
            soit {Math.round((cop / 4) * 100)}% du rendement optimal</p>
            <p className="production-reference">Référence : COP max 4.5 dans les meilleures zones</p>
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

      {/* BADGE TYPE D'INSTALLATION */}
      <div className="thermal-type-badge" style={{ borderLeftColor: "#2c7a4d" }}>
        <Zap size={20} />
        <span>Type d'installation : </span>
        <select
          value={typeGeothermie}
          onChange={(e) => setTypeGeothermie(e.target.value)}
          className="type-select"
        >
          <option value="vertical">Sondes géothermiques verticales (forage profond 80-150m)</option>
          <option value="horizontal">Capteurs horizontaux (faible profondeur, grande surface)</option>
        </select>
      </div>

      {/* SECTION STRATÉGIQUE */}
      <div className="pv-strategy">
        <h2>🎯 Pourquoi investir dans la géothermie ?</h2>
        <div className="pv-grid-3">
          <div className="pv-card">
            <TrendingUp size={24} />
            <h3>Réduction des coûts</h3>
            <p>Divisez votre facture énergétique par 3 à 4</p>
            {hasConsumptionData && (
              <p className="card-stats">
                Économie potentielle: ~{economiesAnnuelles.toLocaleString('fr-FR')} €/an
              </p>
            )}
          </div>

          <div className="pv-card">
            <Shield size={24} />
            <h3>Stabilité exceptionnelle</h3>
            <p>Rendement constant toute l'année, indépendant des conditions extérieures</p>
            {hasConsumptionData && (
              <p className="card-stats">
                COP stable: {cop} en moyenne
              </p>
            )}
          </div>

          <div className="pv-card">
            <Leaf size={24} />
            <h3>Impact environnemental</h3>
            <p>Réduction drastique de l'empreinte carbone</p>
            <p className="card-stats">
              ~{co2Avoided} tCO₂ évitées par an
            </p>
          </div>
        </div>
      </div>

      {/* APPLICATIONS */}
      <div className="pv-strategy">
        <h2><Building size={24} /> Applications pour PME et collectivités</h2>
        <div className="pv-grid-3">
          <div className="pv-card">
            <Building size={24} />
            <h3>Bureaux et commerces</h3>
            <p>Chauffage et climatisation basse consommation</p>
          </div>
          <div className="pv-card">
            <Home size={24} />
            <h3>Logements collectifs</h3>
            <p>Réseau de chaleur pour copropriétés</p>
          </div>
          <div className="pv-card">
            <Factory size={24} />
            <h3>Sites industriels</h3>
            <p>Processus industriels et chauffage des locaux</p>
          </div>
        </div>
      </div>

      {/* SIMULATEUR */}
      <div className="pv-simulator" style={{ background: "linear-gradient(135deg, #f0f7f3, #e6f0ea)" }}>
        <h2><Calculator size={22}/> Simulation personnalisée</h2>
        
        <p className="sim-info" style={{ borderLeftColor: "#2c7a4d" }}>
          {hasDataFromDashboard 
            ? "✅ Simulation basée sur vos données de consommation réelles" 
            : "ℹ️ Simulation basée sur des valeurs moyennes. Un audit vous donnera une estimation plus précise."}
        </p>

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
            <small className="input-hint">
              {typeGeothermie === "vertical"
                ? "≈ 100-150 m² par sonde (5-10kW)"
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
          <div className="result-card" style={{ borderLeftColor: "#2c7a4d" }}>
            <BarChart3 size={20} />
            <p>Production estimée</p>
            <h3>{productionThermique.toLocaleString('fr-FR')} kWh/an</h3>
            <small>{Math.round(productionThermique / validBesoin * 100)}% de vos besoins</small>
          </div>

          <div className="result-card" style={{ borderLeftColor: "#2c7a4d" }}>
            <DollarSign size={20} />
            <p>Économies annuelles</p>
            <h3>{economiesAnnuelles.toLocaleString('fr-FR')} €</h3>
            <small>Basé sur {prixEnergie} €/kWh</small>
          </div>

          <div className="result-card" style={{ borderLeftColor: "#2c7a4d" }}>
            <Gauge size={20} />
            <p>Coefficient de performance (COP)</p>
            <h3>{cop}</h3>
            <small>Électricité consommée: {Math.round(energieElectriqueConsommee).toLocaleString('fr-FR')} kWh/an</small>
          </div>

          <div className="result-card highlight" style={{ background: "linear-gradient(135deg, #2c7a4d, #3b9b62)" }}>
            <TrendingUp size={20} />
            <p>ROI après subventions</p>
            <h3>{roi} ans</h3>
            <small>Durée de vie: 25 ans</small>
          </div>
        </div>

        <div className="investment-details" style={{ borderColor: "#3b9b62" }}>
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

      {/* RECOMMANDATIONS TECHNIQUES */}
      <div className="pv-recommendations">
        <h2><Wrench size={24} /> Recommandations techniques</h2>
        <div className="recommendations-grid">
          {technicalRecommendations.map((rec, index) => {
            const IconComponent = getIconComponent(rec.icon);
            return (
              <div key={index} className="recommendation-card">
                {IconComponent && <IconComponent size={24} style={{ color: "#2c7a4d" }} />}
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
              <CheckCircle size={20} className={aide.eligible ? 'eligible' : ''} style={{ color: aide.eligible ? "#2c7a4d" : "" }} />
              <h3>{aide.title}</h3>
              <p>{aide.description}</p>
              <small>{aide.details}</small>
              {!aide.eligible && <span className="badge">Sous conditions</span>}
            </div>
          ))}
        </div>
      </div>

      {/* AVANTAGES TECHNIQUES */}
      <div className="pv-recommendations">
        <h2><CheckCircle size={24} /> Points forts de la géothermie</h2>
        <div className="advantages-grid" style={{ background: "linear-gradient(135deg, #f0f7f3, white)" }}>
          <div className="advantage-item">
            <Leaf size={18} style={{ color: "#2c7a4d" }} />
            <span>Énergie renouvelable et locale</span>
          </div>
          <div className="advantage-item">
            <Gauge size={18} style={{ color: "#2c7a4d" }} />
            <span>Rendement stable toute l'année (COP 3.5-4.5)</span>
          </div>
          <div className="advantage-item">
            <Shield size={18} style={{ color: "#2c7a4d" }} />
            <span>Durée de vie > 25 ans</span>
          </div>
          <div className="advantage-item">
            <Thermometer size={18} style={{ color: "#2c7a4d" }} />
            <span>Peut assurer climatisation réversible en été</span>
          </div>
          <div className="advantage-item">
            <CheckCircle size={18} style={{ color: "#2c7a4d" }} />
            <span>Éligible à MaPrimeRénov' et CEE</span>
          </div>
          <div className="advantage-item">
            <TrendingUp size={18} style={{ color: "#2c7a4d" }} />
            <span>Valorisation immobilière du bien</span>
          </div>
        </div>
      </div>

      {/* ÉTAPES DU PROJET */}
      <div className="pv-steps">
        <h2><FileText size={24} /> Les 5 étapes de votre projet géothermique</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number" style={{ background: "linear-gradient(135deg, #2c7a4d, #3b9b62)" }}>1</div>
            <h3>Étude de faisabilité</h3>
            <p>Analyse géologique, étude de sol, dimensionnement</p>
          </div>
          <div className="step-card">
            <div className="step-number" style={{ background: "linear-gradient(135deg, #2c7a4d, #3b9b62)" }}>2</div>
            <h3>Recherche de financement</h3>
            <p>Subventions, prêts verts, autofinancement</p>
          </div>
          <div className="step-card">
            <div className="step-number" style={{ background: "linear-gradient(135deg, #2c7a4d, #3b9b62)" }}>3</div>
            <h3>Démarches administratives</h3>
            <p>Déclaration de travaux, autorisation de forage</p>
          </div>
          <div className="step-card">
            <div className="step-number" style={{ background: "linear-gradient(135deg, #2c7a4d, #3b9b62)" }}>4</div>
            <h3>Installation</h3>
            <p>Choix d'un installateur RGE QualiPAC certifié</p>
          </div>
          <div className="step-card">
            <div className="step-number" style={{ background: "linear-gradient(135deg, #2c7a4d, #3b9b62)" }}>5</div>
            <h3>Mise en service & suivi</h3>
            <p>Contrat de maintenance, suivi des performances</p>
          </div>
        </div>
      </div>

      {/* CTA FINAL */}
      <div className="geo-cta" style={{ background: "linear-gradient(135deg, #1a3a2a, #0f2a1e)" }}>
        <Leaf size={28} />
        <div>
          <h3>Prêt à exploiter l'énergie du sous-sol ?</h3>
          <p>Contactez un expert certifié pour un accompagnement personnalisé</p>
        </div>
        <button onClick={() => navigate("/contact")}>
          Étudier mon projet géothermique
        </button>
      </div>
    </div>
  );
}