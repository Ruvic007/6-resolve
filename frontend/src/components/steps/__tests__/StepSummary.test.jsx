import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import StepSummary from '../StepSummary';

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
  const mockData = {
    companyName: 'Test Company',
    postalCode: '75001',
    sector: 'Services',
    buildingType: 'Bureau',
    buildingAge: 2010,
    surfaceArea: 500,
    operatingHours: 40,
    heatingType: 'Pompe à chaleur',
    lightingType: 'LED',
    insulationLevel: 'Bonne',
    ventilationType: 'Naturelle',
    electricityConsumption: 10000,
    gasConsumption: 5000,
    electricityCost: 1500,
    gasCost: 800,
    co2Emissions: 2000
  };

  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
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

    expect(screen.getByText(/résumé de votre audit énergétique/i)).toBeInTheDocument();
  });

  it('affiche les boutons Retour et Envoyer', () => {
    render(
      <BrowserRouter>
        <StepSummary data={mockData} onBack={mockOnBack} />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /retour/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /envoyer/i })).toBeInTheDocument();
  });

  it('affiche une erreur si valeurs négatives détectées', async () => {
    const user = userEvent.setup();
    const invalidData = {
      ...mockData,
      electricityConsumption: -100
    };

    render(
      <BrowserRouter>
        <StepSummary data={invalidData} onBack={mockOnBack} />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /envoyer/i });
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
      json: async () => ({ status: 'success', id: 123 })
    });

    render(
      <BrowserRouter>
        <StepSummary data={mockData} onBack={mockOnBack} />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /envoyer/i });
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

    const submitButton = screen.getByRole('button', { name: /envoyer/i });
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

    const submitButton = screen.getByRole('button', { name: /envoyer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining('serveur backend')
      );
    });
  });

  it('désactive les boutons pendant la soumission', async () => {
    const user = userEvent.setup();

    // Mock fetch qui prend du temps
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

    expect(submitButton).not.toBeDisabled();
    expect(backButton).not.toBeDisabled();

    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(backButton).toBeDisabled();
    expect(screen.getByText(/envoi\.\.\./i)).toBeInTheDocument();

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

  it('formate correctement les clés des données affichées', () => {
    render(
      <BrowserRouter>
        <StepSummary data={{ company_name: 'Test' }} onBack={mockOnBack} />
      </BrowserRouter>
    );

    // Vérifie que "company_name" est formaté en "Company Name"
    expect(screen.getByText(/Company Name/i)).toBeInTheDocument();
  });
});
