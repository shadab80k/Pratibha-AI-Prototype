import { ArrowLeft, TrendingUp, Clock, BookOpen, Users, Home, Heart, Award } from 'lucide-react';
import { impactData } from '../data/mockData';

interface ImpactScreenProps {
  onBack: () => void;
}

export function ImpactScreen({ onBack }: ImpactScreenProps) {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all">
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Impact</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Hero Impact Card */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Award size={28} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-orange-100">This Week&apos;s Impact</p>
              <p className="text-2xl font-bold">90 min saved</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-orange-200" />
            <p className="text-xs text-orange-100">
              +38% more time with children compared to last week
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-2">
              <Clock size={18} className="text-emerald-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">90 min</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Reporting time saved</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={10} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-600 font-medium">+25 min vs last week</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-2">
              <BookOpen size={18} className="text-violet-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">24</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Activities completed</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={10} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-600 font-medium">+8 vs last week</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center mb-2">
              <Users size={18} className="text-sky-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">85%</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Avg. attendance</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={10} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-600 font-medium">+12% improvement</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-2">
              <Home size={18} className="text-amber-600" />
            </div>
            <p className="text-xl font-bold text-gray-800">5</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Home visits done</p>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={10} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-600 font-medium">+2 vs last week</span>
            </div>
          </div>
        </div>

        {/* Weekly Improvement Chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Weekly Progress</h3>
          <div className="space-y-4">
            {/* Engagement */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Heart size={12} className="text-rose-400" />
                  Child Engagement
                </span>
                <span className="text-xs font-bold text-gray-800">85%</span>
              </div>
              <div className="flex items-end gap-2 h-24">
                {impactData.weeklyImprovement.map((week, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center">
                      <span className="text-[9px] text-gray-400 mb-0.5">{week.engagement}%</span>
                      <div
                        className="w-full bg-rose-400 rounded-t-lg transition-all"
                        style={{ height: `${week.engagement * 0.8}px` }}
                      />
                    </div>
                    <span className="text-[8px] text-gray-400">{week.week.replace('Week ', 'W')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 flex items-center gap-1">
                  <Users size={12} className="text-sky-400" />
                  Attendance Rate
                </span>
                <span className="text-xs font-bold text-gray-800">85%</span>
              </div>
              <div className="flex items-end gap-2 h-24">
                {impactData.weeklyImprovement.map((week, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center">
                      <span className="text-[9px] text-gray-400 mb-0.5">{week.attendance}%</span>
                      <div
                        className="w-full bg-sky-400 rounded-t-lg transition-all"
                        style={{ height: `${week.attendance * 0.8}px` }}
                      />
                    </div>
                    <span className="text-[8px] text-gray-400">{week.week.replace('Week ', 'W')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
              <Heart size={18} className="text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-emerald-800 mb-1">Great work, Sunita Ji!</h4>
              <p className="text-xs text-emerald-600 leading-relaxed">
                With the time saved from paperwork, you have spent 90 more minutes engaging with children this week. 
                Your dedication is making a real difference in their early development.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
