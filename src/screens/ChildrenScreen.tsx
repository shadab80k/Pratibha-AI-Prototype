import { useState } from 'react';
import { Search, Filter, ChevronRight, AlertTriangle, Heart, UserCheck } from 'lucide-react';

interface ChildrenScreenProps {
  onChildSelect: (childId: string) => void;
  childrenList: any[];
  onToggleAttendance: (childId: string) => void;
}

type FilterType = 'all' | 'attention' | 'nutrition' | 'attendance';

const filters: { key: FilterType; label: string; labelHi: string }[] = [
  { key: 'all', label: 'All', labelHi: 'सब' },
  { key: 'attention', label: 'Needs Attention', labelHi: 'ध्यान दें' },
  { key: 'nutrition', label: 'Nutrition Risk', labelHi: 'पोषण' },
  { key: 'attendance', label: 'Irregular', labelHi: 'अनियमित' },
];

export function ChildrenScreen({ onChildSelect, childrenList, onToggleAttendance }: ChildrenScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredChildren = childrenList.filter((child) => {
    const matchesSearch =
      child.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'attention'
        ? child.needsAttention
        : activeFilter === 'nutrition'
        ? child.nutritionStatus === 'at-risk' || child.nutritionStatus === 'monitoring'
        : activeFilter === 'attendance'
        ? child.attendance === 'irregular' || child.attendance === 'absent'
        : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Children</h1>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-xl px-3 h-10">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="flex-1 bg-transparent text-sm text-gray-700 dark:text-white placeholder-gray-400 outline-none"
            />
          </div>
          <button className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
            <Filter size={16} className="text-slate-500" />
          </button>
        </div>
      </header>

      {/* Filter Chips */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all active:scale-95 select-none ${
              activeFilter === filter.key
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-800'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Children List */}
      <div className="px-4 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {filteredChildren.length} children
          </p>
        </div>

        {filteredChildren.map((child) => (
          <div
            key={child.id}
            onClick={() => onChildSelect(child.id)}
            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm active:scale-[0.99] hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer transition-all text-left"
          >
            {/* Quick Attendance Checkbox Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleAttendance(child.id);
              }}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all active:scale-90 outline-none ${
                child.attendance === 'present'
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'border-slate-300 dark:border-slate-600 bg-transparent text-transparent'
              }`}
              title="Record Attendance"
            >
              <UserCheck size={12} className="text-white" strokeWidth={3} />
            </button>

            <div className="relative shrink-0">
              <img
                src={child.avatar}
                alt={child.name}
                className="w-14 h-14 rounded-xl object-cover bg-orange-100"
              />
              {child.attendance === 'present' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                  <UserCheck size={10} className="text-white" />
                </div>
              )}
              {child.attendance === 'absent' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                  <AlertTriangle size={10} className="text-white" />
                </div>
              )}
              {child.attendance === 'irregular' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                  <AlertTriangle size={10} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{child.name}</h3>
                <span className="text-xs text-gray-400">({child.ageDisplay})</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    child.nutritionStatus === 'good'
                      ? 'bg-emerald-100 text-emerald-700'
                      : child.nutritionStatus === 'at-risk'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {child.nutritionStatus === 'good' ? 'Good' : child.nutritionStatus === 'at-risk' ? 'At Risk' : 'Monitoring'}
                </span>
                {child.needsAttention && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium flex items-center gap-1">
                    <Heart size={8} />
                    Needs Attention
                  </span>
                )}
              </div>
              {child.observations.length > 0 && (
                <p className="text-[11px] text-gray-400 mt-1 truncate">
                  {child.observations[0].note}
                </p>
              )}
            </div>

            {/* Progress ring */}
            <div className="shrink-0 flex flex-col items-center">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke={child.developmentProgress >= 80 ? '#10b981' : child.developmentProgress >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="3"
                    strokeDasharray={`${child.developmentProgress} ${100 - child.developmentProgress}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600">
                  {child.developmentProgress}%
                </span>
              </div>
            </div>

            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
