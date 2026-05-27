import { Check } from 'lucide-react';
import { languageOptions } from '../data/mockData';

interface LanguageScreenProps {
  selected: string;
  onSelect: (code: string) => void;
  onContinue: () => void;
}

export function LanguageScreen({ selected, onSelect, onContinue }: LanguageScreenProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white dark:from-slate-900 dark:to-slate-950 px-6 py-8 transition-colors duration-300">
      {/* Header */}
      <div className="mt-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Choose Your Language</h1>
        <p className="text-gray-505 dark:text-slate-400 mt-1">अपनी भाषा चुनें / তোমার ভাষা চয়ন কর</p>
      </div>

      {/* Language Cards */}
      <div className="flex-1 space-y-3">
        {languageOptions.map((lang) => {
          const isSelected = selected === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] select-none text-left ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 shadow-md shadow-orange-100 dark:shadow-none'
                  : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-750'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                  isSelected
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300'
                }`}
              >
                {lang.label.charAt(0)}
              </div>
              <div className="flex-1">
                <p className={`text-lg font-semibold ${isSelected ? 'text-orange-700 dark:text-orange-400' : 'text-gray-800 dark:text-slate-200'}`}>
                  {lang.label}
                </p>
                <p className="text-sm text-gray-450 dark:text-slate-450">{lang.labelEn}</p>
              </div>
              {isSelected && (
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                  <Check size={18} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Continue Button */}
      <div className="mt-6">
        <button
          onClick={onContinue}
          className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none active:scale-[0.97] transition-transform select-none"
        >
          Continue / जारी रखें
        </button>
        <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-3 font-medium">
          You can change this anytime in settings
        </p>
      </div>
    </div>
  );
}
