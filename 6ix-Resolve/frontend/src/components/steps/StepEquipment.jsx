import React from "react";
import { useForm } from "react-hook-form";

export default function StepEquipment({ onNext, onBack }) {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log("Équipements :", data);
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-step">
      <h2>Données de consommation</h2>

      <div className="field-group">
        <input {...register("annee")} type="number" placeholder="Année de référence" min="2000" max="2025" />
      </div>

      <div className="field-group">
        <input {...register("conso_electricite_kwh")} type="number" placeholder="Consommation électricité (kWh)" step="0.01" />
      </div>

      <div className="field-group">
        <input {...register("conso_gaz_kwh")} type="number" placeholder="Consommation gaz (kWh)" step="0.01" />
      </div>

      <div className="field-group">
        <input {...register("cout_energie_euros")} type="number" placeholder="Coût total de l'énergie (€)" step="0.01" />
      </div>

      <div className="field-group">
        <input {...register("emission_co2_kg")} type="number" placeholder="Émissions de CO₂ (kg)" step="0.01" />
      </div>

      <div className="actions">
        <button type="button" onClick={onBack} className="btn-secondary">Retour</button>
        <button type="submit" className="btn-primary">Suivant</button>
      </div>
    </form>
  );
}
