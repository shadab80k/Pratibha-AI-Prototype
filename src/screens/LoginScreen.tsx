import { useState } from 'react';
import { CloudOff, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [workerId, setWorkerId] = useState('AW-4521');
  const [mobile, setMobile] = useState('98765 43210');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-slate-900 dark:to-slate-950 px-6 py-8 transition-colors duration-300">
      {/* Header */}
      <div className="mt-8 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-none mb-4">
          <span className="text-white text-2xl font-bold">P</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome Back!</h1>
        <p className="text-gray-505 dark:text-slate-400 mt-1">Login to your Anganwadi account</p>
      </div>

      {/* Form */}
      <div className="flex-1 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Worker ID
          </label>
          <input
            type="text"
            value={workerId}
            onChange={(e) => setWorkerId(e.target.value)}
            className="w-full h-14 px-4 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-2xl text-gray-800 dark:text-white font-medium focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="Enter Worker ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            Mobile Number
          </label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full h-14 px-4 bg-white dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-800 rounded-2xl text-gray-800 dark:text-white font-medium focus:border-orange-500 focus:outline-none transition-colors"
            placeholder="Enter Mobile Number"
          />
        </div>

        {/* Offline Info Card */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
          <CloudOff size={20} className="text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-350">Works offline completely</p>
            <p className="text-xs text-blue-600 dark:text-slate-350 mt-0.5 leading-relaxed">
              All information will sync automatically when internet becomes available. No internet needed to use the app.
            </p>
          </div>
        </div>
      </div>

      {/* Login Button */}
      <div className="mt-6">
        <button
          onClick={onLogin}
          className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none active:scale-[0.97] transition-transform select-none flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight size={20} strokeWidth={2.5} />
        </button>
        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-3 font-medium">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
