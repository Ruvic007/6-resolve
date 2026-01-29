import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { AlertTriangle, ClipboardList, LayoutDashboard, ScrollText } from "lucide-react";
import "../App.css";

export function Historique() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAudits = async () => {
      // Attendre que l'utilisateur soit chargé
      if (!user) return;

      try {
        setLoading(true);
        const apiUrl = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8000";
        // Filtrer par user_id pour n'afficher que les audits de l'utilisateur connecté
        const response = await fetch(`${apiUrl}/api/companies?user_id=${user.id}`);

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.status === "success" && result.data) {
          setAudits(result.data);
        } else {
          throw new Error(result.message || "Erreur lors du chargement");
        }
      } catch (err) {
        console.error("Erreur API:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, [user]);

  const handleViewDashboard = (companyId) => {
    navigate(`/dashboard/${companyId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="historique-container">
        <div className="historique-loading">
          <div className="loading-spinner"></div>
          <p>Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historique-container">
        <div className="historique-error">
          <div className="error-icon"><AlertTriangle size={48} /></div>
          <h3>Erreur de chargement</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="historique-container">
      <div className="historique-header">
        <h1><ScrollText size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />Historique des Audits</h1>
        <p>Retrouvez tous vos audits énergétiques et accédez à leurs dashboards.</p>
      </div>

      {audits.length === 0 ? (
        <div className="historique-empty">
          <div className="empty-icon"><ClipboardList size={48} /></div>
          <h3>Aucun audit trouvé</h3>
          <p>Vous n'avez pas encore réalisé d'audit énergétique.</p>
          <button className="btn btn-primary" onClick={() => navigate("/audit")}>
            Faire mon premier audit
          </button>
        </div>
      ) : (
        <div className="historique-grid">
          {audits.map((audit) => (
            <div key={audit.id} className="audit-card">
              <div className="audit-card-header">
                <h3>{audit.nom || `Entreprise ${audit.id}`}</h3>
                <span className="audit-badge">ID: {audit.id}</span>
              </div>

              <div className="audit-card-body">
                <div className="audit-info-row">
                  <span className="audit-label">Secteur</span>
                  <span className="audit-value">{audit.secteur_activite || "—"}</span>
                </div>
                <div className="audit-info-row">
                  <span className="audit-label">Type de bâtiment</span>
                  <span className="audit-value">{audit.type_batiment || "—"}</span>
                </div>
                <div className="audit-info-row">
                  <span className="audit-label">Surface</span>
                  <span className="audit-value">{audit.surface_locaux ? `${audit.surface_locaux} m²` : "—"}</span>
                </div>
                <div className="audit-info-row">
                  <span className="audit-label">Code postal</span>
                  <span className="audit-value">{audit.code_postal || "—"}</span>
                </div>
                <div className="audit-info-row">
                  <span className="audit-label">Date de création</span>
                  <span className="audit-value">{formatDate(audit.created_at)}</span>
                </div>
              </div>

              <div className="audit-card-footer">
                <button
                  className="btn btn-primary"
                  onClick={() => handleViewDashboard(audit.id)}
                >
                  <LayoutDashboard size={16} style={{ marginRight: '0.4rem' }} /> Voir le Dashboard
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="historique-actions">
        <button className="btn btn-secondary" onClick={() => navigate("/audit")}>
          + Nouvel audit
        </button>
      </div>
    </div>
  );
}
