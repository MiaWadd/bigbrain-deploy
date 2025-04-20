import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBar from '../components/Navbar';

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('NavBar', () => {
  it('renders the Big Brain link', () => {
    renderWithRouter(<NavBar />);
    expect(screen.getByText('Big Brain')).toBeInTheDocument();
    expect(screen.getByText('Big Brain').closest('a')).toHaveAttribute('href', '/dashboard');
  });

  it('doesnt show logout button if user isnt logged in', () => {
    renderWithRouter(<NavBar />);
    const logout = screen.queryByText('Logout');
    expect(logout).not.toBeInTheDocument();
  });

  it('shows logout button when user is logged in', () => {
    renderWithRouter(<NavBar showLogout />);
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls Logout when logout button is clicked', () => {
    const mockLogout = vi.fn();
    renderWithRouter(<NavBar showLogout onLogout={mockLogout} />);
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalledOnce();
  });
});
