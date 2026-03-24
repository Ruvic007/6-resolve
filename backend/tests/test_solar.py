import pytest
from src.services.solar_simulation import SolarSimulation

@pytest.fixture
def simulator():
    return SolarSimulation()

# ---------------------------------------------------------------------------
# TESTS UNITAIRES
# ---------------------------------------------------------------------------

def test_estimer_puissance_installation(simulator):
    """Vérifie le calcul de kWc (300m2 * 0.6 * 0.18 = 32.4)."""
    assert simulator.estimer_puissance_installation(300) == 32.4
    assert simulator.estimer_puissance_installation(0) == 0.0

def test_estimer_production_annuelle_nord(simulator):
    """Vérifie la production en IDF (75001 -> Nord : 1000 kWh/kWc)."""
    production = simulator.estimer_production_annuelle("75001", 32.4)
    assert production == 32400.0

def test_estimer_production_annuelle_sud(simulator):
    """Vérifie la production à Marseille (13000 -> Sud : 1500 kWh/kWc)."""
    production = simulator.estimer_production_annuelle("13000", 10.0)
    assert production == 15000.0

def test_taux_autoconsommation_logic(simulator):
    """
    Vérifie que le profil d'activité impacte bien le taux.
    Note : On utilise une production > consommation pour éviter le plafond de 1.0.
    """
    prod_geante = 1000000 
    conso_moyenne = 50000
    
    # Un bureau (profil 0.80) consomme plus en journée qu'un hôtel (profil 0.45)
    taux_bureau = simulator.estimer_taux_autoconsommation(prod_geante, conso_moyenne, "bureau", 5, 8)
    taux_hotel = simulator.estimer_taux_autoconsommation(prod_geante, conso_moyenne, "hotel", 5, 8)
    
    # On vérifie que la logique de profil est respectée
    assert taux_bureau > taux_hotel
    assert 0 <= taux_bureau <= 1

def test_calcul_roi_rentabilite(simulator):
    """Vérifie que le ROI est bien calculé avec les économies annuelles."""
    # Coût 10 000€, Economies 2 000€/an -> Rentable en moins de 6 ans
    res = simulator.calculer_roi(10000, 2000)
    assert res["roi_annees"] <= 6 
    assert res["rentable"] is True

# ---------------------------------------------------------------------------
# TEST D'INTÉGRATION (Cas "Test Entreprise SARL")
# ---------------------------------------------------------------------------

def test_simulation_complete_integration(simulator):
    """Vérifie le tunnel complet avec tes données réelles."""
    donnees_test = {
        "nom": "Test Entreprise SARL",
        "code_postal": "75001",
        "sous_categorie": "restaurant",
        "surface_toit": 300,
        "jours_ouverture": 5,
        "heure_ouverture": 7,
        "conso_elec": 75000,
        "prix_elec": 0.19,
        "niveau_isolation": "moyen"
    }
    
    resultat = simulator.simuler(donnees_test)
    
    # Vérifications basées sur ton calcul algorithmique
    assert resultat["puissance_kw"] == 32.4
    assert resultat["production_annuelle_kwh"] == 32400.0
    
    # Dans ce cas précis (32k prod / 75k conso), l'entreprise absorbe TOUT le solaire
    assert resultat["taux_autoconsommation"] == 1.0
    assert resultat["rentable"] is True
    assert resultat["region"] == "nord"