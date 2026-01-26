# 📚 Explication Tests & Linter - Projet 6ix-Resolve

Guide complet pour expliquer comment fonctionnent les tests et le linting dans notre projet.

---

## 🧪 PARTIE 1 - LES TESTS FRONTEND (Vitest)

### Qu'est-ce que les tests ?

Les tests permettent de **vérifier automatiquement** que notre code fonctionne correctement. Au lieu de cliquer manuellement sur l'application pour vérifier chaque fonctionnalité, on écrit du code qui le fait pour nous.

**Avantages :**
- ✅ Détecte les bugs avant la production
- ✅ Évite les régressions (casser du code qui marchait)
- ✅ Documentation du comportement attendu
- ✅ Confiance lors des modifications

---

### Stack de Test Frontend

**Technologies utilisées :**

1. **Vitest**
   - Framework de test (comme Jest mais plus moderne et rapide)
   - Intégré avec Vite pour la rapidité
   - Syntaxe : `describe`, `it`, `expect`

2. **React Testing Library**
   - Permet de tester les composants React
   - Simule les interactions utilisateur
   - Fonctions : `render`, `screen`, `waitFor`

3. **@testing-library/user-event**
   - Simule les actions utilisateur (click, type, etc.)
   - Plus réaliste que les événements basiques

4. **jsdom**
   - Simule un navigateur dans Node.js
   - Permet de tester le DOM sans vraie page web

---

### Configuration des Tests

**Fichier : `frontend/vite.config.js`**

```javascript
test: {
  globals: true,                    // Variables globales (describe, it, expect)
  environment: 'jsdom',             // Simuler un navigateur
  setupFiles: './src/test/setup.js', // Fichier d'initialisation
  css: true,                        // Support CSS dans tests

  coverage: {
    provider: 'v8',                 // Moteur de coverage
    reporter: ['text', 'json', 'html'], // Formats de rapport
    exclude: [                      // Fichiers à ignorer
      'node_modules/',
      'src/test/',
      '**/*.config.js',
      '**/main.jsx'
    ],
    thresholds: {                   // Seuils minimum requis
      statements: 70,               // 70% des instructions
      branches: 60,                 // 60% des branches (if/else)
      functions: 70,                // 70% des fonctions
      lines: 70                     // 70% des lignes
    }
  }
}
```

