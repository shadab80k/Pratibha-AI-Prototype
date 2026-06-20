import { useState } from 'react';
import {
  ArrowLeft,
  Mic,
  Sparkles,
  FileText,
  TrendingUp,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import type { Screen } from '../App';

interface ChildProfileScreenProps {
  childId: string;
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  childrenList: any[];
  onAddObservation: (childId: string, note: string, category: string) => void;
}

type Tab = 'overview' | 'milestones' | 'observations';

export function ChildProfileScreen({
  childId,
  onBack,
  onNavigate,
  childrenList,
  onAddObservation,
}: ChildProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [obsCategory, setObsCategory] = useState('Language');
  const [obsNote, setObsNote] = useState('');
  
  const child = childrenList.find((c) => c.id === childId);

  if (!child) return null;

  const presentCount = child.attendanceHistory.filter(Boolean).length;
  const attendanceRate = Math.round((presentCount / child.attendanceHistory.length) * 100);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3 px-4 pt-10 pb-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-slate-300"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">Child Profile</h1>
        </div>
      </header>

      {/* Hero Profile */}
      <div className="bg-white dark:bg-slate-900 px-4 py-6 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <img
            src={child.avatar}
            alt={child.name}
            className="w-20 h-20 rounded-2xl object-cover bg-orange-100 shadow-md"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{child.name}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">{child.ageDisplay}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                child.attendance === 'present'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : child.attendance === 'irregular'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
              }`}>
                {child.attendance === 'present' ? 'Present Today' : child.attendance === 'irregular' ? 'Irregular' : 'Absent'}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                child.nutritionStatus === 'good'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : child.nutritionStatus === 'at-risk'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
              }`}>
                {child.nutritionStatus === 'good' ? 'Nutrition Good' : child.nutritionStatus === 'at-risk' ? 'Nutrition At-Risk' : 'Nutrition Monitoring'}
              </span>
            </div>
          </div>
        </div>

        {/* Parent Info */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-950 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold">Parent</p>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{child.parentName}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold">Phone</p>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{child.parentPhone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        {(['overview', 'milestones', 'observations'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors select-none ${
              activeTab === tab
                ? 'text-orange-600 dark:text-orange-500 border-b-2 border-orange-500 dark:border-orange-500'
                : 'text-gray-400 dark:text-slate-500'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Attendance Graph */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Calendar size={16} className="text-orange-500" />
                  Attendance (Last 14 days)
                </h3>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{attendanceRate}%</span>
              </div>
              <div className="flex gap-1">
                {child.attendanceHistory.map((present: boolean, i: number) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded-md ${
                      present ? 'bg-emerald-400 dark:bg-emerald-500/85' : 'bg-red-300 dark:bg-red-950/60'
                    }`}
                    title={present ? 'Present' : 'Absent'}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-gray-400 dark:text-slate-500">14 days ago</span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500">Today</span>
              </div>
            </div>

            {/* Development Progress */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-orange-500" />
                Development Progress
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Language', value: Math.min(child.developmentProgress + 5, 100), color: 'bg-sky-500' },
                  { label: 'Numeracy', value: Math.min(child.developmentProgress - 5, 100), color: 'bg-violet-500' },
                  { label: 'Social', value: Math.min(child.developmentProgress + 10, 100), color: 'bg-emerald-500' },
                  { label: 'Motor', value: Math.min(child.developmentProgress - 10, 100), color: 'bg-amber-500' },
                ].map((skill) => (
                  <div key={skill.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-slate-300">{skill.label}</span>
                      <span className="text-xs font-medium text-gray-800 dark:text-slate-200">{skill.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${skill.color} rounded-full transition-all`}
                        style={{ width: `${skill.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-900/60 dark:to-slate-800/60 rounded-2xl p-4 border border-orange-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-orange-500" />
                <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-400">AI Insights</h3>
              </div>
              <div className="space-y-2">
                {child.aiInsights.map((insight: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-orange-400 dark:text-orange-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="space-y-3">
            {child.milestones.map((milestone: any) => (
              <div
                key={milestone.id}
                className={`p-4 rounded-2xl border ${
                  milestone.completed
                    ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50'
                    : 'bg-white border-gray-100 dark:bg-slate-900 dark:border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      milestone.completed ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-800'
                    }`}
                  >
                    {milestone.completed ? (
                      <CheckCircle2 size={20} className="text-white" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-400 dark:border-slate-600 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${milestone.completed ? 'text-emerald-800 dark:text-emerald-400' : 'text-gray-600 dark:text-slate-300'}`}>
                      {milestone.title}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{milestone.category} &middot; {milestone.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Observations Tab */}
        {activeTab === 'observations' && (
          <div className="space-y-3">
            {/* Inline Add Observation Form */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-orange-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-2 uppercase tracking-wide">
                Add Observation
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1">CATEGORY</label>
                  <div className="flex flex-wrap gap-1">
                    {['Language', 'Numeracy', 'Social', 'Cognitive', 'Motor', 'Emotional'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setObsCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${
                          obsCategory === cat
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1">OBSERVATION NOTE</label>
                  <textarea
                    value={obsNote}
                    onChange={(e) => setObsNote(e.target.value)}
                    placeholder="Type observation details here..."
                    rows={2}
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!obsNote.trim()) return;
                    onAddObservation(child.id, obsNote, obsCategory);
                    setObsNote('');
                  }}
                  disabled={!obsNote.trim()}
                  className="w-full h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold active:scale-[0.97] transition-all disabled:opacity-50"
                >
                  Save Observation
                </button>
              </div>
            </div>

            {child.observations.map((obs: any) => (
              <div key={obs.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800/80">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    obs.type === 'voice' ? 'bg-orange-100 dark:bg-orange-950/20' : 'bg-sky-100 dark:bg-sky-950/20'
                  }`}>
                    {obs.type === 'voice' ? (
                      <Mic size={14} className="text-orange-500 dark:text-orange-400" />
                    ) : (
                      <FileText size={14} className="text-sky-500 dark:text-sky-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{obs.note}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400 font-medium">
                        {obs.category}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500">{obs.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => onNavigate('voice-report')}
            className="flex items-center justify-center gap-2 p-3 bg-orange-500 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform shadow-md shadow-orange-500/20"
          >
            <Mic size={16} />
            Voice Note
          </button>
          <button
            onClick={() => onNavigate('activities')}
            className="flex items-center justify-center gap-2 p-3 bg-violet-500 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform shadow-md shadow-violet-500/20"
          >
            <Sparkles size={16} />
            Suggest Activity
          </button>
        </div>
      </div>
    </div>
  );
}
