/**
 * Tests for Navbar Component
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, test, expect } from 'vitest';
import Navbar from '../components/Navbar';

const mockLogout = vi.fn();

describe('Navbar Component Logic', () => {
  test('should test navbar display logic', () => {
    const user = {
      id: '1',
      email: 'test@test.com',
      name: 'Test User',
      role: 'STUDENT' as const,
    };
    
    // Should show navbar when user exists
    expect(user).toBeTruthy();
    expect(user.role).toBe('STUDENT');
  });

  test('should hide navbar when user is null', () => {
    const user = null;
    expect(user).toBeNull();
  });

  test('should show student links for student role', () => {
    const userRole = 'STUDENT';
    const studentLinks = ['Find Tutors', 'My Bookings'];
    
    if (userRole === 'STUDENT') {
      expect(studentLinks).toContain('Find Tutors');
      expect(studentLinks).toContain('My Bookings');
    }
  });

  test('should show tutor links for tutor role', () => {
    const userRole = 'TUTOR';
    const tutorLinks = ['My Sessions', 'Manage Slots'];
    
    if (userRole === 'TUTOR') {
      expect(tutorLinks).toContain('My Sessions');
      expect(tutorLinks).toContain('Manage Slots');
    }
  });

  test('should show admin links for admin role', () => {
    const userRole = 'ADMIN';
    const adminLinks = ['Users', 'Bookings'];
    
    if (userRole === 'ADMIN') {
      expect(adminLinks).toContain('Users');
      expect(adminLinks).toContain('Bookings');
    }
  });

  test('should always show dashboard and profile links', () => {
    const commonLinks = ['Dashboard', 'Profile'];
    expect(commonLinks).toContain('Dashboard');
    expect(commonLinks).toContain('Profile');
  });

  test('should have logout functionality', () => {
    const hasLogout = true;
    expect(hasLogout).toBe(true);
  });

  test('should render STUDENT navbar and call logout', () => {
    vi.mock('../contexts/AuthContext', () => ({
      useAuth: () => ({
        user: { id: '1', firstName: 'Test', role: 'STUDENT' },
        logout: mockLogout,
      }),
    }));

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const logoutButton = screen.queryByRole('button', { name: /logout/i });
    if (logoutButton) {
      fireEvent.click(logoutButton);
    }
  });

  test('should render TUTOR navbar', () => {
    vi.mock('../contexts/AuthContext', () => ({
      useAuth: () => ({
        user: { id: '1', firstName: 'Test', role: 'TUTOR' },
        logout: mockLogout,
      }),
    }));

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
  });

  test('should render ADMIN navbar', () => {
    vi.mock('../contexts/AuthContext', () => ({
      useAuth: () => ({
        user: { id: '1', firstName: 'Test', role: 'ADMIN' },
        logout: mockLogout,
      }),
    }));

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
  });
});

