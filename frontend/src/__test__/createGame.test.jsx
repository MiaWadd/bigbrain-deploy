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

  it('loads invalid JSON file, questions not an array', async () => {
    const mockJson = {
        "name" : "Imported Game",
        "questions": "trying somethg e;se"
    };
    const file = new File([JSON.stringify(mockJson)], 'game.json', { type: 'application/json' });
    file.text = vi.fn().mockResolvedValue(JSON.stringify(mockJson));
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    const input = screen.getByLabelText(/Upload Game Data/i);
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/Questions must be an array/i)).toBeInTheDocument();
  });

//   it('loads invalid JSON file, question feild missing', async () => {
//     const mockJson = {
//         "name": "Imported Game"
//     };
//     const file = new File([JSON.stringify(mockJson)], 'game.json', { type: 'application/json' });
//     file.text = vi.fn().mockResolvedValue(JSON.stringify(mockJson));
//     render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
//     const input = screen.getByLabelText(/Upload Game Data/i);
//     fireEvent.change(input, { target: { files: [file] } });
//     expect(await screen.findByText(/Question 1: Question text is required/i)).toBeInTheDocument();
//   });

  it('loads invalid JSON file, imvalid points', async () => {
    const mockJson = {
        "name": "Imported Game",
        "questions": [
          {
            "type": "single-choice",
            "text": "What is 2 + 2?",
            "points": "string",
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
    expect(await screen.findByText(/Question 1: Points must be a positive integer/i)).toBeInTheDocument();
  });

  it('loads invalid JSON file, invalid duration', async () => {
    const mockJson = {
        "name": "Imported Game",
        "questions": [
          {
            "type": "single-choice",
            "text": "What is 2 + 2?",
            "points": 10,
            "duration": -2,
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
    expect(await screen.findByText(/Question 1: Duration must be a positive integer/i)).toBeInTheDocument();
  });

  it('loads invalid JSON file, invalid answers', async () => {
    const mockJson = {
        "name": "Imported Game",
        "questions": [
          {
            "type": "single-choice",
            "text": "What is 2 + 2?",
            "points": 10,
            "duration": 30,
            "answers": [4],
            "correctAnswers": [1]
          }
        ]
    };
    const file = new File([JSON.stringify(mockJson)], 'game.json', { type: 'application/json' });
    file.text = vi.fn().mockResolvedValue(JSON.stringify(mockJson));
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    const input = screen.getByLabelText(/Upload Game Data/i);
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/Question 1: At least 2 answers are required/i)).toBeInTheDocument();
  });

  it('loads invalid JSON file, invalid answer for single-choice', async () => {
    const mockJson = {
        "name": "Imported Game",
        "questions": [
          {
            "type": "single-choice",
            "text": "What is 2 + 2?",
            "points": 10,
            "duration": 30,
            "answers": [3, 4],
            "correctAnswers": "5"
          }
        ]
    };
    const file = new File([JSON.stringify(mockJson)], 'game.json', { type: 'application/json' });
    file.text = vi.fn().mockResolvedValue(JSON.stringify(mockJson));
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    const input = screen.getByLabelText(/Upload Game Data/i);
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/Question 1: At least one correct answer is required/i)).toBeInTheDocument();
  });

  it('loads invalid JSON file, judement quesiton not 2 answers', async () => {
    const mockJson = {
        "name": "Imported Game",
        "questions": [
          {
            "type": "judgement",
            "text": "What is 2 + 2?",
            "points": 10,
            "duration": 30,
            "answers": [3, 4, 5],
            "correctAnswers": [2]
          }
        ]
    };
    const file = new File([JSON.stringify(mockJson)], 'game.json', { type: 'application/json' });
    file.text = vi.fn().mockResolvedValue(JSON.stringify(mockJson));
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    const input = screen.getByLabelText(/Upload Game Data/i);
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/Question 1: Judgement questions must have exactly 2 answers/i)).toBeInTheDocument();
  });

  it('loads invalid JSON file, judement answer not 2 answers', async () => {
    const mockJson = {
        "name": "Imported Game",
        "questions": [
          {
            "type": "judgement",
            "text": "What is 2 + 2?",
            "points": 10,
            "duration": 30,
            "answers": [3, 4],
            "correctAnswers": [0, 1]
          }
        ]
    };
    const file = new File([JSON.stringify(mockJson)], 'game.json', { type: 'application/json' });
    file.text = vi.fn().mockResolvedValue(JSON.stringify(mockJson));
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    const input = screen.getByLabelText(/Upload Game Data/i);
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/Question 1: Judgement questions must have exactly one correct answer/i)).toBeInTheDocument();
  });

  it('loads invalid JSON file, invalid answer index', async () => {
    const mockJson = {
        "name": "Imported Game",
        "questions": [
          {
            "type": "judgement",
            "text": "What is 2 + 2?",
            "points": 10,
            "duration": 30,
            "answers": [3, 4],
            "correctAnswers": [1, 2]
          }
        ]
    };
    const file = new File([JSON.stringify(mockJson)], 'game.json', { type: 'application/json' });
    file.text = vi.fn().mockResolvedValue(JSON.stringify(mockJson));
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    const input = screen.getByLabelText(/Upload Game Data/i);
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/Question 1: Invalid correct answer index/i)).toBeInTheDocument();
  });

  it('loads invalid JSON file, multiple choice for a single choice question', async () => {
    const mockJson = {
        "name": "Imported Game",
        "questions": [
          {
            "type": "single-choice",
            "text": "What is 2 + 2?",
            "points": 10,
            "duration": 30,
            "answers": [3, 4, 5],
            "correctAnswers": [1, 2]
          }
        ]
    };
    const file = new File([JSON.stringify(mockJson)], 'game.json', { type: 'application/json' });
    file.text = vi.fn().mockResolvedValue(JSON.stringify(mockJson));
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    const input = screen.getByLabelText(/Upload Game Data/i);
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/Question 1: Single choice questions must have exactly one correct answer/i)).toBeInTheDocument();
  });

  it('loads invalid JSON file, no question text', async () => {
    const mockJson = {
        "name": "Imported Game",
        "questions": [
          {
            "type": "single-choice",
            "points": 10,
            "duration": 30,
            "answers": [3, 4, 5],
            "correctAnswers": [1]
          }
        ]
    };
    const file = new File([JSON.stringify(mockJson)], 'game.json', { type: 'application/json' });
    file.text = vi.fn().mockResolvedValue(JSON.stringify(mockJson));
    render(<CreateGameModal isOpen={true} onClose={onClose} onCreateGame={onCreateGame} />);
    const input = screen.getByLabelText(/Upload Game Data/i);
    fireEvent.change(input, { target: { files: [file] } });
    expect(await screen.findByText(/Question 1: Question text is required/i)).toBeInTheDocument();
  });

});
