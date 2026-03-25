from src.services.solar_simulation import SolarSimulation

def test_determiner_region():
    sim = SolarSimulation()
    assert sim._determiner_region("75000") == "nord"
    assert sim._determiner_region("59000") == "nord"
    assert sim._determiner_region("13000") == "mediterranee"

def test_estimer_production():
    sim = SolarSimulation()
    # Puissance 10kW dans le sud (facteur 1150)
    production_ouest = sim.estimer_production_annuelle("31000", 10.0)
    assert production_ouest == 10000.0
    production_sud = sim.estimer_production_annuelle("26000", 10.0)
    assert production_sud == 11500.0

def test_calculer_roi_non_rentable():
    sim = SolarSimulation()
    # Installation chère (10000) pour peu d'économies (100)
    roi = sim.calculer_roi(10000, 100)
    assert roi["rentable"] is False
    assert roi["roi_annees"] == 100.0