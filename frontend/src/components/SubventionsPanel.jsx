import { useState, useEffect } from "react";
import { HandCoins, ExternalLink, Target, BadgeEuro } from "lucide-react";

export function SubventionsPanel() {
  const [subventions, setSubventions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubventions = async () => {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      try {
        const response = await fetch(`${baseUrl}/api/subventions/`);
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result; 
          setSubventions(data);
          setSubventions(result.data);
        }
      } catch (err) {
        console.error("Erreur chargement subventions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubventions();
  }, []);

  if (loading) {
    return (
      <div className="subventions-loading">
        <div className="loading-spinner-small"></div>
        <span>Chargement des aides...</span>
      </div>
    );
  }

  if (subventions.length === 0) {
    return (
      <div className="card subventions-empty">
        <HandCoins size={32} strokeWidth={1.5} />
        <h3>Aides financières</h3>
        <p>Aucune aide disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="subventions-grid">
      {subventions.map((sub) => (
        <div key={sub.id} className="subvention-card">
          <div className="subvention-header">
            <span className="subvention-category">{sub.categorie}</span>
            <span className="subvention-organisme">{sub.organisme}</span>
          </div>
          <h4 className="subvention-title">{sub.nom}</h4>
          <p className="subvention-description">{sub.description}</p>
          <div className="subvention-details">
            <div className="subvention-detail">
              <Target size={14} />
              <span>{sub.cible}</span>
            </div>
            <div className="subvention-detail highlight">
              <BadgeEuro size={14} />
              <span>{sub.aide_max}</span>
            </div>
          </div>
          <a href={sub.url} target="_blank" rel="noopener noreferrer" className="subvention-link">
            En savoir plus <ExternalLink size={14} />
          </a>
        </div>
      ))}
    </div>
  );
}
