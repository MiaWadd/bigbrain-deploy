import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

// Mock navigation
const mockedNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useLocation: () => ({
      search: '?sessionId=123',
    }),
  };
});

import Join from '../pages/Join';

// Mock axios
vi.mock('axios');

describe('Join Component', () => {
  beforeEach(() => {
    mockedNavigate.mockReset();
    axios.post.mockReset();
    render(
      <MemoryRouter>
        <Join />
      </MemoryRouter>
    );
    vi.spyOn(window.localStorage.__proto__, 'setItem');
    mockedNavigate.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('Renders join game form correctly', () => {
    expect(screen.getByRole('heading', { name: /Join a Game/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Session ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Join Game/i })).toBeInTheDocument();
  });

  it('Pre-fills sessionId from URL', () => {
    expect(screen.getByDisplayValue('123')).toBeInTheDocument();
  });

  it('Joins game successfully and navigates to lobby', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        playerId: '123',
      },
    });
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Player' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Join Game/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('playerId', '123');
      expect(mockedNavigate).toHaveBeenCalledWith('/lobby');
    });
  });

  it('Shows 400 error message if sessionId is invalid', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          error: 'Invalid session ID',
        },
      },
    });

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Player2' } });
    fireEvent.click(screen.getByRole('button', { name: /Join Game/i }));
    await waitFor(() => {
      expect(screen.getByText(/Invalid session ID/i)).toBeInTheDocument();
    });
  });

  it('Shows 403 error message if session is inactive', async () => {
    axios.post.mockRejectedValueOnce({
      response: {
        status: 403,
      },
    });

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Player3' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Join Game/i }));

    await waitFor(() => {
      expect(screen.getByText(/Session is not active/i)).toBeInTheDocument();
    });
  });

  it('Shows fallback error for unexpected failure', async () => {
    axios.post.mockRejectedValueOnce({
        response: {
            status: 200,
        },
      });
    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: 'Player4' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Join Game/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to join game. Please try again./i)).toBeInTheDocument();
    });
  });
});
