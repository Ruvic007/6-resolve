import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import {
  ArrowLeft, Filter, Award, Lightbulb, AlertTriangle,
  DollarSign, Clock, ChevronRight, Star, RefreshCw, Info
} from "lucide-react";
import "../App.css";
import "../Dashboard.css";
import { useRecommendations } from "../hooks/useRecommendations";

const PRIORITY_COLORS = {
  Haute:   { badge: "#fee2e2", text: "#dc2626", border: "#fca5a5" },
  Moyenne: { badge: "#fef3c7", text: "#d97706", border: "#fcd34d" },
  Basse:   { badge: "#f0fdf4", text: "#16a34a", border: "#86efac" },
};

const PHASE_LABELS = {
  1: "Audit",
  2: "Monitoring",
  3: "Quick Wins",
  4: "Optimisation",
  5: "Investissement",
};

function PriorityBadge({ priorite }) {
  const colors = PRIORITY_COLORS[priorite] || PRIORITY_COLORS.Moyenne;
  return (
    <span style={{
      background: colors.badge,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      borderRadius: "6px",
      padding: "2px 10px",
      fontSize: "0.75rem",
      fontWeight: 600,
    }}>
      {priorite}
    </span>
  );
}

function RecommendationCard({ rec }) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "1.25rem 1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      borderLeft: `4px solid ${PRIORITY_COLORS[rec.priorite]?.border || "#e5e7eb"}`,
    }}>
      {/* Header carte */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
        <PriorityBadge priorite={rec.priorite} />
        <span style={{ fontSize: "0.75rem", color: "#6b7280", background: "#f3f4f6", borderRadius: "6px", padding: "2px 8px" }}>
          Phase {rec.phase} — {PHASE_LABELS[rec.phase]}
        </span>
        {rec.top && (
          <span style={{ fontSize: "0.75rem", color: "#7c3aed", background: "#ede9fe", borderRadius: "6px", padding: "2px 8px" }}>
            ⭐ Top priorité
          </span>
        )}
        <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: "auto" }}>{rec.categorie}</span>
      </div>

      {/* Titre + description */}
      <div>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", margin: "0 0 0.25rem 0" }}>
          {rec.titre}
        </h3>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0, lineHeight: 1.5 }}>
          {rec.description}
        </p>
      </div>

      {/* Métriques */}
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        {rec.economie_estimee && rec.economie_estimee !== "—" && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#059669" }}>
            <DollarSign size={14} /> <span><strong>{rec.economie_estimee}</strong></span>
          </div>
        )}
        {rec.delai && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#6b7280" }}>
            <Clock size={14} /> <span>{rec.delai}</span>
          </div>
        )}
        {rec.roi && rec.roi !== "—" && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "#6b7280" }}>
            <ChevronRight size={14} /> <span>ROI : {rec.roi}</span>
          </div>
        )}
      </div>

      {/* Pourquoi — spécifique à l'utilisateur */}
      <div>
        <button
          onClick={() => setShowWhy(!showWhy)}
          style={{
            display: "flex", alignItems: "center", gap: "0.35rem",
            background: "none", border: "none", cursor: "pointer",
            fontSize: "0.8rem", color: "#10b981", fontWeight: 500, padding: 0,
          }}
        >
          <Info size={14} />
          {showWhy ? "Masquer l'explication" : "Pourquoi cette recommandation ?"}
        </button>
        {showWhy && (
          <p style={{
            marginTop: "0.5rem", padding: "0.75rem", background: "#f0fdf4",
            border: "1px solid #bbf7d0", borderRadius: "8px",
            fontSize: "0.8rem", color: "#374151", lineHeight: 1.6,
          }}>
            {rec.pourquoi}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Recommendations() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { recommendations, companyName, loading, error } = useRecommendations(getToken);
  const [activePhase, setActivePhase] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");

  const filtered = recommendations.filter(rec => {
    const phaseMatch    = activePhase === "all" || rec.phase === parseInt(activePhase);
    const priorityMatch = selectedPriority === "all" || rec.priorite === selectedPriority;
    return phaseMatch && priorityMatch;
  });

  const stats = {
    total:       recommendations.length,
    top:         recommendations.filter(r => r.top).length,
    haute:       recommendations.filter(r => r.priorite === "Haute").length,
  };

  // --- États de chargement / erreur ---
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Génération de vos recommandations personnalisées...</p>
        </div>
      </div>
    );
  }

  if (error === "no_audit") {
    return (
      <div className="dashboard-page">
        <div className="dashboard-empty-state">
          <Lightbulb size={48} strokeWidth={1.5} />
          <h2>Aucun audit disponible</h2>
          <p>Réalisez votre premier audit pour obtenir des recommandations personnalisées.</p>
          <button className="btn-primary" onClick={() => navigate("/audit")}>
            Faire mon premier audit
          </button>
        </div>
      </div>
    );
  }

  if (error) {
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

  return (
    <div className="dashboard-page">

      {/* TOPBAR */}
      <div className="dashboard-topbar">
        <span className="topbar-company">
          {companyName ? `Recommandations — ${companyName}` : "Recommandations personnalisées"}
        </span>
        <div className="topbar-actions">
          <button className="btn-secondary-small" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={16} /> Retour au dashboard
          </button>
        </div>
      </div>

      {/* STATISTIQUES RAPIDES */}
      <section className="dashboard-section">
        <h2 className="section-title">Vue d'ensemble</h2>
        <div className="metrics-grid">
          <div className="metric-card blue">
            <div className="metric-icon blue"><Lightbulb size={24} /></div>
            <div className="metric-info">
              <span className="metric-label">Recommandations</span>
              <span className="metric-value">{stats.total}</span>
            </div>
          </div>
          <div className="metric-card yellow">
            <div className="metric-icon yellow"><Star size={24} /></div>
            <div className="metric-info">
              <span className="metric-label">Top priorité</span>
              <span className="metric-value">{stats.top}</span>
            </div>
          </div>
          <div className="metric-card red" style={{ "--card-color": "#fee2e2", "--icon-color": "#dc2626" }}>
            <div className="metric-icon" style={{ background: "#fee2e2" }}>
              <AlertTriangle size={24} style={{ color: "#dc2626" }} />
            </div>
            <div className="metric-info">
              <span className="metric-label">Priorité haute</span>
              <span className="metric-value">{stats.haute}</span>
            </div>
          </div>
          <div className="metric-card green">
            <div className="metric-icon green"><Award size={24} /></div>
            <div className="metric-info">
              <span className="metric-label">Phases couvertes</span>
              <span className="metric-value">{new Set(recommendations.map(r => r.phase)).size} / 5</span>
            </div>
          </div>
        </div>
      </section>

      {/* FILTRES */}
      <section className="dashboard-section">
        <h2 className="section-title">Filtrer les recommandations</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <select
            value={activePhase}
            onChange={e => setActivePhase(e.target.value)}
            style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.875rem", cursor: "pointer" }}
          >
            <option value="all">Toutes les phases</option>
            {Object.entries(PHASE_LABELS).map(([id, label]) => (
              <option key={id} value={id}>Phase {id} — {label}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={e => setSelectedPriority(e.target.value)}
            style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "0.875rem", cursor: "pointer" }}
          >
            <option value="all">Toutes priorités</option>
            <option value="Haute">Haute priorité</option>
            <option value="Moyenne">Priorité moyenne</option>
            <option value="Basse">Basse priorité</option>
          </select>

          {(activePhase !== "all" || selectedPriority !== "all") && (
            <button
              onClick={() => { setActivePhase("all"); setSelectedPriority("all"); }}
              style={{
                display: "flex", alignItems: "center", gap: "0.35rem",
                background: "none", border: "1px solid #e5e7eb", borderRadius: "8px",
                padding: "0.5rem 0.75rem", cursor: "pointer", fontSize: "0.875rem", color: "#6b7280",
              }}
            >
              <RefreshCw size={14} /> Réinitialiser
            </button>
          )}

          <span style={{ fontSize: "0.875rem", color: "#6b7280", marginLeft: "auto" }}>
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </span>
        </div>
      </section>

      {/* LISTE DES RECOMMANDATIONS */}
      <section className="dashboard-section">
        <h2 className="section-title">Recommandations personnalisées</h2>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
            <Filter size={36} strokeWidth={1.5} />
            <p style={{ marginTop: "0.5rem" }}>Aucune recommandation pour ces filtres.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filtered.map(rec => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="dashboard-section">
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "1rem",
        }}>
          <div>
            <h3 style={{ margin: "0 0 0.25rem 0", fontWeight: 600 }}>Prêt à passer à l'action ?</h3>
            <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem" }}>
              Explorez les solutions technologiques adaptées à votre profil.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button className="btn-primary-small" onClick={() => navigate("/Solar_PV")}>
              Solaire PV
            </button>
            <button className="btn-primary-small" onClick={() => navigate("/Solar_Ther")}>
              Solaire Thermique
            </button>
            <button className="btn-primary-small" onClick={() => navigate("/Geothermique")}>
              Géothermie
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
