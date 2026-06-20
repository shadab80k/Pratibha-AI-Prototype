import { useState, useRef, useEffect } from 'react';
import { CloudOff, ArrowRight, ArrowLeft, ShieldAlert, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Toast } from '../components/Toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

interface LoginScreenProps {
  onLogin: (workerId: string, mobile: string, rememberMe: boolean) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { t } = useLanguage();
  const [workerId, setWorkerId] = useState('AW-4521');
  const [mobile, setMobile] = useState('9876543210');
  const [serverOtp, setServerOtp] = useState<string | null>(null);
  const [localToast, setLocalToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [savedPin] = useState(() => {
    return localStorage.getItem('pratibha_pin_code') || '';
  });
  const [savedWorkerName] = useState(() => {
    return localStorage.getItem('pratibha_worker_name') || 'Worker';
  });

  const [step, setStep] = useState<'login' | 'otp' | 'pin'>(() => {
    const rememberMeActive = localStorage.getItem('pratibha_remember_me') === 'true';
    const pinActive = localStorage.getItem('pratibha_pin_enabled') === 'true';
    return (rememberMeActive && pinActive) ? 'pin' : 'login';
  });
  
  // Validation error states
  const [errors, setErrors] = useState<{ workerId?: string; mobile?: string; otp?: string; pin?: string }>({});
  
  // Resend OTP status indicator
  const [otpSentStatus, setOtpSentStatus] = useState(false);

  // OTP inputs
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // PIN inputs
  const [pinInput, setPinInput] = useState(['', '', '', '']);
  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Focus first cell on transition to OTP screen or PIN screen
  useEffect(() => {
    if (step === 'otp') {
      const timer = setTimeout(() => {
        otpRefs[0].current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    } else if (step === 'pin') {
      const timer = setTimeout(() => {
        pinRefs[0].current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleContinue = async () => {
    const newErrors: typeof errors = {};
    const trimmedId = workerId.trim();
    const cleanMobile = mobile.trim().replace(/\s+/g, '');

    // Validate ID
    if (!trimmedId) {
      newErrors.workerId = t('emptyFieldsErr');
    } else if (!/^AW-\d+$/i.test(trimmedId)) {
      newErrors.workerId = t('invalidIdErr');
    }

    // Validate Mobile
    if (!cleanMobile) {
      newErrors.mobile = t('emptyFieldsErr');
    } else if (!/^\d{10}$/.test(cleanMobile)) {
      newErrors.mobile = t('invalidMobileErr');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      const response = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workerId: trimmedId.toUpperCase(),
          mobile: cleanMobile
        })
      });

      if (response.ok) {
        const data = await response.json();
        setServerOtp(data.otp);
        setStep('otp');
        setOtpSentStatus(false);
        setLocalToast({
          message: `OTP sent successfully! Verification code is ${data.otp}`,
          type: 'success'
        });
      } else {
        const errData = await response.json();
        setErrors({
          workerId: errData.error || 'Server validation failed'
        });
      }
    } catch (err) {
      console.warn('Backend server unreachable during OTP request. Falling back to offline mode:', err);
      // Offline fallback: go to OTP step, use mock 1234
      setServerOtp('1234');
      setStep('otp');
      setOtpSentStatus(false);
      setLocalToast({
        message: 'Working offline. Verification code: 1234',
        type: 'info'
      });
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return; // Only allow numeric inputs

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-focus next box
    if (char && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    const expectedOtp = serverOtp || '1234';

    if (otpCode !== expectedOtp) {
      setErrors({ otp: t('invalidOtpErr') });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mobile: mobile.trim(),
          otp: otpCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('pratibha_jwt', data.token);
        if (data.worker) {
          localStorage.setItem('pratibha_worker_id', data.worker.id);
          localStorage.setItem('pratibha_worker_name', data.worker.name);
          localStorage.setItem('pratibha_anganwadi_block', data.worker.block);
        }
        setErrors({});
        onLogin(workerId.trim().toUpperCase(), mobile.trim(), rememberMe);
      } else {
        const errData = await response.json();
        setErrors({ otp: errData.error || 'Server OTP verification failed' });
      }
    } catch (err) {
      console.warn('Backend server unreachable during OTP verification. Falling back to local offline mode:', err);
      // Offline fallback: continue login locally
      const cleanId = workerId.trim().toUpperCase();
      const mockName = cleanId === 'AW-1234' ? 'Saraswati Devi' : (cleanId === 'AW-4521' ? 'Sunita Ji' : 'Anganwadi Worker');
      localStorage.setItem('pratibha_worker_id', cleanId);
      localStorage.setItem('pratibha_worker_name', mockName);
      localStorage.setItem('pratibha_anganwadi_block', 'Anganwadi Block 3');
      
      setErrors({});
      onLogin(cleanId, mobile.trim(), rememberMe);
    }
  };

  const handleResend = async () => {
    setOtp(['', '', '', '']);
    setErrors({});
    
    const trimmedId = workerId.trim();
    const cleanMobile = mobile.trim().replace(/\s+/g, '');

    try {
      const response = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workerId: trimmedId.toUpperCase(),
          mobile: cleanMobile
        })
      });

      if (response.ok) {
        const data = await response.json();
        setServerOtp(data.otp);
        setOtpSentStatus(true);
        setLocalToast({
          message: `OTP resent! Verification code is ${data.otp}`,
          type: 'success'
        });
      } else {
        const errData = await response.json();
        setErrors({ otp: errData.error || 'Failed to resend OTP' });
      }
    } catch (err) {
      console.warn('Backend server unreachable during OTP resend:', err);
      setServerOtp('1234');
      setOtpSentStatus(true);
      setLocalToast({
        message: 'Resent offline. Verification code: 1234',
        type: 'info'
      });
    }

    setTimeout(() => {
      otpRefs[0].current?.focus();
    }, 50);
    setTimeout(() => setOtpSentStatus(false), 4000);
  };

  // PIN Actions
  const handlePinChange = (index: number, value: string) => {
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newPin = [...pinInput];
    newPin[index] = char;
    setPinInput(newPin);

    // Auto-focus next box
    if (char && index < 3) {
      pinRefs[index + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinInput[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handlePinVerifySubmit = () => {
    const entered = pinInput.join('');
    if (entered === savedPin) {
      setErrors({});
      const savedId = localStorage.getItem('pratibha_worker_id') || 'AW-4521';
      const savedMobile = localStorage.getItem('pratibha_mobile') || '9876543210';
      onLogin(savedId, savedMobile, true);
    } else {
      setErrors({ pin: 'Incorrect PIN code. Please try again.' });
      setPinInput(['', '', '', '']);
      setTimeout(() => {
        pinRefs[0].current?.focus();
      }, 100);
    }
  };

  const handleResetPin = () => {
    // Erase rememberMe & switch to standard login
    localStorage.removeItem('pratibha_remember_me');
    setStep('login');
    setErrors({});
    setPinInput(['', '', '', '']);
  };

  // 1. Render PIN step
  if (step === 'pin') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-slate-900 dark:to-slate-950 px-6 py-8 transition-colors duration-300">
        <div className="mt-12 mb-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-none mb-4">
            <Lock className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Enter Security PIN</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1.5 text-sm leading-relaxed">
            Welcome back, <strong className="text-orange-500 dark:text-orange-400 font-semibold">{savedWorkerName} Ji</strong>
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Please unlock to access your Anganwadi center database.</p>
        </div>

        {/* PIN Inputs */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between gap-3 max-w-[240px] mx-auto">
            {pinInput.map((digit, index) => (
              <input
                key={index}
                ref={pinRefs[index]}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(index, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-2xl border-2 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:border-orange-500 focus:outline-none transition-all ${
                  errors.pin ? 'border-red-500 bg-red-50/20' : 'border-gray-200 dark:border-slate-800'
                }`}
              />
            ))}
          </div>

          {errors.pin && (
            <p className="text-red-500 text-xs font-semibold flex items-center justify-center gap-1.5 animate-shake">
              <ShieldAlert size={14} />
              {errors.pin}
            </p>
          )}

          <div className="text-center pt-2">
            <button
              onClick={handleResetPin}
              className="text-xs text-gray-500 dark:text-slate-400 hover:text-orange-500 font-semibold transition-all"
            >
              Reset PIN via OTP verification
            </button>
          </div>
        </div>

        {/* Unlock Action */}
        <div className="mt-6">
          <button
            onClick={handlePinVerifySubmit}
            disabled={pinInput.some(d => !d)}
            className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none active:scale-[0.97] transition-transform select-none flex items-center justify-center gap-2 disabled:opacity-50"
          >
            Unlock Application
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  // 2. Render OTP Verification step
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-slate-900 dark:to-slate-950 px-6 py-8 transition-colors duration-300">
        <button
          onClick={() => {
            setStep('login');
            setErrors({});
            setOtp(['', '', '', '']);
          }}
          className="mt-4 self-start p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-slate-300 flex items-center gap-2 font-semibold text-sm outline-none"
        >
          <ArrowLeft size={18} />
          {t('back')}
        </button>

        <div className="mt-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('verifyOtpTitle')}</h1>
          <p className="text-gray-505 dark:text-slate-400 mt-1.5 text-sm leading-relaxed">
            {t('enterOtpSent', { mobile })}
          </p>
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex justify-between gap-3 max-w-[280px] mx-auto">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={otpRefs[index]}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className={`w-14 h-14 text-center text-xl font-bold rounded-2xl border-2 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:border-orange-500 focus:outline-none transition-all ${
                  errors.otp ? 'border-red-500 bg-red-50/20' : 'border-gray-200 dark:border-slate-800'
                }`}
              />
            ))}
          </div>

          {errors.otp && (
            <p className="text-red-500 text-xs font-semibold flex items-center justify-center gap-1.5 animate-shake">
              <ShieldAlert size={14} />
              {errors.otp}
            </p>
          )}

          {otpSentStatus && (
            <p className="text-emerald-600 dark:text-emerald-450 text-xs font-bold text-center animate-pulse">
              ✔ OTP resent successfully!
            </p>
          )}

          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-center">
            <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
              💡 {serverOtp ? `Verification Code: ${serverOtp}` : t('mockOtpHint')}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <button
            onClick={handleVerify}
            className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none active:scale-[0.97] transition-transform select-none flex items-center justify-center gap-2"
          >
            {t('verifyBtn')}
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>
          
          <button
            onClick={handleResend}
            className="w-full h-12 bg-gray-100 dark:bg-slate-850 hover:bg-gray-200 text-gray-700 dark:text-slate-355 font-semibold text-sm rounded-xl active:scale-[0.97] transition-transform select-none"
          >
            {t('resendBtn')}
          </button>
        </div>
      </div>
    );
  }

  // 3. Render default Login step
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-slate-900 dark:to-slate-950 px-6 py-8 transition-colors duration-300">
      <div className="mt-8 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-none mb-4">
          <span className="text-white text-2xl font-bold">P</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t('welcomeBack')}</h1>
        <p className="text-gray-505 dark:text-slate-400 mt-1 text-sm">{t('loginSubtitle')}</p>
      </div>

      <div className="flex-1 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
            {t('workerIdLabel')}
          </label>
          <input
            type="text"
            value={workerId}
            onChange={(e) => {
              setWorkerId(e.target.value);
              if (errors.workerId) setErrors(prev => ({ ...prev, workerId: undefined }));
            }}
            className={`w-full h-14 px-4 bg-white dark:bg-slate-900 border-2 rounded-2xl text-gray-800 dark:text-white font-medium focus:border-orange-500 focus:outline-none transition-colors ${
              errors.workerId ? 'border-red-500 bg-red-50/10' : 'border-gray-200 dark:border-slate-800'
            }`}
            placeholder={t('workerIdPlaceholder')}
          />
          {errors.workerId && (
            <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1.5">
              <ShieldAlert size={14} />
              {errors.workerId}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
            {t('mobileLabel')}
          </label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value);
              if (errors.mobile) setErrors(prev => ({ ...prev, mobile: undefined }));
            }}
            className={`w-full h-14 px-4 bg-white dark:bg-slate-900 border-2 rounded-2xl text-gray-800 dark:text-white font-medium focus:border-orange-500 focus:outline-none transition-colors ${
              errors.mobile ? 'border-red-500 bg-red-50/10' : 'border-gray-200 dark:border-slate-800'
            }`}
            placeholder={t('mobilePlaceholder')}
          />
          {errors.mobile && (
            <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1.5">
              <ShieldAlert size={14} />
              {errors.mobile}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 py-1">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 focus:ring-offset-0 cursor-pointer dark:bg-slate-900 dark:border-slate-800"
          />
          <label htmlFor="remember-me" className="text-xs font-semibold text-gray-650 dark:text-slate-305 cursor-pointer select-none">
            {t('rememberMe')}
          </label>
        </div>

        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
          <CloudOff size={20} className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-350">{t('offlineBannerTitle')}</p>
            <p className="text-xs text-blue-600 dark:text-slate-355 mt-0.5 leading-relaxed">
              {t('offlineBannerDesc')}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleContinue}
          className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none active:scale-[0.97] transition-transform select-none flex items-center justify-center gap-2"
        >
          {t('loginBtn')}
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
        <p className="text-center text-[10px] text-gray-400 dark:text-slate-500 mt-3 font-semibold leading-relaxed px-4">
          {t('terms')}
        </p>
      </div>

      {localToast && (
        <Toast
          message={localToast.message}
          type={localToast.type}
          onClose={() => setLocalToast(null)}
        />
      )}
    </div>
  );
}
