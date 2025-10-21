from pathlib import Path
import os
from urllib.parse import quote_plus

from dotenv import load_dotenv, find_dotenv
from sqlalchemy import create_engine, text

# -----------------------------------------------------------
# Chargement .env au même endroit que db.py (backend/src/.env)
# -----------------------------------------------------------
# On cherche automatiquement le .env le plus proche
dotenv_path = find_dotenv(usecwd=True)
if not dotenv_path:
    # fallback: backend/.env si besoin
    dotenv_path = str(Path(__file__).resolve().parents[1] / ".env")
load_dotenv(dotenv_path=dotenv_path)

# -----------------------------------------------------------
# Récupération de la chaîne de connexion (2 stratégies)
# 1) Si DATABASE_URL est définie, on l'utilise telle quelle
# 2) Sinon on reconstruit comme dans db.py (psycopg2 + sslmode)
# -----------------------------------------------------------
database_url = os.getenv("DATABASE_URL")

if not database_url:
    USER = os.getenv("USER")
    PASSWORD = os.getenv("PASSWORD")
    HOST = os.getenv("HOST")
    PORT = os.getenv("PORT", "5432")
    DBNAME = os.getenv("DBNAME", "postgres")

    missing = [k for k, v in {
        "USER": USER, "PASSWORD": PASSWORD, "HOST": HOST, "PORT": PORT, "DBNAME": DBNAME
    }.items() if not v]
    if missing:
        raise SystemExit(
            f"❌ Variables manquantes dans .env: {', '.join(missing)} "
            "(ou bien définis DATABASE_URL directement)."
        )

    # Encodage du mot de passe pour gérer % @ ? etc.
    PASSWORD_Q = quote_plus(PASSWORD)

    # IMPORTANT: on s'aligne sur db.py → driver psycopg2 + sslmode=require
    database_url = f"postgresql+psycopg2://{USER}:{PASSWORD_Q}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

# Affichage sécurisé (on masque l'hôte/mot de passe)
masked = database_url
try:
    prefix, rest = database_url.split("@", 1)
    masked = prefix + "@<hidden>"
except Exception:
    pass

print("=" * 60)
print("🔍 Testing Database Connection (aligned with db.py)")
print("=" * 60)
print(f"Using: {masked}\n")

# -----------------------------------------------------------
# Test de connexion (SELECT version()), sans créer de tables
# -----------------------------------------------------------
try:
    engine = create_engine(database_url, pool_pre_ping=True)
    with engine.connect() as conn:
        version = conn.execute(text("SELECT version();")).fetchone()
        print("✅ Connection OK")
        print("ℹ️ PostgreSQL:", version[0])
except Exception as e:
    print("❌ Connection failed:")
    print(e)

print("\n" + "=" * 60)
