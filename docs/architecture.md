## Structure du projet

```
6ixResolve/
│
├── backend/
│   ├── src/
│   │   ├── database/       # Connexion et modèles SQLAlchemy
│   │   ├── routes/         # Routes API (auth, onboarding, etc.)
│   │   ├── services/       # Solar simulation
│   │   └── main.py         # Point d’entrée FastAPI
│   ├── .env
│   ├── requirements.txt
│   └── server.py
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