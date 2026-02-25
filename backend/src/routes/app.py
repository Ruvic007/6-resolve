from fastapi import APIRouter, Request
from src.database.db import supabase
from src.services.solar_simulation import SolarSimulation
from src.services.thermal_simulation import ThermalSimulation
from src.services.benchmark import moyenne_conso_m2_secteur
from typing import Dict, Any
from pathlib import Path
import json

BASE_DIR = Path(__file__).parent.parent.parent
MOCK_FILE = BASE_DIR / "mock_data.json"

router = APIRouter()

@router.post("/questionnaire")
async def recevoir_questionnaire(request: Request):
    """Reçoit les données du questionnaire, les stocke et génère une simulation PV."""
    try:
        data = await request.json()

        # --- 1. Préparation des données pour les tables de base ---
        company_data = {
            "nom": data.get("nom"),
            "code_postal": data.get("code_postal"),
            "secteur_activite": data.get("sous_categorie"),
            "type_batiment": data.get("type_batiment"),
            "annee_construction": data.get("annee_construction"),
            "surface_locaux": data.get("surface_locaux"),
            "surface_toit": data.get("surface_toit"),
            "horaire_ouverture": data.get("horaire_ouverture"),
            "type_facture": data.get("type_facture"),
            "utilisation_energie_renouvelable": data.get("utilisation_energie_renouvelable"),
            "type_energie_renouvelable": data.get("type_energie_renouvelable"),
            "monitoring_consommation": data.get("monitoring_consommation"),
            "user_id": data.get("user_id")  # ID utilisateur Clerk
        }

        energy_usage_data = {
            "annee": data.get("annee"),
            "conso_electricite_kwh": data.get("conso_electricite_kwh"),
            "conso_gaz_kwh": data.get("conso_gaz_kwh"),
            "cout_energie_euros": data.get("cout_energie_euros"),
            "emission_co2_kg": data.get("emission_co2_kg")
        }

        # --- 2. Insertions initiales dans Supabase ---
        try:
            # Insertion Entreprise
            company_res = supabase.table("companies").insert(company_data).execute()
            company_id = company_res.data[0]["id"]
            
            # Insertion Consommation
            energy_usage_data["company_id"] = company_id
            supabase.table("energyusage").insert(energy_usage_data).execute()
            
            # Insertion Types d'énergie (si présents)
            energy_types = {
                "company_id": company_id,
                "type_chauffage": data.get("type_chauffage"),
                "type_eclairage": data.get("type_eclairage"),
                "niveau_isolation": data.get("niveau_isolation")
            }
            supabase.table("energytypes").insert(energy_types).execute()

        except Exception as e:
            return {"status": "error", "message": f"Erreur base de données: {str(e)}"}
        secteur = company_data.get("sous_categorie")
        surface_m2 = float(company_data.get("surface_locaux"))

# Conso RÉELLE normalisée en kWh/m²
        conso_reelle_m2 = float(data.get("conso_electricite_kwh")) / surface_m2

# Benchmark secteur en kWh/m² (moyenne du CSV)
        benchmark_secteur = moyenne_conso_m2_secteur.get(secteur, 150.0)

