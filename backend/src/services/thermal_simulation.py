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
        
        # Facteurs d'émission (kg CO₂/kWh) - Harmonisé avec app.py
        self.facteurs_co2 = {
            "gaz": 0.227,
            "électrique": 0.055,
            "electricite": 0.055,
            "fioul": 0.324
        }
        
        self.prix_m2_installation = 1100

    def _determiner_region(self, code_postal: str) -> str:
        """Détermine la zone climatique."""
        if not code_postal or len(str(code_postal)) < 2:
            return "sud"
        
        pref = str(code_postal)[:2]
        # Utilisation de strings pour éviter les erreurs avec la Corse (2A/2B)
        if pref in ['02', '59', '62', '80']: return "nord"
        if pref in ['67', '68', '57', '54', '55', '88']: return "est"
        if pref in ['35', '56', '29', '22', '44', '85', '17', '79', '86']: return "ouest"
        if pref in ['83', '84', '13', '30', '34', '66', '11', '12', '48', '07', '26', '38']: return "mediterranee"
        return "sud"

    def calculer_simulation_complete(self, surface_toit: float, cp: str, type_chauffage: str, prix_kwh: float) -> Dict[str, Any]:
        """Méthode principale pour app.py : calcule tout d'un coup."""
        # On estime que 10% de la surface du toit est utilisée pour le thermique
        surface_th = float(surface_toit or 0) * 0.1
        
        if surface_th <= 0:
            return {
                "surface_m2": 0, "production_kwh": 0, "cout_installation": 0,
                "economies_annuelles": 0, "reduction_co2_kg": 0, "roi_annees": 0
            }

        # 1. Production
        region = self._determiner_region(cp)
        production = surface_th * self.rendement_regions[region]
        
        # 2. Coût
        cout = surface_th * self.prix_m2_installation
        
        # 3. Impact CO2 et financier
        # Normalisation du type de chauffage pour matcher le dictionnaire
        type_key = type_chauffage.lower().replace('é', 'e')
        facteur = self.facteurs_co2.get(type_key, 0.2)
        
        reduction_co2 = production * facteur
        economies = production * prix_kwh
        
        # 4. ROI
        roi = cout / economies if economies > 0 else 99
        
        return {
            "surface_m2": round(surface_th, 2),
            "production_kwh": round(production, 2),
            "cout_installation": round(cout, 2),
            "economies_annuelles": round(economies, 2),
            "reduction_co2_kg": round(reduction_co2, 2),
            "roi_annees": round(roi, 1)
        }