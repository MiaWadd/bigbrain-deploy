import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

const BACKEND_PORT = 5005;
const API_URL = `http://localhost:${BACKEND_PORT}`;

// Mocks
const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

vi.mock('axios');

import Results from '../pages/Results';

describe('Results Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => {
        if (key === 'playerId') return 'mock-player-id';
        if (key === 'points') return '10,20';
        if (key === 'duration') return '10,10';
        return null;
      }),
      setItem: vi.fn(),
    });
  });

  it('Redirects to /join if playerId is missing', async () => {
    localStorage.getItem = vi.fn((key) => null);
    render(
      <MemoryRouter>
        <Results />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/join');
    });
  });

  it('Fetches and displays results correctly when playerId exists', async () => {
    const mockResults = [
      {
        questionStartedAt: new Date(Date.now() - 5000).toISOString(),
        answeredAt: new Date().toISOString(),
        correct: true,
      },
      {
        questionStartedAt: new Date(Date.now() - 7000).toISOString(),
        answeredAt: new Date().toISOString(),
        correct: false,
      },
    ];
    axios.get.mockResolvedValue({ data: mockResults });
    render(
      <MemoryRouter>
        <Results />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        `${API_URL}/play/mock-player-id/results`
      );
      expect(screen.getByText(/Your Results/i)).toBeInTheDocument();
      expect(screen.getByText(/Question 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Question 2/i)).toBeInTheDocument();
    });
  });

  it('Redirects to /lobby if session has not started yet', async () => {
    axios.get.mockRejectedValue({
      response: {
        data: { error: 'Session has not started yet' },
      },
    });
    render(
      <MemoryRouter>
        <Results />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/lobby');
    });
  });

  it('Redirects to /play if session is ongoing', async () => {
    axios.get.mockRejectedValue({
      response: {
        data: { error: 'Session is ongoing, cannot get results yet' },
      },
    });
    render(
      <MemoryRouter>
        <Results />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/play');
    });
  });

  it('Displays generic error if unknown error occurs', async () => {
    axios.get.mockRejectedValue({
      response: {
        data: { error: 'Unexpected server error' },
      },
    });
    render(
      <MemoryRouter>
        <Results />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/Unexpected server error/i)).toBeInTheDocument();
    });
  });
});
