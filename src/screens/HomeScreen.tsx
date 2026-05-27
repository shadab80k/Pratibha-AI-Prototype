import {
  Mic,
  Users,
  Sparkles,
  FileText,
  CalendarCheck,
  PlusCircle,
  Bell,
  CloudOff,
  Wifi,
  ChevronRight,
  TrendingUp,
  Clock,
  Heart,
} from 'lucide-react';
import type { Screen } from '../App';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  onChildSelect?: (childId: string) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  notificationCount: number;
  onNotificationClick: () => void;
  onOpenSidebar: () => void;
  childrenList: any[];
  visitsList: any[];
  workerName: string;
}

const quickActions = [
  { label: 'Record\nAttendance', labelHi: 'उपस्थिति', icon: CalendarCheck, color: 'bg-emerald-500', screen: 'children' as Screen },
  { label: 'Start\nActivity', labelHi: 'गतिविधि', icon: Sparkles, color: 'bg-violet-500', screen: 'activities' as Screen },
  { label: 'Voice\nReport', labelHi: 'आवाज़ रिपोर्ट', icon: Mic, color: 'bg-orange-500', screen: 'voice-report' as Screen },
  { label: 'Add\nObservation', labelHi: 'टिप्पणी', icon: PlusCircle, color: 'bg-sky-500', screen: 'children' as Screen },
];

const alerts = [
  { icon: Users, text: '3 children absent for 5+ days', color: 'text-red-500', bg: 'bg-red-50' },
  { icon: FileText, text: 'Nutrition update pending', color: 'text-amber-500', bg: 'bg-amber-50' },
];

export function HomeScreen({
  onNavigate,
  onChildSelect: _onChildSelect,
  isOffline,
  onToggleOffline,
  notificationCount,
  onNotificationClick,
  onOpenSidebar,
  childrenList,
  visitsList,
  workerName,
}: HomeScreenProps) {
  const presentCount = childrenList.filter((c) => c.attendance === 'present').length;
  const totalCount = childrenList.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 1000) / 10 : 0;
  const goodNutritionCount = childrenList.filter((c) => c.nutritionStatus === 'good').length;
  
  // Calculate pending visits dynamically from visitsList state
  const pendingVisitsCount = visitsList.filter((v) => v.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onOpenSidebar}
            className="flex items-center gap-3 text-left active:scale-95 transition-transform outline-none"
          >
            <img
              src="/worker-sunita.png"
              alt="Sunita"
              className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
            />
            <div>
              <p className="text-xs text-gray-400">Welcome</p>
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Namaste {workerName}</h2>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleOffline}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle offline mode"
            >
              {isOffline ? (
                <CloudOff size={20} className="text-gray-400" />
              ) : (
                <Wifi size={20} className="text-emerald-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={onNotificationClick}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell size={20} className="text-gray-650 dark:text-slate-350" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Offline Banner */}
        {isOffline && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-850 rounded-xl border border-transparent dark:border-slate-800">
            <CloudOff size={16} className="text-gray-500 dark:text-slate-400" />
            <p className="text-xs text-gray-500 dark:text-slate-400 flex-1 font-medium">Offline mode - Sandbox local sync active</p>
            <span className="text-[9px] bg-amber-500/20 dark:bg-amber-500/10 px-2 py-0.5 rounded-full text-amber-700 dark:text-amber-450 font-bold">Auto-sync</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs text-gray-400 font-medium">Attendance</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {presentCount}
              <span className="text-sm font-normal text-gray-400">/{totalCount}</span>
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-450 mt-1 font-medium">{attendanceRate}% present today</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-950/30 rounded-lg flex items-center justify-center">
                <Heart size={16} className="text-amber-600 dark:text-amber-405" />
              </div>
              <span className="text-xs text-gray-400 font-medium">Nutrition</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {goodNutritionCount}
              <span className="text-sm font-normal text-gray-400">/{totalCount}</span>
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-450 mt-1 font-medium">Good status</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => onNavigate(action.screen)}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform select-none"
                >
                  <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center shadow-md`}>
                    <Icon size={24} className="text-white" strokeWidth={2} />
                  </div>
                  <span className="text-[11px] text-gray-600 dark:text-slate-350 text-center leading-tight whitespace-pre-line font-medium">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Activity Suggestion */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-violet-500/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-violet-200" />
                <span className="text-xs font-medium text-violet-200">AI Recommended</span>
              </div>
              <h4 className="text-base font-semibold mb-1">Story Circle Activity</h4>
              <p className="text-xs text-violet-100 leading-relaxed">
                Based on recent observations, Rani and 3 others would benefit from language-focused group reading.
              </p>
              <button
                onClick={() => onNavigate('activities')}
                className="mt-3 px-4 py-2 bg-white/20 rounded-xl text-xs font-medium active:bg-white/30 transition-colors"
              >
                View Activity
              </button>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 ml-3">
              <BookIcon size={28} className="text-white" />
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">Reminders</h3>
            {pendingVisitsCount > 0 && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold">
                {pendingVisitsCount} Visits Pending
              </span>
            )}
          </div>
          {alerts.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <button
                key={i}
                onClick={() => onNavigate('children')}
                className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-transform text-left"
              >
                <div className={`w-10 h-10 ${alert.bg} dark:bg-slate-950 rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={alert.color} />
                </div>
                <span className="text-sm text-gray-700 dark:text-slate-300 flex-1">{alert.text}</span>
                <ChevronRight size={16} className="text-gray-300 dark:text-slate-500" />
              </button>
            );
          })}
        </div>

        {/* Daily Insight */}
        <div className="bg-orange-50 dark:bg-orange-955/20 rounded-2xl p-4 border border-orange-105 dark:border-orange-900/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-orange-500" />
            <span className="text-xs font-medium text-orange-600 dark:text-orange-450">Today&apos;s Insight</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
            &ldquo;Rani&apos;s participation in language activities has improved by 40% this week. 
            Keep encouraging group storytelling!&rdquo;
          </p>
        </div>

        {/* Time Saved Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-emerald-600 dark:text-emerald-450" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-800 dark:text-white">90 minutes saved</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">of reporting time this week</p>
            </div>
            <button
              onClick={() => onNavigate('impact')}
              className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg active:bg-emerald-650 transition-colors"
            >
              View
            </button>
          </div>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-center gap-2 py-2">
          <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-gray-400' : 'bg-emerald-500 animate-pulse'}`} />
          <p className="text-[11px] text-gray-400 dark:text-slate-500">
            {isOffline ? 'Last synced: 2 hours ago' : 'Synced just now'}
          </p>
        </div>
      </div>
    </div>
  );
}

function BookIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
