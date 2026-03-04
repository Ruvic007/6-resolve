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
    if (onNext) onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="step-header">
        <span className="step-badge">Étape 2 / 3</span>
        <h2><Zap size={22} /> Vos consommations énergétiques</h2>
        <p className="step-description">
          Saisissez les données de vos dernières factures. Ces chiffres servent à calculer vos économies potentielles, votre ROI et votre empreinte carbone.
        </p>
        <div className="step-tip">
          <span>💡</span>
          <span>Vous trouverez ces données sur vos factures EDF / Engie, ou dans votre espace client en ligne. En cas de doute, une estimation suffit.</span>
        </div>
      </div>

      <div className="field-group">
        <label>Année de référence <span className="required">*</span></label>
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
        <small>Correspond à l'année de vos dernières factures annuelles</small>
        {errors.annee && <p className="error">{errors.annee.message}</p>}
      </div>

      <div className="form-row">
        <div className="field-group">
          <label>Type de facture énergétique <span className="required">*</span></label>
          <select {...register("type_facture")}>
            <option value="">-- Sélectionnez --</option>
            <option value="electricite">Électricité</option>
            <option value="mixte">Électricité + Gaz</option>
          </select>
        </div>
      </div>
      {typeFacture === "electricite" && (
        <div className="form-section">
          <h4>⚡ Électricité</h4>
          <div className="form-row">
            <div className="field-group">
              <label>Consommation annuelle (kWh) <span className="required">*</span></label>
              <input
                type="number"
                {...register("conso_elec", {
                  required: "Consommation obligatoire",
                  valueAsNumber: true,
                  min: { value: 100, message: "Min 100 kWh/an" },
                  max: { value: 30000000, message: "Max 30 000 000 kWh/an" },
                })}
                placeholder="2000"
                step="1"
                min="100"
                max="30000000"
              />
              <small>Total kWh consommés sur l'année de référence</small>
              {errors.conso_elec && <p className="error">{errors.conso_elec.message}</p>}
            </div>
            <div className="field-group">
              <label>Tarif moyen (€/kWh HT) <span className="required">*</span></label>
              <input
                type="number"
                step="0.001"
                {...register("prix_elec", {
                  required: "Prix obligatoire",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "Min 0,01€" },
                  max: { value: 0.5, message: "Max 0,5€" }
                })}
                placeholder="0.18"
                min="0.01"
                max="0.5"
              />
              <small>Indiqué sur votre facture, généralement entre 0,15 et 0,25 €</small>
              {errors?.prix_elec && <p className="error">{errors.prix_elec.message}</p>}
            </div>
          </div>
        </div>
      )}

      {typeFacture === "mixte" && (
        <div className="form-section">
          <h4>⚡ Électricité + 🔥 Gaz</h4>
          {/* ÉLECTRICITÉ */}
          <div className="form-row">
            <div className="field-group">
              <label>Consommation électricité (kWh/an) <span className="required">*</span></label>
              <input
                type="number"
                {...register("conso_elec", {
                  required: "Consommation Élec obligatoire",
                  valueAsNumber: true,
                  min: { value: 100, message: "Min 100 kWh/an" },
                  max: { value: 30000000, message: "Max 30 000 000 kWh/an" }
                })}
                placeholder="2000"
                step="1"
                min="100"
                max="30000000"
              />
              {errors?.conso_elec && <p className="error">{errors.conso_elec.message}</p>}
            </div>
            <div className="field-group">
              <label>Tarif électricité (€/kWh HT) <span className="required">*</span></label>
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
                max="1"
              />
              <small>Indiqué sur votre facture, généralement entre 0,15 et 0,25 €</small>
              {errors?.prix_elec && <p className="error">{errors.prix_elec.message}</p>}
            </div>
          </div>
          {/* GAZ */}
          <div className="form-row">
            <div className="field-group">
              <label>Consommation gaz (kWh/an) <span className="required">*</span></label>
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
              <label>Tarif gaz (€/kWh HT) <span className="required">*</span></label>
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
              <small>Tarif hors taxes, généralement entre 0,07 et 0,12 €</small>
              {errors?.prix_gaz && <p className="error">{errors.prix_gaz.message}</p>}
            </div>
          </div>
        </div>
      )}


      <div className="field-group">
        <label>Part actuelle d'énergies renouvelables (%)</label>
        <div className="energy-slider">
          <input
            type="range"
            min="0" max="100" step="1"
            {...register("pourcentage_renouvelable")}
            className="slider"
          />
          <span className="value">{pourcentageRenouvelable || 0}%</span>
        </div>
        <small>Part de renouvelables dans votre mix actuel (panneaux solaires, contrat vert…). Affiché sur votre dashboard.</small>
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
