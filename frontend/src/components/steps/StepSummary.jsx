import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useApp } from "../AppContext";
import { ClipboardCheck, ArrowLeft, Send, Loader2 } from "lucide-react";

// Organiser les données par section
const SECTIONS = {
  entreprise: {
    title: "Entreprise",
    fields: ["nom", "code_postal", "categorie_activite", "sous_categorie"]
  },
  batiment: {
    title: "Bâtiment",
    fields: ["type_batiment", "annee_construction", "surface_locaux", "surface_toit", "horaire_ouverture"]
  },
  energie: {
    title: "Énergie",
    fields: ["type_facture", "type_chauffage", "type_eclairage", "niveau_isolation", "ventilation", "utilisation_energie_renouvelable", "type_energie_renouvelable", "monitoring_consommation"]
  },
  consommation: {
    title: "Consommation",
    fields: ["annee", "conso_elec", "conso_gaz", "cout_energie_euros", "emission_co2_kg"]
  }
};

const FIELD_LABELS = {
  nom: "Nom",
  code_postal: "Code postal",
  categorie_activite: "Catégorie",
  sous_categorie: "Sous-catégorie",
  type_batiment: "Type de bâtiment",
  annee_construction: "Année de construction",
  surface_locaux: "Surface locaux (m²)",
  surface_toit: "Surface toit (m²)",
  horaire_ouverture: "Horaires",
  type_facture: "Type de facture",
  type_chauffage: "Chauffage",
  type_eclairage: "Éclairage",
  niveau_isolation: "Isolation",
  ventilation: "Ventilation",
  utilisation_energie_renouvelable: "Énergie renouvelable",
  type_energie_renouvelable: "Type renouvelable",
  monitoring_consommation: "Monitoring",
  annee: "Année de référence",
  conso_electricite_kwh: "Électricité (kWh)",
  conso_gaz_kwh: "Gaz (kWh)",
  cout_energie_euros: "Coût total (€)",
  emission_co2_kg: "Émissions CO₂ (kg)"
};

export default function StepSummary({ data, onBack }) {
  const navigate = useNavigate();
  const { user } = useUser();
  const { completeForm } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateData = () => {
    const invalidFields = Object.entries(data).filter(
      ([, value]) => typeof value === "number" && value < 0
    );

    if (invalidFields.length > 0) {
      const fieldNames = invalidFields.map(([key]) => FIELD_LABELS[key] || key).join(", ");
      toast.error(`Valeurs négatives non autorisées : ${fieldNames}`);
      return false;
    }
    return true;
  };

  const handleFinish = async () => {
    if (!validateData()) return;

    setIsSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const dataWithUser = {
        ...data,
        user_id: user?.id || null
      };
      console.log("=== Données envoyées au backend ===");
      Object.entries(dataWithUser).forEach(([key, value]) => {
        console.log(`${key}:`, value, `(type: ${typeof value})`);
      });
      console.log("===================================");
      const response = await fetch(`${apiUrl}/api/questionnaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataWithUser),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast.success("Données envoyées avec succès !");
        const companyId = result.company_id;
        completeForm(companyId);
        setTimeout(() => navigate(`/dashboard/${companyId}`), 1500);
      } else {
        toast.error("Erreur : " + (result.message || "Échec d'envoi"));
      }
    } catch (error) {
      console.error("Erreur d'envoi :", error);
      toast.error("Impossible de se connecter au serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatValue = (key, value) => {
    if (value === undefined || value === null || value === "") return "—";
    if (value === "true") return "Oui";
    if (value === "false") return "Non";
    return String(value);
  };

  return (
    <div>
      <h2><ClipboardCheck size={24} /> Résumé de votre audit</h2>
      <p className="step-description">
        Vérifiez les informations avant de soumettre votre audit énergétique.
      </p>

      <div className="summary-grid">
        {Object.entries(SECTIONS).map(([sectionKey, section]) => (
          <div key={sectionKey} className="summary-section">
            <h4>{section.title}</h4>
            {section.fields.map((fieldKey) => {
              if (data[fieldKey] === undefined) return null;
              return (
                <div key={fieldKey} className="summary-item">
                  <span className="label">{FIELD_LABELS[fieldKey] || fieldKey}</span>
                  <span className="value">{formatValue(fieldKey, data[fieldKey])}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="step-actions">
        <button onClick={onBack} className="btn-back" disabled={isSubmitting}>
          <ArrowLeft size={18} /> Retour
        </button>
        <button onClick={handleFinish} className="btn-next" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="spin" /> Envoi en cours...
            </>
          ) : (
            <>
              <Send size={18} /> Envoyer l'audit
            </>
          )}
        </button>
      </div>
    </div>
  );
}
