import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useApp } from "../AppContext";

export default function StepSummary({ data, onBack }) {
  const navigate = useNavigate();
  const { user } = useUser();
  const { completeForm } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Vérification avant envoi (ex : valeurs négatives interdites)
  const validateData = () => {
    const invalidFields = Object.entries(data).filter(
      ([key, value]) =>
        typeof value === "number" && value < 0 // on interdit les nombres négatifs
    );

    if (invalidFields.length > 0) {
      const fieldNames = invalidFields.map(([key]) => key).join(", ");
      toast.error(`Les valeurs suivantes ne peuvent pas être négatives : ${fieldNames}`);
      return false;
    }

    return true;
  };

  const handleFinish = async () => {
    if (!validateData()) return; // si valeurs invalides → stop

    setIsSubmitting(true);
    try {
      // Utiliser la variable d'environnement pour l'URL de l'API
      const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

      // Ajouter l'ID utilisateur Clerk aux données
      const dataWithUser = {
        ...data,
        user_id: user?.id || null
      };

      const response = await fetch(`${apiUrl}/api/questionnaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataWithUser),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        toast.success("✅ Données envoyées avec succès !");
        console.log(result);

        // Récupérer le company_id de la réponse
        const companyId = result.company_id;

        // Marquer le formulaire comme complété et stocker l'ID dans le contexte
        completeForm(companyId);

        // ⏳ petit délai pour afficher le toast avant redirection
        setTimeout(() => navigate(`/dashboard/${companyId}`), 1500);
      } else {
        toast.error("❌ Erreur : " + (result.message || "Échec d’envoi"));
        console.error(result);
      }
    } catch (error) {
      console.error("Erreur d'envoi :", error);
      toast.error("⚠️ Impossible de se connecter au serveur backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-step summary-step">
      <h2>Résumé de votre audit énergétique</h2>

      <p className="summary-intro">
        Voici les informations que vous avez saisies.
        Veuillez vérifier avant de les envoyer à notre base de données.
      </p>

      <div className="summary-grid">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="summary-item">
            <span className="summary-key">
              {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} :
            </span>
            <span className="summary-value">{String(value) || "—"}</span>
          </div>
        ))}
      </div>

      <div className="actions">
        <button onClick={onBack} className="btn-secondary" disabled={isSubmitting}>
          Retour
        </button>
        <button onClick={handleFinish} className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Envoi..." : "Envoyer"}
        </button>
      </div>
    </div>
  );
}
