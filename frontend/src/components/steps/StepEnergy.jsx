import React from "react";
import { useForm } from "react-hook-form";

export default function StepEnergy({ onNext, onBack }) {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log("Énergie :", data);
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-step">
      <h2>Caractéristiques énergétiques</h2>

      <div className="field-group">
        <select {...register("type_chauffage")}>
          <option value="">-- Type de chauffage --</option>
          <option value="pompe_a_chaleur">Pompe à chaleur</option>
          <option value="gaz">Gaz</option>
          <option value="fuel">Fioul</option>
          <option value="electrique">Électrique</option>
        </select>
      </div>

      <div className="field-group">
        <select {...register("type_eclairage")}>
          <option value="">-- Type d'éclairage --</option>
          <option value="LED">LED</option>
          <option value="halogene">Halogène</option>
          <option value="fluorescent">Fluorescent</option>
        </select>
      </div>

      <div className="field-group">
        <select {...register("niveau_isolation")}>
          <option value="">-- Niveau d'isolation --</option>
          <option value="faible">Faible</option>
          <option value="moyen">Moyen</option>
          <option value="bon">Bon</option>
          <option value="excellent">Excellent</option>
        </select>
      </div>

      <div className="field-group">
        <select {...register("ventilation")}>
          <option value="">-- Type de ventilation --</option>
          <option value="naturelle">Naturelle</option>
          <option value="VMC_simple_flux">VMC simple flux</option>
          <option value="VMC_double_flux">VMC double flux</option>
        </select>
      </div>

      <div className="field-group">
        <textarea {...register("autres")} placeholder="Autres informations énergétiques..." rows="3" />
      </div>

      <div className="actions">
        <button type="button" onClick={onBack} className="btn-secondary">Retour</button>
        <button type="submit" className="btn-primary">Suivant</button>
      </div>
    </form>
  );
}
