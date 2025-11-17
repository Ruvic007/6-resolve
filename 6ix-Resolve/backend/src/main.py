from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes.app import router as questionnaire_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(questionnaire_router, prefix="/api")

