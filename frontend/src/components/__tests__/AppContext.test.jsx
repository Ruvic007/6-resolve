import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, useApp } from '../AppContext';

// Composant de test qui utilise le contexte
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

describe('AppContext', () => {
  it('fournit la valeur initiale hasCompletedForm à false', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('status')).toHaveTextContent('Not Completed');
  });

  it('permet de modifier hasCompletedForm via setHasCompletedForm', async () => {
    const user = userEvent.setup();

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    const button = screen.getByRole('button', { name: /complete form/i });
    await user.click(button);

    expect(screen.getByTestId('status')).toHaveTextContent('Completed');
  });

  it('partage le state entre plusieurs composants enfants', async () => {
    const user = userEvent.setup();

    function FirstComponent() {
      const { hasCompletedForm, setHasCompletedForm } = useApp();
      return (
        <button onClick={() => setHasCompletedForm(true)}>
          Set Complete
        </button>
      );
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

    expect(screen.getByTestId('shared-status')).toHaveTextContent('Incomplete');

    const button = screen.getByRole('button', { name: /set complete/i });
    await user.click(button);

    expect(screen.getByTestId('shared-status')).toHaveTextContent('Complete');
  });
});
