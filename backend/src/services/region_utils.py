"""
Utilitaire partagé pour la détermination de la région climatique
à partir d'un code postal français.
"""

# Départements par zone climatique (fusion des deux versions)
_REGIONS = {
    "nord": ['02', '59', '62', '80', '60', '76', '27', '14', '50', '61',  # Nord, Normandie, Oise
             '75', '77', '78', '91', '92', '93', '94', '95'],               # Île-de-France
             
    "est":  ['67', '68', '57', '54', '55', '88', '08', '51', '10', '52',   # Alsace, Lorraine, Champagne
             '21','23','42','52','63','69','73','74','90','10', '25', '39', '70', '71', '89'],  # Bourgogne, Franche-Comté

    "ouest": ['16', '17', '18', '22', '24', '29', '31', '32', '33',
              '35', '36', '37', '40', '41', '44', '46', '47', '49',
              '53', '56', '64', '65', '72', '79', '81', '82', '85', '86'],         # Centre-Val de Loire

    "mediterranee": ['06', '11', '13', '20', '2A', '2B', '30', '34', '66', '83'],    # PACA, Occitanie, Auvergne-Rhône-Alpes
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
