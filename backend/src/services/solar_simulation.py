from typing import Dict, Any
from src.services.region_utils import determiner_region

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
        return determiner_region(code_postal)
    
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
        rentable = roi_annees <= 10  # Considéré comme rentable si ROI ≤ 10 ans
        
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
        puissance_kw = surface_utilisable * 0.15  # 150W par m²
        return round(puissance_kw, 2)
    
    def estimer_cout_installation(self, puissance_kw: float, prix_par_kw: float = 1500) -> float:
        """Estime le coût d'installation basé sur la puissance"""
        return round(puissance_kw * prix_par_kw, 2)