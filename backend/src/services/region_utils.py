"""
Utilitaire partagé pour la détermination de la région climatique
à partir d'un code postal français.
"""

# Départements par zone climatique (fusion des deux versions)
_REGIONS = {
    "nord": ['02', '59', '62', '80', '60', '76', '27', '14', '50', '61',  # Nord, Normandie, Oise
             '75', '77', '78', '91', '92', '93', '94', '95'],               # Île-de-France
    "est":  ['67', '68', '57', '54', '55', '88', '08', '51', '10', '52',   # Alsace, Lorraine, Champagne
             '21', '25', '39', '70', '71', '89'],                           # Bourgogne, Franche-Comté
    "ouest": ['35', '56', '29', '22', '44', '85', '17', '79', '86', '49', '72', '53',  # Bretagne, Pays de la Loire, Poitou
              '18', '28', '36', '37', '41', '45'],                                       # Centre-Val de Loire
    "mediterranee": ['83', '84', '13', '30', '34', '66', '11', '12', '48',
                     '07', '26', '38', '06', '04', '05', '2A', '2B'],       # PACA, Occitanie, Auvergne-Rhône-Alpes
}


def determiner_region(code_postal: str) -> str:
    """
    Détermine la zone climatique à partir d'un code postal.
    Retourne : 'nord' | 'est' | 'ouest' | 'sud' | 'mediterranee'
    'sud' est la valeur par défaut (Centre, Bourgogne, Auvergne...)
    """
    if not code_postal or len(str(code_postal)) < 2:
        return "sud"

    pref = str(code_postal)[:2].upper()

    for region, departements in _REGIONS.items():
        if pref in departements:
            return region

    return "sud"
