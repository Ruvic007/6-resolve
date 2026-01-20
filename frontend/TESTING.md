# 🧪 Tests Unitaires Frontend - 6ix-Resolve

## 🎯 Vue d'ensemble

Ce projet utilise **Vitest** et **React Testing Library** pour les tests unitaires frontend.

### Statistiques Actuelles

```
Coverage Report:

File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|----------
All files           |  97.22% |   87.5%  |    90%  |   100%
  AppContext.jsx    |   100%  |   100%   |   100%  |   100%
  StepSummary.jsx   |  96.77% |   87.5%  |  87.5%  |   100%
```

**Tests implémentés** : 13 tests
**Tests réussis** : 13/13 ✅

---

## 🚀 Commandes Disponibles

### Lancer tous les tests

```bash
npm test
```

Lance Vitest en mode watch (re-run automatique lors des changements).

### Lancer tests avec UI interactive

```bash
npm run test:ui
```

Ouvre une interface web pour visualiser et débugger les tests.

### Générer rapport de coverage

```bash
npm run test:coverage
```

Génère un rapport de couverture de code dans `coverage/`.

### Lancer tests une seule fois (CI)

```bash
npm test -- --run
```

### Lancer un fichier spécifique

```bash
npm test -- AppContext
```

---

## 📁 Structure des Tests

```
frontend/
├── src/
│   ├── components/
│   │   ├── __tests__/
│   │   │   └── AppContext.test.jsx
│   │   └── steps/
│   │       └── __tests__/
│   │           └── StepSummary.test.jsx
│   └── test/
│       └── setup.js
├── coverage/               (généré par test:coverage)
├── vite.config.js         (configuration Vitest)
└── package.json
```

---

## 🧩 Stack de Test

- **Vitest** 4.0.17 - Test runner (compatible avec Jest API)
- **@testing-library/react** 16.3.2 - Utilitaires pour tester React
- **@testing-library/user-event** 14.6.1 - Simuler interactions utilisateur
- **@testing-library/jest-dom** 6.9.1 - Matchers custom (toBeInTheDocument, etc.)
- **jsdom** 27.4.0 - Simuler DOM dans Node.js
- **@vitest/coverage-v8** 4.0.17 - Couverture de code

---

## 📝 Exemples de Tests

### Test Simple : Composant Contexte

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, useApp } from '../AppContext';

describe('AppContext', () => {
  it('fournit la valeur initiale hasCompletedForm à false', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('status')).toHaveTextContent('Not Completed');
  });
});
```

### Test Complexe : Mock API

```javascript
import { vi } from 'vitest';

// Mock fetch global
global.fetch = vi.fn();

it('envoie les données à l\'API', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ status: 'success' })
  });

  // ... render component
  // ... user interactions

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/questionnaire',
      expect.objectContaining({ method: 'POST' })
    );
  });
});
```

---

## ✅ Bonnes Pratiques Appliquées

### 1. Tester le Comportement, pas l'Implémentation

```javascript
// ✅ BON
expect(screen.getByText('Total: 1500€')).toBeInTheDocument();

// ❌ ÉVITER
expect(component.state.total).toBe(1500);
```

### 2. Utiliser des Queries Accessibles

```javascript
// ✅ BON (accessibilité)
screen.getByRole('button', { name: /envoyer/i });

// ❌ MOINS BON
screen.getByTestId('submit-btn');
```

### 3. AAA Pattern (Arrange-Act-Assert)

```javascript
it('test description', () => {
  // Arrange : préparer
  const mockData = { ... };

  // Act : agir
  render(<Component data={mockData} />);

  // Assert : vérifier
  expect(...).toBe(...);
});
```

### 4. Cleanup Automatique

Le fichier `src/test/setup.js` nettoie automatiquement après chaque test :

```javascript
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

---

## 🎯 Composants Testés

### ✅ AppContext.jsx (100% coverage)

- Valeur initiale du contexte
- Modification d'état
- Partage de state entre composants

### ✅ StepSummary.jsx (96.77% coverage)

- Affichage des données
- Validation (valeurs négatives)
- Appels API (succès/erreur)
- Toast notifications
- Navigation
- États de chargement

---

## 📋 TODO : Composants à Tester

### ⭐⭐⭐ Priorité Haute

- [ ] **Dashboard.jsx** - Fetch API, graphiques Chart.js, fallback données démo
- [ ] **Audit.jsx** - Navigation multi-étapes, cumul données

### ⭐⭐ Priorité Moyenne

- [ ] **ProtectedRoute.jsx** - Authentification Clerk, redirection
- [ ] **Layout.jsx** - Navigation conditionnelle

### ⭐ Priorité Basse

- [ ] **StepCompany.jsx** - Formulaire react-hook-form
- [ ] **StepEnergy.jsx** - Formulaire react-hook-form
- [ ] **StepEquipment.jsx** - Formulaire react-hook-form

---

## 🐛 Debugging Tests

### Voir le DOM rendu

```javascript
import { screen } from '@testing-library/react';

it('test', () => {
  render(<Component />);

  // Afficher tout le DOM
  screen.debug();

  // Afficher un élément spécifique
  screen.debug(screen.getByRole('button'));
});
```

### Isoler un test

```javascript
// Lancer seulement ce test
it.only('ce test uniquement', () => {
  // ...
});

// Ignorer ce test
it.skip('ignorer ce test', () => {
  // ...
});
```

### Mode Watch

En mode `npm test`, utilisez ces raccourcis :

- **a** : Relancer tous les tests
- **f** : Relancer seulement les tests échoués
- **p** : Filtrer par nom de fichier
- **t** : Filtrer par nom de test
- **q** : Quitter

---

## 📊 Configuration Coverage

### Seuils Configurés

Dans `vite.config.js` :

```javascript
coverage: {
  thresholds: {
    statements: 70,
    branches: 60,
    functions: 70,
    lines: 70
  }
}
```

### Fichiers Exclus du Coverage

- `node_modules/`
- `src/test/`
- `**/*.config.js`
- `**/main.jsx`

### Visualiser le Rapport

Après `npm run test:coverage`, ouvrez :

```
coverage/index.html
```

---

## 🔗 Ressources

### Documentation

- [Vitest](https://vitest.dev)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [User Event](https://testing-library.com/docs/user-event/intro/)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)

### Guides

- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Best Practices](https://testingjavascript.com)

---

## 🤝 Contribution

### Ajouter un Nouveau Test

1. Créer le fichier dans `__tests__/` à côté du composant
2. Nommer le fichier `ComponentName.test.jsx`
3. Suivre le pattern AAA (Arrange-Act-Assert)
4. Ajouter des tests pour chaque cas d'usage important
5. Vérifier le coverage : `npm run test:coverage`

### Conventions de Nommage

```javascript
describe('ComponentName', () => {
  it('fait quelque chose de spécifique', () => {
    // ...
  });

  it('gère le cas d\'erreur X', () => {
    // ...
  });
});
```

---

## 📞 Support

Pour toute question sur les tests, consultez :

1. Ce README
2. Le guide complet dans Notion : [🧪 Guide Complet : Tests Unitaires Frontend](https://notion.so/...)
3. Les exemples de tests existants dans `__tests__/`

---

🚀 **Happy Testing!**
