from typing import Dict, Any

class ThermalSimulation:
    def __init__(self):
        # Rendement moyen annuel (kWh produits par m² de capteurs)
        self.rendement_regions = {
            "nord": 450,
            "est": 500,
            "ouest": 550,
            "sud": 600,
            "mediterranee": 650
        }
        
        # Facteurs d'émission (kg CO₂/kWh)
        self.facteurs_co2 = {
            "gaz": 0.227,
            "electrique": 0.055,
            "electricite": 0.055,
            "fioul": 0.324
        }
        
        # On ne définit plus un prix fixe unique, mais une méthode dégressive

    def _calculer_prix_m2_degressif(self, surface: float) -> float:
        """Calcule un prix au m2 qui baisse avec la surface."""
        if surface < 20: return 1300
        if surface < 100: return 1100
        if surface < 500: return 950
        return 850  # Tarif pour les très grandes surfaces industrielles

    def _determiner_region(self, code_postal: str) -> str:
        """Détermine la zone climatique."""
        if not code_postal or len(str(code_postal)) < 2:
            return "sud"
        
        pref = str(code_postal)[:2]
        if pref in ['02', '59', '62', '80']: return "nord"
        if pref in ['67', '68', '57', '54', '55', '88']: return "est"
        if pref in ['35', '56', '29', '22', '44', '85', '17', '79', '86']: return "ouest"
        if pref in ['83', '84', '13', '30', '34', '66', '11', '12', '48', '07', '26', '38']: return "mediterranee"
        # Ajout du 91 explicitement au Nord si tu veux éviter le "sud" par défaut
        if pref in ['91', '75', '77', '78', '92', '93', '94', '95']: return "nord" 
        return "sud"

    def calculer_simulation_complete(self, surface_toit: float, cp: str, type_chauffage: str, prix_kwh: float) -> Dict[str, Any]:
        """Méthode principale : le ROI variera désormais selon la surface."""
        surface_th = float(surface_toit or 0) * 0.1
        
        if surface_th <= 0:
            return {
                "surface_m2": 0, "production_kwh": 0, "cout_installation": 0,
                "economies_annuelles": 0, "reduction_co2_kg": 0, "roi_annees": 0
            }

        # 1. Production (dépend de la région)
        region = self._determiner_region(cp)
        production = surface_th * self.rendement_regions[region]
        
        # 2. Coût avec dégressivité (Rend le ROI dynamique !)
        prix_unitaire = self._calculer_prix_m2_degressif(surface_th)
        cout = surface_th * prix_unitaire
        
        # 3. Impact financier
        type_key = type_chauffage.lower().replace('é', 'e')
        facteur = self.facteurs_co2.get(type_key, 0.2)
        
        reduction_co2 = production * facteur
        economies = production * prix_kwh
        
        # 4. ROI : La surface ne s'annule plus car prix_unitaire change
        roi = cout / economies if economies > 0 else 99
        
        return {
            "surface_m2": round(surface_th, 2),
            "production_kwh": round(production, 2),
            "cout_installation": round(cout, 2),
            "economies_annuelles": round(economies, 2),
            "reduction_co2_kg": round(reduction_co2, 2),
            "roi_annees": round(roi, 1)
        }