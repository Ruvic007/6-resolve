# Paramètres par défaut (à adapter selon ton référentiel ADEME / Base Carbone)
# Unités :
# - consommation élec : kWh
# - consommation gaz  : kWh PCI
# - facteurs d'émission : kgCO2e / kWh

FACTEUR_ELEC_MIX = 0.057      # 57 gCO2e/kWh -> 0.057 kgCO2e/kWh (mix moyen FR 2018 ordre de grandeur)[web:21]
FACTEUR_ELEC_RENOUV = 0.020   # 20 gCO2e/kWh -> 0.020 kgCO2e/kWh (ordre de grandeur élec renouvelable)[web:26]
FACTEUR_GAZ_NATUREL = 0.21    # 0.21 kgCO2e/kWh PCI (mix gaz naturel France, combustion + amont)[web:13][web:24]

def calcul_emissions(
    conso_elec_kwh: float,
    part_renouvelable_elec: float,
    conso_gaz_kwh: float,
    facteur_elec_mix: float = FACTEUR_ELEC_MIX,
    facteur_elec_renouv: float = FACTEUR_ELEC_RENOUV,
    facteur_gaz: float = FACTEUR_GAZ_NATUREL,
) -> dict:
    """
    Calcule les émissions de CO2e à partir :
      - conso_elec_kwh : consommation d'électricité (kWh)
      - part_renouvelable_elec : part d'électricité renouvelable entre 0 et 1 (ex : 0.3 = 30%)
      - conso_gaz_kwh : consommation de gaz (kWh PCI)
    Retourne un dict avec les émissions (kgCO2e) par énergie et le total.
    """

    # Sécurisation de la part renouvelable
    part_renouvelable_elec = max(0.0, min(1.0, part_renouvelable_elec))

    # Décomposition de la conso élec en renouvelable vs non renouvelable (mix)
    conso_elec_renouv = conso_elec_kwh * part_renouvelable_elec
    conso_elec_non_renouv = conso_elec_kwh * (1 - part_renouvelable_elec)

    # Émissions électricité
    emissions_elec_renouv = conso_elec_renouv * facteur_elec_renouv
    emissions_elec_non_renouv = conso_elec_non_renouv * facteur_elec_mix
    emissions_elec_tot = emissions_elec_renouv + emissions_elec_non_renouv

    # Émissions gaz
    emissions_gaz = conso_gaz_kwh * facteur_gaz

    # Total
    emissions_totales = emissions_elec_tot + emissions_gaz

    return {
        "emissions_elec_renouvelable_kgCO2e": emissions_elec_renouv,
        "emissions_elec_non_renouvelable_kgCO2e": emissions_elec_non_renouv,
        "emissions_elec_totales_kgCO2e": emissions_elec_tot,
        "emissions_gaz_kgCO2e": emissions_gaz,
        "emissions_totales_kgCO2e": emissions_totales,
    }

# Exemple d'utilisation
if __name__ == "__main__":
    conso_elec = 10000        # kWh d'électricité
    part_renouv = 0.30        # 30% d'électricité renouvelable
    conso_gaz = 20000         # kWh de gaz

    resultats = calcul_emissions(conso_elec, part_renouv, conso_gaz)
    for k, v in resultats.items():
        print(f"{k}: {v:.2f} kgCO2e")


