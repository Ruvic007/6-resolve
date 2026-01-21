from pathlib import Path
import pandas as pd
import numpy as np
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

CSV_PATH = Path(__file__).parent / "consommation_tertiaire_activite.csv"
df= pd.read_csv(CSV_PATH)
df["conso_m2"] = np.where(
    df["surface_declaree"] > 0, 
    df["consommation_declaree"] / df["surface_declaree"], 
    0
)

df_filtered = df[df["categorie_activite"].isin(categories_a_garder)].copy()

df_res = df_filtered.groupby("categorie_activite")["conso_m2"].agg(['mean', 'count'])
df_res = df_res[df_res['count'] >= 3]  

moyenne_conso_m2_secteur = df_res['mean'].to_dict()
print(len(df_filtered),len(moyenne_conso_m2_secteur))
print("Exemple:", dict(list(moyenne_conso_m2_secteur.items())[:5]))

