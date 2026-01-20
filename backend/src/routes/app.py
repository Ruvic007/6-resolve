from fastapi import APIRouter, Request
from src.database.db import supabase
from typing import Dict, Any

# --- CLASSE SOLAR SIMULATION INTÉGRÉE ---
class SolarSimulation:
    def __init__(self):
        # Facteurs régionaux d'ensoleillement (kWh/kWc/an)
        self.ensoleillement_regions = {
            "nord": 850,   # Nord, Nord-Est
            "est": 950,    # Est, Centre-Est
            "ouest": 1000, # Ouest, Centre-Ouest
            "sud": 1150,   # Sud, Sud-Est
            "mediterranee": 1300  # Sud-Est, Corse
        }
        
        # Facteur d'émission CO₂ mix électrique français (kg CO₂/kWh)
        self.facteur_emission_co2 = 0.055
        
        # Prix moyen électricité pour les entreprises (€/kWh)
        self.prix_kwh_entreprise = 0.18
        
    def estimer_production_annuelle(self, code_postal: str, puissance_kw: float) -> float:
        """Estime la production annuelle basée sur la région et la puissance"""
        region = self._determiner_region(code_postal)
        production_kwh = puissance_kw * self.ensoleillement_regions[region]
        return round(production_kwh, 2) 
    
    def _determiner_region(self, code_postal: str) -> str:
        """Détermine la région d'ensoleillement basée sur le code postal"""
        if not code_postal or len(code_postal) < 2:
            return "sud"
        
        try:
            prefixe = int(code_postal[:2])
            
            if prefixe in [2, 59, 62, 80]:
                return "nord"
            elif prefixe in [67, 68, 57, 54, 55, 88]:
                return "est"
            elif prefixe in [35, 56, 29, 22, 44, 85, 17, 79, 86]:
                return "ouest"
            elif prefixe in [83, 84, 13, 30, 34, 66, 11, 12, 48, 7, 26, 38]:
                return "mediterranee"
            else:
                return "sud"
        except ValueError:
            return "sud"
    
    def calculer_economies_annuelles(self, production_kwh: float, taux_autoconsommation: float, 
                                   tarif_rachat: float, prix_kwh_achete: float) -> Dict[str, float]:
        """Calcule les économies annuelles et revenus de revente"""
        autoconsommation_kwh = production_kwh * taux_autoconsommation
        revente_kwh = production_kwh * (1 - taux_autoconsommation)
        
        economies_autoconsommation = autoconsommation_kwh * prix_kwh_achete
        revenus_revente = revente_kwh * tarif_rachat
        
        economies_totales = economies_autoconsommation + revenus_revente
        
        return {
            "economies_autoconsommation": round(economies_autoconsommation, 2),
            "revenus_revente": round(revenus_revente, 2),
            "economies_totales": round(economies_totales, 2),
            "autoconsommation_kwh": round(autoconsommation_kwh, 2),
            "revente_kwh": round(revente_kwh, 2)
        }
    
    def calculer_reduction_co2(self, production_kwh: float) -> float:
        """Calcule la réduction annuelle des émissions de CO₂"""
        reduction = production_kwh * self.facteur_emission_co2
        return round(reduction, 2)
    
    def calculer_roi(self, cout_installation: float, economies_annuelles: float) -> Dict[str, Any]:
        """Calcule le ROI et la rentabilité"""
        if economies_annuelles <= 0:
            return {"roi_annees": float('inf'), "rentable": False}
        
        roi_annees = cout_installation / economies_annuelles
        rentable = roi_annees <= 10
        
        return {
            "roi_annees": round(roi_annees, 1),
            "rentable": rentable,
            "economies_10_ans": round(economies_annuelles * 10, 2),
            "economies_20_ans": round(economies_annuelles * 20, 2)
        }
    
    def estimer_puissance_installation(self, surface_toit_m2: float, pourcentage_utilisation: float = 0.6) -> float:
        """Estime la puissance installable basée sur la surface de toit"""
        if not surface_toit_m2:
            return 0.0
        surface_utilisable = surface_toit_m2 * pourcentage_utilisation
        puissance_kw = surface_utilisable * 0.15
        return round(puissance_kw, 2)
    
    def estimer_cout_installation(self, puissance_kw: float, prix_par_kw: float = 1500) -> float:
        """Estime le coût d'installation basé sur la puissance"""
        return round(puissance_kw * prix_par_kw, 2)

router = APIRouter()

