## Structure du projet

```
6ix-Resolve/
│
├── backend/
│   ├── src/
│   │   ├── database/       # Connexion et modèles SQLAlchemy
│   │   ├── routes/         # Routes API (auth, onboarding, etc.)
│   │   ├── main.py         # Point d’entrée FastAPI
│   │   └── test_connection.py
│   ├── .env
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/     # Composants React
    │   ├── pages/          # Pages principales
    │   ├── auth/           # Gestion Clerk
    │   └── layout/         # Structure / layout
    ├── .env
    ├── package.json
    └── vite.config.js
```