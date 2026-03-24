"""
Simulation solaire pour entreprises.
Utilise les données du questionnaire pour affiner les calculs.
"""

from typing import Dict, Any
from src.services.region_utils import determiner_region


# ---------------------------------------------------------------------------
# Tables de référence
# ---------------------------------------------------------------------------

# Ensoleillement corrigé (kWh/kWc/an) — valeurs terrain 2024
ENSOLEILLEMENT_REGIONS: Dict[str, float] = {
    "nord":         1000,
    "est":          1100,
    "ouest":        1100,
    "sud":          1350,
    "mediterranee": 1500,
}

# Profil de consommation diurne par sous-catégorie d'activité
# Représente la part de la conso électrique annuelle qui tombe en heures solaires
PROFIL_DIURNE: Dict[str, float] = {
    "restaurant":       0.70,   # service midi + prépa matin
    "bureau":           0.80,   # 9h-18h = plein jour
    "commerce":         0.75,   # ouverture journée
    "entrepot":         0.65,
    "industrie":        0.60,
    "hotel":            0.45,   # forte conso nocturne
    "default":          0.60,
}

# Bonus d'isolation sur la conso de chauffage/climatisation
BONUS_ISOLATION: Dict[str, float] = {
    "faible":   1.20,   # +20% conso estimée
    "moyen":    1.00,
    "bon":      0.85,
    "excellent":0.70,
}

# Facteur CO₂ mix électrique français (kg CO₂/kWh) — ADEME 2024
FACTEUR_CO2 = 0.052

# Tarif de rachat EDF Obligation d'Achat 2025 (€/kWh) — > 36 kWc : 0.06, ≤ 36 kWc : 0.13
TARIF_RACHAT_PETIT  = 0.13   # ≤ 36 kWc
TARIF_RACHAT_GRAND  = 0.06   # > 36 kWc


# ---------------------------------------------------------------------------
# Classe principale
# ---------------------------------------------------------------------------

