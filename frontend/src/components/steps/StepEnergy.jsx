import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Zap, ArrowLeft, ArrowRight,Check } from "lucide-react";

export default function StepEnergy({ onNext, onBack, defaultValues }) {

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm({defaultValues:defaultValues,shouldUnregister: false});

  const typeFacture = useWatch({ control, name: "type_facture" });
  const pourcentageRenouvelable = useWatch({ control, name: "pourcentage_renouvelable" }); // ✅ Pour le slider

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = (data) => {
    console.log("DATA:", data);
    if (onNext) onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2><Zap size={24} /> Caractéristiques énergétiques</h2>
      <p className="step-description">Décrivez les équipements énergétiques de votre bâtiment.</p>

      <div className="field-group">
        <label>Année de référence</label>
        <input
          {...register("annee",{
            required: "année de référence obligatoire",
            valueAsNumber: true,
            min: { value: 1960, message: "Min 1960 " },
            max: { value: 2026, message: "Max 2026" },
            validate: (value) => {
              if (!Number.isInteger(value)) {
                return "L'année doit être un nombre entier (pas de décimales)";
              }
            return true;
            }
          })}
          type="number"
          placeholder="Ex: 2024"
          min="1960"
          max="2026"
          step="1"
        />
        {errors.annee && <p className="error">{errors.annee.message}</p>}

      </div>

      <div className="form-row">
        <div className="field-group">
          <label>Type de facture énergétique</label>
          <select {...register("type_facture")}>
            <option value="">-- Sélectionnez --</option>
            <option value="electricite">Électricité</option>
            <option value="mixte">Électricité + Gaz</option>
          </select>
        </div>
      </div>
      {typeFacture === "electricite" && (
        <div className="form-section">
          <h4> Électricité</h4>
          <div className="form-row">
            <div className="field-group">
              <label>Consommation (kWh) <span className="required">*</span></label>
              <input 
                type="number" 
                {...register("conso_elec", {
                  required: "Consommation obligatoire",
                  valueAsNumber: true,
                  min: { value: 100, message: "Min 100 kWh/ans " },
                  max: { value: 30000000, message: "Max 30 000 000 kWh/ans" },
                })} 
                placeholder="2000"
                step="1"
                min="100"
                max="30000000"
              />
              {errors.conso_elec && <p className="error">{errors.conso_elec.message}</p>}
            </div>
            <div className="field-group">
              <label>Prix (€/kWh HT) <span className="required">*</span></label>
              <input 
                type="number" 
                step="0.001"
                {...register("prix_elec", {
                  required: "Prix obligatoire",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "Min 0,01€ " },
                  max: { value: 0.5, message: "Max 0,5" }
                })} 
                placeholder="0.18"
                min="0.01"
                max="0.5"
              />
              {errors?.prix_elec && <p className="error">{errors.prix_elec.message}</p>}
            </div>
          </div>
        </div>
      )}

      {typeFacture === "mixte" && (
        <div className="form-section">
          <h4> Électricité + Gaz</h4>
          {/* ÉLECTRICITÉ */}
          <div className="form-row">
            <div className="field-group">
              <label>Conso Élec (kWh) <span className="required">*</span></label>
              <input 
                type="number" 
                {...register("conso_elec", {
                  required: "Consommation Élec obligatoire",
                  valueAsNumber: true,
                  min: { value: 100, message: "Min 100 kWh/an" },
                  max: { value: 30000000, message: "Max 3 000 000 kWh/an" }
                })} 
                placeholder="2000"
                step="50"
                min="100"
                max="30000000"
              />
              {errors?.conso_elec && <p className="error">{errors.conso_elec.message}</p>}
            </div>
            <div className="field-group">
              <label>Prix Élec (€/kWh) <span className="required">*</span></label>
              <input 
                type="number" 
                step="0.001"
                {...register("prix_elec", {
                  required: "Prix Élec obligatoire",
                  valueAsNumber: true,
                  min: { value: 0.05, message: "Min 0,05€" },
                  max: { value: 1, message: "Max 1€" }
                })} 
                placeholder="0.18"
                min="0.05"
                max="1€"
              />
              {errors?.prix_elec && <p className="error">{errors.prix_elec.message}</p>}
            </div>
          </div>
          {/* GAZ */}
          <div className="form-row">
            <div className="field-group">
              <label>Conso Gaz (kWh) <span className="required">*</span></label>
              <input 
                type="number" 
                {...register("conso_gaz", {
                  required: "Consommation Gaz obligatoire",
                  valueAsNumber: true,
                  min: { value: 100, message: "Min 100 kWh" },
                  max: { value: 5000000, message: "Max 5 000 000 kWh" }
                })} 
                placeholder="5000"
                step="1"
                min="100"
                max="5000000"
              />
              {errors?.conso_gaz && <p className="error">{errors.conso_gaz.message}</p>}
            </div>
            <div className="field-group">
              <label>Prix Gaz (€/kWh) <span className="required">*</span></label>
              <input 
                type="number" 
                step="0.001"
                {...register("prix_gaz", {
                  required: "Prix Gaz obligatoire",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "Min 0,01€" },
                  max: { value: 0.5, message: "Max 0,5€" }
                })} 
                placeholder="0.09"
                min="0.01"
                max="0.5"
              />
              {errors?.prix_gaz && <p className="error">{errors.prix_gaz.message}</p>}
            </div>
          </div>
        </div>
      )}


      {/* ✅ SLIDER CORRIGÉ */}
      <div className="field-group">
        <label>Énergies renouvelables (%)</label>
        <div className="energy-slider">
          <input 
            type="range" 
            min="0" max="100" step="0.1"  // ✅ step=5 (plus pratique)
            {...register("pourcentage_renouvelable")}
            className="slider"
          />
          <span className="value">{pourcentageRenouvelable || 0}%</span> {/* ✅ useWatch */}
        </div>
      </div>
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
