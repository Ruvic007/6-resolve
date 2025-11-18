from fastapi import APIRouter, Request
from backend.src.database.db import supabase



router = APIRouter()

@router.post("/questionnaire")
async def recevoir_questionnaire(request: Request):

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

    return {
        "status": "success",
        "company": company_response.data,
        "energy": energy_response.data,
        "energyusage": energy_usage_response.data
    }
