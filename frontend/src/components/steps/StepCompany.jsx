import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Building2, ArrowRight } from "lucide-react";

const categoriesData = [
  {
    categorie: "Commerce - Grande Surface Alimentaire",
    sous_categories: [
      'Commerce - Grande Surface Alimentaire - Petit supermarché (surface de vente comprise entre 400 m² et 1 000 m²)',
      'Commerce - Grande Surface Alimentaire - Supérette (surface de vente < 400 m²)'
    ]
  },
  {
    categorie: "Commerce - Grande Surface Spécialisée",
    sous_categories: [
      'Commerce - Grande Surface Spécialisée - Equipement automobile et Moto',
      'Commerce - Grande Surface Spécialisée - Equipement de la maison',
      'Commerce - Grande Surface Spécialisée - Equipement de la personne et loisirs',
      'Commerce - Grande Surface de Bricolage'
    ]
  },
  {
    categorie: "Commerce détail",
    sous_categories: [
      'Commerces et services de détail - Alimentaire',
      'Commerces et services de détail - Equipement de la maison',
      'Commerces et services de détail - Equipement de la personne et loisirs',
      'Commerce de gros'
    ]
  },
  {
    categorie: "Bureaux et Services",
    sous_categories: [
      'Bureaux - Services Publics - Banque',
      'Imprimerie et reprographie',
      'Logistique',
      "Salles serveurs et centres d'exploitation informatique"
    ]
  },
  {
    categorie: "Restauration et Hébergement",
    sous_categories: [
      'Restauration - Débit de boissons',
      'Hôtellerie',
      'Résidences de tourisme et villages ou clubs de vacances',
      'Terrain de camping et parcs pour caravanes ou véhicules de loisirs',
      "Hébergement touristique de courte durée (auberge de jeunesse, centre-sportif, colonies de vacances, gîte d'étape et refuge de montagne)",
    ]
  },
  {
    categorie: "Santé libérale",
    sous_categories: [
      'Santé - Santé libérale',
      'Laboratoires (hors périmètre médical : étalonnage, suivi écologique…)',
    ]
  },
  {
    categorie: "Services spécialisés",
    sous_categories: [
      'Blanchisserie dite ""industrielle""',
      'Etablissement de nuit et de loisirs',
      'Enseignement - Formation continue pour adultes',
      'Accueil petite enfance'
    ]
  },
  {
    categorie: "Automobile et véhicules",
    sous_categories: [
      'Vente et services véhicules légers',
      'Vente et services motocycle',
      'Vente et services véhicules utilitaires et véhicules industriels',
      'Vente et services engins nautiques et de plaisance'
    ]
  },
  {
    categorie: "Culture",
    sous_categories: [
      'Culture et spectacles - Cinéma',
      "Culture et spectacles - Bibliothèque, médiathèque et service d'archives"
    ]
  },
  {
    categorie: "Sport",
    sous_categories: [
      'Sports'
    ]
  }
];


