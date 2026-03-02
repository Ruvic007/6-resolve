from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from src.database.db import get_db
from src.database.models import (Company, Energy, AuditReport, SimulationPV, ThermalSimulation as ModelThermal)
from src.auth.clerk_auth import verify_clerk_token
from src.services.solar_simulation import SolarSimulation
from src.services.thermal_simulation import ThermalSimulation as ServiceThermal
from src.services.benchmark import moyenne_conso_m2_secteur
from typing import Dict, Any, Optional
from pathlib import Path
import json
from pydantic import BaseModel

BASE_DIR = Path(__file__).parent.parent.parent
MOCK_FILE = BASE_DIR / "mock_data.json"

router = APIRouter()

# --- UTILS ---

def model_to_dict(model):
    """Convertit un modèle SQLAlchemy en dictionnaire."""
    if not model:
        return {}
    return {c.name: getattr(model, c.name) for c in model.__table__.columns}

def parse_int(val):
    try: return int(val)
    except: return None

def parse_float(val):
    try: return float(val)
    except: return None

# --- CONSTANTES ---

NOMS_REGIONS = {
    "nord": "Nord / Nord-Est",
    "est": "Est / Alsace-Lorraine",
    "ouest": "Ouest / Bretagne",
    "sud": "Sud / Centre",
    "mediterranee": "Méditerranée / PACA",
}
PRIX_KW_PV = 1500

# --- LOGIQUE MÉTIER ---

async def traiter_questionnaire_data(data: Dict[str, Any], db: Session, user_id: str) -> Dict[str, Any]:
    """Logique métier utilisant SQLAlchemy Session."""

    try:
        # --- 1. Création Entreprise ---
        new_company = Company(
            nom=data.get("nom"),
            code_postal=parse_int(data.get("code_postal")),
            secteur_activite=data.get("sous_categorie"),
            type_batiment=data.get("type_batiment"),
            annee_construction=parse_int(data.get("annee_construction")),
            surface_locaux=parse_float(data.get("surface_locaux")),
            surface_toit=parse_float(data.get("surface_toit")),
            jours_semaine=parse_int(data.get("jours_semaine")),
            heures_par_jour=parse_float(data.get("heures_par_jour")),
            user_id=user_id  # Extrait du JWT — jamais du body client
        )
        db.add(new_company)
        db.flush()  # Génère l'ID sans commiter
        company_id = new_company.id

        # --- 2. Création Données Énergétiques ---
        energy_model = Energy(
            company_id=company_id,
            annee=parse_int(data.get("annee")),
            conso_elec=parse_float(data.get("conso_elec")),
            prix_elec=parse_float(data.get("prix_elec")),
            conso_gaz=parse_float(data.get("conso_gaz")),
            prix_gaz=parse_float(data.get("prix_gaz")),
            pourcentage_renouvelable=parse_float(data.get("pourcentage_renouvelable")),
            type_facture=data.get("type_facture"),
            type_chauffage=data.get("type_chauffage"),
            type_eclairage=data.get("type_eclairage"),
            niveau_isolation=data.get("niveau_isolation"),
            emission_co2_kg=parse_float(data.get("emission_co2_kg")) or 0
        )
        db.add(energy_model)

        # --- 3. Benchmark ---
        secteur = new_company.secteur_activite
        surface_m2 = new_company.surface_locaux or 0
        conso_reelle_m2 = ((energy_model.conso_elec or 0) / surface_m2) if surface_m2 > 0 else 0
        benchmark_secteur = moyenne_conso_m2_secteur.get(secteur, 150.0)
        benchmark_pourcentage = round((conso_reelle_m2 / benchmark_secteur) * 100) if benchmark_secteur > 0 else 0

        audit_report = AuditReport(
            id=company_id,
            benchmark=benchmark_pourcentage,
            energy_score=0,
            part_electricite_sur_total=0
        )
        db.add(audit_report)

        # --- 4. Simulation PV ---
        simulation_results = {}
        surface_toit = new_company.surface_toit
        code_postal = new_company.code_postal

        if surface_toit and code_postal:
            simulation = SolarSimulation()

            p_installee = simulation.estimer_puissance_installation(surface_toit)
            prix_inst = simulation.estimer_cout_installation(p_installee)
            prod_annuelle = simulation.estimer_production_annuelle(str(code_postal), p_installee)

            prix_kwh_reel = max(parse_float(data.get("prix_elec")) or simulation.prix_kwh_entreprise, 0.10)

            economies = simulation.calculer_economies_annuelles(prod_annuelle, 0.7, 0.10, prix_kwh_reel)
            co2_kg = simulation.calculer_reduction_co2(prod_annuelle)
            analyse_roi = simulation.calculer_roi(prix_inst, economies["economies_totales"])

            sim_pv = SimulationPV(
                company_id=company_id,
                puissance_installee_kw=p_installee,
                surface_panneaux_m2=surface_toit * 0.6,
                taux_autoconsommation=0.7,
                tarif_rachat_kwh=0.10,
                prix_installation_ht=prix_inst,
                production_annuelle_estimee_kwh=prod_annuelle,
                economies_annuelles_estimees=economies["economies_totales"],
                reduction_co2_annuelle_kg=co2_kg,
                roi_annees=analyse_roi["roi_annees"]
            )
            db.add(sim_pv)

            simulation_results = {
                "puissance_kw": p_installee,
                "production_kwh": prod_annuelle,
                "economies_annuelles": economies["economies_totales"],
                "roi_annees": analyse_roi["roi_annees"],
                "rentable": analyse_roi["rentable"]
            }

            # --- 5. Simulation Thermique ---
            try:
                type_chauffage_client = data.get("type_chauffage") or "gaz"
                thermal_service = ServiceThermal()
                prix_th = max(
                    parse_float(data.get("prix_gaz")) or parse_float(data.get("prix_elec")) or 0.10,
                    0.10
                )

                res_th = thermal_service.calculer_simulation_complete(
                    surface_toit=surface_toit,
                    cp=str(code_postal),
                    type_chauffage=type_chauffage_client,
                    prix_kwh=prix_th
                )

                if res_th["surface_m2"] > 0:
                    sim_th = ModelThermal(
                        company_id=company_id,
                        surface_m2=res_th["surface_m2"],
                        production_kwh=res_th["production_kwh"],
                        cout_installation_estime=res_th["cout_installation"],
                        economies_annuelles_estimees=res_th["economies_annuelles"],
                        roi_annees=res_th["roi_annees"],
                        reduction_co2_kg=res_th["reduction_co2_kg"]
                    )
                    db.add(sim_th)

            except Exception as e:
                print(f"Échec simulation thermique : {str(e)}")

        # Validation finale de la transaction
        db.commit()

        return {
            "status": "success",
            "company_id": company_id,
            "simulation_preview": simulation_results
        }

    except Exception as e:
        db.rollback()
        raise e


