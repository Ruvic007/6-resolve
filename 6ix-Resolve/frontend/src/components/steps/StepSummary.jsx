import React from "react";

export default function StepSummary({ data, onBack}) {
  const handleFinish = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/questionnaire", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok && result.status === "success") {
      alert("✅ Données envoyées avec succès !");
      console.log(result);
    } else {
      alert("❌ Erreur : " + (result.message || "Échec d’envoi"));
      console.error(result);
    }
  } catch (error) {
    console.error("Erreur d'envoi :", error);
    alert("❌ Impossible de se connecter au serveur backend.");
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
            <span className="summary-value">
              {String(value) || "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="actions">
        <button onClick={onBack} className="btn-secondary">
          Retour
        </button>
        <button onClick={handleFinish} className="btn-primary">
          Envoyer
        </button>
      </div>
    </div>
  );
}
