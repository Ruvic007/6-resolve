from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes.app import router as questionnaire_router
from src.routes.subventions import router as subventions_router

from src.database.db import engine, Base
from src.database.models import Company, Energy, AuditReport, SimulationPV, ThermalSimulation

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(questionnaire_router, prefix="/api")
app.include_router(subventions_router, prefix="/api")

