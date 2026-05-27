import { useState } from 'react';
import { CloudOff, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [workerId, setWorkerId] = useState('AW-4521');
  const [mobile, setMobile] = useState('98765 43210');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white px-6 py-8">
      {/* Header */}
      <div className="mt-8 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 mb-4">
          <span className="text-white text-2xl font-bold">P</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Welcome Back!</h1>
        <p className="text-gray-500 mt-1">Login to your Anganwadi account</p>
      </div>

      {/* Form */}
      <div className="flex-1 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Worker ID
          </label>
          <input
            type="text"
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-800 font-medium focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="Enter Worker ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number
          </label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-800 font-medium focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="Enter Mobile Number"
          />
        </div>

        {/* Offline Info Card */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <CloudOff size={20} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Works offline completely</p>
            <p className="text-xs text-blue-600 mt-0.5">
              All information will sync automatically when internet becomes available. No internet needed to use the app.
            </p>
          </div>
        </div>
      </div>

      {/* Login Button */}
      <div className="mt-6">
        <button
          onClick={onLogin}
          className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-orange-200 active:scale-[0.97] transition-transform select-none flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
