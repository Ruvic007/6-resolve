import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Target, Download, ArrowLeft, Filter, BarChart3, Calendar, Award, Lightbulb,
  AlertTriangle, Zap, Building, DollarSign, Clock, CheckCircle, ChevronRight, Star, RefreshCw,
  Thermometer, Battery, Home, Factory, Settings, Sun, Wind, Shield, TrendingUp
} from "lucide-react";
import "../App.css";

export default function Recommendations() {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  // Données doivent être définies AVANT les composants qui les utilisent
  const phases = [
    { id: 1, name: "Audit", description: "Diagnostic initial", mois: "Mois 1-2", icon: Thermometer },
    { id: 2, name: "Monitoring", description: "Suivi et analyse", mois: "Mois 2", icon: BarChart3 },
    { id: 3, name: "Quick Wins", description: "Gains rapides", mois: "Mois 3-4", icon: Zap },
    { id: 4, name: "Optimisation", description: "Améliorations techniques", mois: "Mois 5-8", icon: Settings },
    { id: 5, name: "Investissement", description: "Équipements structurants", mois: "Mois 9+", icon: Building }
  ];

  const recommendations = [
    // Phase 1: Audit
    {
      id: 1,
      titre: "Audit facturier complet",
      description: "Analyse des 3 dernières années de factures pour identifier les postes de coût et anomalies",
      phase: 1,
      priorite: "Haute",
      economie: "Jusqu'à 15%",
      delai: "2-4 semaines",
      roi: "< 1 mois",
      categorie: "Diagnostic",
      top: true,
      secteur: "Tous"
    },
    {
      id: 2,
      titre: "Recensement équipements",
      description: "Inventaire détaillé de tous les équipements énergivores avec âge et état",
      phase: 1,
      priorite: "Moyenne",
      economie: "—",
      delai: "1-2 semaines",
      roi: "—",
      categorie: "Inventaire",
      top: false,
      secteur: "Tous"
    },

    // Phase 2: Monitoring
    {
      id: 3,
      titre: "Box énergie connectée",
      description: "Installation système monitoring bas coût avec analyse consommation temps réel",
      phase: 2,
      priorite: "Haute",
      economie: "5-10%",
      delai: "1 mois",
      roi: "< 12 mois",
      categorie: "Monitoring",
      top: true,
      secteur: "Tous"
    },

    // Phase 3: Quick Wins
    {
      id: 4,
      titre: "Programmation chauffage intelligent",
      description: "Thermostats programmables avec sondes et gestion horaires réels",
      phase: 3,
      priorite: "Haute",
      economie: "10-20% chauffage",
      delai: "1-2 semaines",
      roi: "< 6 mois",
      categorie: "Régulation",
      top: true,
      secteur: "Tous"
    },
    {
      id: 5,
      titre: "Conversion LED complète",
      description: "Remplacement éclairage + détecteurs présence zones peu fréquentées",
      phase: 3,
      priorite: "Haute",
      economie: "30-50% éclairage",
      delai: "2-4 semaines",
      roi: "< 2 ans",
      categorie: "Éclairage",
      top: true,
      secteur: "Tous"
    },
    {
      id: 6,
      titre: "Chasse gaspillages invisibles",
      description: "Détection fuites air comprimé, isolation circuits eau chaude, gestion moteurs",
      phase: 3,
      priorite: "Haute",
      economie: "8-12%",
      delai: "3-4 semaines",
      roi: "< 1 an",
      categorie: "Maintenance",
      top: true,
      secteur: "Industrie"
    },

    // Phase 4: Optimisation
    {
      id: 7,
      titre: "Isolation toiture prioritaire",
      description: "40% des déperditions - isolation combles perdus ou toiture terrasse",
      phase: 4,
      priorite: "Moyenne",
      economie: "20-30% chauffage",
      delai: "2-3 mois",
      roi: "3-5 ans",
      categorie: "Isolation",
      top: false,
      secteur: "Bâtiment"
    },
    {
      id: 8,
      titre: "Remplacement simples vitrages",
      description: "Installation double vitrage PVC ou aluminium à rupture de pont thermique",
      phase: 4,
      priorite: "Moyenne",
      economie: "10-15% chauffage",
      delai: "1-2 mois",
      roi: "4-6 ans",
      categorie: "Fenêtres",
      top: false,
      secteur: "Bâtiment"
    },

    // Phase 5: Investissement
    {
      id: 9,
      titre: "Photovoltaïque autoconsommation",
      description: "Installation panneaux solaires avec taux autoconsommation ~70%",
      phase: 5,
      priorite: "Moyenne",
      economie: "40-60% électricité",
      delai: "4-6 mois",
      roi: "5-8 ans",
      categorie: "Renouvelable",
      top: false,
      secteur: "Tous"
    },
    {
      id: 10,
      titre: "GTB centralisée",
      description: "Gestion Technique Bâtiment intelligente avec sous-comptage",
      phase: 5,
      priorite: "Basse",
      economie: "10-15% globale",
      delai: "3-4 mois",
      roi: "4-6 ans",
      categorie: "Gestion",
      top: false,
      secteur: "Bâtiment"
    }
  ];

  const aides = [
    { 
      nom: "Certificats Économies Énergie (CEE)", 
      montant: "30-100€/m²", 
      conditions: "Travaux éligibles réalisés par artisan RGE" 
    },
    { 
      nom: "MaPrimeRénov' Entreprise", 
      montant: "Jusqu'à 30% HT", 
      conditions: "TPE/PME <50 salariés, bâtiment >2 ans" 
    },
    { 
      nom: "TVA taux réduit 5.5%", 
      montant: "Réduction 10 points", 
      conditions: "Travaux amélioration énergétique locaux >2 ans" 
    },
    { 
      nom: "Aides régionales", 
      montant: "20-50% subvention", 
      conditions: "Variables selon région (appels à projets)" 
    },
    { 
      nom: "Prêt Éco-Énergie 0%", 
      montant: "Prêt bonifié", 
      conditions: "Via banques partenaires pour travaux éligibles" 
    }
  ];

  // Filtrage des recommandations
  const filteredRecommendations = recommendations.filter(rec => {
    const phaseMatch = activePhase === "all" || rec.phase === parseInt(activePhase);
    const priorityMatch = selectedPriority === "all" || rec.priorite === selectedPriority;
    return phaseMatch && priorityMatch;
  });

  // Statistiques calculées
  const stats = {
    total: recommendations.length,
    top: recommendations.filter(r => r.top).length,
    highPriority: recommendations.filter(r => r.priorite === "Haute").length,
    quickROI: recommendations.filter(r => r.roi && r.roi.includes("< 2 ans")).length,
    estimatedSavings: "15-30%"
  };

  // Fonction d'export
  const handleExport = () => {
    const exportData = {
      titre: "Feuille de Route Énergétique 6ixResolve",
      date: new Date().toISOString(),
      nombreRecommandations: filteredRecommendations.length,
      recommandations: filteredRecommendations,
      statistiques: stats
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `recommandations-energetiques-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleFilterReset = () => {
    setActivePhase("all");
    setSelectedPriority("all");
  };

  // 1. HEADER COMPONENT
  const Header = () => (
    <div className="recommendations-header">
      <button 
        className="back-button"
        onClick={() => navigate("/")}
      >
        <ArrowLeft size={20} />
        Retour
      </button>
      
      <div className="header-content">
        <Target size={32} className="header-icon" />
        <div>
          <h1>Feuille de Route Énergétique</h1>
          <p className="subtitle">Guide personnalisé pour réduire votre facture de 15 à 30%</p>
        </div>
      </div>
    </div>
  );

  // 2. INTRODUCTION COMPONENT
  const Introduction = () => (
    <div className="intro-section">
      <Lightbulb size={24} />
      <div>
        <h2>Optimisez votre consommation en 5 étapes</h2>
        <p>Méthodologie progressive adaptée aux PME françaises : Comprendre → Optimiser → Investir</p>
      </div>
    </div>
  );

  // 3. STATISTICS COMPONENT
  const Statistics = () => (
    <div className="stats-section">
      <div className="stat-card">
        <Target size={24} />
        <div>
          <h3>{stats.total}</h3>
          <p>Recommandations générales</p>
        </div>
      </div>
      <div className="stat-card">
        <Star size={24} />
        <div>
          <h3>{stats.top}</h3>
          <p>Prioritaires</p>
        </div>
      </div>
      <div className="stat-card">
        <AlertTriangle size={24} />
        <div>
          <h3>{stats.highPriority}</h3>
          <p>Actions urgentes</p>
        </div>
      </div>
      <div className="stat-card">
        <DollarSign size={24} />
        <div>
          <h3>{stats.estimatedSavings}</h3>
          <p>Recommandations personnalisées</p>
        </div>
      </div>
    </div>
  );

  // 4. PHASE STEP COMPONENT
  const PhaseStep = ({ phase, activePhase, onClick }) => {
    const Icon = phase.icon || Target;
    const isActive = activePhase === phase.id.toString();
    
    return (
      <div 
        className={`phase-step ${isActive ? "active" : ""}`}
        onClick={() => onClick(phase.id.toString())}
      >
        <div className="step-icon">
          <Icon size={20} />
        </div>
        <div className="step-content">
          <h4>Étape {phase.id}: {phase.name}</h4>
          <p>{phase.description}</p>
          <span className="step-duration">{phase.mois}</span>
        </div>
      </div>
    );
  };

  // 5. PHASES NAVIGATION COMPONENT
  const PhasesNavigation = () => (
    <div className="phases-section">
      <h2>🗺️ Parcours recommandé</h2>
      <div className="phases-container">
        {phases.map(phase => (
          <PhaseStep
            key={phase.id}
            phase={phase}
            activePhase={activePhase}
            onClick={setActivePhase}
          />
        ))}
      </div>
    </div>
  );

  // 6. FILTERS COMPONENT
  const Filters = () => (
    <div className="filters-section">
      <div className="filter-group">
        <Filter size={18} />
        <select 
          value={activePhase}
          onChange={(e) => setActivePhase(e.target.value)}
          className="filter-select"
        >
          <option value="all">Toutes les phases</option>
          {phases.map(p => (
            <option key={p.id} value={p.id}>Phase {p.id}: {p.name}</option>
          ))}
        </select>
      </div>
      
      <div className="filter-group">
        <AlertTriangle size={18} />
        <select 
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="filter-select"
        >
          <option value="all">Toutes priorités</option>
          <option value="Haute">Haute priorité</option>
          <option value="Moyenne">Priorité moyenne</option>
          <option value="Basse">Basse priorité</option>
        </select>
      </div>

      <button className="reset-filters" onClick={handleFilterReset}>
        <RefreshCw size={16} />
        Réinitialiser
      </button>

      <div className="results-count">
        {filteredRecommendations.length} résultat{filteredRecommendations.length > 1 ? 's' : ''}
      </div>
    </div>
  );

  // 7. RECOMMENDATION CARD COMPONENT
  const RecommendationCard = ({ rec }) => {
    const getPriorityColor = (priority) => {
      switch(priority) {
        case "Haute": return "priority-high";
        case "Moyenne": return "priority-medium";
        case "Basse": return "priority-low";
        default: return "priority-medium";
      }
    };

    const handleAddToPlan = (rec) => {
      alert(`"${rec.titre}" ajouté à votre plan d'action !`);
      // Ajout futur de la logique pour sauvegarder dans localStorage ou API
    };

    return (
      <div className="recommendation-card">
        <div className="card-header">
          <span className={`priority-badge ${getPriorityColor(rec.priorite)}`}>
            {rec.priorite}
          </span>
          <span className="phase-tag">Phase {rec.phase}</span>
          {rec.top && <span className="top-badge">⭐ TOP</span>}
        </div>
        
        <div className="card-body">
          <h3>{rec.titre}</h3>
          <p>{rec.description}</p>
          
          <div className="card-metrics">
            {rec.economie && rec.economie !== "—" && (
              <div className="metric">
                <DollarSign size={16} />
                <span>Éco: {rec.economie}</span>
              </div>
            )}
            {rec.delai && (
              <div className="metric">
                <Clock size={16} />
                <span>Délai: {rec.delai}</span>
              </div>
            )}
            {rec.roi && rec.roi !== "—" && (
              <div className="metric">
                <TrendingUp size={16} />
                <span>ROI: {rec.roi}</span>
              </div>
            )}
          </div>
          
          <div className="card-footer-info">
            <span className="category-tag">{rec.categorie}</span>
            <span className="sector-tag">{rec.secteur}</span>
          </div>
        </div>
        
        <div className="card-actions">
          <button 
            className="btn-outline"
            onClick={() => alert(`Détails: ${rec.titre}`)}
          >
            Détails
            <ChevronRight size={16} />
          </button>
          <button 
            className="btn-primary"
            onClick={() => handleAddToPlan(rec)}
          >
            Ajouter au plan
          </button>
        </div>
      </div>
    );
  };

  // 8. RECOMMENDATIONS GRID COMPONENT
  const RecommendationsGrid = () => (
    <div className="recommendations-grid">
      {filteredRecommendations.length === 0 ? (
        <div className="empty-state">
          <Filter size={48} />
          <h3>Aucune recommandation trouvée</h3>
          <p>Modifiez vos critères de filtrage</p>
        </div>
      ) : (
        filteredRecommendations.map(rec => (
          <RecommendationCard key={rec.id} rec={rec} />
        ))
      )}
    </div>
  );

  // 9. AIDE CARD COMPONENT
  const AideCard = ({ aide }) => (
    <div className="aide-card">
      <div className="aide-header">
        <Shield size={20} className="aide-icon" />
        <span className="aide-name">{aide.nom}</span>
      </div>
      <div className="aide-body">
        <div className="aide-amount">
          <DollarSign size={14} />
          <span>{aide.montant}</span>
        </div>
        <p className="aide-conditions">{aide.conditions}</p>
      </div>
    </div>
  );

  // 10. FINANCIAL AIDS COMPONENT
  const FinancialAids = () => (
    <div className="aides-section">
      <h2>💰 Aides financières disponibles</h2>
      <div className="aides-grid">
        {aides.slice(0, 3).map((aide, index) => (
          <AideCard key={index} aide={aide} />
        ))}
      </div>
      <button 
        className="view-more-btn"
        onClick={() => alert("Page des aides financières (à implémenter)")}
      >
        Voir toutes les aides
      </button>
    </div>
  );

  // 11. CALL TO ACTION COMPONENT
  const CallToAction = () => (
    <div className="cta-section">
      <Award size={32} />
      <div>
        <h3>Prêt à démarrer ?</h3>
        <p>Sélectionnez vos recommandations prioritaires et créez votre plan d'action personnalisé</p>
      </div>
      <button 
        className="cta-button"
        onClick={() => navigate("/dashboard")}
      >
        <CheckCircle size={20} />
        Créer mon plan d'action
      </button>
    </div>
  );

  // 12. MAIN RETURN - ORDRE D'AFFICHAGE DE LA PAGE
  return (
    <div className="recommendations-container">
      {/* 1. Header */}
      <Header />
      
      {/* 2. Introduction */}
      <Introduction />
      
      {/* 3. Statistiques */}
      <Statistics />
      
      {/* 4. Navigation par phases */}
      <PhasesNavigation />
      
      {/* 5. Filtres */}
      <Filters />
      
      {/* 6. Grille de recommandations */}
      <RecommendationsGrid />
      
      {/* 7. Aides financières */}
      <FinancialAids />
      
      {/* 8. Call to Action */}
      <CallToAction />
    </div>
  );
}