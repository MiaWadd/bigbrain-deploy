import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateGameModal from '../components/CreateGameModal';
import { vi } from 'vitest';

describe('CreateGameModal', () => {
  const onClose = vi.fn();
  const onCreateGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the modal when isOpen is true', () => {
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    expect(screen.getByText(/Create New Game/i)).toBeInTheDocument();
  });

  it('does not render the modal when isOpen is false', () => {
    render(<CreateGameModal isOpen={false} onClose={onClose} onCreateGame={onCreateGame} />);
    expect(screen.queryByText(/Create New Game/i)).not.toBeInTheDocument();
  });

  it('shows validation error if game name is empty and form is submitted', async () => {
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    fireEvent.click(screen.getByRole('button', { name: /Create Game/i }));
    expect(await screen.findByText(/Game name is required/i)).toBeInTheDocument();
    expect(onCreateGame).not.toHaveBeenCalled();
  });

  it('submits form and calls onCreateGame with game name', async () => {
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    
    const input = screen.getByPlaceholderText(/Enter game name/i);
    fireEvent.change(input, { target: { value: 'My Cool Game' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Game/i }));

    await waitFor(() => {
      expect(onCreateGame).toHaveBeenCalledWith({ name: 'My Cool Game' });
    });
  });

  it('loads valid JSON file and updates game name from it', async () => {
    const mockJson = {
        "name": "Imported Game",
        "questions": [
          {
            "type": "single-choice",
            "text": "What is 2 + 2?",
            "points": 10,
            "duration": 30,
            "answers": [3, 4],
            "correctAnswers": [1]
          }
        ]
    };
    const file = new File([JSON.stringify(mockJson)], 'game.json', { type: 'application/json' });
    file.text = vi.fn().mockResolvedValue(JSON.stringify(mockJson));
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    const input = screen.getByLabelText(/Upload Game Data/i);
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByDisplayValue('Imported Game')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Create Game/i }));
    await waitFor(() => {
      expect(onCreateGame).toHaveBeenCalledWith(mockJson);
    });
  });

  it('loads invalid JSON file, invalid type', async () => {
    const mockJson = {
        "name": "Imported Game",
        "questions": [
          {
            "type": "wrong-type",
            "text": "What is 2 + 2?",
            "points": 10,
            "duration": 30,
            "answers": [3, 4],
            "correctAnswers": [1]
          }
        ]
    };
    const file = new File([JSON.stringify(mockJson)], 'game.json', { type: 'application/json' });
    file.text = vi.fn().mockResolvedValue(JSON.stringify(mockJson));
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    const input = screen.getByLabelText(/Upload Game Data/i);
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/Question 1: Invalid question type/i)).toBeInTheDocument();
  });

  it('loads invalid JSON file, no name', async () => {
    const mockJson = {
        "questions": [
          {
            "type": "single-choice",
            "text": "What is 2 + 2?",
            "points": 10,
            "duration": 30,
            "answers": [3, 4],
            "correctAnswers": [1]
          }
        ]
    };
    const file = new File([JSON.stringify(mockJson)], 'game.json', { type: 'application/json' });
    file.text = vi.fn().mockResolvedValue(JSON.stringify(mockJson));
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    const input = screen.getByLabelText(/Upload Game Data/i);
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/Game name is required and must be a string/i)).toBeInTheDocument();
  });

});