export default function StepCompany({ onNext, defaultValues, isFirstStep }) {
  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm({
    defaultValues: defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const selectedCategorie = watch("categorie_activite");
  const sousCategoriesOptions = categoriesData
    .find(cat => cat.categorie === selectedCategorie)?.sous_categories || [];

  const onSubmit = (data) => {
    if (onNext) onNext(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="step-company-form">
      <div className="step-header">
        <span className="step-badge">Étape 1 / 3</span>
        <h2><Building2 size={22} /> Votre entreprise &amp; bâtiment</h2>
        <p className="step-description">
          Ces informations permettent de profiler votre site et d'adapter les simulations d'économies à votre secteur d'activité et à votre localisation.
        </p>
      </div>

      {/* LIGNE 1 : Nom + Code postal */}
      <div className="form-grid">
        <div className="field-group">
          <label>Nom de l'entreprise <span className="required">*</span></label>
          <input
            {...register("nom", {
              required: "Nom obligatoire",
              minLength: { value: 2, message: "Min 2 caractères" },
              maxLength: { value: 100, message: "Max 100 caractères" }
            })}
            placeholder="Ex: Ma Société SAS"
          />
          {errors.nom && <p className="error">{errors.nom.message}</p>}
        </div>
        <div className="field-group">
          <label>Code postal <span className="required">*</span></label>
          <input
            {...register("code_postal", {
              required: "Code postal obligatoire",
              pattern: { value: /^[0-9]{5}$/, message: "5 chiffres requis" }
            })}
            placeholder="75001"
          />
          <small>Détermine votre zone climatique pour les simulations solaires</small>
          {errors.code_postal && <p className="error">{errors.code_postal.message}</p>}
        </div>
      </div>

      {/* LIGNE 2 : Catégorie + Surface locaux */}
      <div className="form-grid">
        <div className="field-group">
          <label>Secteur d'activité <span className="required">*</span></label>
          <Controller
            name="categorie_activite"
            control={control}
            rules={{ required: "Choisissez une catégorie" }}
            render={({ field }) => (
              <select {...field}>
                <option value="">-- Sélectionnez --</option>
                {categoriesData.map((cat) => (
                  <option key={cat.categorie} value={cat.categorie}>
                    {cat.categorie}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.categorie_activite && <p className="error">{errors.categorie_activite.message}</p>}
        </div>
        <div className="field-group">
        <label>Sous-catégorie d'activité</label>
        <Controller
          name="sous_categorie"
          control={control}
          render={({ field }) => (
            <select {...field} disabled={!selectedCategorie}>
              <option value="">
                {selectedCategorie ? "-- Sélectionnez --" : "-- Choisissez catégorie --"}
              </option>
              {sousCategoriesOptions.map((sous) => (
                <option key={sous} value={sous}>{sous.replace(/-/g, " ")}</option>
              ))}
            </select>
          )}
        />
        <div className="field-group">
          <label>Surface des locaux (m²) <span className="required">*</span></label>
          <input
            {...register("surface_locaux", {
              required: "Surface obligatoire",
              valueAsNumber: true,
              min: { value: 50, message: "Min 50m²" },
              max: { value: 5000, message: "Max 5000m²" }
            })}
            type="number" step="0.1"
            placeholder="500"
          />
          <small>Surface totale intérieure de vos locaux</small>
          {errors.surface_locaux && <p className="error">{errors.surface_locaux.message}</p>}
        </div>
        <div className="form-grid">
          <div className="field-group">
            <label>Surface du toit (m²)</label>
            <input
              {...register("surface_toit", {
                valueAsNumber: true,
                min: { value: 0, message: "Min 0m²" }
              })}
              type="number" step="1"
              placeholder="300"
            />
            <small>Utilisée pour calculer votre potentiel solaire PV et thermique</small>
          </div>
        </div>
      </div>      
    </div>

      {/* LIGNE 3 : Type bâtiment + Année construction */}
      <div className="form-grid">
        <div className="field-group">
          <label>Type de bâtiment <span className="required">*</span></label>

          <select {...register("type_batiment", { required: "Type obligatoire" })}>
            <option value="">-- Sélectionnez --</option>
            <option value="bureau">Bureau</option>
            <option value="commerce">Commerce</option>
            <option value="industriel">Industriel</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div className="field-group">
          <label>Année de construction</label>
          <input
            {...register("annee_construction", {
              valueAsNumber: true,
              min: { value: 1900, message: "Min 1900" },
              max: { value: 2026, message: "Max 2026" }
            })}
            type="number" step="1"
            placeholder="1995"
          />
          <small>Influence l'évaluation du niveau d'isolation</small>
          {errors.annee_construction && <p className="error">{errors.annee_construction.message}</p>}
        </div>
      </div>

      {/* LIGNE 4 : NOUVEAU - Jours + Heures (OBLIGATOIRES + SIMPLES) */}
      <div className="form-grid">
        <div className="field-group">
          <label>Jours d'ouverture / semaine <span className="required">*</span></label>
          <input
            {...register("jours_semaine", {
              required: "Nombre de jours obligatoire",
              valueAsNumber: true,
              min: { value: 1, message: "Min 1 jour" },
              max: { value: 7, message: "Max 7 jours" }
            })}
            type="number"
            min="1" max="7" step="1"
            placeholder="5"
          />
          <small>Ex : 5 pour lundi–vendredi, 7 pour 7j/7</small>
          {errors.jours_semaine && <p className="error">{errors.jours_semaine.message}</p>}
        </div>
        <div className="field-group">
          <label>Heures d'activité / jour <span className="required">*</span></label>
          <input
            {...register("heures_par_jour", {
              required: "Nombre d'heures obligatoire",
              valueAsNumber: true,
              min: { value: 1, message: "Min 1h" },
              max: { value: 14, message: "Max 14h/jour" }
            })}
            type="number"
            min="1" max="14" step="0.5"
            placeholder="8"
          />
          <small>Ex : 8 pour une journée 9h–17h</small>
          {errors.heures_par_jour && <p className="error">{errors.heures_par_jour.message}</p>}
        </div>
      </div>

      

      <div className={`step-actions ${isFirstStep ? 'end' : ''}`}>
        <button type="submit" className="btn-next">
          Suivant <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}
