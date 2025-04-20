import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

// Mock navigation
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Mock axios
vi.mock('axios');

import Login from "../pages/Login"

describe("Login Component", () => {
  const mockUpdateToken = vi.fn();

  beforeEach(() => {
    mockUpdateToken.mockReset();
    render(
      <MemoryRouter>
        <Login token={null} updateToken={mockUpdateToken} />
      </MemoryRouter>
    );
  });

  it("Renders login form", async () => {
    expect(screen.getByRole("heading", { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText("Don’t have an account?")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Register/i })).toBeInTheDocument();
  });

  it('Updates email and password inputs', async () => {
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
  
    expect(screen.getByLabelText(/Email/i).value).toBe('test@example.com');
    expect(screen.getByLabelText(/Password/i).value).toBe('password123');
  });

  it("Redirects to /dashboard if token exists", () => {
    render(
      <MemoryRouter>
        <Login token={'mockToken'} updateToken={() => {}} />
      </MemoryRouter>
    );
    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it("Throws arror if token doesnt exists", async () => {
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    await waitFor(() => {
        expect(screen.getByText(/failed to login\. please try again\./i)).toBeInTheDocument();
      });
  });

  it("Navigates to /home TODO dashboard after successful login", async () => {
    axios.post.mockResolvedValue({
      data: {
        token: 'mockToken123',
      }
    });    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(mockUpdateToken).toHaveBeenCalledWith('mockToken123');
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it("Returns an error if incorrect email or password", async () => {
    axios.post.mockRejectedValue({
      response: {
        data: {
          error: "Invaild username or password",
        },
      },
    });   
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@wrong.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'incorrect' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    await waitFor(() => {
      expect(screen.getByText(/Invaild username or password/i)).toBeInTheDocument();
    });
  });
});


