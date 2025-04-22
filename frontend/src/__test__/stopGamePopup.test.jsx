import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StopGamePopup from '../components/StopGamePopup';

describe('StopGamePopup', () => {
  it('renders the popup with expected text', () => {
    render(<StopGamePopup onClose={() => {}} onViewResults={() => {}} />);
    expect(screen.getByText(/Game Session Stopped/i)).toBeInTheDocument();
    expect(screen.getByText(/The game session has been stopped/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /View Results/i })).toBeInTheDocument();
  });

  it('calls onClose when the Close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(<StopGamePopup onClose={onCloseMock} onViewResults={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    expect(onCloseMock).toHaveBeenCalledOnce();
  });

  it('calls onViewResults when the View Results button is clicked', () => {
    const onViewResultsMock = vi.fn();
    render(<StopGamePopup onClose={() => {}} onViewResults={onViewResultsMock} />);
    fireEvent.click(screen.getByRole('button', { name: /View Results/i }));
    expect(onViewResultsMock).toHaveBeenCalledOnce();
  });
});
