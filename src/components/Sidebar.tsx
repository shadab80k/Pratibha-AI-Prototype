import { useEffect, useState } from 'react';
import {
  X,
  Calendar,
  CloudOff,
  TrendingUp,
  Bell,
  LogOut,
  Moon,
  Sun,
  Wifi,
  Settings,
} from 'lucide-react';
import type { Screen } from '../App';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  workerName: string;
  workerId: string;
  anganwadiBlock: string;
}

export function Sidebar({
  isOpen,
  onClose,
  currentScreen,
  onNavigate,
  isOffline,
  onToggleOffline,
  isDarkMode,
  onToggleDarkMode,
  workerName,
  workerId,
  anganwadiBlock,
}: SidebarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted && !isOpen) return null;

  const menuItems = [
    { label: 'Home Visits Planner', screen: 'home-visits' as Screen, icon: Calendar },
    { label: 'Impact & Analytics', screen: 'impact' as Screen, icon: TrendingUp },
    { label: 'Offline Sync Center', screen: 'offline' as Screen, icon: CloudOff },
    { label: 'Notifications Hub', screen: 'notifications' as Screen, icon: Bell },
    { label: 'Settings & Preferences', screen: 'settings' as Screen, icon: Settings },
  ];

  return (
    <div className="absolute inset-0 z-50 overflow-hidden rounded-[40px] pointer-events-none select-none">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto rounded-[40px] ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Side Menu Drawer */}
      <div
        className={`absolute top-0 left-0 h-full w-[255px] bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 shadow-2xl flex flex-col pointer-events-auto rounded-l-[40px] transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDarkMode ? 'dark text-white' : 'text-slate-800'}`}
      >
        {/* Header Profile Section */}
        <div className="p-5 pb-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-tl-[40px] relative shadow-md">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 transition-all text-white"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 mt-4">
            <img
              src="/worker-sunita.png"
              alt="Sunita"
              className="w-12 h-12 rounded-full object-cover border-2 border-white/40 shadow-sm"
            />
            <div>
              <h3 className="font-bold text-base leading-tight">{workerName}</h3>
              <p className="text-[10px] text-orange-100 font-medium">Worker ID: {workerId}</p>
              <span className="inline-block mt-1 text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-medium">
                {anganwadiBlock}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Navigation scroll list */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scrollbar-hide dark:bg-slate-900">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold px-3 mb-2.5">
              Tools & Planners
            </p>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.screen;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      onNavigate(item.screen);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all active:scale-[0.98] ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
            <p className="text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold px-3 mb-3">
              Simulator Toggles
            </p>
            <div className="space-y-2">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-transparent dark:border-slate-850/50">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                  {isDarkMode ? <Moon size={14} className="text-amber-400" /> : <Sun size={14} className="text-orange-550" />}
                  Dark Theme
                </span>
                <button
                  onClick={onToggleDarkMode}
                  className={`w-9 h-5.5 rounded-full transition-colors duration-300 relative outline-none ${
                    isDarkMode ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-300 absolute top-0.5 left-0.5 ${
                      isDarkMode ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Offline Mode Toggle */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-transparent dark:border-slate-850/50">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                  {isOffline ? <CloudOff size={14} className="text-slate-400" /> : <Wifi size={14} className="text-emerald-500" />}
                  Offline Sync
                </span>
                <button
                  onClick={onToggleOffline}
                  className={`w-9 h-5.5 rounded-full transition-colors duration-300 relative outline-none ${
                    isOffline ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform duration-300 absolute top-0.5 left-0.5 ${
                      isOffline ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col gap-2">
          <button
            onClick={() => {
              onNavigate('login');
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 h-10 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-650 dark:text-red-400 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all"
          >
            <LogOut size={14} />
            Logout from Account
          </button>
          <p className="text-center text-[9px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase">
            Pratibha AI v1.2.0
          </p>
        </div>
      </div>
    </div>
  );
}
