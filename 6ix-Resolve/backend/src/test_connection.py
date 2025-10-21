# backend/src/test_connection.py
from pathlib import Path
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os

# --- Charger les variables d'environnement ---
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_FILE)

# --- Lire l'URL depuis .env ---
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(f"DATABASE_URL non trouvée dans {ENV_FILE}")

print("=" * 60)
print("🔍 Testing Supabase Database Connection")
print("=" * 60)
print(f"Database URL: {DATABASE_URL[:DATABASE_URL.find('@')]}@<hidden>")
print()

# --- Tester la connexion ---
try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();")).fetchone()
        print("✅ Connection OK!")
        print(f"PostgreSQL version: {result[0]}")
except Exception as e:
    print("❌ Connection failed:")
    print(e)
print("\n" + "=" * 60)
