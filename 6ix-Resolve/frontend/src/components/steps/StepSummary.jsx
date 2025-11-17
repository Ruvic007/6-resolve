import React from "react";

export default function StepSummary({ data, onBack }) {
  const handleFinish = () => {
    console.log("Données finales :", data);
    alert("✅ Données prêtes à être envoyées au backend !");
    // TODO: envoi vers FastAPI ou Supabase ici
  };

  return (
    <div className="form-step">
      <h2>Résumé du questionnaire</h2>

      <div className="summary-box">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>

      <div className="actions">
        <button onClick={onBack} className="btn-secondary">Retour</button>
        <button onClick={handleFinish} className="btn-primary">Envoyer</button>
      </div>
    </div>
  );
}