# Pourcentage = (réelle / benchmark) * 100
        benchmark_pourcentage = round((conso_reelle_m2 / benchmark_secteur) * 100)

        audit_reports_data = {
            "id": company_id,  # Pas "id" !
            "benchmark": benchmark_pourcentage  # 85.3% par ex.
        }

        supabase.table("AuditReports").insert(audit_reports_data).execute()
        # --- 3. Simulation PV via le Service SolarSimulation ---
        simulation_results = {}
        surface_toit = company_data.get("surface_toit")
        code_postal = company_data.get("code_postal")

        if surface_toit and code_postal:
            simulation = SolarSimulation()
            
            # Conversion pour les calculs
            s_toit_float = float(surface_toit)
            cp_str = str(code_postal)
            
            # Calculs de base
            p_installee = simulation.estimer_puissance_installation(s_toit_float)
            prix_inst = simulation.estimer_cout_installation(p_installee)
            prod_annuelle = simulation.estimer_production_annuelle(cp_str, p_installee)
            
            # Calcul du prix du kWh réel (ou défaut)
            prix_kwh_reel = simulation.prix_kwh_entreprise
            conso = energy_usage_data.get("conso_electricite_kwh")
            cout = energy_usage_data.get("cout_energie_euros")
            
            if conso and cout and float(conso) > 0:
                prix_kwh_reel = float(cout) / float(conso)
                prix_kwh_reel = max(prix_kwh_reel, 0.10) # Sécurité minimum

            # Calculs avancés
            economies = simulation.calculer_economies_annuelles(prod_annuelle, 0.7, 0.10, prix_kwh_reel)
            co2_kg = simulation.calculer_reduction_co2(prod_annuelle)
            analyse_roi = simulation.calculer_roi(prix_inst, economies["economies_totales"])

            # --- 4. Correction de l'erreur NOT NULL ---
            # On prépare TOUTES les colonnes attendues par la table simulations_pv
            sim_db_data = {
                "company_id": company_id,
                "puissance_installee_kw": p_installee,
                "surface_panneaux_m2": s_toit_float * 0.6,  # Valeur manquante précédemment
                "taux_autoconsommation": 0.7,
                "tarif_rachat_kwh": 0.10,
                "prix_installation_ht": prix_inst,
                "production_annuelle_estimee_kwh": prod_annuelle,
                "economies_annuelles_estimees": economies["economies_totales"],
                "reduction_co2_annuelle_kg": co2_kg,
                "roi_annees": analyse_roi["roi_annees"]
            }

            # Insertion de la simulation
            try:
                supabase.table("simulations_pv").insert(sim_db_data).execute()
                simulation_results = {
                    "puissance_kw": p_installee,
                    "production_kwh": prod_annuelle,
                    "economies_annuelles": economies["economies_totales"],
                    "roi_annees": analyse_roi["roi_annees"],
                    "rentable": analyse_roi["rentable"]
                }
            except Exception as e:
                simulation_results["erreur_sauvegarde"] = str(e)
                
                
            # simulation Thermique
            
            try:
                # Récupération du type de chauffage pour adapter le calcul
                type_chauffage_client = data.get("type_chauffage", "Gaz")
                
                thermal_service = ThermalSimulation()
                
                # Prix de l'énergie remplacée par le solaire thermique
                prix_th = 0.18 if type_chauffage_client == "Électrique" else 0.12 
                
                # Calcul complet via le service thermal_simulation
                res_th = thermal_service.calculer_simulation_complete(
                    surface_toit=s_toit_float,
                    cp=cp_str,
                    type_chauffage=type_chauffage_client,
                    prix_kwh=prix_th
                )

                # Préparation du dictionnaire pour la table 'thermal_simulations'
                thermal_db_data = {
                    "company_id": company_id,
                    "surface_m2": res_th["surface_m2"],
                    "production_kwh": res_th["production_kwh"],
                    "cout_installation_estime": res_th["cout_installation"],
                    "economies_annuelles_estimees": res_th["economies_annuelles"],
                    "roi_annees": res_th["roi_annees"],
                    "reduction_co2_kg": res_th["reduction_co2_kg"]
                }
                
                # Insertion effective en base de données
                supabase.table("thermal_simulations").insert(thermal_db_data).execute() 
                
            except Exception as e:
                # On utilise print() pour loguer l'erreur sans interrompre le retour de l'API
                print(f"DEBUG: Échec enregistrement thermique : {str(e)}")

        return {
            "status": "success",
            "company_id": company_id,
            "simulation_preview": simulation_results
        }

    except Exception as e:
        return {"status": "error", "message": f"Erreur générale: {str(e)}"}

@router.get("/simulations/{company_id}")
async def get_simulations_entreprise(company_id: int):
    """Récupère l'historique des simulations d'une entreprise."""
    try:
        res = supabase.table("simulations_pv").select("*").eq("company_id", company_id).execute()
        return {"status": "success", "simulations": res.data}
    except Exception as e:
        return {"status": "error", "message": f"Erreur lors de la récupération: {str(e)}"}
    
NOMS_REGIONS = {
    "nord": "Nord / Nord-Est",
    "est": "Est / Alsace-Lorraine",
    "ouest": "Ouest / Bretagne",
    "sud": "Sud / Centre",
    "mediterranee": "Méditerranée / PACA",
}

PRIX_KW_PV = 1500  # €/kWc


