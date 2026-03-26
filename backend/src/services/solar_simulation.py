from typing import Dict, Any
from src.services.region_utils import determiner_region

class SolarSimulation:
    def __init__(self):
        # Facteurs régionaux d'ensoleillement (kWh/kWc/an)
        self.ensoleillement_regions = {
            "nord": 1000, 
            "est": 1100, 
            "ouest": 1100, 
            "sud": 1350, 
            "mediterranee": 1500
        }
        
        # Facteur d'émission CO₂ mix électrique français (kg CO₂/kWh)
        self.facteur_emission_co2 = 0.052
        
        # Prix moyen par défaut (sera calculé dynamiquement via cout_elec dans ton flux)
        self.prix_kwh_entreprise = 0.18
        
    def estimer_production_annuelle(self, code_postal: str, puissance_kw: float) -> float:
        """Estime la production annuelle basée sur la région et la puissance"""
        # Utilisation sécurisée de la fonction importée
        region = self._determiner_region(code_postal)
        
        # Sécurité pour éviter le crash si la région n'est pas trouvée
        ensoleillement = self.ensoleillement_regions.get(region, 1000)
        
        production_kwh = float(puissance_kw or 0) * ensoleillement
        return round(production_kwh, 2)

    def _determiner_region(self, code_postal: str) -> str:
        # On s'assure que le CP est une chaîne
        cp = str(code_postal) if code_postal else "75000"
        return determiner_region(cp)
    
    def calculer_economies_annuelles(self, production_kwh: float, taux_autoconsommation: float, 
                                   tarif_rachat: float, prix_kwh_achete: float) -> Dict[str, float]:
        """Calcule les économies annuelles et revenus de revente"""
        # Sécurisation des entrées pour éviter le crash "NoneType"
        prod = float(production_kwh or 0)
        taux = float(taux_autoconsommation or 0)
        prix = float(prix_kwh_achete or 0.20)
        rachat = float(tarif_rachat or 0.13)

        autoconsommation_kwh = prod * taux
        revente_kwh = prod * (1 - taux)
        
        economies_autoconsommation = autoconsommation_kwh * prix
        revenus_revente = revente_kwh * rachat
        
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
        reduction = float(production_kwh or 0) * self.facteur_emission_co2
        return round(reduction, 2)
    
    def calculer_roi(self, cout_installation: float, economies_annuelles: float) -> Dict[str, Any]:
        """Calcule le ROI et la rentabilité"""
        eco = float(economies_annuelles or 0)
        # Correction SQL : 99.0 au lieu de l'infini pour éviter l'erreur de capacité
        if eco <= 0:
            return {"roi_annees": 99.0, "rentable": False}
        
        roi_annees = float(cout_installation or 0) / eco
        rentable = roi_annees <= 12  # Seuil de rentabilité ajusté à 12 ans
        
        return {
            "roi_annees": round(min(roi_annees, 99.0), 1),
            "rentable": rentable,
            "economies_10_ans": round(eco * 10, 2),
            "economies_20_ans": round(eco * 20, 2)
        }
    
    def estimer_puissance_installation(self, surface_toit_m2: float, pourcentage_utilisation: float = 0.6) -> float:
        """Estime la puissance installable basée sur la surface de toit"""
        s_toit = float(surface_toit_m2 or 0)
        if not s_toit:
            return 0.0
        surface_utilisable = s_toit * pourcentage_utilisation
        # 18% de rendement (plus réaliste en 2025)
        puissance_kw = surface_utilisable * 0.18  
        return round(puissance_kw, 2)
    
    def estimer_cout_installation(self, puissance_kw: float, prix_par_kw: float = 1600) -> float:
        """Estime le coût d'installation basé sur la puissance"""
        # Prix par kWc dégressif si l'installation est grande
        p_kw = float(puissance_kw or 0)
        if p_kw > 36:
            prix_par_kw = 1200
        return round(p_kw * prix_par_kw, 2)