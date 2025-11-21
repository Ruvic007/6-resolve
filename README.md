# ⚡️ 6ix-Resolve — Guide de configuration du projet

> **6ix-Resolve** est une application web full-stack qui aide les entreprises à analyser et optimiser leur consommation énergétique, dans le cadre du **CapProjet ESIEA 4A**.  
> Le projet repose sur une architecture **FastAPI + React + Supabase + Clerk**.

---

## 🧩 Aperçu du projet

| Côté | Technologie |
|------|--------------|
| **Backend** | Python 3.13 + FastAPI + SQLAlchemy |
| **Base de données** | Supabase (PostgreSQL) |
| **Frontend** | React 19 + Vite + React Router |
| **Authentification** | Clerk (`@clerk/clerk-react`) |

---

## 🛠️ Prérequis

Avant de commencer, assurez-vous d’avoir installé :

- 🐍 **Python 3.13+**
- 🟩 **Node.js** (avec `npm` ou `pnpm`)
- 🐘 **Compte Supabase** (PostgreSQL hébergé)
- 🔑 **Clés Clerk** (Publishable Key et Secret Key)

---

## ⚙️ 1. Configuration du Backend

### 📁 Navigation
```bash
cd backend
```

### 🧱 Création de l’environnement virtuel
```bash
python -m venv .venv

# Sous Windows
.venv\Scripts\activate

# Sous macOS / Linux
source .venv/bin/activate
```

### 📦 Installation des dépendances
```bash
pip install -r requirements.txt
```

### 🔐 Fichier `.env`
Créez un fichier `.env` dans le dossier `backend/` :

```env
# --- Base de données Supabase ---
USER=postgres
PASSWORD=XnC?.&EAjC5dMTR
HOST=db.osqnqpemdvnnvtacgshp.supabase.co
PORT=5432
DBNAME=postgres
DATABASE_URL=postgresql+psycopg://postgres:XnC%3F%2E%26EAjC5dMTR@db.osqnqpemdvnnvtacgshp.supabase.co:5432/postgres?sslmode=require

# --- Authentification Clerk ---
CLERK_SECRET_KEY=sk_test_frOZqstOlwpFEuvwtvl9E2dYknFlkfTs4yEBH4C2Gq
CLERK_ISSUER=https://<votre-instance>.clerk.accounts.dev
JWT_KEY="-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAp7Tm+T//PBgZBAtVcnb5
+u45wbxI8O6r04dSNbzKCOZfot+OK1yYFzGG8Yx24Y01P6fAm48+KiZaSvqHMwv2
j6v1JHjKGHO4NpBLB++yWFGJKO8+z9gGOk4p/2pm3p27JUG9xBJ7OdEydNtjiZjw
XicOpVsdwtvln3Oi82KYlrebBgrH0atImrxiiEJFsEQD88BprsYnQtBkEWK4C1KI
/IWXUJAk8XG/CNiu2PyvSu1UDjoS/US9X16ux1Lg8A4ycZteBjahgntEEHKyb+M5
IJQgDRXiJAVA41YGpLhY81c7z7gu4yyYNQp8NqKnS4tKFMCil6FEEYKoKBQqNsd9
VQIDAQAB
-----END PUBLIC KEY-----"

# --- Configuration interne ---
APP_ENV=dev
CORS_ALLOW_ORIGINS=http://localhost:5173
```

> ⚠️ Ne partagez jamais ce fichier publiquement (il contient vos identifiants réels).

### ▶️ Lancer le serveur backend
```bash
# depuis le dossier backend
python -m uvicorn main:app --reload --port 8000 --app-dir src

```

Testez ensuite : [http://localhost:8000/health](http://localhost:8000/health)  
Vous devez voir :
```json
{"status": "ok"}
```

---

## 💻 2. Configuration du Frontend

### 📁 Navigation
```bash
cd frontend
```

### 📦 Installation des dépendances
```bash
npm install
# ou
pnpm install
```

### 🔐 Fichier `.env`
Créez un fichier `frontend/.env` :
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y29taWMtbGVtdXItMi5jbGVyay5hY2NvdW50cy5kZXYk
VITE_API_BASE_URL=http://localhost:8000
```

### ▶️ Lancer le serveur frontend
```bash
npm run dev
```

Par défaut, Vite lance le serveur sur [http://localhost:5173](http://localhost:5173)

---

## 🧮 3. Vérification de la connexion Supabase

Testez la connexion à votre base de données Supabase :

```bash
python backend/src/test_connection.py
```

Sortie attendue :
```
✅ Connection OK
ℹ️ PostgreSQL: PostgreSQL 16.x on ...
```

---

## 🧱 4. Structure du projet

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

---

## ▶️ 5. Démarrer l’application complète

### Terminal 1 – Backend
```bash
cd backend
python -m uvicorn main:app --reload --port 8000 --app-dir src
```

### Terminal 2 – Frontend
```bash
cd frontend
npm run dev
```

Accédez ensuite à : [http://localhost:5173](http://localhost:5173)

---

## 🧠 Technologies et outils

| Composant | Outil |
|------------|--------|
| API REST | FastAPI |
| ORM | SQLAlchemy |
| Base de données | Supabase (PostgreSQL) |
| Authentification | Clerk |
| Frontend | React + Vite |
| Déploiement (futur) | Supabase / Render / Vercel |

---

## 🧾 Commandes essentielles

| Étape | Commande |
|--------|-----------|
| Créer l’environnement virtuel | `python -m venv .venv` |
| Activer l’environnement | `.venv\Scripts\activate` (Windows) |
| Installer les dépendances backend | `pip install -r requirements.txt` |
| Lancer le backend | `uvicorn src.main:app --reload` |
| Installer les dépendances frontend | `npm install` |
| Lancer le frontend | `npm run dev` |
| Tester la connexion DB | `python src/test_connection.py` |

---

## 🧯 Débogage rapide

| Problème | Cause probable | Solution |
|-----------|----------------|-----------|
| ❌ `could not translate host name ...` | DNS ou VPN bloque Supabase | Essayer un autre réseau ou DNS (1.1.1.1) |
| ❌ `DATABASE_URL not found` | `.env` non chargé ou mal placé | Vérifier le chemin et les variables |
| ⚠️ `CORS policy` | Origine non autorisée | Ajouter `http://localhost:5173` dans `CORS_ALLOW_ORIGINS` |
| ⚠️ `Invalid Clerk token` | Mauvaise clé / mauvais environnement | Vérifier les clés `VITE_CLERK_PUBLISHABLE_KEY` et `CLERK_SECRET_KEY` |
| ❌ `connection refused : 5432` | Port bloqué | Vérifier le pare-feu ou le proxy |

---

## ✨ Auteur

**Equipe 419**  
Étudiants à l’ESIEA
Projet CapProjet 4A — *Numérique responsable & transition énergétique*

---

© 2025 – **6ix-Resolve**  
Développé avec ❤️ en **Python(FastAPI)** + **React(JS)**
