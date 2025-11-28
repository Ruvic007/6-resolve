## Documentation de la base de données – 6ix-Resolve

Cette base de données regroupe les informations relatives aux entreprises, à leur consommation énergétique, à leurs caractéristiques techniques et aux simulations photovoltaïques ou rapports d’audit.

Elle se compose de 5 tables principales :

- `companies`

- `energytypes`

- `energyusage`

- `simulations_pv`

- `AuditReports`

Les relations s’articulent toutes autour de la table centrale `companies`, identifiée par `company_id` dans les autres tables.


# Table: companies

| Colonne                         | Type        | Description |
|---------------------------------|-------------|-------------|
| id                              | int8        | Identifiant unique |
| created_at                      | timestamptz | Date de création |
| nom                             | varchar     | Nom de l’entreprise |
| code_postal                     | int         | Code postal |
| secteur_activite                | varchar     | Secteur d’activité |
| type_batiment                   | varchar     | Type de bâtiment |
| annee_construction              | int         | Année de construction |
| surface_locaux                  | float4      | Surface des locaux (m²) |
| surface_toit                    | float4      | Surface de toiture (m²) |
| horaire_ouverture               | text        | Horaires d’ouverture |
| type_facture                    | varchar     | Type de facture énergétique |
| utilisation_energie_renouvelable| bool        | Utilisation d’énergie renouvelable |
| type_energie_renouvelable       | varchar     | Type d’énergie renouvelable utilisée |
| monitoring_consommation         | bool        | Système de monitoring en place |


# Table: energytypes

| Colonne          | Type    | Description |
|------------------|---------|-------------|
| id               | int8    | Identifiant |
| type_chauffage   | varchar | Type de chauffage |
| type_eclairage   | varchar | Type d’éclairage |
| niveau_isolation | varchar | Niveau d’isolation |
| ventilation      | varchar | Type de ventilation |
| autres           | text    | Autres informations |
| company_id       | int8    | Référence à companies.id |


# Table: energyusage

| Colonne               | Type        | Description |
|-----------------------|-------------|-------------|
| id                    | int8        | Identifiant |
| created_at            | timestamptz | Date d’enregistrement |
| annee                 | int2        | Année |
| conso_electricite_kwh | float4      | Consommation électrique (kWh) |
| conso_gaz_kwh         | float4      | Consommation gaz (kWh) |
| cout_energie_euros    | float4      | Coût énergétique (€) |
| emission_co2_kg       | float4      | Émissions CO₂ (kg) |
| company_id            | int8        | Référence à companies.id |


# Table: simulations_pv

| Colonne                    | Type      | Description |
|----------------------------|-----------|-------------|
| id                         | int4      | Identifiant |
| company_id                 | int4      | Référence à companies.id |
| puissance_installee_kw     | numeric   | Puissance installée (kW) |
| surface_panneaux_m2        | numeric   | Surface de panneaux (m²) |
| taux_autoconsommation      | numeric   | Taux d’autoconsommation |
| tarif_rachaut_kwh          | numeric   | Tarif de rachat (€/kWh) |
| prix_installation_ht       | numeric   | Prix d’installation HT |
| production_annuelle_kwh    | numeric   | Production annuelle (kWh) |
| economies_annuelles_euros  | numeric   | Économies annuelles (€) |
| reduction_co2_annuelle_kg  | numeric   | Réduction CO₂ annuelle (kg) |
| roi_annees                 | numeric   | Retour sur investissement (années) |
| created_at                 | timestamp | Date de création |


# Table: AuditReports

| Colonne         | Type        | Description |
|------------------|-------------|-------------|
| id               | int8        | Identifiant |
| date_created     | timestamptz | Date du rapport |
| energy_score     | float4      | Score énergétique |
| recommendations  | text        | Recommandations |
| benchmark        | json        | Données de comparaison |
| pv_simulation    | json        | Simulation photovoltaïque |
| niveau           | varchar     | Niveau énergétique |
| company_id       | uuid        | Référence à companies.id |