def _build_simulation_pv(simulation_data: dict, company: dict) -> dict:
    puissance_kw = simulation_data.get("puissance_installee_kw", 0) or 0
    prix_installation = simulation_data.get("prix_installation_ht", 0) or 0
    surface_panneaux = simulation_data.get("surface_panneaux_m2", 0) or 0
    surface_toit = float(company.get("surface_toit") or 0)
    code_postal = str(company.get("code_postal") or "")

    solar = SolarSimulation()
    region_key = solar._determiner_region(code_postal)
    ensoleillement = solar.ensoleillement_regions.get(region_key, 1000)

    prix_par_kw = round(prix_installation / puissance_kw) if puissance_kw > 0 else PRIX_KW_PV

    return {
        "puissance_kw": puissance_kw,
        "production_kwh": simulation_data.get("production_annuelle_estimee_kwh", 0),
        "economies_annuelles": simulation_data.get("economies_annuelles_estimees", 0),
        "reduction_co2_kg": simulation_data.get("reduction_co2_annuelle_kg", 0),
        "roi_annees": simulation_data.get("roi_annees", 0),
        "prix_installation": prix_installation,
        "detail_cout": {
            "surface_toit_m2": surface_toit,
            "surface_panneaux_m2": round(surface_panneaux, 1),
            "taux_utilisation_toit": "60 %",
            "puissance_par_m2": "150 Wc/m²",
            "puissance_kw": puissance_kw,
            "prix_par_kw": f"{prix_par_kw} €/kWc",
            "region": NOMS_REGIONS.get(region_key, region_key),
            "ensoleillement": f"{ensoleillement} kWh/kWc/an",
            "formule": f"{round(surface_panneaux, 1)} m² × 0,15 kWc/m² = {puissance_kw} kWc  ×  {prix_par_kw} €/kWc",
            "resultat_cout": round(prix_installation),
        },
    }


def _build_simulation_thermique(thermal_data: dict, company: dict) -> dict:
    surface_m2 = thermal_data.get("surface_m2", 0) or 0
    prix_installation = thermal_data.get("cout_installation_estime", 0) or 0
    surface_toit = float(company.get("surface_toit") or 0)
    code_postal = str(company.get("code_postal") or "")

    thermal = ThermalSimulation()
    region_key = thermal._determiner_region(code_postal)
    rendement = thermal.rendement_regions.get(region_key, 550)
    prix_m2 = thermal._calculer_prix_m2_degressif(surface_m2)

    return {
        "surface_m2": surface_m2,
        "production_kwh": thermal_data.get("production_kwh", 0),
        "economies_annuelles": thermal_data.get("economies_annuelles_estimees", 0),
        "reduction_co2_kg": thermal_data.get("reduction_co2_kg", 0),
        "roi_annees": thermal_data.get("roi_annees", 0),
        "prix_installation": prix_installation,
        "detail_cout": {
            "surface_toit_m2": surface_toit,
            "surface_capteurs_m2": round(surface_m2, 1),
            "taux_utilisation_toit": "10 %",
            "region": NOMS_REGIONS.get(region_key, region_key),
            "rendement_region": f"{rendement} kWh/m²/an",
            "prix_par_m2": f"{prix_m2} €/m²",
            "palier_tarif": _palier_thermique(surface_m2),
            "formule": f"{round(surface_m2, 1)} m² × {prix_m2} €/m²",
            "resultat_cout": round(prix_installation),
        },
    }


def _palier_thermique(surface: float) -> str:
    if surface < 20:   return "< 20 m² → 1 300 €/m²"
    if surface < 100:  return "20–100 m² → 1 100 €/m²"
    if surface < 500:  return "100–500 m² → 950 €/m²"
    return "> 500 m² → 850 €/m²"


