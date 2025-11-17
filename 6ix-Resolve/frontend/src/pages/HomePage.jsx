import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"; // pour les variables globales et classes de bouton

export default function HomePage() {
  const navigate = useNavigate();

  const handleAuditClick = () => {
    navigate("/audit");
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">
          Bienvenue sur <span className="accent-text">EcoPulse</span> ⚡
        </h1>

        <p className="home-subtitle">
          Analysez, simulez et réduisez votre consommation énergétique grâce à
          une plateforme intelligente dédiée à la transition durable.
        </p>

        <div className="home-buttons">
          <button className="primary-btn" onClick={handleAuditClick}>
            Commencer mon audit
          </button>
          <button className="secondary-btn" onClick={() => navigate("/about")}>
            En savoir plus
          </button>
        </div>
      </div>
    </div>
  );
}
