

FACTEUR_ELEC_MIX = 0.057
FACTEUR_ELEC_RENOUV = 0.020 
FACTEUR_GAZ_NATUREL = 0.21

def calcul_emissions(
    conso_elec_kwh: float,
    part_renouvelable_elec: float,
    conso_gaz_kwh: float,
    facteur_elec_mix: float = FACTEUR_ELEC_MIX,
    facteur_elec_renouv: float = FACTEUR_ELEC_RENOUV,
    facteur_gaz: float = FACTEUR_GAZ_NATUREL,
) -> dict:
   
    part_renouvelable_elec = max(0.0, min(1.0, part_renouvelable_elec))

    conso_elec_renouv = conso_elec_kwh * part_renouvelable_elec
    conso_elec_non_renouv = conso_elec_kwh * (1 - part_renouvelable_elec)

  
    emissions_elec_renouv = conso_elec_renouv * facteur_elec_renouv
    emissions_elec_non_renouv = conso_elec_non_renouv * facteur_elec_mix
    emissions_elec_tot = emissions_elec_renouv + emissions_elec_non_renouv

   
    emissions_gaz = conso_gaz_kwh * facteur_gaz

   
    emissions_totales = emissions_elec_tot + emissions_gaz

    return {
        "emissions_elec_renouvelable_kgCO2e": emissions_elec_renouv,
        "emissions_elec_non_renouvelable_kgCO2e": emissions_elec_non_renouv,
        "emissions_elec_totales_kgCO2e": emissions_elec_tot,
        "emissions_gaz_kgCO2e": emissions_gaz,
        "emissions_totales_kgCO2e": emissions_totales,
    }



