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
import { children } from '../data/mockData';
import type { Screen } from '../App';

interface ChildProfileScreenProps {
  childId: string;
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

type Tab = 'overview' | 'milestones' | 'observations';

export function ChildProfileScreen({ childId, onBack, onNavigate }: ChildProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const child = children.find((c) => c.id === childId);

  if (!child) return null;

  const presentCount = child.attendanceHistory.filter(Boolean).length;
  const attendanceRate = Math.round((presentCount / child.attendanceHistory.length) * 100);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:scale-95 transition-all"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Child Profile</h1>
        </div>
      </header>

      {/* Hero Profile */}
      <div className="bg-white px-4 py-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <img
            src={child.avatar}
            alt={child.name}
            className="w-20 h-20 rounded-2xl object-cover bg-orange-100 shadow-md"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">{child.name}</h2>
            <p className="text-sm text-gray-500">{child.ageDisplay}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                child.attendance === 'present'
                  ? 'bg-emerald-100 text-emerald-700'
                  : child.attendance === 'irregular'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {child.attendance === 'present' ? 'Present Today' : child.attendance === 'irregular' ? 'Irregular' : 'Absent'}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                child.nutritionStatus === 'good'
                  ? 'bg-emerald-100 text-emerald-700'
                  : child.nutritionStatus === 'at-risk'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {child.nutritionStatus === 'good' ? 'Nutrition Good' : child.nutritionStatus === 'at-risk' ? 'Nutrition At-Risk' : 'Nutrition Monitoring'}
              </span>
            </div>
          </div>
        </div>

        {/* Parent Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Parent</p>
              <p className="text-sm font-medium text-gray-700">{child.parentName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-700">{child.parentPhone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100">
        {(['overview', 'milestones', 'observations'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium capitalize transition-colors select-none ${
              activeTab === tab
                ? 'text-orange-600 border-b-2 border-orange-500'
                : 'text-gray-400'
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
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Calendar size={16} className="text-orange-500" />
                  Attendance (Last 14 days)
                </h3>
                <span className="text-xs font-medium text-emerald-600">{attendanceRate}%</span>
              </div>
              <div className="flex gap-1">
                {child.attendanceHistory.map((present, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded-md ${
                      present ? 'bg-emerald-400' : 'bg-red-300'
                    }`}
                    title={present ? 'Present' : 'Absent'}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-gray-400">14 days ago</span>
                <span className="text-[10px] text-gray-400">Today</span>
              </div>
            </div>

            {/* Development Progress */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
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
                      <span className="text-xs text-gray-600">{skill.label}</span>
                      <span className="text-xs font-medium text-gray-800">{skill.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
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
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-orange-500" />
                <h3 className="text-sm font-semibold text-orange-800">AI Insights</h3>
              </div>
              <div className="space-y-2">
                {child.aiInsights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-orange-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-700 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="space-y-3">
            {child.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`p-4 rounded-2xl border ${
                  milestone.completed
                    ? 'bg-emerald-50 border-emerald-100'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      milestone.completed ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    {milestone.completed ? (
                      <CheckCircle2 size={20} className="text-white" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-400 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-medium ${milestone.completed ? 'text-emerald-800' : 'text-gray-600'}`}>
                      {milestone.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">{milestone.category} &middot; {milestone.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Observations Tab */}
        {activeTab === 'observations' && (
          <div className="space-y-3">
            {child.observations.map((obs) => (
              <div key={obs.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    obs.type === 'voice' ? 'bg-orange-100' : 'bg-sky-100'
                  }`}>
                    {obs.type === 'voice' ? (
                      <Mic size={14} className="text-orange-500" />
                    ) : (
                      <FileText size={14} className="text-sky-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 leading-relaxed">{obs.note}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500">
                        {obs.category}
                      </span>
                      <span className="text-[10px] text-gray-400">{obs.date}</span>
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
            className="flex items-center gap-2 p-3 bg-orange-500 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            <Mic size={16} />
            Voice Note
          </button>
          <button
            onClick={() => onNavigate('activities')}
            className="flex items-center gap-2 p-3 bg-violet-500 text-white rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            <Sparkles size={16} />
            Suggest Activity
          </button>
        </div>
      </div>
    </div>
  );
}
