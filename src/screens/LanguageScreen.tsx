import { Check } from 'lucide-react';
import { languageOptions } from '../data/mockData';

interface LanguageScreenProps {
  selected: string;
  onSelect: (code: string) => void;
  onContinue: () => void;
}

export function LanguageScreen({ selected, onSelect, onContinue }: LanguageScreenProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-orange-50 to-white px-6 py-8">
      {/* Header */}
      <div className="mt-8 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Choose Your Language</h1>
        <p className="text-gray-500 mt-1">अपनी भाषा चुनें / তোমার ভাষা চয়ন কর</p>
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
                  ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                  isSelected
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {lang.label.charAt(0)}
              </div>
              <div className="flex-1">
                <p className={`text-lg font-semibold ${isSelected ? 'text-orange-700' : 'text-gray-800'}`}>
                  {lang.label}
                </p>
                <p className="text-sm text-gray-400">{lang.labelEn}</p>
              </div>
              {isSelected && (
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
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
          className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-orange-200 active:scale-[0.97] transition-transform select-none"
        >
          Continue / जारी रखें
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          You can change this anytime in settings
        </p>
      </div>
    </div>
  );
}
