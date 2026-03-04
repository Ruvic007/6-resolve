import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ajoute le dossier src au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.main import app
from src.auth.clerk_auth import verify_clerk_token

# --- Mock de l'authentification Clerk pour les tests ---
# Remplace verify_clerk_token par une fonction qui retourne toujours un user_id fictif.
# Cela permet de tester les routes protégées sans avoir besoin d'un vrai token JWT.
def mock_verify_clerk_token():
    return "test_user_id"

app.dependency_overrides[verify_clerk_token] = mock_verify_clerk_token


@pytest.fixture
def client():
    """Fixture qui fournit un client de test FastAPI avec auth mockée."""
    return TestClient(app)