# --- ROUTES ---

@router.post("/questionnaire")
async def recevoir_questionnaire(
    request: Request,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_clerk_token)
):
    """Reçoit les données du questionnaire depuis le frontend authentifié."""
    try:
        data = await request.json()
        return await traiter_questionnaire_data(data, db, user_id)
    except Exception as e:
        return {"status": "error", "message": f"Erreur générale: {str(e)}"}


class TestRequest(BaseModel):
    exemple_id: Optional[int] = 1

@router.post("/questionnaire/test")
async def recevoir_questionnaire_test(request: TestRequest, db: Session = Depends(get_db)):
    """Charge mock_data.json et exécute la logique (sans auth)."""
    try:
        if not MOCK_FILE.exists():
            return {"status": "error", "message": f"Fichier mock introuvable: {MOCK_FILE}"}

        with MOCK_FILE.open(encoding="utf-8") as f:
            data = json.load(f)

        if not data:
            return {"status": "error", "message": "Fichier mock vide !"}

        if not (1 <= request.exemple_id <= len(data)):
            return {"status": "error", "message": f"exemple_id doit être 1-{len(data)}"}

        exemple = data[request.exemple_id - 1]
        return await traiter_questionnaire_data(exemple, db, user_id="test_mock_user")

    except json.JSONDecodeError as e:
        return {"status": "error", "message": f"JSON invalide: {str(e)}"}
    except Exception as e:
        return {"status": "error", "message": f"Erreur: {type(e).__name__}: {str(e)}"}


