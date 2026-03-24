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
                min="100"
                max="30000000"
              />
              <small>Total kWh consommés sur l'année de référence</small>
              {errors.conso_elec && <p className="error">{errors.conso_elec.message}</p>}
            </div>
            <div className="field-group">
              <label>Coût total facture électricité (€ TTC/an) <span className="required">*</span></label>
              <input
                type="number"
                {...register("cout_elec", {
                  required: "Montant facture obligatoire",
                  valueAsNumber: true,
                  min: { value: 1000, message: "Min 1 000€/an (PME)" },
                  max: { value: 1000000, message: "Max 1M€/an" }
                })}
                placeholder="150000"
                min="1000"
                max="1000000"
              />
              <small>💡 Prenez le montant TOTAL TTC de votre dernière facture annuelle</small>
              {errors?.cout_facture_elec_ttc && <p className="error">{errors.cout_facture_elec_ttc.message}</p>}
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
              <label>Coût total facture électricité (€ TTC/an) <span className="required">*</span></label>
              <input
                type="number"
                {...register("cout_elec", {
                  required: "Montant facture obligatoire",
                  valueAsNumber: true,
                  min: { value: 1000, message: "Min 1 000€/an (PME)" },
                  max: { value: 1000000, message: "Max 1M€/an" }
                })}
                placeholder="150000"
                min="1000"
                max="1000000"
              />
              <small>💡 Prenez le montant TOTAL TTC de votre dernière facture annuelle</small>
              {errors?.cout_facture_elec_ttc && <p className="error">{errors.cout_facture_elec_ttc.message}</p>}
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
              <label>Coût total facture gaz (€ TTC/an) <span className="required">*</span></label>
              <input
                type="number"
                {...register("cout_gaz", {
                  required: "Montant facture obligatoire",
                  valueAsNumber: true,
                  min: { value: 500, message: "Min 500€/an (PME)" },
                  max: { value: 500000, message: "Max 500k€/an" }
                })}
                placeholder="45000"
                min="500"
                max="500000"
              />
              <small>💡 Prenez le montant TOTAL TTC de votre dernière facture gaz annuelle</small>
              {errors?.cout_facture_gaz_ttc && <p className="error">{errors.cout_facture_gaz_ttc.message}</p>}
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
