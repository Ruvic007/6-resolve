# Contenu Présentation Canva - Sprint 6ix-Resolve
## Guide de Remplissage (19-23 Janvier 2026)

**Instructions :** Copie-colle le contenu de chaque slide ci-dessous dans ton template Canva.

---

## 📋 SLIDE 1 - Page de Titre

**À MODIFIER :**
- **Sous-titre actuel :** "Energie : Vers une utilisation durable et soutenable"
- **Nouveau sous-titre :** `Plateforme d'Analyse Énergétique EcoPulse`

**Titre principal (ligne 3) à remplacer :**
- **Texte actuel :** "Présentation du MVP et Organisation"
- **Nouveau texte :** `Sprint Review - 19-23 Janvier 2026`

**À GARDER :**
- Titre "6ix & Resolve"
- Liste des membres du groupe
- Fond énergie (éoliennes)

---

## 📋 SLIDE 2 - Vue d'Ensemble Sprint

**TITRE :**
```
Accomplissements du Sprint
```

**CONTENU :**
```
🔢 6 commits majeurs fusionnés (19-23 janvier)

🎨 Frontend :
   • Dashboard énergétique complet
   • Historique des audits
   • Navigation améliorée
   • Tests 97% coverage

🔧 Backend :
   • 6 endpoints API REST
   • Simulation photovoltaïque
   • Benchmark sectoriel

✅ Tests : 18 totaux (13 frontend + 5 backend)

📊 Métriques : 881 lignes backend / 575 lignes frontend
```

---

## 📋 SLIDE 3 - Dashboard Énergétique

**TITRE :**
```
Dashboard Énergétique - Feature Phare
```

**CONTENU :**
```
4 Métriques clés :
💰 Coût Total Annuel (€)
⚡ Consommation Totale (kWh)
🌍 Impact Carbone (tonnes CO₂)
♻️ Énergie Renouvelable (%)

2 Graphiques Chart.js :
📊 Bar Chart : Consommation par usage
🍩 Doughnut Chart : Répartition des coûts

Technique :
• 419 lignes React 19 + Chart.js
• Intégration API REST dynamique
• Données temps réel depuis Supabase
```

---

## 📋 SLIDE 4 - Historique & Navigation

**TITRE :**
```
Historique des Audits & Navigation Améliorée
```

**CONTENU :**
```
Historique :
📋 Liste audits filtrée par utilisateur (Clerk)
🎯 Affichage grille avec infos détaillées
🔄 Navigation fluide vers Dashboard

Navigation :
📂 Dropdown menu "Audit" (2 options)
✨ NavLink actif avec styling dynamique
🎨 Intégration cohérente avec Layout

Code : 156 lignes
```

---

## 📋 SLIDE 5 - Tests Frontend 97%

**TITRE :**
```
Tests & Qualité - Coverage Exceptionnelle
```

**CONTENU :**
```
🎉 Objectif DÉPASSÉ : 70% → 97.22% (+27%)

Framework : Vitest + React Testing Library

13 tests écrits :
• AppContext.test.jsx (3 tests)
  → État global, partage entre composants

• StepSummary.test.jsx (10 tests)
  → Validation formulaires
  → Erreurs API, navigation
  → Boutons, callbacks

📊 Tous les thresholds dépassés :
   Statements, Branches, Functions, Lines
```

---

## 📋 SLIDE 6 - Backend API REST

**TITRE :**
```
API REST - 6 Endpoints Développés
```

**CONTENU :**
```
462 lignes app.py (FastAPI + Python 3.13)

Endpoints :
• POST /api/questionnaire
  → Multi-tables + simulation auto

• POST /api/simulation/{id}
  → Re-simulation personnalisée

• GET /api/simulations/{id}
  → Récupération simulations

• GET /api/dashboard/{id}
  → Agrégation 4 tables

• GET /api/companies
  → Liste filtrée user_id

• GET / → Health check

🗄️ Base de données : Supabase (PostgreSQL)
```

---

## 📋 SLIDE 7 - Simulation Photovoltaïque

**TITRE :**
```
Simulation Photovoltaïque Intelligente
```

**CONTENU :**
```
Classe SolarSimulation - 6 méthodes de calcul :

☀️ Production annuelle
   • 5 régions France : 850-1300 kWh/kWc/an
   • Calculs régionaux adaptés

💰 Économies annuelles
   • Autoconsommation 70% + revente surplus

🌍 Réduction CO₂
   • Facteur : 0.055 kg/kWh (France)

📈 ROI (Retour sur Investissement)
   • Seuil rentabilité : 10 ans

⚡ Puissance optimale : 0.15 kW/m²

💵 Coût installation : 1500 €/kW
```

---

## 📋 SLIDE 8 - Benchmark Sectoriel

**TITRE :**
```
Benchmark Consommation par Secteur
```

