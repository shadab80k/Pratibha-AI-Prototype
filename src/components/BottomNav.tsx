import { Home, Users, Sparkles, FileText, Bot } from 'lucide-react';
import type { Tab } from '../App';

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
  return (
    <nav className="shrink-0 h-16 bg-white border-t border-gray-200 flex items-center justify-around px-2 z-50 relative">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex flex-col items-center justify-center w-16 h-full rounded-lg transition-all duration-200 select-none active:scale-95 ${
              isActive ? 'text-orange-500' : 'text-gray-400'
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
            <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
