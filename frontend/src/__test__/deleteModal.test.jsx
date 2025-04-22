import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

describe('DeleteConfirmationModal', () => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();
  const gameName = 'Test Quiz';

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DeleteConfirmationModal
        isOpen={false}
        onClose={onClose}
        onConfirm={onConfirm}
        gameName={gameName}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        gameName={gameName}
      />
    );
    expect(screen.getByRole("heading", { name: /Delete Game/i })).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
    expect(screen.getByText(/"Test Quiz"/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete Game/i })).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        gameName={gameName}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onConfirm when Delete Game is clicked', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        gameName={gameName}
      />
    );
    expect(screen.getByRole('button', { name: /Delete Game/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Delete Game/i }));
    expect(onConfirm).toHaveBeenCalled();
  });
});
