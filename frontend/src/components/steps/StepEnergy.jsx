import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Zap, ArrowLeft, ArrowRight } from "lucide-react";

export default function StepEnergy({ onNext, onBack, defaultValues }) {
  const { register, handleSubmit, reset } = useForm({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = (data) => {
    if (onNext) onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2><Zap size={24} /> Caractéristiques énergétiques</h2>
      <p className="step-description">Décrivez les équipements énergétiques de votre bâtiment.</p>

      <div className="form-row">
        <div className="field-group">
          <label>Type de chauffage</label>
          <select {...register("type_chauffage")}>
            <option value="">-- Sélectionnez --</option>
            <option value="pompe_a_chaleur">Pompe à chaleur</option>
            <option value="gaz">Gaz</option>
            <option value="fuel">Fioul</option>
            <option value="electrique">Électrique</option>
          </select>
        </div>
        <div className="field-group">
          <label>Type d'éclairage</label>
          <select {...register("type_eclairage")}>
            <option value="">-- Sélectionnez --</option>
            <option value="LED">LED</option>
            <option value="halogene">Halogène</option>
            <option value="fluorescent">Fluorescent</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="field-group">
          <label>Niveau d'isolation</label>
          <select {...register("niveau_isolation")}>
            <option value="">-- Sélectionnez --</option>
            <option value="faible">Faible</option>
            <option value="moyen">Moyen</option>
            <option value="bon">Bon</option>
            <option value="excellent">Excellent</option>
          </select>
        </div>
        <div className="field-group">
          <label>Type de ventilation</label>
          <select {...register("ventilation")}>
            <option value="">-- Sélectionnez --</option>
            <option value="naturelle">Naturelle</option>
            <option value="VMC_simple_flux">VMC simple flux</option>
            <option value="VMC_double_flux">VMC double flux</option>
          </select>
        </div>
      </div>

      <div className="field-group">
        <label>Autres informations</label>
        <textarea {...register("autres")} placeholder="Informations complémentaires sur vos équipements énergétiques..." rows="3" />
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
