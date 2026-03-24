"""
CONFIGURATION FASTAPI — Point d'entrée du backend
==================================================

POURQUOI CONFIGURER CORS ?
---------------------------
CORS = Cross-Origin Resource Sharing.
Par défaut, un navigateur BLOQUE les requêtes vers un domaine différent.
Ex: frontend sur localhost:5173 → backend sur localhost:8000 = BLOQUÉ par le navigateur.

CORS permet au serveur de dire "j'accepte les requêtes venant de ces domaines".

POURQUOI allow_origins=["*"] EST DANGEREUX ?
---------------------------------------------
"*" signifie "j'accepte les requêtes de N'IMPORTE QUEL site internet".
Combiné avec allow_credentials=True, cela permettrait à un site malveillant
(ex: hacker.com) d'envoyer des requêtes avec les cookies de vos utilisateurs.

LA BONNE APPROCHE :
- Lister explicitement les origines autorisées (localhost en dev, votre domaine en prod)
- allow_credentials=True est OK si les origines sont explicites (pas "*")
- En production, récupérer l'origine depuis une variable d'environnement
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes.app import router as questionnaire_router
from src.routes.subventions import router as subventions_router

from src.database.db import engine, Base
from src.database.models import Company, Energy, AuditReport, SimulationPV, ThermalSimulation

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Avertissement : impossible de créer les tables : {e}")
app = FastAPI()

# Origines autorisées — à adapter selon l'environnement
# En production : mettre l'URL de votre vrai domaine dans la variable FRONTEND_URL
ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite dev (port par défaut)
    "http://localhost:5174",   # Vite dev (port alternatif si 5173 occupé)
    "http://localhost:3000",   # Create React App (si utilisé)
]

# Ajout de l'URL de production si définie dans l'environnement
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    ALLOWED_ORIGINS.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,        # Origines explicites (plus "*")
    allow_credentials=True,               # OK car les origines sont explicites
    allow_methods=["GET", "POST"],        # Seulement les méthodes utilisées
    allow_headers=["Content-Type", "Authorization"],  # Authorization pour le JWT
)

app.include_router(questionnaire_router, prefix="/api")
app.include_router(subventions_router, prefix="/api")
