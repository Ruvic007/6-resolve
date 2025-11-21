import React from "react";
import { useForm } from "react-hook-form";

export default function StepCompany({ onNext }) {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data) => {
    console.log("Entreprise :", data);
    onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-step">
      <h2>Informations sur l’entreprise</h2>

      <div className="field-group">
        <input {...register("nom")} placeholder="Nom de l'entreprise" required />
      </div>

      <div className="field-group">
        <input {...register("code_postal")} placeholder="Code postal" required />
      </div>

      <div className="field-group">
        <input {...register("secteur_activite")} placeholder="Secteur d'activité" required />
      </div>

      <div className="field-group">
        <select {...register("type_batiment")} required>
          <option value="">-- Type de bâtiment --</option>
          <option value="bureau">Bureau</option>
          <option value="commerce">Commerce</option>
          <option value="industriel">Industriel</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      <div className="field-group">
        <input {...register("annee_construction")} type="number" placeholder="Année de construction" />
      </div>

      <div className="field-group">
        <input {...register("surface_locaux")} type="number" placeholder="Surface des locaux (m²)" step="0.1" />
      </div>

      <div className="field-group">
        <input {...register("surface_toit")} type="number" placeholder="Surface du toit (m²)" step="0.1" />
      </div>

      <div className="field-group">
        <input {...register("horaire_ouverture")} placeholder="Horaires d'ouverture" />
      </div>

      <div className="field-group">
        <select {...register("type_facture")}>
          <option value="">-- Type de facture énergétique --</option>
          <option value="electricite">Électricité</option>
          <option value="gaz">Gaz</option>
          <option value="mixte">Mixte</option>
        </select>
      </div>

      <div className="field-group">
        <select {...register("utilisation_energie_renouvelable")}>
          <option value="false">Énergie renouvelable ?</option>
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>
      </div>

      <div className="field-group">
        <input {...register("type_energie_renouvelable")} placeholder="Type d'énergie renouvelable (si applicable)" />
      </div>

      <div className="field-group">
        <select {...register("monitoring_consommation")}>
          <option value="false">Monitoring de consommation ?</option>
          <option value="true">Oui</option>
          <option value="false">Non</option>
        </select>
      </div>

      <div className="actions">
        <button type="submit" className="btn-primary">Suivant</button>
      </div>
    </form>
  );
}
