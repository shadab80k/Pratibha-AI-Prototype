import React, { createContext, useContext, useState } from 'react';
import { translations, type TranslationStrings } from '../lib/translations';
import { STORAGE_KEYS } from '../lib/constants';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'mr';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: keyof TranslationStrings, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (saved === 'hi' || saved === 'en' || saved === 'bn' || saved === 'mr') {
      return saved as LanguageCode;
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  };

  const t = (key: keyof TranslationStrings, variables?: Record<string, string | number>): string => {
    const langStrings = translations[language] || translations['en'];
    let text = langStrings[key] || translations['en'][key] || String(key);
    
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
