import pandas as pd

categories_a_garder = [
            # Commerce - Grande Surface Alimentaire
            'Commerce - Grande Surface Alimentaire - Petit supermarché (surface de vente comprise entre 400 m² et 1 000 m²)',
            'Commerce - Grande Surface Alimentaire - Supérette (surface de vente < 400 m²)',
            
            # Commerce - Grande Surface Spécialisée
            'Commerce - Grande Surface Spécialisée - Equipement automobile et Moto',
            'Commerce - Grande Surface Spécialisée - Equipement de la maison',
            'Commerce - Grande Surface Spécialisée - Equipement de la personne et loisirs',
            'Commerce - Grande Surface de Bricolage',
            
            # Commerce détail
            'Commerces et services de détail - Alimentaire',
            'Commerces et services de détail - Equipement de la maison',
            'Commerces et services de détail - Equipement de la personne et loisirs',
            'Commerce de gros',
            
            # Bureaux et Services
            'Bureaux - Services Publics - Banque',
            'Imprimerie et reprographie',
            'Logistique',
            "Salles serveurs et centres d'exploitation informatique",
            
            # Restauration et Hébergement
            'Restauration - Débit de boissons',
            'Hôtellerie',
            'Résidences de tourisme et villages ou clubs de vacances',
            'Terrain de camping et parcs pour caravanes ou véhicules de loisirs',
            "Hébergement touristique de courte durée (auberge de jeunesse, centre-sportif, colonies de vacances, gîte d'étape et refuge de montagne)",
            
            # Santé libérale
            'Santé - Santé libérale',
            'Laboratoires (hors périmètre médical : étalonnage, suivi écologique…)',
            
            # Services spécialisés
            'Blanchisserie dite ""industrielle""',
            'Etablissement de nuit et de loisirs',
            'Enseignement - Formation continue pour adultes',
            'Accueil petite enfance',
            
            # Automobile et véhicules
            'Vente et services véhicules légers',
            'Vente et services motocycle',
            'Vente et services véhicules utilitaires et véhicules industriels',
            'Vente et services engins nautiques et de plaisance',
            
            # Culture (PME)
            'Culture et spectacles - Cinéma',
            "Culture et spectacles - Bibliothèque, médiathèque et service d'archives",
            
            #Sport
            'Sports'
        ]
df = pd.read_csv("consommation_tertiaire_activite.csv")

df["conso_m2"] = df["consommation_declaree"] / df["surface_declaree"]

# Normalisation (optionnel mais conseillé)
df["categorie_activite"] = df["categorie_activite"].str.strip().str.lower()
categories_a_garder = [c.lower() for c in categories_a_garder]

# Filtrage
df_filtered = df[df["categorie_activite"].isin(categories_a_garder)].copy()

# Groupby → moyenne par sous-catégorie
df_grouped = df_filtered.groupby("sous_categorie_activite")["conso_m2"].mean().round(2)

# Conversion en dictionnaire
moyenne_conso_m2_secteur = df_grouped.to_dict()

print(moyenne_conso_m2_secteur)
