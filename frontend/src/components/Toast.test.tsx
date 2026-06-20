import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the toast message correctly', () => {
    render(<Toast message="Hello, Anganwadi!" type="success" onClose={() => {}} />);
    expect(screen.getByText('Hello, Anganwadi!')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<Toast message="Warning alert" type="warning" onClose={handleClose} />);
    
    // Find the button (it contains the X icon)
    const closeBtn = screen.getByRole('button');
    fireEvent.click(closeBtn);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('automatically triggers onClose after 3000ms', () => {
    const handleClose = vi.fn();
    render(<Toast message="Info alert" type="info" onClose={handleClose} />);
    
    expect(handleClose).not.toHaveBeenCalled();
    
    // Advance timers by 3 seconds
    vi.advanceTimersByTime(3000);
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