**Résultat atteint : 97.22%** (bien au-dessus de l'objectif 70%) 🎉

---

### Exemple 1 - Test AppContext (État Global)

**Fichier : `frontend/src/components/__tests__/AppContext.test.jsx`**

**But :** Tester que le contexte React partage bien l'état entre composants.

**Structure du test :**

```javascript
// 1. IMPORTS
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, useApp } from '../AppContext';

// 2. COMPOSANT DE TEST
function TestComponent() {
  const { hasCompletedForm, setHasCompletedForm } = useApp();

  return (
    <div>
      <p data-testid="status">
        {hasCompletedForm ? 'Completed' : 'Not Completed'}
      </p>
      <button onClick={() => setHasCompletedForm(true)}>
        Complete Form
      </button>
    </div>
  );
}

// 3. SUITE DE TESTS
describe('AppContext', () => {

  // TEST 1 : Valeur initiale
  it('fournit la valeur initiale hasCompletedForm à false', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // ASSERTION : Vérifie que le texte est "Not Completed"
    expect(screen.getByTestId('status')).toHaveTextContent('Not Completed');
  });

  // TEST 2 : Modification d'état
  it('permet de modifier hasCompletedForm via setHasCompletedForm', async () => {
    const user = userEvent.setup();

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    // SIMULATION : Clic sur le bouton
    const button = screen.getByRole('button', { name: /complete form/i });
    await user.click(button);

    // ASSERTION : Vérifie que le texte a changé
    expect(screen.getByTestId('status')).toHaveTextContent('Completed');
  });

  // TEST 3 : Partage d'état
  it('partage le state entre plusieurs composants enfants', async () => {
    const user = userEvent.setup();

    // Deux composants qui utilisent le même contexte
    function FirstComponent() {
      const { setHasCompletedForm } = useApp();
      return <button onClick={() => setHasCompletedForm(true)}>Set Complete</button>;
    }

    function SecondComponent() {
      const { hasCompletedForm } = useApp();
      return <p data-testid="shared-status">{hasCompletedForm ? 'Complete' : 'Incomplete'}</p>;
    }

    render(
      <AppProvider>
        <FirstComponent />
        <SecondComponent />
      </AppProvider>
    );

    // Vérification initiale
    expect(screen.getByTestId('shared-status')).toHaveTextContent('Incomplete');

    // Clic sur le premier composant
    const button = screen.getByRole('button', { name: /set complete/i });
    await user.click(button);

    // Le deuxième composant doit refléter le changement
    expect(screen.getByTestId('shared-status')).toHaveTextContent('Complete');
  });
});
```

**Concepts clés :**
- `describe()` : Groupe de tests
- `it()` : Un test individuel
- `render()` : Affiche le composant dans le DOM de test
- `screen.getByTestId()` : Trouve un élément par son attribut `data-testid`
- `expect().toHaveTextContent()` : Vérifie le contenu texte
- `await user.click()` : Simule un clic utilisateur

---

### Exemple 2 - Test StepSummary (Composant Complexe)

**Fichier : `frontend/src/components/steps/__tests__/StepSummary.test.jsx`**

**But :** Tester le formulaire final qui envoie les données à l'API.

**Techniques avancées utilisées :**

#### 1. Mocking (Simulation de dépendances)

```javascript
// MOCK : Remplacer Clerk par une version simulée
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: { id: 'test-user-123' }
  })
}));

// MOCK : Remplacer fetch par une version contrôlable
global.fetch = vi.fn();

// MOCK : Remplacer toast notifications
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// MOCK : Remplacer navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});
```

**Pourquoi mocker ?**
- ❌ On ne veut PAS vraiment appeler l'API pendant les tests
- ❌ On ne veut PAS vraiment naviguer vers une autre page
- ✅ On veut CONTRÔLER le comportement pour tester différents scénarios

#### 2. beforeEach (Nettoyage entre tests)

```javascript
beforeEach(() => {
  vi.clearAllMocks();           // Réinitialise tous les mocks
  mockCompleteForm.mockClear(); // Efface l'historique d'appels
});
```

**Pourquoi ?** Les tests doivent être **indépendants**. Un test ne doit pas influencer les autres.

#### 3. Tests de Validation

```javascript
it('affiche une erreur si valeurs négatives détectées', async () => {
  const user = userEvent.setup();

  // Données INVALIDES avec consommation négative
  const invalidData = {
    ...mockData,
    electricityConsumption: -100  // ❌ Négatif interdit
  };

  render(
    <BrowserRouter>
      <StepSummary data={invalidData} onBack={mockOnBack} />
    </BrowserRouter>
  );

  const submitButton = screen.getByRole('button', { name: /envoyer/i });
  await user.click(submitButton);

  // Vérification : toast.error doit être appelé avec message contenant "négatives"
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('négatives')
    );
  });

  // Vérification : fetch ne doit PAS être appelé
  expect(fetch).not.toHaveBeenCalled();
});
```

**Concepts :**
- `waitFor()` : Attend que quelque chose se produise (asynchrone)
- `expect.stringContaining()` : Vérifie qu'une chaîne contient un mot
- `.not.toHaveBeenCalled()` : Vérifie qu'une fonction n'a PAS été appelée

#### 4. Tests d'API Success

```javascript
it('envoie les données à l\'API et navigue vers dashboard en cas de succès', async () => {
  const user = userEvent.setup();

  // SIMULATION : fetch retourne succès
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ status: 'success', id: 123 })
  });

  render(
    <BrowserRouter>
      <StepSummary data={mockData} onBack={mockOnBack} />
    </BrowserRouter>
  );

  const submitButton = screen.getByRole('button', { name: /envoyer/i });
  await user.click(submitButton);

  // Vérification : fetch a été appelé avec les bons paramètres
  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/questionnaire',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String)
      })
    );
  });

  // Vérification : toast.success a été appelé
  await waitFor(() => {
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('succès')
    );
  });
});
```

**Concepts :**
- `mockResolvedValueOnce()` : Simule une promesse résolue une fois
- `expect.objectContaining()` : Vérifie qu'un objet contient certaines propriétés
- `expect.any(String)` : N'importe quelle chaîne de caractères

#### 5. Tests d'Erreur API

```javascript
it('affiche une erreur en cas d\'échec API', async () => {
  const user = userEvent.setup();

  // SIMULATION : fetch retourne erreur
  fetch.mockResolvedValueOnce({
    ok: false,
    json: async () => ({ status: 'error', message: 'Erreur serveur' })
  });

  render(
    <BrowserRouter>
      <StepSummary data={mockData} onBack={mockOnBack} />
    </BrowserRouter>
  );

  const submitButton = screen.getByRole('button', { name: /envoyer/i });
  await user.click(submitButton);

  // Vérification : toast.error appelé
  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Erreur')
    );
  });

  // Vérification : Pas de navigation
  expect(mockNavigate).not.toHaveBeenCalled();
});
```

#### 6. Tests d'États UI

```javascript
it('désactive les boutons pendant la soumission', async () => {
  const user = userEvent.setup();

  // Mock fetch qui prend du temps (100ms)
  fetch.mockImplementationOnce(
    () => new Promise(resolve => setTimeout(() => resolve({
      ok: true,
      json: async () => ({ status: 'success' })
    }), 100))
  );

  render(
    <BrowserRouter>
      <StepSummary data={mockData} onBack={mockOnBack} />
    </BrowserRouter>
  );

  const submitButton = screen.getByRole('button', { name: /envoyer/i });
  const backButton = screen.getByRole('button', { name: /retour/i });

  // AVANT clic : boutons activés
  expect(submitButton).not.toBeDisabled();
  expect(backButton).not.toBeDisabled();

  await user.click(submitButton);

  // PENDANT soumission : boutons désactivés
  expect(submitButton).toBeDisabled();
  expect(backButton).toBeDisabled();
  expect(screen.getByText(/envoi\.\.\./i)).toBeInTheDocument();

  // APRÈS soumission : boutons réactivés
  await waitFor(() => {
    expect(submitButton).not.toBeDisabled();
  });
});
```

---

### Lancer les Tests

**Commandes :**

```bash
# Lancer tous les tests
npm run test

# Lancer avec interface graphique
npm run test:ui

# Lancer avec rapport de coverage
npm run test:coverage
```

**Résultat du coverage :**

```
File                          | % Stmts | % Branch | % Funcs | % Lines |
------------------------------|---------|----------|---------|---------|
All files                     |  97.22  |   97.22  |  97.22  |  97.22  |
 components/AppContext.jsx    | 100.00  |  100.00  | 100.00  | 100.00  |
 steps/StepSummary.jsx        |  96.77  |   96.77  |  96.77  |  96.77  |
```

---

## 🔍 PARTIE 2 - LE LINTER (ESLint pour Frontend / Pylint pour Backend)

### Qu'est-ce qu'un Linter ?

Un **linter** est un outil qui **analyse le code source** pour détecter :
- ❌ Erreurs de syntaxe
- ❌ Bugs potentiels
- ❌ Mauvaises pratiques
- ❌ Non-respect des conventions de code

**C'est comme un correcteur orthographique pour le code !**

---

### ESLint (Frontend)

**Configuration : `frontend/package.json`**

```json
{
  "scripts": {
    "lint": "eslint ."  // Analyse tous les fichiers
  },
  "devDependencies": {
    "@eslint/js": "^9.36.0",              // ESLint core
    "eslint": "^9.36.0",                  // ESLint principal
    "eslint-plugin-react-hooks": "^5.2.0", // Règles React Hooks
    "eslint-plugin-react-refresh": "^0.4.22" // Règles React Refresh
  }
}
```

**Lancer ESLint :**

```bash
npm run lint
```

**Ce qu'ESLint détecte :**

1. **Erreurs React Hooks**
   ```javascript
   // ❌ ERREUR : Hook conditionnel
   if (condition) {
     useState(0); // Hooks doivent être au top-level
   }

   // ✅ CORRECT
   const [count, setCount] = useState(0);
   if (condition) {
     setCount(count + 1);
   }
   ```

2. **Variables non utilisées**
   ```javascript
   // ❌ WARNING : variable jamais utilisée
   const unusedVariable = 42;

   // ✅ CORRECT : enlever ou utiliser
   ```

3. **Dépendances useEffect manquantes**
   ```javascript
   // ❌ WARNING : 'count' devrait être dans les dépendances
   useEffect(() => {
     console.log(count);
   }, []); // [] vide

   // ✅ CORRECT
   useEffect(() => {
     console.log(count);
   }, [count]); // count ajouté
   ```

4. **Code inaccessible**
   ```javascript
   // ❌ ERREUR : code après return
   function test() {
     return true;
     console.log('unreachable'); // Ne s'exécutera jamais
   }
   ```

**Pas de fichier de configuration ?**

Le projet n'a pas de `.eslintrc.js` ou `eslint.config.js` personnalisé visible. Cela signifie qu'ESLint utilise les **règles par défaut** fournies par :
- `@eslint/js` (règles JavaScript standards)
- `eslint-plugin-react-hooks` (règles React)
- `eslint-plugin-react-refresh` (règles Vite HMR)

---

### Pylint (Backend - CI/CD GitLab)

**Configuration : `.gitlab-ci.yml`**

```yaml
pylint:
  stage: test                           # Étape du pipeline
  image: python:latest                   # Image Docker Python

  before_script:
    - mkdir -p public/badges public/lint
    - pip3 install anybadge pylint      # Installation outils
    - pip3 install -r backend/requirements.txt
    - git clone https://gitlab.esiea.fr/.../python-file-scorer.git /opt/python-file-scorer
    - apt update && apt install bc -y  # Calculatrice bash

  script:
    # Lancer le scoring récursif sur tous les fichiers Python
    - /opt/python-file-scorer/score.sh | tee public/lint/lint.txt

    # Extraire le score final
    - tail -n 1 public/lint/lint.txt > public/badges/$CI_JOB_NAME.score

  after_script:
    # Générer un badge SVG avec couleur selon score
    - anybadge --overwrite
        --label $CI_JOB_NAME
        --value=$(cat public/badges/$CI_JOB_NAME.score)
        --file=pylint.svg
        4=red 6=orange 8=yellow 10=green

  artifacts:
    paths:
      - public       # Rapports de lint
      - pylint.svg   # Badge qualité
    when: always     # Toujours sauvegarder, même si erreur
```

**Fonctionnement :**

1. **Installation** :
   - Installe `pylint` (linter Python)
   - Installe `anybadge` (générateur de badges SVG)
   - Clone script custom `python-file-scorer` de l'ESIEA

2. **Exécution** :
   - `score.sh` analyse tous les fichiers `.py` du backend
   - Calcule un **score de 0 à 10** (10 = parfait)
   - Sauvegarde le résultat dans `public/lint/lint.txt`

3. **Badge** :
   - Score **< 4** : 🔴 Rouge (très mauvais)
   - Score **4-6** : 🟠 Orange (améliorable)
   - Score **6-8** : 🟡 Jaune (correct)
   - Score **8-10** : 🟢 Vert (excellent)

4. **Artifacts** :
   - Les rapports et badges sont **conservés** dans GitLab
   - Visibles dans l'interface GitLab CI/CD

**Ce que Pylint détecte :**

1. **Erreurs de syntaxe**
   ```python
   # ❌ ERREUR : parenthèse manquante
   def calculate(x, y:
       return x + y
   ```

2. **Variables non utilisées**
   ```python
   # ❌ WARNING : variable 'z' jamais utilisée
   def add(x, y):
       z = 5
       return x + y
   ```

3. **Conventions de nommage**
   ```python
   # ❌ WARNING : fonction devrait être en snake_case
   def CalculateTotal():
       pass

   # ✅ CORRECT
   def calculate_total():
       pass
   ```

4. **Imports non utilisés**
   ```python
   # ❌ WARNING : 'os' importé mais jamais utilisé
   import os
   import sys

   print(sys.version)  # os n'est pas utilisé
   ```

5. **Docstrings manquants**
   ```python
   # ❌ WARNING : fonction sans docstring
   def complex_calculation(x, y):
       return x ** 2 + y ** 2

   # ✅ CORRECT
   def complex_calculation(x, y):
       """Calcule la somme des carrés de x et y."""
       return x ** 2 + y ** 2
   ```

6. **Lignes trop longues**
   ```python
   # ❌ WARNING : ligne dépasse 100 caractères
   very_long_variable_name = some_function_with_many_parameters(param1, param2, param3, param4, param5)

   # ✅ CORRECT
   very_long_variable_name = some_function_with_many_parameters(
       param1, param2, param3, param4, param5
   )
   ```

**Score personnalisé ESIEA :**

Le script `python-file-scorer` fait probablement :
- Analyse récursive de tous les `.py`
- Calcul de moyenne pondérée
- Pénalités pour erreurs critiques
- Bonifications pour bonnes pratiques

---

## 📊 RÉSUMÉ - Tests vs Linter

| Aspect | Tests | Linter |
|--------|-------|--------|
| **But** | Vérifier que le code **fonctionne** | Vérifier que le code est **propre** |
| **Détecte** | Bugs logiques, régressions | Erreurs syntaxe, mauvaises pratiques |
| **Quand** | Avant commit, en CI/CD | Pendant développement, en CI/CD |
| **Exemple** | "Le bouton ne navigue pas vers Dashboard" | "Variable non utilisée" |
| **Outil Frontend** | Vitest + React Testing Library | ESLint |
| **Outil Backend** | Pytest | Pylint (GitLab CI/CD) |
| **Résultat** | ✅ 97.22% coverage | ✅ Badge SVG (score/10) |

---

## 🎯 POURQUOI C'EST IMPORTANT ?

### Tests (97% coverage)

**Impact :**
- ✅ Confiance totale lors des modifications
- ✅ Détection précoce des bugs
- ✅ Documentation vivante du code
- ✅ Facilite le travail en équipe
- ✅ Réduit les bugs en production

**Exemple concret :**
> Sans tests : Tu modifies `Dashboard.jsx` et tu casses accidentellement `Historique.jsx`. Tu ne le découvres qu'en production quand un utilisateur se plaint.
>
> Avec tests : `npm run test` détecte immédiatement l'erreur. Tu corriges avant de commit.

### Linter

**Impact :**
- ✅ Code uniforme dans toute l'équipe
- ✅ Moins d'erreurs stupides
- ✅ Meilleure lisibilité
- ✅ Facilite les code reviews
- ✅ Apprentissage des bonnes pratiques

**Exemple concret :**
> Sans linter : Chaque développeur écrit du code différemment. Les conventions sont incohérentes. Les code reviews sont compliquées.
>
> Avec linter : Tout le monde suit les mêmes règles. Le code est homogène. Plus facile à maintenir.

---

## 📝 POUR TA PRÉSENTATION

**Points à mentionner :**

### Tests (Slide 5)
```
🎉 Objectif DÉPASSÉ : 70% → 97.22% (+27%)

Framework : Vitest + React Testing Library

13 tests écrits :
• AppContext (3 tests) : État global partagé
• StepSummary (10 tests) : Validation, API, navigation

Techniques utilisées :
✅ Mocking (fetch, toast, navigation)
✅ Tests asynchrones (waitFor, async/await)
✅ Simulations utilisateur (userEvent)
✅ Vérifications assertions (expect)
```

### Linter Backend (Slide 9)
```
Pipeline GitLab CI/CD :

🔄 Linter Pylint automatique
   • Analyse tous les fichiers Python
   • Détecte erreurs syntaxe + conventions
   • Vérifie docstrings, nommage, imports

📛 Badge qualité SVG généré
   • Score 0-10 avec couleurs
   • 🔴 <4  🟠 4-6  🟡 6-8  🟢 8-10

⚙️ Job exécuté sur chaque push
   • Feedback immédiat sur qualité code
   • Artifacts sauvegardés dans GitLab
```

---

## 🚀 COMMANDES UTILES

### Frontend

```bash
# Tests
npm run test              # Lancer tous les tests
npm run test:ui           # Interface graphique
npm run test:coverage     # Rapport coverage détaillé

# Linter
npm run lint              # Analyser le code avec ESLint
```

### Backend

```bash
# Tests (si configurés avec pytest)
pytest                    # Lancer tests backend
pytest --cov              # Avec coverage

# Linter (local)
pylint backend/src/       # Analyser manuellement
```

### CI/CD

```bash
# Le pipeline GitLab lance automatiquement :
# - Pylint sur chaque push
# - Génère badge qualité
# - Sauvegarde artifacts
```

---

**Bonne explication ! 🎓**
