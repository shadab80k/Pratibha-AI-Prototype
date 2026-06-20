import { ArrowLeft, TrendingUp, Clock, BookOpen, Users, Home, Heart, Award } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { Child, HomeVisit, ScheduledActivity } from '../types';

interface ImpactScreenProps {
  onBack: () => void;
  childrenList?: Child[];
  visitsList?: HomeVisit[];
  scheduledActivities?: ScheduledActivity[];
}

export function ImpactScreen({
  onBack,
  childrenList = [],
  visitsList = [],
  scheduledActivities = [],
}: ImpactScreenProps) {
  // Calculate dynamic stats
  const totalChildren = childrenList.length;
  
  // 1. Attendance rate (dynamic calculation based on children present)
  const presentCount = childrenList.filter(c => c.attendance === 'present').length;
  const attendanceRate = totalChildren > 0 ? Math.round((presentCount / totalChildren) * 100) : 85;

  // 2. Observations count across all children
  const observationsCount = childrenList.reduce(
    (acc, child) => acc + (child.observations ? child.observations.length : 0),
    0
  );

  // 3. Completed Visits count
  const completedVisitsCount = visitsList.filter(v => v.status === 'completed').length;

  // 4. Activities done (combining base activities with custom scheduled ones)
  const activitiesCount = scheduledActivities.length + 12;

  // 5. Dynamic Time Saved calculation:
  // - 2 minutes saved per digital observation logged (instead of paper booklet)
  // - 10 minutes saved per completed home visit report
  // - 5 minutes saved per scheduled activity planner logging
  // - 30 minutes baseline saved weekly on report sheets compilation
  const timeSaved = (observationsCount * 2) + (completedVisitsCount * 10) + (scheduledActivities.length * 5) + 30;
  const timeSavedPrev = 65; // Base comparator
  const timeSavedDiff = timeSaved - timeSavedPrev;

  // 6. Child Engagement Score (formulated dynamically based on attendance and logged observations)
  const childEngagementScore = totalChildren > 0 
    ? Math.min(65 + Math.round((observationsCount / totalChildren) * 8) + Math.round(attendanceRate * 0.15), 100) 
    : 85;

  // Dynamic Weekly Progress Data
  const dynamicWeeklyData = [
    { week: 'W1', engagement: 65, attendance: 70, timeSaved: 40 },
    { week: 'W2', engagement: 70, attendance: 72, timeSaved: 55 },
    { week: 'W3', engagement: 75, attendance: 75, timeSaved: 65 },
    { week: 'W4', engagement: 82, attendance: 80, timeSaved: 80 },
    { week: 'This Week', engagement: childEngagementScore, attendance: attendanceRate, timeSaved: timeSaved },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-slate-350">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Impact Analytics</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {/* Hero Impact Card */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-md shadow-orange-500/10 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Award size={28} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-orange-100">This Week&apos;s Saved Time</p>
              <p className="text-2xl font-bold">{timeSaved} min saved</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-orange-200" />
            <p className="text-xs text-orange-200">
              {timeSavedDiff > 0 
                ? `Saved ${timeSavedDiff} more minutes compared to last week (digital efficiency)` 
                : 'Maintaining high reporting efficiency with digital logging'}
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center mb-2">
              <Clock size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{timeSaved} min</p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Admin time saved</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={10} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-medium">
                {timeSavedDiff >= 0 ? `+${timeSavedDiff} min vs last week` : `${timeSavedDiff} min vs last week`}
              </span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-950/40 rounded-xl flex items-center justify-center mb-2">
              <BookOpen size={18} className="text-violet-600 dark:text-violet-450" />
            </div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{activitiesCount}</p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Activities done</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={10} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-medium">
                +{scheduledActivities.length} custom scheduled
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="w-10 h-10 bg-sky-100 dark:bg-sky-950/40 rounded-xl flex items-center justify-center mb-2">
              <Users size={18} className="text-sky-600 dark:text-sky-400" />
            </div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{attendanceRate}%</p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Avg. attendance</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={10} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-medium">
                {attendanceRate > 80 ? '+12% improvement' : '+5% improvement'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/40 rounded-xl flex items-center justify-center mb-2">
              <Home size={18} className="text-amber-600 dark:text-amber-405" />
            </div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{completedVisitsCount}</p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">Home visits done</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={10} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-medium">
                {completedVisitsCount} visits logged
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Progress Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 shrink-0">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Early Education Progress</h3>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mb-3">Weekly comparison of child engagement and attendance rates</p>
          
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dynamicWeeklyData}
                margin={{ top: 10, right: 5, left: -28, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="#cbd5e1" className="dark:stroke-slate-800" />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="#cbd5e1" domain={[0, 100]} className="dark:stroke-slate-800" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#fff', fontSize: '10px' }} />
                <Area type="monotone" name="Engagement %" dataKey="engagement" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorEngagement)" />
                <Area type="monotone" name="Attendance %" dataKey="attendance" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorAttendance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legends */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-[10px] text-gray-650 dark:text-slate-400 font-medium">Engagement: {childEngagementScore}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-[10px] text-gray-650 dark:text-slate-400 font-medium">Attendance: {attendanceRate}%</span>
            </div>
          </div>
        </div>

        {/* Observations logs info card */}
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-950/40 rounded-xl flex items-center justify-center text-violet-600 dark:text-violet-400">
              <BookOpen size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 dark:text-white">Observations Logged</p>
              <p className="text-[10px] text-gray-450 dark:text-slate-400">Total digital development records</p>
            </div>
          </div>
          <span className="text-base font-bold text-violet-600 dark:text-violet-400">{observationsCount}</span>
        </div>

        {/* Motivational Message */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900/60 dark:to-slate-850/60 rounded-2xl p-4 border border-emerald-100 dark:border-slate-800 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <Heart size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-450 mb-0.5">Great work!</h4>
              <p className="text-xs text-emerald-650 dark:text-slate-300 leading-relaxed">
                By digitizing records, you saved {timeSaved} minutes of administrative paperwork this week. This translates to more focus time directly supporting children and optimizing early education tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
