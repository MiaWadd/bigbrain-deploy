import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SessionPopup from '../components/SessionPopup';

const mockSessionId = '123456';
const playUrl = `${window.location.origin}/join?sessionId=${mockSessionId}`;

describe('SessionPopup', () => {
  let onClose;

  beforeEach(() => {
    onClose = vi.fn();
    vi.resetAllMocks();
  });

  it('does not render if no sessionId is provided', () => {
    const { container } = render(<SessionPopup sessionId={null} onClose={onClose} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders popup if session id is provided', () => {
    render(<SessionPopup sessionId={mockSessionId} onClose={onClose} />);
    expect(screen.getByText("Game Session Started")).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockSessionId)).toBeInTheDocument();
    expect(screen.getByDisplayValue(playUrl)).toBeInTheDocument();
  });

  it('calls onClose when either close button is clicked', () => {
    render(<SessionPopup sessionId={mockSessionId} onClose={onClose} />);
    fireEvent.click(screen.getAllByRole('button', { name: /close/i })[0]);
    expect(onClose).toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole('button', { name: /Close/i })[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('copies the URL to clipboard and shows "Copied!"', async () => {
    const writeText = vi.fn();
    navigator.clipboard = { writeText };
    render(<SessionPopup sessionId={mockSessionId} onClose={onClose} />);
    fireEvent.click(screen.getByText('Copy'));
    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(playUrl);
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
    }, { timeout: 2500 }); 
  });

  it('shows error message when clipboard write fails', async () => {
    navigator.clipboard = {
      writeText: vi.fn().mockRejectedValue(new Error('fail')),
    };
    render(<SessionPopup sessionId={mockSessionId} onClose={onClose} />);
    fireEvent.click(screen.getByText('Copy'));
    await waitFor(() => {
      expect(screen.getByText('Failed to copy')).toBeInTheDocument();
    });
  });
});