@router.post("/questionnaire")
async def recevoir_questionnaire(request: Request):
    try:
        data = await request.json()

        # --- Division des données ---
        company_data = {
            "nom": data.get("nom"),
            "code_postal": data.get("code_postal"),
            "secteur_activite": data.get("secteur_activite"),
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

        energy_data = {
            "type_chauffage": data.get("type_chauffage"),
            "type_eclairage": data.get("type_eclairage"),
            "niveau_isolation": data.get("niveau_isolation"),
            "ventilation": data.get("ventilation"),
            "autres": data.get("autres")
        }

        energy_usage_data = {
            "annee": data.get("annee"),
            "conso_electricite_kwh": data.get("conso_electricite_kwh"),
            "conso_gaz_kwh": data.get("conso_gaz_kwh"),
            "cout_energie_euros": data.get("cout_energie_euros"),
            "emission_co2_kg": data.get("emission_co2_kg")
        }

        # --- Companies ---
        try:
            company_response = supabase.table("companies").insert(company_data).execute()
            company_id = company_response.data[0]["id"]
        except Exception as e:
            return {"status": "error", "message": f"Erreur insertion company: {e}"}

        # --- EnergyTypes ---
        try:
            energy_data["company_id"] = company_id
            energy_response = supabase.table("energytypes").insert(energy_data).execute()
        except Exception as e:
            return {"status": "error", "message": f"Erreur insertion energytypes: {e}"}

        # --- EnergyUsage ---
        try:
            energy_usage_data["company_id"] = company_id
            energy_usage_response = supabase.table("energyusage").insert(energy_usage_data).execute()
        except Exception as e:
            return {"status": "error", "message": f"Erreur insertion energyusage: {e}"}

        # --- Simulation PV ---
        simulation_results = {}
        try:
            # Vérification des données nécessaires
            surface_toit = company_data.get("surface_toit")
            code_postal = company_data.get("code_postal")
            
            if surface_toit and code_postal:
                # Conversion en types appropriés
                surface_toit_float = float(surface_toit)
                code_postal_str = str(code_postal)
                
                # Initialisation simulation
                simulation = SolarSimulation()
                
                # Calculs de base
                puissance_installee = simulation.estimer_puissance_installation(surface_toit_float)
                prix_installation = simulation.estimer_cout_installation(puissance_installee)
                production_annuelle = simulation.estimer_production_annuelle(code_postal_str, puissance_installee)
                
                # Calcul du prix kWh réel
                prix_kwh_reel = simulation.prix_kwh_entreprise
                conso_electrique = energy_usage_data.get("conso_electricite_kwh")
                cout_energie = energy_usage_data.get("cout_energie_euros")

                # Conversion en float et vérification
                try:
                    if conso_electrique and cout_energie:
                        conso_float = float(conso_electrique)
                        cout_float = float(cout_energie)
                        
                        if conso_float > 0:
                            prix_kwh_reel = cout_float / conso_float
                            # Validation du prix minimum réaliste
                            prix_kwh_minimum = 0.10
                            if prix_kwh_reel < prix_kwh_minimum:
                                prix_kwh_reel = prix_kwh_minimum
                except (ValueError, TypeError):
                    pass
                
                # Calculs avancés
                economies = simulation.calculer_economies_annuelles(production_annuelle, 0.7, 0.10, prix_kwh_reel)
                reduction_co2 = simulation.calculer_reduction_co2(production_annuelle)
                analyse_roi = simulation.calculer_roi(prix_installation, economies["economies_totales"])
                
                # Préparation données pour insertion
                simulation_db_data = {
                    "company_id": company_id,
                    "puissance_installee_kw": float(puissance_installee),
                    "surface_panneaux_m2": float(surface_toit_float) * 0.6,
                    "taux_autoconsommation": 0.7,
                    "tarif_rachat_kwh": 0.10,
                    "prix_installation_ht": float(prix_installation),
                    "production_annuelle_estimee_kwh": float(production_annuelle),
                    "economies_annuelles_estimees": float(economies["economies_totales"]),
                    "reduction_co2_annuelle_kg": float(reduction_co2),
                    "roi_annees": float(analyse_roi["roi_annees"])
                }
                
                # INSERTION
                try:
                    response = supabase.table("simulations_pv").insert(simulation_db_data).execute()
                    if response.data:
                        simulation_results["sauvegarde"] = "success"
                        simulation_results["id_simulation"] = response.data[0]["id"] if response.data else "inconnu"
                    else:
                        simulation_results["sauvegarde"] = "echec_aucune_donnee"
                except Exception:
                    simulation_results["sauvegarde"] = "echec_insertion"
                    
                # Résultats des calculs pour la réponse
                simulation_results["calculs"] = {
                    "puissance_kw": puissance_installee,
                    "production_kwh": production_annuelle,
                    "economies_annuelles": economies["economies_totales"],
                    "reduction_co2_kg": reduction_co2,
                    "roi_annees": analyse_roi["roi_annees"],
                    "rentable": analyse_roi["rentable"]
                }
                
            else:
                simulation_results["message"] = "Données insuffisantes pour simulation"
                
        except Exception as e:
            simulation_results["erreur"] = str(e)

        return {
            "status": "success",
            "company_id": company_id,
            "company": company_response.data,
            "energy": energy_response.data,
            "energyusage": energy_usage_response.data,
            "simulation_preview": simulation_results
        }

    except Exception as e:
        return {"status": "error", "message": f"Erreur générale: {e}"}


# --- ENDPOINT POUR SIMULATIONS PERSONNALISÉES ---
@router.post("/simulation/{company_id}")
async def simuler_installation_pv(company_id: int):
    """Endpoint séparé pour faire des simulations sur une entreprise existante"""
    try:
        # Vérifier que l'entreprise existe
        company_response = supabase.table("companies").select("*").eq("id", company_id).execute()
        if not company_response.data:
            return {"status": "error", "message": "Entreprise non trouvée"}
        
        company = company_response.data[0]
        
        # Vérifier les données nécessaires
        if not company.get("surface_toit") or not company.get("code_postal"):
            return {
                "status": "error", 
                "message": "Données manquantes pour la simulation (surface_toit ou code_postal)"
            }
        
        # Utiliser la simulation
        simulation = SolarSimulation()
        
        surface_toit = company["surface_toit"]
        code_postal = company["code_postal"]
        
        # Calculs de simulation
        puissance_installee = simulation.estimer_puissance_installation(float(surface_toit))
        prix_installation = simulation.estimer_cout_installation(puissance_installee)
        production_annuelle = simulation.estimer_production_annuelle(str(code_postal), puissance_installee)
        
        # Récupérer le prix réel du kWh si possible
        energy_usage_response = supabase.table("energyusage").select("*").eq("company_id", company_id).execute()
        prix_kwh_reel = simulation.prix_kwh_entreprise
        
        if energy_usage_response.data:
            last_usage = energy_usage_response.data[0]
            if last_usage.get("conso_electricite_kwh") and last_usage.get("conso_electricite_kwh") > 0:
                prix_kwh_reel = last_usage.get("cout_energie_euros", 0) / last_usage["conso_electricite_kwh"]
                # Validation du prix minimum réaliste
                prix_kwh_minimum = 0.10
                if prix_kwh_reel < prix_kwh_minimum:
                    prix_kwh_reel = prix_kwh_minimum
        
        economies = simulation.calculer_economies_annuelles(production_annuelle, 0.7, 0.10, prix_kwh_reel)
        reduction_co2 = simulation.calculer_reduction_co2(production_annuelle)
        analyse_roi = simulation.calculer_roi(prix_installation, economies["economies_totales"])
        
        resultat_simulation = {
            "entreprise": company["nom"],
            "puissance_installee_kw": puissance_installee,
            "surface_panneaux_m2": float(surface_toit) * 0.6,
            "production_annuelle_kwh": production_annuelle,
            "economies_annuelles": economies,
            "reduction_co2_kg": reduction_co2,
            "analyse_roi": analyse_roi,
            "cout_installation": prix_installation
        }
        
        return {
            "status": "success", 
            "simulation": resultat_simulation
        }
        
    except Exception as e:
        return {"status": "error", "message": f"Erreur lors de la simulation: {str(e)}"}


# --- ENDPOINT POUR RÉCUPÉRER LES SIMULATIONS ---
@router.get("/simulations/{company_id}")
async def get_simulations_entreprise(company_id: int):
    """Récupère toutes les simulations d'une entreprise"""
    try:
        # Vérifier que l'entreprise existe
        company_response = supabase.table("companies").select("nom").eq("id", company_id).execute()
        if not company_response.data:
            return {"status": "error", "message": "Entreprise non trouvée"}
        
        # Récupérer les simulations
        simulations_response = supabase.table("simulations_pv").select("*").eq("company_id", company_id).execute()
        
        return {
            "status": "success",
            "entreprise": company_response.data[0]["nom"],
            "simulations": simulations_response.data
        }
    except Exception as e:
        return {"status": "error", "message": f"Erreur lors de la récupération: {str(e)}"}
@router.get("/")
async def root():
    return {"message": "API OK"}