@router.get("/simulations/{company_id}")
async def get_simulations_entreprise(company_id: int, db: Session = Depends(get_db)):
    """Récupère l'historique des simulations d'une entreprise."""
    try:
        sims = db.query(SimulationPV).filter(SimulationPV.company_id == company_id).all()
        return {"status": "success", "simulations": [model_to_dict(s) for s in sims]}
    except Exception as e:
        return {"status": "error", "message": f"Erreur lors de la récupération: {str(e)}"}


@router.get("/companies")
async def get_all_companies(
    user_id: str = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Récupère uniquement les entreprises/audits de l'utilisateur connecté."""
    try:
        companies = (
            db.query(Company)
            .filter(Company.user_id == user_id)
            .order_by(Company.created_at.desc())
            .all()
        )
        return {
            "status": "success",
            "data": [model_to_dict(c) for c in companies],
            "count": len(companies)
        }
    except Exception as e:
        return {"status": "error", "message": f"Erreur lors de la récupération des entreprises: {str(e)}"}


@router.get("/dashboard/{company_id}")
async def get_dashboard_data(
    company_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(verify_clerk_token)
):
    """Récupère toutes les données nécessaires pour le dashboard."""
    try:
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            return {"status": "error", "message": "Entreprise non trouvée"}

        # CONTRÔLE D'ACCÈS : vérifier que cette entreprise appartient bien à l'utilisateur connecté.
        if company.user_id != user_id:
            raise HTTPException(status_code=403, detail="Accès refusé : cette entreprise ne vous appartient pas.")

        energy_model = db.query(Energy).filter(Energy.company_id == company_id).first()
        simulation_data = db.query(SimulationPV).filter(SimulationPV.company_id == company_id).first()
        thermal_data = db.query(ModelThermal).filter(ModelThermal.company_id == company_id).first()
        audit_data = db.query(AuditReport).filter(AuditReport.id == company_id).first()

        comp_dict = model_to_dict(company)
        energy_dict = model_to_dict(energy_model)
        sim_dict = model_to_dict(simulation_data)
        thermal_dict = model_to_dict(thermal_data)
        audit_dict = model_to_dict(audit_data)

        # Calculs des métriques
        conso_elec = float(energy_dict.get("conso_elec", 0) or 0)
        conso_gaz = float(energy_dict.get("conso_gaz", 0) or 0)
        prix_elec = float(energy_dict.get("prix_elec", 0) or 0)
        prix_gaz = float(energy_dict.get("prix_gaz", 0) or 0)
        cout_total = round(conso_elec * prix_elec + conso_gaz * prix_gaz, 2)
        co2_emissions = float(energy_dict.get("emission_co2_kg", 0) or 0)

        # Énergie renouvelable : % déclaré par l'utilisateur dans le questionnaire
        energie_renouvelable_pct = float(energy_dict.get("pourcentage_renouvelable", 0) or 0)

        dashboard_data = {
            "company_name": comp_dict.get("nom", "Entreprise"),
            "metrics": {
                "coutTotal": cout_total,
                "consommationTotale": round(conso_elec + conso_gaz, 2),
                "impactCarbone": round(co2_emissions / 1000, 2),
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
                {"label": "Nom", "value": comp_dict.get("nom", "—")},
                {"label": "Surface locaux", "value": f"{comp_dict.get('surface_locaux', '—')} m²"},
                {"label": "Surface toit", "value": f"{comp_dict.get('surface_toit', '—')} m²"},
                {"label": "Type bâtiment", "value": comp_dict.get("type_batiment", "—")},
                {"label": "Année construction", "value": str(comp_dict.get("annee_construction", "—"))},
                {"label": "Secteur", "value": comp_dict.get("secteur_activite", "—")}
            ],
            "simulationPV": _build_simulation_pv(sim_dict, comp_dict) if sim_dict else None,
            "simulationThermique": _build_simulation_thermique(thermal_dict, comp_dict) if thermal_dict else None,
            "benchmark": {
                "pourcentage": audit_dict.get("benchmark", 100),
                "secteur": comp_dict.get("secteur_activite", "Non spécifié"),
                "moyenne_secteur": moyenne_conso_m2_secteur.get(comp_dict.get("secteur_activite"), 150)
            }
        }

        return {
            "status": "success",
            "data": dashboard_data
        }

    except Exception as e:
        return {"status": "error", "message": f"Erreur lors de la récupération des données: {str(e)}"}


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

    thermal = ServiceThermal()
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


@router.get("/")
async def root():
    return {"message": "API OK"}
