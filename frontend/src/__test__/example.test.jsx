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

import App from "../App";
import Login from "../Login"


describe("example test", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

// describe("login test", () => {
//   it ("renders login form", async () => {
//     <MemoryRouter>
//       render(<Login />)
//       console.log(screen.getByRole('submit')) 
//     </MemoryRouter>
    
//   })
// })

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
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    // expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByText("Don’t have an account?")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: "Register" })).toBeInTheDocument();
  });

  it('Updates email and password inputs', async () => {
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
  
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
  
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it("Redirects to /dashboard if token exists", () => {
    render(
      <MemoryRouter>
        <Login token={'mockToken'} updateToken={() => {}} />
      </MemoryRouter>
    );
    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it("Navigates to /home TODO dashboard after successful login", async () => {
    axios.post.mockResolvedValue({
      data: {
        token: 'mockToken123',
      }
    });    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockUpdateToken).toHaveBeenCalledWith('mockToken123');
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it("Returns an error if incorrect email or password", async () => {
    axios.post.mockRejectedValue({
      response: {
        data: {
          error: "Invalid email or password",
        },
      },
    });   
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@wrong.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'incorrect' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    // TODO
    // await waitFor(() => {
    //   expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    // });
  });
});



// describe("app test", () => {
//   it("captures the button and clicks it", async () => {
//     render(<App />);
//     const button = screen.getByText("count is 0");
//     expect(button).toBeInTheDocument();
//     await fireEvent.click(button);  // You will find await useful when you trigger events
//     expect(button).toHaveTextContent("count is 1");
//   });

//   it("captures the logos and renders them", () => {
//     render(<App />);
//     expect(screen.getByText('Vite + React')).toBeInTheDocument();
//   });
// });
