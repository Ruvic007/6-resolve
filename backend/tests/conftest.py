import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ajoute le dossier src au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.main import app

@pytest.fixture
def client():
    """Fixture qui fournit un client de test FastAPI."""
    return TestClient(app)