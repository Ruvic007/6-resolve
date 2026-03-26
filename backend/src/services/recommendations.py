"""
Service de génération de recommandations énergétiques personnalisées.

Les recommandations sont déclenchées par les données réelles de l'audit :
- Données bâtiment : secteur, type, année construction, surfaces
- Données énergie : consommations, coûts, type chauffage/éclairage, isolation
- Benchmark : position vs moyenne sectorielle
- Simulations : PV et thermique déjà calculées
"""

from typing import Optional


def generer_recommandations(
    company: dict,
    energy: dict,
    audit: dict,
    simulation_pv: Optional[dict] = None,
    simulation_thermique: Optional[dict] = None,
) -> list[dict]:
    """
    Génère une liste de recommandations personnalisées basées sur les données réelles.
    Retourne les recommandations triées par priorité puis par phase.
    """
    recs = []

    # --- Données extraites ---
    secteur          = (company.get("secteur_activite") or "").lower()
    type_batiment    = (company.get("type_batiment") or "").lower()
    annee            = company.get("annee_construction") or 2000
    surface_locaux   = float(company.get("surface_locaux") or 0)
    surface_toit     = float(company.get("surface_toit") or 0)
    heures_par_jour  = float(company.get("heures_par_jour") or 8)

    conso_elec       = float(energy.get("conso_elec") or 0)
    conso_gaz        = float(energy.get("conso_gaz") or 0)
    cout_elec        = float(energy.get("cout_elec") or 0)
    cout_gaz         = float(energy.get("cout_gaz") or 0)
    cout_total       = cout_elec + cout_gaz
    renouvelable_pct = float(energy.get("pourcentage_renouvelable") or 0)
    type_chauffage   = (energy.get("type_chauffage") or "").lower()
    type_eclairage   = (energy.get("type_eclairage") or "").lower()
    isolation        = (energy.get("niveau_isolation") or "").lower()

    benchmark_pct    = float(audit.get("benchmark") or 100)

    # --- Helpers ---
    def add(rec: dict):
        recs.append(rec)

    # ================================================================
    # PHASE 1 — AUDIT (toujours proposé)
    # ================================================================
    add({
        "id": "reco_audit_facturier",
        "titre": "Audit facturier complet",
        "description": "Analysez vos 3 dernières années de factures pour identifier les postes de coût et anomalies de facturation.",
        "phase": 1,
        "priorite": "Haute",
        "economie_estimee": "Jusqu'à 15%",
        "delai": "2-4 semaines",
        "roi": "< 1 mois",
        "categorie": "Diagnostic",
        "top": True,
        "pourquoi": f"Votre coût énergétique total est de {round(cout_total):,} €/an. Un audit facturier permet souvent d'identifier des anomalies ou des options tarifaires plus avantageuses.".replace(",", " "),
    })

    add({
        "id": "reco_recensement",
        "titre": "Recensement des équipements énergivores",
        "description": "Inventaire détaillé de tous les équipements avec leur âge, leur état et leur consommation estimée.",
        "phase": 1,
        "priorite": "Moyenne",
        "economie_estimee": "Base indispensable",
        "delai": "1-2 semaines",
        "roi": "—",
        "categorie": "Inventaire",
        "top": False,
        "pourquoi": f"Sur {surface_locaux:.0f} m² de locaux, identifier les équipements énergivores est le point de départ de toute optimisation.",
    })

    # ================================================================
    # PHASE 2 — MONITORING
    # ================================================================
    if heures_par_jour >= 10 or conso_elec > 40000:
        add({
            "id": "reco_monitoring",
            "titre": "Mise en place d'un système de monitoring",
            "description": "Installation d'une box énergie connectée pour suivre la consommation en temps réel et détecter les anomalies.",
            "phase": 2,
            "priorite": "Haute" if conso_elec > 60000 else "Moyenne",
            "economie_estimee": "5-10%",
            "delai": "1 mois",
            "roi": "< 12 mois",
            "categorie": "Monitoring",
            "top": True,
            "pourquoi": f"Votre bâtiment fonctionne {heures_par_jour:.0f}h/jour avec {round(conso_elec):,} kWh/an d'électricité. Un monitoring temps réel permettrait de détecter les consommations inutiles (veilles, hors-heures).".replace(",", " "),
        })

    # ================================================================
    # PHASE 3 — QUICK WINS
    # ================================================================

    # Éclairage non-LED
    eclairage_fossile = any(x in type_eclairage for x in ["halogène", "halogene", "fluorescent", "incandescent", "néon", "neon"])
    if eclairage_fossile or (type_eclairage and "led" not in type_eclairage):
        add({
            "id": "reco_led",
            "titre": "Conversion complète en éclairage LED",
            "description": "Remplacement de l'éclairage existant par des LED avec détecteurs de présence dans les zones peu fréquentées.",
            "phase": 3,
            "priorite": "Haute",
            "economie_estimee": "30-50% sur l'éclairage",
            "delai": "2-4 semaines",
            "roi": "< 2 ans",
            "categorie": "Éclairage",
            "top": True,
            "pourquoi": f"Votre éclairage actuel ({energy.get('type_eclairage', 'non-LED')}) est l'un des postes les plus faciles à optimiser. Sur {surface_locaux:.0f} m² de locaux, le gain peut être significatif.",
        })

    # Programmation chauffage
    chauffage_programmable = any(x in type_chauffage for x in ["gaz", "fioul", "propane", "électrique", "electrique"])
    if chauffage_programmable:
        add({
            "id": "reco_prog_chauffage",
            "titre": "Programmation intelligente du chauffage",
            "description": "Installation de thermostats programmables avec gestion des plages horaires réelles d'occupation.",
            "phase": 3,
            "priorite": "Haute" if conso_gaz > 15000 else "Moyenne",
            "economie_estimee": "10-20% sur le chauffage",
            "delai": "1-2 semaines",
            "roi": "< 6 mois",
            "categorie": "Chauffage",
            "top": conso_gaz > 20000,
            "pourquoi": f"Votre consommation de gaz est de {round(conso_gaz):,} kWh/an ({round(cout_gaz):,} €). Une programmation adaptée à vos {heures_par_jour:.0f}h/jour d'exploitation réduirait significativement ce poste.".replace(",", " "),
        })

    # Benchmark trop élevé → chasse aux gaspillages urgente
    if benchmark_pct > 120:
        add({
            "id": "reco_gaspillages",
            "titre": "Chasse aux gaspillages — action urgente",
            "description": "Audit de détection : fuites air comprimé, équipements en veille prolongée, éclairages inutiles hors heures.",
            "phase": 3,
            "priorite": "Haute",
            "economie_estimee": "8-15%",
            "delai": "3-4 semaines",
            "roi": "< 6 mois",
            "categorie": "Maintenance",
            "top": True,
            "pourquoi": f"Votre consommation représente {benchmark_pct:.0f}% de la moyenne de votre secteur. Vous consommez {benchmark_pct - 100:.0f}% de plus que vos concurrents — des gaspillages sont probablement en cause.",
        })

    # ================================================================
    # PHASE 4 — OPTIMISATION
    # ================================================================

    # Isolation insuffisante
    if isolation in ["faible", "mauvais", "mauvaise", "insuffisant", "insuffisante"]:
        add({
            "id": "reco_isolation_toiture",
            "titre": "Isolation toiture prioritaire",
            "description": "L'isolation des combles ou de la toiture terrasse représente jusqu'à 40% des déperditions thermiques.",
            "phase": 4,
            "priorite": "Haute",
            "economie_estimee": "20-30% sur le chauffage",
            "delai": "2-3 mois",
            "roi": "3-5 ans",
            "categorie": "Isolation",
            "top": True,
            "pourquoi": f"Votre niveau d'isolation actuel est '{energy.get('niveau_isolation')}'. C'est le levier le plus rentable pour réduire vos {round(conso_gaz):,} kWh/an de gaz.".replace(",", " "),
        })
    elif isolation in ["moyen", "moyenne", "correct", "correcte"]:
        add({
            "id": "reco_isolation_murs",
            "titre": "Amélioration de l'isolation des murs",
            "description": "Isolation par l'intérieur ou l'extérieur pour réduire les déperditions thermiques.",
            "phase": 4,
            "priorite": "Moyenne",
            "economie_estimee": "10-20% sur le chauffage",
            "delai": "3-6 mois",
            "roi": "5-8 ans",
            "categorie": "Isolation",
            "top": False,
            "pourquoi": f"Votre isolation est '{energy.get('niveau_isolation')}'. Une amélioration permettrait de réduire vos besoins en chauffage sur {surface_locaux:.0f} m².",
        })

    # Bâtiment ancien
    if annee < 1990:
        add({
            "id": "reco_audit_thermique",
            "titre": "Audit thermique complet du bâtiment",
            "description": "Réalisation d'un audit thermique réglementaire pour identifier toutes les sources de déperdition.",
            "phase": 4,
            "priorite": "Haute" if annee < 1975 else "Moyenne",
            "economie_estimee": "15-35%",
            "delai": "1-2 mois",
            "roi": "Variable selon travaux",
            "categorie": "Rénovation",
            "top": annee < 1975,
            "pourquoi": f"Votre bâtiment date de {annee}. Les bâtiments construits avant les premières réglementations thermiques (RT 1974) sont souvent très énergivores.",
        })

    # Secteur tertiaire → GTB
    if any(x in secteur for x in ["bureau", "tertiaire", "service", "banque", "assurance", "informatique"]):
        add({
            "id": "reco_gtb",
            "titre": "Gestion Technique du Bâtiment (GTB)",
            "description": "Centralisation du pilotage éclairage, chauffage, climatisation et ventilation sur une plateforme unique.",
            "phase": 4,
            "priorite": "Moyenne",
            "economie_estimee": "10-20%",
            "delai": "3-6 mois",
            "roi": "3-5 ans",
            "categorie": "Automatisation",
            "top": False,
            "pourquoi": f"Dans le secteur tertiaire ({company.get('secteur_activite')}), la GTB est un investissement rentable pour piloter automatiquement les équipements selon l'occupation réelle.",
        })

    # Secteur industriel → récupération chaleur
    if any(x in secteur for x in ["industrie", "industriel", "fabrication", "production", "manufacturier"]):
        add({
            "id": "reco_chaleur_fatale",
            "titre": "Récupération de chaleur fatale",
            "description": "Captage et réutilisation de la chaleur produite par vos procédés industriels (compresseurs, fours, sécheurs).",
            "phase": 4,
            "priorite": "Haute" if conso_elec > 100000 else "Moyenne",
            "economie_estimee": "10-25%",
            "delai": "3-6 mois",
            "roi": "2-4 ans",
            "categorie": "Process industriel",
            "top": conso_elec > 100000,
            "pourquoi": f"Votre secteur industriel génère de la chaleur fatale lors des procédés. Avec {round(conso_elec + conso_gaz):,} kWh/an de consommation totale, le potentiel de récupération est significatif.".replace(",", " "),
        })

    # ================================================================
    # PHASE 5 — INVESTISSEMENT
    # ================================================================

    # Installation PV (avec données réelles si disponible)
    if surface_toit > 80 and renouvelable_pct < 30:
        if simulation_pv and simulation_pv.get("economies_annuelles_estimees"):
            eco_pv = round(float(simulation_pv["economies_annuelles_estimees"]))
            roi_pv = round(float(simulation_pv.get("roi_annees") or 0), 1)
            puissance = round(float(simulation_pv.get("puissance_installee_kw") or 0), 1)
            description_pv = f"Installation de panneaux photovoltaïques ({puissance} kWc) pour couvrir une partie de votre consommation électrique."
            pourquoi_pv = f"Votre simulation PV indique {eco_pv:,} €/an d'économies pour un ROI de {roi_pv} ans. Votre taux de renouvelable actuel est de {renouvelable_pct:.0f}%, bien en-dessous du potentiel de votre toit ({surface_toit:.0f} m²).".replace(",", " ")
            roi_str = f"{roi_pv} ans"
        else:
            description_pv = "Installation de panneaux photovoltaïques adaptée à votre surface de toit pour réduire votre facture électrique."
            pourquoi_pv = f"Votre toit de {surface_toit:.0f} m² offre un potentiel solaire inexploité. Votre taux d'énergie renouvelable actuel est de {renouvelable_pct:.0f}%."
            roi_str = "8-12 ans"

        add({
            "id": "reco_pv",
            "titre": "Installation solaire photovoltaïque",
            "description": description_pv,
            "phase": 5,
            "priorite": "Haute" if renouvelable_pct < 10 else "Moyenne",
            "economie_estimee": f"{eco_pv:,} €/an".replace(",", " ") if (simulation_pv and simulation_pv.get("economies_annuelles_estimees")) else "15-30% facture électrique",
            "delai": "3-6 mois",
            "roi": roi_str,
            "categorie": "Solaire PV",
            "top": renouvelable_pct < 10,
            "pourquoi": pourquoi_pv,
        })

    # Solaire thermique (avec données réelles si disponible)
    if conso_gaz > 8000 and surface_toit > 40:
        if simulation_thermique and simulation_thermique.get("economies_annuelles_estimees"):
            eco_th = round(float(simulation_thermique["economies_annuelles_estimees"]))
            roi_th = round(float(simulation_thermique.get("roi_annees") or 0), 1)
            description_th = "Installation de capteurs solaires thermiques pour couvrir vos besoins en eau chaude sanitaire et/ou chauffage."
            pourquoi_th = f"Votre simulation thermique indique {eco_th:,} €/an d'économies pour un ROI de {roi_th} ans. Vos {round(conso_gaz):,} kWh/an de gaz sont un potentiel d'optimisation majeur.".replace(",", " ")
            roi_str_th = f"{roi_th} ans"
        else:
            description_th = "Installation de capteurs solaires thermiques pour réduire votre consommation de gaz."
            pourquoi_th = f"Votre consommation de gaz ({round(conso_gaz):,} kWh/an — {round(cout_gaz):,} €/an) peut être réduite significativement par l'énergie solaire thermique.".replace(",", " ")
            roi_str_th = "5-10 ans"

        add({
            "id": "reco_thermique",
            "titre": "Installation solaire thermique",
            "description": description_th,
            "phase": 5,
            "priorite": "Haute" if conso_gaz > 30000 else "Moyenne",
            "economie_estimee": f"{eco_th:,} €/an".replace(",", " ") if (simulation_thermique and simulation_thermique.get("economies_annuelles_estimees")) else "20-40% facture gaz",
            "delai": "3-6 mois",
            "roi": roi_str_th,
            "categorie": "Solaire Thermique",
            "top": conso_gaz > 30000,
            "pourquoi": pourquoi_th,
        })

    # Pompe à chaleur
    if any(x in type_chauffage for x in ["gaz", "fioul", "propane"]) and conso_gaz > 15000:
        add({
            "id": "reco_pac",
            "titre": "Remplacement chauffage par pompe à chaleur",
            "description": "Substitution du chauffage fossile par une PAC air/eau ou géothermique pour diviser par 3 à 4 la consommation.",
            "phase": 5,
            "priorite": "Haute" if conso_gaz > 30000 else "Moyenne",
            "economie_estimee": "50-70% sur le chauffage",
            "delai": "3-6 mois",
            "roi": "5-10 ans",
            "categorie": "Chauffage",
            "top": conso_gaz > 40000,
            "pourquoi": f"Votre chauffage au {energy.get('type_chauffage')} consomme {round(conso_gaz):,} kWh/an ({round(cout_gaz):,} €/an). Une PAC avec un COP de 3.5 réduirait ce poste de plus de 60%.".replace(",", " "),
        })

    # ================================================================
    # TRI FINAL : priorité Haute → Moyenne → Basse, puis phase croissante
    # ================================================================
    ordre_priorite = {"Haute": 0, "Moyenne": 1, "Basse": 2}
    recs.sort(key=lambda r: (ordre_priorite.get(r["priorite"], 3), r["phase"]))

    return recs
