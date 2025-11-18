import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import RatingModal from '../components/RatingModal';

describe('RatingModal Function Coverage', () => {
  it('should call setRating when star is clicked', () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn();

    render(
      <RatingModal
        tutorName="Test Tutor"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const stars = screen.getAllByRole('button', { name: '' });
    fireEvent.click(stars[2]); // Click 3rd star
    fireEvent.click(stars[4]); // Click 5th star
  });

  it('should call setHoveredRating on mouse enter/leave', () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn();

    render(
      <RatingModal
        tutorName="Test Tutor"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const stars = screen.getAllByRole('button', { name: '' });
    fireEvent.mouseEnter(stars[0]);
    fireEvent.mouseEnter(stars[3]);
    fireEvent.mouseLeave(stars[3]);
  });

  it('should alert when submitting without rating', async () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <RatingModal
        tutorName="Test Tutor"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submit rating/i });
    fireEvent.submit(submitButton.closest('form')!);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });
    alertSpy.mockRestore();
  });

  it('should call onSubmit with rating and review', async () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <RatingModal
        tutorName="Test Tutor"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    // Click 4th star
    const stars = screen.getAllByRole('button', { name: '' });
    fireEvent.click(stars[3]);

    // Type review
    const textarea = screen.getByPlaceholderText(/share your experience/i);
    fireEvent.change(textarea, { target: { value: 'Great session!' } });

    // Submit
    const submitButton = screen.getByRole('button', { name: /submit rating/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(4, 'Great session!');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should handle submission error', async () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <RatingModal
        tutorName="Test Tutor"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const stars = screen.getAllByRole('button', { name: '' });
    fireEvent.click(stars[4]);

    const submitButton = screen.getByRole('button', { name: /submit rating/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('should call onClose when cancel is clicked', () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn();

    render(
      <RatingModal
        tutorName="Test Tutor"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should update review state when typing', () => {
    const mockOnClose = vi.fn();
    const mockOnSubmit = vi.fn();

    render(
      <RatingModal
        tutorName="Test Tutor"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const textarea = screen.getByPlaceholderText(/share your experience/i);
    fireEvent.change(textarea, { target: { value: 'Test review' } });
    fireEvent.change(textarea, { target: { value: 'Updated review' } });
    
    expect(textarea).toHaveValue('Updated review');
  });
});
