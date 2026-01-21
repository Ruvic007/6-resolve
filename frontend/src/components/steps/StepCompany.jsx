import React, {useEffect} from "react";
import { useForm ,Controller} from "react-hook-form";

const categoriesData = [
  {
    categorie : "Commerce - Grande Surface Alimentaire",
    sous_categories: [
      'Commerce - Grande Surface Alimentaire - Petit supermarché (surface de vente comprise entre 400 m² et 1 000 m²)',
      'Commerce - Grande Surface Alimentaire - Supérette (surface de vente < 400 m²)'
    ]
  },
  {
    categorie : "Commerce - Grande Surface Spécialisée",
    sous_categories: [  
      'Commerce - Grande Surface Spécialisée - Equipement automobile et Moto',
      'Commerce - Grande Surface Spécialisée - Equipement de la maison',
      'Commerce - Grande Surface Spécialisée - Equipement de la personne et loisirs',
      'Commerce - Grande Surface de Bricolage'
    ]
  },
  {        
    categorie : "Commerce détail",
    sous_categories: [
      'Commerces et services de détail - Alimentaire',
      'Commerces et services de détail - Equipement de la maison',
      'Commerces et services de détail - Equipement de la personne et loisirs',
      'Commerce de gros'
    ]
  },
  {
    categorie : "Bureaux et Services",
    sous_categories: [
      'Bureaux - Services Publics - Banque',
      'Imprimerie et reprographie',
      'Logistique',
      "Salles serveurs et centres d'exploitation informatique"
    ]
  },
  {
    categorie : "Restauration et Hébergement",
    sous_categories: [
      'Restauration - Débit de boissons',
      'Hôtellerie',
      'Résidences de tourisme et villages ou clubs de vacances',
      'Terrain de camping et parcs pour caravanes ou véhicules de loisirs',
      "Hébergement touristique de courte durée (auberge de jeunesse, centre-sportif, colonies de vacances, gîte d'étape et refuge de montagne)",      
    ]
  },
  {      
    categorie : "Santé libérale",
    sous_categories: [        
      'Santé - Santé libérale',
      'Laboratoires (hors périmètre médical : étalonnage, suivi écologique…)',
    ]
  },
  {     
    categorie : "Services spécialisés",
    sous_categories: [       
      'Blanchisserie dite ""industrielle""',
      'Etablissement de nuit et de loisirs',
      'Enseignement - Formation continue pour adultes',
      'Accueil petite enfance'
    ]
  },
  {
    categorie : "Automobile et véhicules",
    sous_categories: [
      'Vente et services véhicules légers',
      'Vente et services motocycle',
      'Vente et services véhicules utilitaires et véhicules industriels',
      'Vente et services engins nautiques et de plaisance'
    ]
  },
  {
    categorie : "Culture",
    sous_categories: [
      'Culture et spectacles - Cinéma',
      "Culture et spectacles - Bibliothèque, médiathèque et service d'archives"
    ]
  },
  {
    categorie : "Sport",
    sous_categories: [
      'Sports'
    ]
  }]    


export default function StepCompany({ onNext, defaultValues }) {
  const { register, handleSubmit, reset, control, 
    watch, 
    formState: { errors }  } = useForm({
    defaultValues: defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const selectedCategorie = watch("categorie_activite");
  const sousCategoriesOptions = categoriesData
    .find(cat => cat.categorie === selectedCategorie)?.sous_categories || [];

  const onSubmit = (data) => {
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
        <label>Catégorie principale</label>
        <Controller
          name="categorie_activite"
          control={control}
          rules={{ required: "Choisissez une catégorie" }}
          render={({ field }) => (
            <select 
              {...field} 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
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
          <p className="text-red-500 text-sm mt-1">
            {errors.categorie_activite.message}
          </p>
        )}
      </div>

      <div className="field-group">
        <label>Sous-catégorie</label>
        <Controller
          name="sous_categorie"
          control={control}
          rules={{ 
            required: selectedCategorie ? "Choisissez une sous-catégorie" : false 
          }}
          render={({ field }) => (
            <select 
              {...field}
              disabled={!selectedCategorie}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">
                {selectedCategorie 
                  ? "-- Sélectionnez une sous-catégorie --" 
                  : "-- Choisissez d'abord la catégorie --"
                }
              </option>
              {sousCategoriesOptions.map((sous) => (
                <option key={sous} value={sous}>
                  {sous.replace(/-/g, " ").replace(/ {2}/g, " ")}
                </option>
              ))}
            </select>
          )}
        />
        {errors.sous_categorie && (
          <p className="text-red-500 text-sm mt-1">
            {errors.sous_categorie.message}
          </p>
        )}
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
