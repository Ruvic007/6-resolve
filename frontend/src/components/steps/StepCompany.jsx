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
    // Call parent's onNext with data and the stepper's next function
    if (onNext) {
      onNext(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2><Building2 size={24} /> Informations sur l'entreprise</h2>
      <p className="step-description">Renseignez les informations générales de votre entreprise et bâtiment.</p>

      <div className="form-row">
        <div className="field-group">
          <label>Nom de l'entreprise *</label>
          <input {...register("nom", { required: true })} placeholder="Ex: Ma Société SAS" />
        </div>
        <div className="field-group">
          <label>Code postal *</label>
          <input {...register("code_postal", { required: true })} placeholder="Ex: 75001" />
        </div>
      </div>

      <div className="field-group">
        <label>Catégorie d'activité *</label>
        <Controller
          name="categorie_activite"
          control={control}
          rules={{ required: "Choisissez une catégorie" }}
          render={({ field }) => (
            <select {...field}>
              <option value="">-- Sélectionnez une catégorie --</option>
              {categoriesData.map((cat) => (
                <option key={cat.categorie} value={cat.categorie}>
                  {cat.categorie}
                </option>
              ))}
            </select>
          )}
        />
        {errors.categorie_activite && (
          <span className="error-message">{errors.categorie_activite.message}</span>
        )}
      </div>

      <div className="field-group">
        <label>Sous-catégorie</label>
        <Controller
          name="sous_categorie"
          control={control}
          render={({ field }) => (
            <select {...field} disabled={!selectedCategorie}>
              <option value="">
                {selectedCategorie
                  ? "-- Sélectionnez une sous-catégorie --"
                  : "-- Choisissez d'abord la catégorie --"}
              </option>
              {sousCategoriesOptions.map((sous) => (
                <option key={sous} value={sous}>
                  {sous.replace(/-/g, " ").replace(/ {2}/g, " ")}
                </option>
              ))}
            </select>
          )}
        />
      </div>

      <div className="form-row">
        <div className="field-group">
          <label>Type de bâtiment *</label>
          <select {...register("type_batiment", { required: true })}>
            <option value="">-- Sélectionnez --</option>
            <option value="bureau">Bureau</option>
            <option value="commerce">Commerce</option>
            <option value="industriel">Industriel</option>
            <option value="autre">Autre</option>
          </select>
        </div>
        <div className="field-group">
          <label>Année de construction</label>
          <input {...register("annee_construction")} type="number" placeholder="Ex: 1995" min="1800" max="2025" />
        </div>
      </div>

      <div className="form-row">
        <div className="field-group">
          <label>Surface des locaux (m²)</label>
          <input {...register("surface_locaux")} type="number" placeholder="Ex: 500" step="0.1" min="0" />
        </div>
        <div className="field-group">
          <label>Surface du toit (m²)</label>
          <input {...register("surface_toit")} type="number" placeholder="Ex: 200" step="0.1" min="0" />
        </div>
      </div>

      <div className="field-group">
        <label>Horaires d'ouverture</label>
        <input {...register("horaire_ouverture")} placeholder="Ex: 9h-18h du lundi au vendredi" />
      </div>

      <div className="form-row">
        <div className="field-group">
          <label>Type de facture énergétique</label>
          <select {...register("type_facture")}>
            <option value="">-- Sélectionnez --</option>
            <option value="electricite">Électricité</option>
            <option value="gaz">Gaz</option>
            <option value="mixte">Mixte</option>
          </select>
        </div>
        <div className="field-group">
          <label>Énergie renouvelable ?</label>
          <select {...register("utilisation_energie_renouvelable")}>
            <option value="false">Non</option>
            <option value="true">Oui</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="field-group">
          <label>Type d'énergie renouvelable</label>
          <input {...register("type_energie_renouvelable")} placeholder="Ex: Panneaux solaires" />
        </div>
        <div className="field-group">
          <label>Monitoring de consommation ?</label>
          <select {...register("monitoring_consommation")}>
            <option value="false">Non</option>
            <option value="true">Oui</option>
          </select>
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
