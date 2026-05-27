import { useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Clock, CheckCircle2, Info, Bell } from 'lucide-react';
import { notifications } from '../data/mockData';
import type { Screen } from '../App';

interface NotificationsScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  onRead: () => void;
}

const typeConfig = {
  alert: { icon: AlertTriangle, bg: 'bg-red-50', border: 'border-red-100', iconColor: 'text-red-500' },
  reminder: { icon: Clock, bg: 'bg-amber-50', border: 'border-amber-100', iconColor: 'text-amber-500' },
  success: { icon: CheckCircle2, bg: 'bg-emerald-50', border: 'border-emerald-100', iconColor: 'text-emerald-500' },
  info: { icon: Info, bg: 'bg-sky-50', border: 'border-sky-100', iconColor: 'text-sky-500' },
};

const actionMap: Record<string, Screen> = {
  children: 'children',
  reports: 'reports',
  'home-visits': 'home-visits',
  activities: 'activities',
};

export function NotificationsScreen({ onBack, onNavigate, onRead }: NotificationsScreenProps) {
  useEffect(() => {
    onRead();
  }, [onRead]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Notifications</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-3">
        {notifications.map((notif) => {
          const config = typeConfig[notif.type];
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
                notif.read ? 'bg-white border-gray-100 opacity-70' : `${config.bg} ${config.border}`
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                notif.read ? 'bg-gray-100' : 'bg-white/80'
              }`}>
                <Icon size={18} className={config.iconColor} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-800">{notif.title}</h4>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{notif.time}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
              </div>
              {!notif.read && (
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shrink-0 mt-1.5" />
              )}
            </button>
          );
        })}

        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Bell size={48} className="text-gray-300 mb-4" />
            <p className="text-gray-400 text-sm">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
