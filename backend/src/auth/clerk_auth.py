"""
AUTHENTIFICATION CLERK — Middleware de vérification JWT
========================================================

POURQUOI CE FICHIER EXISTE ?
-----------------------------
Clerk gère l'authentification côté FRONTEND (React).
Quand un utilisateur se connecte, Clerk lui délivre un JWT (JSON Web Token).
Ce token doit être envoyé dans CHAQUE requête vers notre API backend.
Ce fichier vérifie que ce token est valide AVANT d'exécuter un endpoint.

COMMENT ÇA MARCHE ? (le flux complet)
---------------------------------------
1. L'utilisateur se connecte via Clerk dans React
2. Clerk génère un JWT signé avec sa clé privée (côté Clerk)
3. Le frontend envoie ce token dans le header : Authorization: Bearer <token>
4. Ce middleware intercepte la requête et vérifie la signature du token
5. Pour vérifier, on télécharge la clé PUBLIQUE de Clerk (JWKS)
6. Si le token est valide → on extrait l'identifiant utilisateur (sub)
7. Cet identifiant est passé à l'endpoint → plus besoin de faire confiance au client

QU'EST-CE QU'UN JWT ?
----------------------
Un JWT est un token en 3 parties séparées par des points :
    header.payload.signature

- header   : algorithme de signature (ex: RS256)
- payload  : données (user_id, email, expiration...)
- signature: preuve que le token n'a pas été falsifié

QU'EST-CE QUE LE JWKS ?
------------------------
Clerk publie ses clés publiques à une URL publique (JWKS = JSON Web Key Set).
On les utilise pour vérifier la signature du token sans contacter Clerk à chaque fois.
URL : https://<votre-domaine-clerk>/.well-known/jwks.json

DANS FASTAPI, UNE "DEPENDENCY" (Depends)
-----------------------------------------
FastAPI permet de déclarer des dépendances sur un endpoint :
    @router.get("/dashboard/{id}")
    async def get_dashboard(user_id: str = Depends(verify_clerk_token)):
        ...

FastAPI appelle verify_clerk_token AVANT d'exécuter get_dashboard.
Si le token est invalide → 401 automatique, l'endpoint n'est jamais exécuté.
"""

import os
import httpx
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, jwk, JWTError

# HTTPBearer indique à FastAPI qu'on attend un header "Authorization: Bearer <token>"
# auto_error=False permet de gérer manuellement l'erreur (message plus clair)
security = HTTPBearer(auto_error=False)

# URL des clés publiques Clerk — extraite de votre publishable key
# La publishable key pk_test_<base64> → décoder la partie base64 → domaine Clerk
# Mettez cette valeur dans votre .env pour la changer facilement
CLERK_JWKS_URL = os.getenv(
    "CLERK_JWKS_URL",
    "https://comic-lemur-2.clerk.accounts.dev/.well-known/jwks.json"
)

# Cache en mémoire pour éviter de re-télécharger les clés à chaque requête
# En production, ajoutez une expiration (ex: rafraîchir toutes les heures)
_jwks_cache: dict | None = None


async def _get_jwks() -> dict:
    """
    Télécharge les clés publiques Clerk (une seule fois grâce au cache).

    POURQUOI UN CACHE ?
    Sans cache, on ferait une requête HTTP vers Clerk à CHAQUE appel API.
    Avec le cache, on télécharge une fois et on réutilise.
    """
    global _jwks_cache
    if _jwks_cache is None:
        async with httpx.AsyncClient() as client:
            response = await client.get(CLERK_JWKS_URL, timeout=5.0)
            response.raise_for_status()
            _jwks_cache = response.json()
    return _jwks_cache


async def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> str:
    """
    Dépendance FastAPI : vérifie le JWT Clerk et retourne le user_id.

    PARAMÈTRE :
        credentials — extrait automatiquement du header Authorization: Bearer <token>

    RETOURNE :
        str — l'identifiant Clerk de l'utilisateur (ex: "user_2abc...")

    LÈVE :
        HTTPException 401 — si le token est absent, expiré ou falsifié

    UTILISATION DANS UN ENDPOINT :
        @router.post("/questionnaire")
        async def create(user_id: str = Depends(verify_clerk_token)):
            # user_id est garanti valide ici
    """
    # 1. Vérifier que le token est bien présent dans la requête
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Token d'authentification manquant. Connectez-vous d'abord."
        )

    token = credentials.credentials

    try:
        # 2. Lire l'en-tête du token (sans vérifier) pour obtenir le "kid"
        #    Le "kid" = Key ID = identifie quelle clé Clerk a utilisé pour signer
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        # 3. Télécharger les clés publiques Clerk
        jwks = await _get_jwks()

        # 4. Trouver la clé correspondant au "kid" du token
        public_key = None
        for key_data in jwks.get("keys", []):
            if key_data.get("kid") == kid:
                public_key = jwk.construct(key_data)
                break

        if not public_key:
            raise HTTPException(
                status_code=401,
                detail="Clé de vérification introuvable. Token peut-être périmé."
            )

        # 5. Vérifier la signature et décoder le payload
        #    RS256 = algorithme asymétrique (Clerk signe avec sa clé privée,
        #    on vérifie avec la clé publique → impossible à falsifier)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_aud": False},  # Clerk n'utilise pas toujours "aud"
        )

        # 6. Extraire l'identifiant utilisateur ("sub" = subject dans un JWT)
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalide : identifiant manquant.")

        return user_id

    except JWTError as e:
        # Token expiré, signature invalide, format incorrect...
        raise HTTPException(status_code=401, detail=f"Token invalide : {str(e)}")
