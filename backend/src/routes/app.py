from fastapi import APIRouter, Request
from src.database.db import supabase
from src.services.solar_simulation import SolarSimulation
from src.services.benchmark import moyenne_conso_m2_secteur
from typing import Dict, Any

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
            "monitoring_consommation": data.get("monitoring_consommation")
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
        return {"status": "error", "message": str(e)}