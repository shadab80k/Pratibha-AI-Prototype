import { Home, Users, Sparkles, FileText, Bot } from 'lucide-react';
import type { Tab } from '../App';
import { useLanguage } from '../context/LanguageContext';

const tabKeys: Record<Tab, any> = {
  home: 'homeTab',
  children: 'childrenTab',
  activities: 'activitiesTab',
  reports: 'reportsTab',
  'ai-assistant': 'aiAssistantTab',
};

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  notificationCount: number;
}

const tabs: { key: Tab; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'children', label: 'Children', icon: Users },
  { key: 'activities', label: 'Activities', icon: Sparkles },
  { key: 'reports', label: 'Reports', icon: FileText },
  { key: 'ai-assistant', label: 'AI Help', icon: Bot },
];

export function BottomNav({ activeTab, onTabChange, notificationCount }: BottomNavProps) {
  const { t } = useLanguage();

  return (
    <nav className="shrink-0 h-16 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center justify-around px-2 z-50 relative">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex flex-col items-center justify-center w-16 h-full rounded-lg transition-all duration-200 select-none active:scale-95 ${
              isActive ? 'text-orange-500' : 'text-gray-400 dark:text-slate-500'
            }`}
          >
            <div className="relative">
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.5}
                className="transition-all"
              />
              {tab.key === 'home' && notificationCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-orange-500' : 'text-gray-400 dark:text-slate-500'}`}>
              {t(tabKeys[tab.key])}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
