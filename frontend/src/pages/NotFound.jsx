import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();
  const particlesRef = useRef([]);

  useEffect(() => {
    particlesRef.current.forEach((el, i) => {
      if (!el) return;
      const delay = i * 0.3;
      el.style.animationDelay = `${delay}s`;
    });
  }, []);

  return (
    <div className="not-found-page">
      {/* Particules flottantes */}
      <div className="particles">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            ref={(el) => (particlesRef.current[i] = el)}
          />
        ))}
      </div>

      <div className="not-found-content">
        {/* Icône centrale animée */}
        <div className="not-found-icon-wrapper">
          <div className="icon-ring" />
          <div className="icon-ring ring-2" />
          <Zap size={48} className="not-found-zap" />
        </div>

        {/* 404 */}
        <h1 className="not-found-code">404</h1>

        {/* Message */}
        <h2 className="not-found-title">Page introuvable</h2>
        <p className="not-found-description">
          Oups ! Cette page n'existe pas ou a été déplacée.
          <br />
          Retournez sur le tableau de bord pour continuer votre audit.
        </p>

        {/* Boutons */}
        <div className="not-found-actions">
          <button
            className="not-found-btn-primary"
            onClick={() => navigate("/dashboard")}
          >
            <Home size={18} />
            Tableau de bord
          </button>
          <button
            className="not-found-btn-secondary"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Retour
          </button>
        </div>
      </div>
    </div>
  );
}