**CONTENU :**
```
Service benchmark.py (68 lignes)

Fonctionnalités :
📂 Analyse CSV consommation tertiaire

🏷️ 39 catégories secteurs d'activité
   • Commerce, Bureau, Enseignement
   • Santé, Hôtellerie, Restauration
   • Industrie, Entrepôts, etc.

📐 Normalisation : conso/m²
   • Comparaison réel vs théorique
   • Identification écarts

✅ Intégré dans POST /api/questionnaire
   • Données benchmark dans réponse API
```

---

## 📋 SLIDE 9 - Tests Backend & CI/CD

**TITRE :**
```
Tests Backend & Pipeline CI/CD
```

**CONTENU :**
```
5 tests backend (pytest) :

✅ test_determiner_region()
   → Validation région par code postal

✅ test_estimer_production()
   → Calculs production photovoltaïque

✅ test_calculer_roi_non_rentable()
   → Validation ROI négatif

✅ test_recevoir_questionnaire_fail_no_data()
   → Robustesse données manquantes

✅ test_get_simulations_non_existent()
   → Gestion erreurs

Pipeline GitLab CI/CD :
🔄 Linter pylint automatique
📛 Badge qualité SVG généré
⚙️ Job exécuté sur chaque push
```

---

## 📋 SLIDE 10 - Architecture

**TITRE :**
```
Architecture & Base de Données
```

**CONTENU :**
```
Schéma 4 couches (Draw.io) :

💻 Ordinateur (Dev)
   • VSCode, Git, outils développement

🎨 Client (React 19 + Clerk)
   • Interface utilisateur responsive
   • Authentification JWT

⚙️ Serveur (FastAPI + Python 3.13)
   • API REST, logique métier
   • Simulation PV, Benchmark

🗄️ BDD (Supabase PostgreSQL)
   • 4 tables : companies, energytypes,
     energyusage, simulations_pv

Stack : React + Vite + FastAPI + Clerk + Supabase
```

---

## 📋 SLIDE 11 - Sécurité

**TITRE :**
```
Sécurité & Bonnes Pratiques
```

**CONTENU :**
```
Mesures de sécurité :

🔐 .env supprimé du versioning
   • Ajout .env.example pour documentation
   • Protection credentials Supabase + Clerk

✅ Validation formulaires
   • min="0" sur champs numériques
   • Pas de valeurs négatives acceptées

🔔 Toast notifications (react-toastify)
   • Retours utilisateur temps réel
   • Success, error, warning

🔑 Authentification Clerk (JWT)
   • Sessions sécurisées
   • Routes protégées

📂 .gitignore mis à jour
   • coverage/, .claude/, node_modules/
```

---

## 📋 SLIDE 12 - Métriques & Roadmap

**TITRE :**
```
Résultats Sprint & Prochaines Étapes
```

**CONTENU :**
```
Métriques Sprint :
📝 881 lignes backend / 575 lignes frontend
✅ 18 tests totaux (13 frontend + 5 backend)
🎯 97.22% coverage frontend (objectif dépassé)
🔢 6 commits majeurs fusionnés

Prochaines Étapes :

📊 Filtres Dashboard
   • Filtrage par période, secteur

📥 Export rapports
   • PDF/Excel des audits énergétiques

📈 Graphiques évolution
   • Suivi temporel consommation

🧪 Coverage backend
   • Objectif : 80%+ avec pytest-cov

🚀 Déploiement production
   • Vercel (frontend) + Railway (backend)
```

---

## 📋 SLIDE 13 - Merci

**À GARDER TEL QUEL :**
```
Merci pour votre écoute

Avez-vous des questions ?
```

(Conserver le fond énergie et le design existant)

---

## ✅ Checklist Vérification

Après avoir rempli toutes les slides :

**Contenu :**
- [ ] Slide 1 : Titre adapté "Sprint Review 19-23 Jan"
- [ ] Slide 2 : Vue d'ensemble (6 commits, métriques)
- [ ] Slide 3 : Dashboard (4 métriques, 419 lignes)
- [ ] Slide 4 : Historique & Navigation (156 lignes)
- [ ] Slide 5 : Tests Frontend 97%
- [ ] Slide 6 : API REST 6 endpoints (462 lignes)
- [ ] Slide 7 : Simulation PV (6 méthodes)
- [ ] Slide 8 : Benchmark (39 catégories)
- [ ] Slide 9 : Tests Backend + CI/CD
- [ ] Slide 10 : Architecture 4 couches
- [ ] Slide 11 : Sécurité
- [ ] Slide 12 : Métriques + Roadmap
- [ ] Slide 13 : Merci (inchangé)

**Qualité :**
- [ ] Métriques clés visibles : 97%, 6 commits, 18 tests
- [ ] Emojis présents pour attractivité
- [ ] Flow logique respecté
- [ ] Timing : 8-10 minutes

---

**Bon courage pour ta présentation ! 🚀**
