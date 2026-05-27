import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onStart: () => void;
}

export function SplashScreen({ onStart }: SplashScreenProps) {
  const [loaded, setLoaded] = useState(false);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLoaded(true), 300);
    const t2 = setTimeout(() => setPulsing(true), 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-orange-50 via-amber-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 px-6 py-12 transition-colors duration-300">
      {/* Top section - Logo */}
      <div
        className={`flex flex-col items-center transition-all duration-700 ${
          loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-none mb-4">
          <Sparkles size={36} className="text-white" strokeWidth={2} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Pratibha AI</h1>
      </div>

      {/* Middle section - Illustration */}
      <div
        className={`flex-1 flex items-center justify-center w-full max-w-[320px] transition-all duration-700 delay-200 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="relative w-full">
          <img
            src="/splash-illustration.jpg"
            alt="Anganwadi worker with children"
            className="w-full h-auto rounded-3xl shadow-xl object-cover"
          />
          <div className="absolute -bottom-3 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-transparent dark:border-slate-800">
            <p className="text-center text-gray-700 dark:text-slate-200 font-medium text-sm">
              Less paperwork. More child engagement.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom section - CTA */}
      <div
        className={`w-full max-w-[320px] transition-all duration-700 delay-500 ${
          loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`w-2 h-2 rounded-full bg-orange-400 ${pulsing ? 'animate-pulse' : ''}`} />
          <div className={`w-2 h-2 rounded-full bg-orange-300 ${pulsing ? 'animate-pulse delay-75' : ''}`} />
          <div className={`w-2 h-2 rounded-full bg-orange-200 ${pulsing ? 'animate-pulse delay-150' : ''}`} />
        </div>

        <button
          onClick={onStart}
          className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none active:scale-[0.97] transition-transform select-none"
        >
          Get Started
        </button>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-3 font-medium">
          Works offline even without internet
        </p>
      </div>
    </div>
  );
}
