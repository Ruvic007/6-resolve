import React from "react";
import { Link } from "react-router-dom";

export function About() {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <header className="page-header">
          <h1>Qui Sommes-Nous ?</h1>
          <p className="page-subtitle">Votre partenaire pour la transition énergétique</p>
           <p className="page-subtitle">
            Découvrez l'équipe derrière EcoPulse et notre mission pour une énergie plus responsable
          </p>
        </header>

        <section className="mission-section">
          <div className="section-content">
            <h2>Notre Mission</h2>
            <p>
                Chez EcoPulse, nous croyons en un avenir énergétique plus durable et accessible 
                à toutes les entreprises. Notre mission est d'accompagner les organisations dans 
                leur transition énergétique grâce à des solutions innovantes et personnalisées.
            </p>
          </div>
        </section>

        <section className="values-section">
          <div className="section-content">
            <h2>Nos Valeurs</h2>
            <div className="values-grid">
              <div className="value-card">
                <h3>Innovation</h3>
                <p>
                  Nous développons des solutions technologiques avancées pour 
                  une gestion énergétique plus intelligente et efficace.
                </p>
              </div>
              <div className="value-card">
                <h3>Durabilité</h3>
                <p>
                  Nous nous engageons pour un avenir énergétique respectueux 
                  de l'environnement et économiquement viable.
                </p>
              </div>
              <div className="value-card">
                <h3>Accompagnement</h3>
                <p>
                  Nous offrons un soutien personnalisé à chaque étape de votre 
                  transition énergétique, de l'audit à la mise en œuvre.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="services-section">
          <div className="section-content">
            <h2>Nos Services</h2>
            <ul className="services-list">
              <li>
                <strong>Audit énergétique complet :</strong> Analyse détaillée de votre 
                consommation et identification des axes d'amélioration.
              </li>
              <li>
                <strong>Recommandations personnalisées :</strong> Solutions adaptées 
                à vos besoins spécifiques pour réduire votre consommation.
              </li>
              <li>
                <strong>Accès aux subventions :</strong> Aide au montage de dossiers 
                pour bénéficier des aides financières disponibles.
              </li>
              <li>
                <strong>Plans d'investissement :</strong> Élaboration de stratégies 
                financières pour vos projets d'autoproduction énergétique.
              </li>
            </ul>
          </div>
        </section>

        <section className="team-section">
          <div className="section-content">
            <h2>Notre Équipe</h2>
            <p>
              Notre équipe est composée d'experts en énergie, d'ingénieurs 
              spécialisés et de consultants en développement durable. 
              Ensemble, nous mettons notre expertise à votre service pour 
              vous accompagner dans votre transition énergétique.
            </p>
          </div>
        </section>

        <section className="cta-section">
          <div className="section-content">
            <h2>Prêt à rejoindre l'aventure ?</h2>
            <p>
               Découvrez comment nous pouvons vous accompagner dans votre transition énergétique.
            </p>
            <div className="cta-buttons">
              <Link to="/contact" className="btn btn-primary">
                Nous contacter
              </Link>
              <Link to="/audit" className="btn btn-secondary">
                Démarrer un audit
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}