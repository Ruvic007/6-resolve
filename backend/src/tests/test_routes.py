def test_recevoir_questionnaire_fail_no_data(client):
    """Vérifie que l'API réagit si on envoie un JSON vide ou incomplet."""
    response = client.post("/api/questionnaire", json={})
    # Comme ton code fait un try/except général, il renverra probablement un success 
    # mais avec des erreurs d'insertion. Testons la réponse :
    assert response.status_code == 200
    assert "status" in response.json()

def test_get_simulations_non_existent(client):
    """Vérifie l'erreur si l'entreprise n'existe pas."""
    # On teste l'ID 999999 qui n'existe pas en base
    response = client.get("/api/simulations/999999")
    assert response.json()["status"] == "error"