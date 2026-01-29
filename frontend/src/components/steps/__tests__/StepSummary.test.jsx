import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import StepSummary from '../StepSummary';

// Mock Clerk useUser hook
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: { id: 'test-user-123' }
  })
}));

// Mock AppContext useApp hook
const mockCompleteForm = vi.fn();
vi.mock('../../AppContext', () => ({
  useApp: () => ({
    completeForm: mockCompleteForm
  })
}));

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock fetch
global.fetch = vi.fn();

describe('StepSummary', () => {
  // Données au format attendu par le nouveau composant (clés françaises)
  const mockData = {
    nom: 'Test Company',
    code_postal: '75001',
    categorie_activite: 'Services',
    sous_categorie: 'Bureaux',
    type_batiment: 'Bureau',
    annee_construction: 2010,
    surface_locaux: 500,
    surface_toit: 200,
    horaire_ouverture: '9h-18h',
    type_facture: 'mixte',
    type_chauffage: 'Pompe à chaleur',
    type_eclairage: 'LED',
    niveau_isolation: 'Bonne',
    ventilation: 'Naturelle',
    utilisation_energie_renouvelable: 'false',
    type_energie_renouvelable: '',
    monitoring_consommation: 'false',
    annee: 2024,
    conso_electricite_kwh: 10000,
    conso_gaz_kwh: 5000,
    cout_energie_euros: 2300,
    emission_co2_kg: 2000
  };

  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCompleteForm.mockClear();
  });

  it('affiche toutes les données du formulaire', () => {
    render(
      <BrowserRouter>
        <StepSummary data={mockData} onBack={mockOnBack} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('75001')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
  });

  it('affiche un titre de résumé', () => {
    render(
      <BrowserRouter>
        <StepSummary data={mockData} onBack={mockOnBack} />
      </BrowserRouter>
    );

    expect(screen.getByText(/résumé de votre audit/i)).toBeInTheDocument();
  });

  it('affiche les boutons Retour et Envoyer', () => {
    render(
      <BrowserRouter>
        <StepSummary data={mockData} onBack={mockOnBack} />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /envoyer l'audit/i })).toBeInTheDocument();
  });

  it('affiche une erreur si valeurs négatives détectées', async () => {
    const user = userEvent.setup();
    const invalidData = {
      ...mockData,
      conso_electricite_kwh: -100
    };

    render(
      <BrowserRouter>
        <StepSummary data={invalidData} onBack={mockOnBack} />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /envoyer l'audit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('négatives')
      );
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it('envoie les données à l\'API et navigue vers dashboard en cas de succès', async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success', company_id: 123 })
    });

    render(
      <BrowserRouter>
        <StepSummary data={mockData} onBack={mockOnBack} />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /envoyer l'audit/i });
    await user.click(submitButton);

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

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('succès')
      );
    });
  });

  it('affiche une erreur en cas d\'échec API', async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ status: 'error', message: 'Erreur serveur' })
    });

    render(
      <BrowserRouter>
        <StepSummary data={mockData} onBack={mockOnBack} />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /envoyer l'audit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('Erreur')
      );
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('affiche une erreur en cas d\'exception réseau', async () => {
    const user = userEvent.setup();

    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <StepSummary data={mockData} onBack={mockOnBack} />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /envoyer l'audit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('serveur')
      );
    });
  });

  it('désactive les boutons pendant la soumission', async () => {
    const user = userEvent.setup();

    // Mock fetch qui prend du temps
    fetch.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ status: 'success', company_id: 123 })
      }), 100))
    );

    render(
      <BrowserRouter>
        <StepSummary data={mockData} onBack={mockOnBack} />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /envoyer l'audit/i });
    const backButton = screen.getByRole('button', { name: /retour/i });

    expect(submitButton).not.toBeDisabled();
    expect(backButton).not.toBeDisabled();

    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(backButton).toBeDisabled();
    expect(screen.getByText(/envoi en cours/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('appelle onBack quand on clique sur Retour', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <StepSummary data={mockData} onBack={mockOnBack} />
      </BrowserRouter>
    );

    const backButton = screen.getByRole('button', { name: /retour/i });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('affiche les labels corrects pour chaque section', () => {
    render(
      <BrowserRouter>
        <StepSummary data={{ nom: 'Test Company', code_postal: '75001' }} onBack={mockOnBack} />
      </BrowserRouter>
    );

    // Vérifie que les labels du FIELD_LABELS sont utilisés
    expect(screen.getByText('Nom')).toBeInTheDocument();
    expect(screen.getByText('Code postal')).toBeInTheDocument();
    // Vérifie les sections
    expect(screen.getByText('Entreprise')).toBeInTheDocument();
  });
});