@router.get("/dashboard/{company_id}")
async def get_dashboard_data(company_id: int):
    """Récupère toutes les données nécessaires pour le dashboard"""
    try:
        # Récupérer les informations de l'entreprise
        company_response = supabase.table("companies").select("*").eq("id", company_id).execute()
        if not company_response.data:
            return {"status": "error", "message": "Entreprise non trouvée"}

        company = company_response.data[0]

        # Récupérer les données énergétiques
        energy_response = supabase.table("energytypes").select("*").eq("company_id", company_id).execute()
        energy_data = energy_response.data[0] if energy_response.data else {}

        # Récupérer la consommation
        usage_response = supabase.table("energyusage").select("*").eq("company_id", company_id).execute()
        usage_data = usage_response.data[0] if usage_response.data else {}

        # Récupérer les simulations PV
        sim_response = supabase.table("simulations_pv").select("*").eq("company_id", company_id).execute()
        simulation_data = sim_response.data[0] if sim_response.data else {}

        # Récupérer les simulations thermiques
        thermal_response = supabase.table("thermal_simulations").select("*").eq("company_id", company_id).execute()
        thermal_data = thermal_response.data[0] if thermal_response.data else {}

        # Récupérer le benchmark depuis AuditReports
        audit_response = supabase.table("AuditReports").select("*").eq("id", company_id).execute()
        audit_data = audit_response.data[0] if audit_response.data else {}

        # Calculer les métriques
        conso_elec = float(usage_data.get("conso_electricite_kwh", 0) or 0)
        conso_gaz = float(usage_data.get("conso_gaz_kwh", 0) or 0)
        cout_total = float(usage_data.get("cout_energie_euros", 0) or 0)
        co2_emissions = float(usage_data.get("emission_co2_kg", 0) or 0)

        # Calcul énergie renouvelable (%)
        energie_renouvelable_pct = 0
        if simulation_data and conso_elec > 0:
            production_pv = float(simulation_data.get("production_annuelle_estimee_kwh", 0) or 0)
            energie_renouvelable_pct = round((production_pv / conso_elec) * 100, 1)

        # Préparer les données pour le dashboard
        dashboard_data = {
            "company_name": company.get("nom", "Entreprise"),
            "metrics": {
                "coutTotal": round(cout_total, 2),
                "consommationTotale": round(conso_elec + conso_gaz, 2),
                "impactCarbone": round(co2_emissions / 1000, 2),  # Conversion kg -> tonnes
                "energieRenouvelable": energie_renouvelable_pct
            },
            "consommationParUsages": {
                "labels": ["Électricité", "Gaz", "Autres"],
                "data": {
                    "electricite": conso_elec,
                    "gaz": conso_gaz,
                    "autres": 0
                }
            },
            "repartitionCouts": {
                "electricite": round((conso_elec / (conso_elec + conso_gaz) * 100) if (conso_elec + conso_gaz) > 0 else 50, 1),
                "gaz": round((conso_gaz / (conso_elec + conso_gaz) * 100) if (conso_elec + conso_gaz) > 0 else 50, 1)
            },
            "detailsBatiment": [
                {"label": "Nom", "value": company.get("nom", "—")},
                {"label": "Surface locaux", "value": f"{company.get('surface_locaux', '—')} m²"},
                {"label": "Surface toit", "value": f"{company.get('surface_toit', '—')} m²"},
                {"label": "Type bâtiment", "value": company.get("type_batiment", "—")},
                {"label": "Année construction", "value": str(company.get("annee_construction", "—"))},
                {"label": "Secteur", "value": company.get("secteur_activite", "—")}
            ],
            "simulationPV": _build_simulation_pv(simulation_data, company) if simulation_data else None,
            "simulationThermique": _build_simulation_thermique(thermal_data, company) if thermal_data else None,
            "benchmark": {
                "pourcentage": audit_data.get("benchmark", 100),
                "secteur": company.get("secteur_activite", "Non spécifié"),
                "moyenne_secteur": moyenne_conso_m2_secteur.get(company.get("secteur_activite"), 150)
            }
        }

        return {
            "status": "success",
            "data": dashboard_data
        }

    except Exception as e:
        return {"status": "error", "message": f"Erreur lors de la récupération des données: {str(e)}"}