class SolarSimulation:

    def __init__(self):
        self.ensoleillement_regions = ENSOLEILLEMENT_REGIONS
        self.facteur_emission_co2   = FACTEUR_CO2

    # ------------------------------------------------------------------
    # 1. Puissance installable
    # ------------------------------------------------------------------

    def estimer_puissance_installation(
        self,
        surface_toit_m2: float,
        pourcentage_utilisation: float = 0.6,
        rendement_panneau: float = 0.18,    # 180 W/m² panneaux modernes
    ) -> float:
        """
        Estime la puissance crête installable (kWc).

        Args:
            surface_toit_m2       : surface totale du toit
            pourcentage_utilisation: fraction réellement exploitable (défaut 60 %)
            rendement_panneau     : rendement surfacique W/m² / 1000  (défaut 18 %)
        """
        if not surface_toit_m2 or surface_toit_m2 <= 0:
            return 0.0
        if not 0 < pourcentage_utilisation <= 1:
            raise ValueError("pourcentage_utilisation doit être entre 0 et 1")

        surface_utilisable = surface_toit_m2 * pourcentage_utilisation
        puissance_kw       = surface_utilisable * rendement_panneau
        return round(puissance_kw, 2)

    # ------------------------------------------------------------------
    # 2. Production annuelle
    # ------------------------------------------------------------------

    def estimer_production_annuelle(
        self,
        code_postal: str,
        puissance_kw: float,
    ) -> float:
        """
        Production annuelle estimée (kWh/an).
        Production = puissance × ensoleillement régional.
        """
        region        = determiner_region(code_postal)
        ensoleillement = self.ensoleillement_regions.get(region, 1000)
        return round(puissance_kw * ensoleillement, 2)

    # ------------------------------------------------------------------
    # 3. Taux d'autoconsommation dynamique
    # ------------------------------------------------------------------

    def estimer_taux_autoconsommation(
        self,
        production_kwh: float,
        conso_elec_kwh: float,
        sous_categorie: str,
        jours_ouverture: int,
        heure_ouverture: float,
    ) -> float:
        """
        Estime le taux d'autoconsommation réaliste (0–1).

        Logique :
        - La conso diurne est la part de la conso totale utilisable pendant
          les heures de production solaire, selon le profil d'activité.
        - On ajuste par le ratio jours ouverts / 7 (présence effective).
        - Si la conso diurne > production : tout est autoconsommé.
        - Sinon : seulement la fraction absorbée.
        """
        sous_cat_norm   = sous_categorie.lower().strip()
        profil_diurne   = PROFIL_DIURNE.get(sous_cat_norm, PROFIL_DIURNE["default"])

        # Pondération par les jours d'ouverture (présence = autoconsommation)
        ratio_presence  = min(jours_ouverture / 7, 1.0)

        # Heures d'ouverture : plus l'entreprise ouvre tôt, plus elle capte le solaire matinal
        # On normalise sur 8h (heure typique d'ouverture standard)
        bonus_horaire   = min(heure_ouverture / 8.0, 1.0) * 0.1   # jusqu'à +10%

        profil_effectif = min(profil_diurne * ratio_presence + bonus_horaire, 1.0)
        conso_diurne    = conso_elec_kwh * profil_effectif

        if conso_diurne <= 0 or production_kwh <= 0:
            return 0.0

        # Part de la production que la conso diurne peut absorber
        taux = min(conso_diurne / production_kwh, 1.0)
        return round(taux, 3)

    # ------------------------------------------------------------------
    # 4. Économies annuelles
    # ------------------------------------------------------------------

    def calculer_economies_annuelles(
        self,
        production_kwh: float,
        taux_autoconsommation: float,
        puissance_kw: float,
        prix_kwh_achete: float,
    ) -> Dict[str, float]:
        """
        Calcule les économies annuelles et revenus de revente.

        Le tarif de rachat est déterminé automatiquement selon la puissance :
        - ≤ 36 kWc → 0.13 €/kWh (petit pro, EDF OA 2025)
        - > 36 kWc → 0.06 €/kWh (grande installation)
        """
        if not 0 <= taux_autoconsommation <= 1:
            raise ValueError("taux_autoconsommation doit être entre 0 et 1")

        tarif_rachat = TARIF_RACHAT_PETIT if puissance_kw <= 36 else TARIF_RACHAT_GRAND

        autoconso_kwh  = production_kwh * taux_autoconsommation
        revente_kwh    = production_kwh * (1 - taux_autoconsommation)

        eco_autoconso  = autoconso_kwh * prix_kwh_achete
        revenus_revente = revente_kwh  * tarif_rachat
        economies_totales = eco_autoconso + revenus_revente

        return {
            "economies_autoconsommation": round(eco_autoconso, 2),
            "revenus_revente":            round(revenus_revente, 2),
            "economies_totales":          round(economies_totales, 2),
            "autoconsommation_kwh":       round(autoconso_kwh, 2),
            "revente_kwh":                round(revente_kwh, 2),
            "tarif_rachat_utilise":       tarif_rachat,
        }

    # ------------------------------------------------------------------
    # 5. Réduction CO₂
    # ------------------------------------------------------------------

    def calculer_reduction_co2(self, production_kwh: float) -> float:
        """Réduction annuelle des émissions CO₂ (kg/an)."""
        return round(production_kwh * self.facteur_emission_co2, 2)

    # ------------------------------------------------------------------
    # 6. ROI avec dégradation des panneaux
    # ------------------------------------------------------------------

    def calculer_roi(
        self,
        cout_installation: float,
        economies_annuelles: float,
        taux_degradation_annuel: float = 0.005,   # 0.5 %/an
        horizon_ans: int = 25,
    ) -> Dict[str, Any]:
        """
        ROI réaliste avec dégradation progressive de la production.

        La production (et donc les économies) diminuent de 0.5 %/an.
        On cumule les économies réelles année par année.
        """
        if economies_annuelles <= 0:
            return {"roi_annees": float("inf"), "rentable": False}

        cumul      = 0.0
        roi_annees = None

        economies_par_an = []
        for annee in range(1, horizon_ans + 1):
            facteur      = (1 - taux_degradation_annuel) ** (annee - 1)
            eco_annee    = economies_annuelles * facteur
            cumul       += eco_annee
            economies_par_an.append(round(eco_annee, 2))

            if roi_annees is None and cumul >= cout_installation:
                roi_annees = annee

        if roi_annees is None:
            roi_annees = float("inf")

        return {
            "roi_annees":      roi_annees,
            "rentable":        isinstance(roi_annees, int) and roi_annees <= 12,
            "economies_10_ans": round(sum(economies_par_an[:10]), 2),
            "economies_20_ans": round(sum(economies_par_an[:20]), 2),
            "economies_25_ans": round(sum(economies_par_an[:25]), 2),
        }

    # ------------------------------------------------------------------
    # 7. Coût d'installation avec dégressivité
    # ------------------------------------------------------------------

    def estimer_cout_installation(self, puissance_kw: float) -> float:
        """
        Coût d'installation avec prix dégressif selon la puissance.

        Barème 2025 (€/kWc) :
        - < 9 kWc   : 2 000 €/kWc
        - 9–36 kWc  : 1 600 €/kWc
        - 36–100 kWc: 1 200 €/kWc
        - > 100 kWc :   900 €/kWc
        """
        if puissance_kw < 9:
            prix_par_kw = 2000
        elif puissance_kw < 36:
            prix_par_kw = 1600
        elif puissance_kw < 100:
            prix_par_kw = 1200
        else:
            prix_par_kw = 900

        return round(puissance_kw * prix_par_kw, 2)

    # ------------------------------------------------------------------
    # 8. Point d'entrée principal — simule depuis les données du questionnaire
    # ------------------------------------------------------------------

    def simuler(self, questionnaire: Dict[str, Any]) -> Dict[str, Any]:
        """
        Lance la simulation complète à partir des données brutes du questionnaire.

        Champs utilisés :
            code_postal, surface_toit, sous_categorie,
            jours_ouverture, heure_ouverture,
            conso_elec, prix_elec, niveau_isolation
        """
        # --- Extraction et valeurs par défaut ---
        code_postal      = str(questionnaire.get("code_postal", "75000"))
        surface_toit     = float(questionnaire.get("surface_toit", 0))
        sous_categorie   = str(questionnaire.get("sous_categorie", "default"))
        jours_ouverture  = int(questionnaire.get("jours_ouverture", 5))
        heure_ouverture  = float(questionnaire.get("heure_ouverture", 8))
        conso_elec       = float(questionnaire.get("conso_elec", 0))
        prix_elec        = float(questionnaire.get("prix_elec", 0.22))
        niveau_isolation = str(questionnaire.get("niveau_isolation", "moyen")).lower()

        # Correction conso selon isolation (utile si on étend aux économies chauffage)
        bonus_iso = BONUS_ISOLATION.get(niveau_isolation, 1.0)
        conso_elec_corrigee = conso_elec * bonus_iso

        # --- Calculs en cascade ---
        puissance       = self.estimer_puissance_installation(surface_toit)
        production      = self.estimer_production_annuelle(code_postal, puissance)
        taux_autoconso  = self.estimer_taux_autoconsommation(
            production, conso_elec_corrigee,
            sous_categorie, jours_ouverture, heure_ouverture
        )
        economies       = self.calculer_economies_annuelles(
            production, taux_autoconso, puissance, prix_elec
        )
        cout            = self.estimer_cout_installation(puissance)
        roi             = self.calculer_roi(cout, economies["economies_totales"])
        co2             = self.calculer_reduction_co2(production)
        region          = determiner_region(code_postal)

        return {
            "region":                region,
            "puissance_kw":          puissance,
            "production_annuelle_kwh": production,
            "taux_autoconsommation": taux_autoconso,
            "cout_installation":     cout,
            "co2_evite_kg_an":       co2,
            **economies,
            **roi,
        }
    