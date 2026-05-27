import { useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Clock, CheckCircle2, Info, Bell, Trash2 } from 'lucide-react';
import type { Screen } from '../App';

interface NotificationsScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  onRead: () => void;
  notificationsList: any[];
  onClearNotifications: () => void;
}

const typeConfig = {
  alert: { icon: AlertTriangle, bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-100 dark:border-red-900/30', iconColor: 'text-red-500' },
  reminder: { icon: Clock, bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-100 dark:border-amber-900/30', iconColor: 'text-amber-500' },
  success: { icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-100 dark:border-emerald-900/30', iconColor: 'text-emerald-500' },
  info: { icon: Info, bg: 'bg-sky-50 dark:bg-sky-950/20', border: 'border-sky-100 dark:border-sky-900/30', iconColor: 'text-sky-500' },
};

const actionMap: Record<string, Screen> = {
  children: 'children',
  reports: 'reports',
  'home-visits': 'home-visits',
  activities: 'activities',
};

export function NotificationsScreen({ 
  onBack, 
  onNavigate, 
  onRead, 
  notificationsList, 
  onClearNotifications 
}: NotificationsScreenProps) {
  useEffect(() => {
    onRead();
  }, [onRead]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-slate-350">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Notifications</h1>
          </div>
          {notificationsList.length > 0 && (
            <button
              onClick={onClearNotifications}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded-xl text-xs font-semibold active:scale-95 transition-all"
            >
              <Trash2 size={13} />
              Clear
            </button>
          )}
        </div>
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
        {notificationsList.map((notif) => {
          const config = typeConfig[notif.type as keyof typeof typeConfig] || typeConfig.info;
          const Icon = config.icon;
          return (
            <button
              key={notif.id}
              onClick={() => {
                if (notif.action && actionMap[notif.action]) {
                  onNavigate(actionMap[notif.action]);
                }
              }}
              className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left active:scale-[0.98] transition-transform ${
                notif.read
                  ? 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800/85 opacity-70 text-slate-800 dark:text-slate-200'
                  : `${config.bg} ${config.border} text-slate-800 dark:text-white`
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                notif.read ? 'bg-gray-100 dark:bg-slate-800' : 'bg-white/80 dark:bg-slate-950/40'
              }`}>
                <Icon size={18} className={config.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold truncate pr-1">{notif.title}</h4>
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 whitespace-nowrap shrink-0">{notif.time}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
              </div>
              {!notif.read && (
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shrink-0 mt-1.5" />
              )}
            </button>
          );
        })}

        {notificationsList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 shadow-inner">
              <Bell size={36} className="text-gray-300 dark:text-slate-700" />
            </div>
            <p className="text-xs font-semibold text-gray-800 dark:text-white">All Caught Up!</p>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 max-w-[200px] mt-1 leading-relaxed">
              No new alerts or reminders. We will notify you when there are learning observations or due visits.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
