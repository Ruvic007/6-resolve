import pytest
from src.services.thermal_simulation import ThermalSimulation

@pytest.fixture
def thermal_service():
    return ThermalSimulation()

def test_calculer_prix_m2_degressif(thermal_service):
    """Vérifie que le prix au m2 baisse avec la surface"""
    assert thermal_service._calculer_prix_m2_degressif(10) == 1300
    assert thermal_service._calculer_prix_m2_degressif(50) == 1100
    assert thermal_service._calculer_prix_m2_degressif(200) == 950
    assert thermal_service._calculer_prix_m2_degressif(600) == 850

def test_roi_is_better_for_large_surfaces(thermal_service):
    """
    PROUVE QUE LE ROI EST DYNAMIQUE : 
    Une grande surface doit avoir un meilleur ROI qu'une petite 
    car le prix d'installation au m2 est dégressif.
    """
    # Cas 1 : Petite surface (100m2 de toit -> 10m2 thermique)
    res_small = thermal_service.calculer_simulation_complete(100, "75000", "gaz", 0.20)
    
    # Cas 2 : Très grande surface (6000m2 de toit -> 600m2 thermique)
    res_large = thermal_service.calculer_simulation_complete(6000, "75000", "gaz", 0.20)
    
    # Le ROI de la grande surface (prix m2 = 850) doit être plus petit 
    # que celui de la petite (prix m2 = 1300)
    assert res_large["roi_annees"] < res_small["roi_annees"]
    print(f"\nROI Petite surface: {res_small['roi_annees']} ans")
    print(f"ROI Grande surface: {res_large['roi_annees']} ans")

def test_co2_reduction_logic(thermal_service):
    """Vérifie que remplacer le fioul réduit plus de CO2 que l'électrique"""
    # Simulation pour 200m2 au Gaz vs Electrique
    res_gaz = thermal_service.calculer_simulation_complete(200, "75000", "gaz", 0.20)
    res_elec = thermal_service.calculer_simulation_complete(200, "75000", "electrique", 0.20)
    
    # Le gaz émet plus que l'électrique en France, donc l'économie de CO2 
    # doit être plus grande en remplaçant du gaz.
    assert res_gaz["reduction_co2_kg"] > res_elec["reduction_co2_kg"]

def test_zero_surface(thermal_service):
    """Vérifie que l'app ne crash pas si la surface est nulle"""
    res = thermal_service.calculer_simulation_complete(0, "75000", "gaz", 0.20)
    assert res["surface_m2"] == 0
    assert res["roi_annees"] == 0