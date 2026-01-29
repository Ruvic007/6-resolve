import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { BarChart3, ArrowLeft, ArrowRight } from "lucide-react";

export default function StepEquipment({ onNext, onBack, defaultValues }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = (data) => {
    if (onNext) onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2><BarChart3 size={24} /> Données de consommation</h2>
      <p className="step-description">Indiquez vos consommations énergétiques annuelles.</p>

      <div className="field-group">
        <label>Année de référence</label>
        <input
          {...register("annee")}
          type="number"
          placeholder="Ex: 2024"
          min="1960"
          max={currentYear}
        />
      </div>

      <div className="form-row">
        <div className="field-group">
          <label>Consommation électricité (kWh)</label>
          <input
            {...register("conso_electricite_kwh")}
            type="number"
            placeholder="Ex: 25000"
            step="0.01"
            min="0"
          />
        </div>
        <div className="field-group">
          <label>Consommation gaz (kWh)</label>
          <input
            {...register("conso_gaz_kwh")}
            type="number"
            placeholder="Ex: 15000"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="field-group">
          <label>Coût total de l'énergie (€)</label>
          <input
            {...register("cout_energie_euros")}
            type="number"
            placeholder="Ex: 5000"
            step="0.01"
            min="0"
          />
        </div>
        <div className="field-group">
          <label>Émissions de CO₂ (kg)</label>
          <input
            {...register("emission_co2_kg")}
            type="number"
            placeholder="Ex: 3500"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="step-actions">
        <button type="button" onClick={onBack} className="btn-back">
          <ArrowLeft size={18} /> Retour
        </button>
        <button type="submit" className="btn-next">
          Suivant <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}
