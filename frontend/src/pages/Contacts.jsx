import React, { useState } from "react";
import { Link } from "react-router-dom";

export function Contacts() {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    entreprise: "",
    telephone: "",
    sujet: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici vous ajouterez la logique d'envoi du formulaire
    console.log("Formulaire soumis:", formData);
    alert("Merci pour votre message ! Nous vous recontacterons rapidement.");
    setFormData({
      nom: "",
      email: "",
      entreprise: "",
      telephone: "",
      sujet: "",
      message: ""
    });
  };

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <header className="page-header">
          <h1>Contactez-nous</h1>
          <p className="page-subtitle">
            Prêt à optimiser votre consommation énergétique ? Parlons-en !
          </p>
        </header>

        <div className="contact-sections">
          {/* Section Informations de contact */}
          <section className="contact-info-section">
            <div className="section-content">
              <h2>Nos coordonnées</h2>
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-icon">📧</div>
                  <div className="contact-details">
                    <h3>Email</h3>
                    <p>6x-resolve@energie-optimisee.fr</p>
                    <span className="contact-note">Réponse sous 24h</span>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-icon">📞</div>
                  <div className="contact-details">
                    <h3>Téléphone</h3>
                    <p>XX XX XX XX XX</p>
                    <span className="contact-note">Lun-Ven, 9h-18h</span>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-icon">📍</div>
                  <div className="contact-details">
                    <h3>Adresse</h3>
                    <p>74 bis Av. Maurice Thorez <br />94200 Ivry-sur-Seine</p>
                    {/*9 rue Saint-Just, 94200 Ivry-sur-Seine  pour le New campus*/ }
                    <span className="contact-note">Sur rendez-vous</span>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-icon">💬</div>
                  <div className="contact-details">
                    <h3>Réseaux sociaux</h3>
                    <div className="social-links">
                      <a href="#" className="social-link">LinkedIn</a>
                      <a href="#" className="social-link">Twitter</a>
                      <a href="#" className="social-link">Facebook</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section Formulaire de contact */}
          <section className="contact-form-section">
            <div className="section-content">
              <h2>Envoyez-nous un message</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nom">Nom complet *</label>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="entreprise">Entreprise</label>
                    <input
                      type="text"
                      id="entreprise"
                      name="entreprise"
                      value={formData.entreprise}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="telephone">Téléphone</label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="sujet">Sujet *</label>
                  <select
                    id="sujet"
                    name="sujet"
                    value={formData.sujet}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="audit">Audit énergétique</option>
                    <option value="subventions">Subventions et aides</option>
                    <option value="autoproduction">Autoproduction énergétique</option>
                    <option value="partenariat">Partenariat</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Décrivez votre projet ou votre demande..."
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary submit-btn">
                  Envoyer le message
                </button>
              </form>
            </div>
          </section>
        </div>

        {/* Section FAQ rapide */}
        <section className="faq-section">
          <div className="section-content">
            <h2>Questions fréquentes</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>Quel est le délai pour un audit énergétique ?</h3>
                <p>Un audit complet prend généralement 2 à 3 semaines, incluant l'analyse et les recommandations.</p>
              </div>
              <div className="faq-item">
                <h3>Proposez-vous des consultations à distance ?</h3>
                <p>Oui, nous réalisons des audits préliminaires et consultations en visioconférence.</p>
              </div>
              <div className="faq-item">
                <h3>Quelles aides financières sont disponibles ?</h3>
                <p>Nous vous accompagnons pour accéder aux subventions CEE, MaPrimeRénov', et autres aides locales.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="section-content">
            <h2>Prêt à optimiser et à démarrer votre transition énergétique ?</h2>
            <p>
             Rejoignez les entreprises qui ont déjà fait le choix d'une 
              consommation énergétique plus responsable et économique grâce à nos solutions.
            </p>
            <div className="cta-buttons">
              <Link to="/audit" className="btn btn-primary">
                 Démarrer un audit
              </Link>
              <Link to="/qui-sommes-nous" className="btn btn-secondary">
                Découvrir notre expertise
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}