async def traiter_questionnaire_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Logique métier extraite - réutilisable par les 2 routes."""
    
    # --- 1. Préparation des données ---
    company_data = {
        "nom": data.get("nom"),
        "code_postal": data.get("code_postal"),
        "secteur_activite": data.get("sous_categorie"),
        "type_batiment": data.get("type_batiment"),
        "annee_construction": data.get("annee_construction"),
        "surface_locaux": data.get("surface_locaux"),
        "surface_toit": data.get("surface_toit"),
        "horaire_ouverture": data.get("horaire_ouverture"),
        "type_facture": data.get("type_facture"),
        "utilisation_energie_renouvelable": data.get("utilisation_energie_renouvelable"),
        "type_energie_renouvelable": data.get("type_energie_renouvelable"),
        "monitoring_consommation": data.get("monitoring_consommation"),
        "user_id": data.get("user_id")
    }

    energy_usage_data = {
        "annee": data.get("annee"),
        "conso_electricite_kwh": data.get("conso_electricite_kwh"),
        "conso_gaz_kwh": data.get("conso_gaz_kwh"),
        "cout_energie_euros": data.get("cout_energie_euros"),
        "emission_co2_kg": data.get("emission_co2_kg")
    }

    # --- 2. Insertions DB ---
    try:
        company_res = supabase.table("companies").insert(company_data).execute()
        company_id = company_res.data[0]["id"]
        
        energy_usage_data["company_id"] = company_id
        supabase.table("energyusage").insert(energy_usage_data).execute()
        
        energy_types = {
            "company_id": company_id,
            "type_chauffage": data.get("type_chauffage"),
            "type_eclairage": data.get("type_eclairage"),
            "niveau_isolation": data.get("niveau_isolation")
        }
        supabase.table("energytypes").insert(energy_types).execute()
    except Exception as e:
        raise Exception(f"Erreur base de données: {str(e)}")

    # --- 3. Benchmark ---
    secteur = company_data.get("sous_categorie")
    surface_m2 = float(company_data.get("surface_locaux"))
    conso_reelle_m2 = float(data.get("conso_electricite_kwh")) / surface_m2
    benchmark_secteur = moyenne_conso_m2_secteur.get(secteur, 150.0)
    benchmark_pourcentage = round((conso_reelle_m2 / benchmark_secteur) * 100)

    audit_reports_data = {"id": company_id, "benchmark": benchmark_pourcentage}
    supabase.table("AuditReports").insert(audit_reports_data).execute()

    # --- 4. Simulation PV ---
    simulation_results = {}
    surface_toit = company_data.get("surface_toit")
    code_postal = company_data.get("code_postal")

    if surface_toit and code_postal:
        simulation = SolarSimulation()
        s_toit_float = float(surface_toit)
        cp_str = str(code_postal)
        
        p_installee = simulation.estimer_puissance_installation(s_toit_float)
        prix_inst = simulation.estimer_cout_installation(p_installee)
        prod_annuelle = simulation.estimer_production_annuelle(cp_str, p_installee)
        
        prix_kwh_reel = simulation.prix_kwh_entreprise
        conso = energy_usage_data.get("conso_electricite_kwh")
        cout = energy_usage_data.get("cout_energie_euros")
        
        if conso and cout and float(conso) > 0:
            prix_kwh_reel = max(float(cout) / float(conso), 0.10)

        economies = simulation.calculer_economies_annuelles(prod_annuelle, 0.7, 0.10, prix_kwh_reel)
        co2_kg = simulation.calculer_reduction_co2(prod_annuelle)
        analyse_roi = simulation.calculer_roi(prix_inst, economies["economies_totales"])

        sim_db_data = {
            "company_id": company_id,
            "puissance_installee_kw": p_installee,
            "surface_panneaux_m2": s_toit_float * 0.6,
            "taux_autoconsommation": 0.7,
            "tarif_rachat_kwh": 0.10,
            "prix_installation_ht": prix_inst,
            "production_annuelle_estimee_kwh": prod_annuelle,
            "economies_annuelles_estimees": economies["economies_totales"],
            "reduction_co2_annuelle_kg": co2_kg,
            "roi_annees": analyse_roi["roi_annees"]
        }

        try:
            supabase.table("simulations_pv").insert(sim_db_data).execute()
            simulation_results = {
                "puissance_kw": p_installee,
                "production_kwh": prod_annuelle,
                "economies_annuelles": economies["economies_totales"],
                "roi_annees": analyse_roi["roi_annees"],
                "rentable": analyse_roi["rentable"]
            }
        except Exception as e:
            simulation_results["erreur_sauvegarde"] = str(e)

    return {
        "status": "success",
        "company_id": company_id,
        "simulation_preview": simulation_results
    }

# Route normale (remplace ton ancienne)
@router.post("/questionnaire")
async def recevoir_questionnaire(request: Request):
    """Reçoit les données du questionnaire depuis le frontend."""
    try:
        data = await request.json()
        return await traiter_questionnaire_data(data)
    except Exception as e:
        return {"status": "error", "message": f"Erreur générale: {str(e)}"}

# Route TEST (NOUVELLE)
@router.post("/questionnaire/test")
async def recevoir_questionnaire_test():
    """Charge mock_data.json et exécute la même logique."""
    try:
        if not MOCK_FILE.exists():
            return {"status": "error", "message": f"Fichier mock introuvable: {MOCK_FILE}"}
        
        with MOCK_FILE.open(encoding="utf-8") as f:
            data = json.load(f)
        
        return await traiter_questionnaire_data(data)
        
    except Exception as e:
        return {"status": "error", "message": f"Erreur test: {str(e)}"}



@router.get("/companies")
async def get_all_companies(user_id: str = None):
    """Récupère la liste des entreprises/audits, filtré par user_id si fourni"""
    try:
        # Construire la requête de base
        query = supabase.table("companies").select("*")

        # Filtrer par user_id si fourni
        if user_id:
            query = query.eq("user_id", user_id)

        # Trier par date de création (plus récent en premier)
        response = query.order("created_at", desc=True).execute()

        if not response.data:
            return {
                "status": "success",
                "data": [],
                "message": "Aucun audit trouvé" if user_id else "Aucune entreprise trouvée"
            }

        return {
            "status": "success",
            "data": response.data,
            "count": len(response.data)
        }

    except Exception as e:
        return {"status": "error", "message": f"Erreur lors de la récupération des entreprises: {str(e)}"}
    return {"status": "error", "message": str(e)}
@router.get("/")
async def root():
    return {"message": "API OK"}

        