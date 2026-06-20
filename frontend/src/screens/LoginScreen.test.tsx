import { vi } from 'vitest';

// Mock Language Context
vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key: string) => {
      const messages: Record<string, string> = {
        loginTitle: 'Anganwadi login',
        emptyFieldsErr: 'Please fill out this field',
        invalidIdErr: 'Invalid worker ID format (must be AW-XXXX)',
        invalidMobileErr: 'Invalid mobile number format (must be 10 digits)',
        invalidOtpErr: 'Invalid verification code',
        loginBtn: 'Continue',
        verifyBtn: 'Verify Code',
        resendBtn: 'Resend Code'
      };
      return messages[key] || key;
    }
  })
}));

// Mock API Client
vi.mock('../lib/apiClient', () => ({
  apiCall: vi.fn(),
  API_BASE: 'http://localhost:5000/api',
  ApiError: class extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  }
}));

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginScreen } from './LoginScreen';
import { apiCall } from '../lib/apiClient';

describe('LoginScreen Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('renders the login fields and remembers inputs', () => {
    render(<LoginScreen onLogin={() => {}} />);
    
    // Default values are pre-filled in state: Worker ID AW-4521 and Mobile 9876543210
    const workerIdInput = screen.getByDisplayValue('AW-4521');
    const mobileInput = screen.getByDisplayValue('9876543210');
    
    expect(workerIdInput).toBeInTheDocument();
    expect(mobileInput).toBeInTheDocument();
  });

  it('validates Worker ID format on submit', async () => {
    render(<LoginScreen onLogin={() => {}} />);
    
    const workerIdInput = screen.getByDisplayValue('AW-4521');
    fireEvent.change(workerIdInput, { target: { value: 'AW-abc' } }); // invalid format
    
    const continueBtn = screen.getByRole('button', { name: /continue|आगे बढ़ें/i });
    fireEvent.click(continueBtn);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid worker ID format (must be AW-XXXX)')).toBeInTheDocument();
    });
  });

  it('triggers OTP send request and progresses to OTP verification step', async () => {
    const mockApi = vi.mocked(apiCall).mockResolvedValue({ success: true });
    
    render(<LoginScreen onLogin={() => {}} />);
    
    const continueBtn = screen.getByRole('button', { name: /continue|आगे बढ़ें/i });
    fireEvent.click(continueBtn);

    await waitFor(() => {
      expect(mockApi).toHaveBeenCalledWith('/auth/send-otp', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ workerId: 'AW-4521', mobile: '9876543210' })
      }));
    });

    // Step should advance to OTP entry
    await waitFor(() => {
      expect(screen.getByText('verifyOtpTitle')).toBeInTheDocument();
    });
  });

  it('triggers OTP verify request and calls onLogin on success', async () => {
    // 1. Render login screen
    const mockOnLogin = vi.fn();
    const mockApi = vi.mocked(apiCall)
      .mockResolvedValueOnce({ success: true }) // first call for send-otp
      .mockResolvedValueOnce({ token: 'mock-jwt-token', worker: { id: 'AW-4521', name: 'Sunita Ji', block: 'Block 3' } }); // second call for verify-otp

    render(<LoginScreen onLogin={mockOnLogin} />);
    
    // 2. Click continue to send OTP
    const continueBtn = screen.getByRole('button', { name: /continue|आगे बढ़ें/i });
    fireEvent.click(continueBtn);

    // Wait for step transitions to OTP
    await waitFor(() => {
      expect(screen.getByText('verifyOtpTitle')).toBeInTheDocument();
    });

    // 3. Fill OTP inputs (4 digits)
    const otpInputs = screen.getAllByRole('textbox');
    // In OTP step, textboxes correspond to the 4 OTP cells
    fireEvent.change(otpInputs[0], { target: { value: '1' } });
    fireEvent.change(otpInputs[1], { target: { value: '0' } });
    fireEvent.change(otpInputs[2], { target: { value: '0' } });
    fireEvent.change(otpInputs[3], { target: { value: '0' } });

    // 4. Click verify code button
    const verifyBtn = screen.getByRole('button', { name: /verify|सत्यापित/i });
    fireEvent.click(verifyBtn);

    // 5. Verify local storage and onLogin callback
    await waitFor(() => {
      expect(mockApi).toHaveBeenLastCalledWith('/auth/verify-otp', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ mobile: '9876543210', otp: '1000' })
      }));
      expect(mockOnLogin).toHaveBeenCalledWith('AW-4521', '9876543210', false);
    });
  });
});
