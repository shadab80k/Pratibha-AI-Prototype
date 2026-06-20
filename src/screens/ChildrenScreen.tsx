import { useState, useMemo } from 'react';
import { Search, Filter, ChevronRight, AlertTriangle, Heart, UserCheck, Check, Users } from 'lucide-react';
import type { Child } from '../lib/api';
interface ChildrenScreenProps {
  onChildSelect: (childId: string) => void;
  childrenList: Child[];
  onToggleAttendance: (childId: string) => void;
  onMarkAllPresent?: () => void;
  language?: string;
}

type FilterType = 'all' | 'attention' | 'nutrition' | 'attendance';

const filters: { key: FilterType; label: string; labelHi: string }[] = [
  { key: 'all', label: 'All', labelHi: 'सब' },
  { key: 'attention', label: 'Needs Attention', labelHi: 'ध्यान दें' },
  { key: 'nutrition', label: 'Nutrition Risk', labelHi: 'पोषण' },
  { key: 'attendance', label: 'Absent/Irregular', labelHi: 'अनुपस्थित' },
];

export function ChildrenScreen({ 
  onChildSelect, 
  childrenList, 
  onToggleAttendance,
  onMarkAllPresent,
  language = 'en'
}: ChildrenScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'attendance' | 'attention'>('name');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Dynamic filter chip counts
  const filterCounts = useMemo(() => {
    const list = childrenList || [];
    return {
      all: list.length,
      attention: list.filter(c => c.needsAttention).length,
      nutrition: list.filter(c => c.nutritionStatus === 'at-risk' || c.nutritionStatus === 'monitoring').length,
      attendance: list.filter(c => c.attendance === 'irregular' || c.attendance === 'absent').length,
    };
  }, [childrenList]);

  // Memoized, sorted and filtered list
  const sortedAndFilteredChildren = useMemo(() => {
    const list = childrenList || [];
    const filtered = list.filter((child) => {
      // Extended search parameters
      const matchesSearch =
        child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (child.nameHindi && child.nameHindi.toLowerCase().includes(searchQuery.toLowerCase())) ||
        child.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        child.address.toLowerCase().includes(searchQuery.toLowerCase());
        
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

    // Apply sorting logic
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = language === 'hi' && a.nameHindi ? a.nameHindi : a.name;
        const nameB = language === 'hi' && b.nameHindi ? b.nameHindi : b.name;
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'progress') {
        return b.developmentProgress - a.developmentProgress; // High to Low
      }
      if (sortBy === 'attention') {
        return (b.needsAttention ? 1 : 0) - (a.needsAttention ? 1 : 0); // Attention first
      }
      if (sortBy === 'attendance') {
        const order: Record<string, number> = { absent: 0, irregular: 1, present: 2 };
        return order[a.attendance] - order[b.attendance]; // Absent/Irregular first
      }
      return 0;
    });
  }, [childrenList, searchQuery, activeFilter, sortBy, language]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3 shrink-0">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
          {language === 'hi' ? 'बच्चे' : 'Children'}
        </h1>
        <div className="flex items-center gap-2">
          {/* Extended Search Bar */}
          <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-xl px-3 h-10 border border-transparent focus-within:border-orange-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'नाम, माता/पिता या पते से खोजें...' : 'Search by name, parent or address...'}
              className="flex-1 bg-transparent text-xs text-gray-700 dark:text-white placeholder-gray-400 outline-none"
            />
          </div>
          {/* Filter / Sort Button */}
          <button 
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
              showSortDropdown 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
            title={language === 'hi' ? 'क्रमबद्ध करें (Sort)' : 'Sort List'}
            aria-label="Sort children list"
          >
            <Filter size={16} />
          </button>
        </div>

        {/* Sort Dropdown Overlay */}
        {showSortDropdown && (
          <div className="absolute right-4 mt-2 w-52 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-slideDown">
            <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase px-3 py-1">
              {language === 'hi' ? 'क्रमबद्ध करें (Sort By)' : 'Sort By'}
            </p>
            {[
              { key: 'name', label: 'Name (A-Z)', labelHi: 'नाम (A-Z)' },
              { key: 'progress', label: 'Progress (High-Low)', labelHi: 'विकास प्रगति' },
              { key: 'attendance', label: 'Absent/Irregular First', labelHi: 'अनुपस्थित पहले' },
              { key: 'attention', label: 'Needs Attention First', labelHi: 'ध्यान देने योग्य' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => {
                  setSortBy(opt.key as any);
                  setShowSortDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between outline-none ${
                  sortBy === opt.key 
                    ? 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 font-bold' 
                    : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <span>{language === 'hi' ? opt.labelHi : opt.label}</span>
                {sortBy === opt.key && <Check size={12} className="stroke-[3]" />}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Filter Chips with Count Badges */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 select-none">
        {filters.map((filter) => {
          const count = filterCounts[filter.key];
          const label = language === 'hi' ? filter.labelHi : filter.label;
          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 select-none outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                activeFilter === filter.key
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border border-gray-100 dark:border-slate-800'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Children List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scrollbar-hide">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 font-medium">
            {language === 'hi' ? `${sortedAndFilteredChildren.length} बच्चे` : `${sortedAndFilteredChildren.length} children`}
          </p>
          {/* Bulk attendance action */}
          {onMarkAllPresent && sortedAndFilteredChildren.some(c => c.attendance !== 'present') && (
            <button
              onClick={onMarkAllPresent}
              className="text-[10.5px] font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/25 px-2.5 py-1.5 rounded-xl hover:bg-orange-100 active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              {language === 'hi' ? 'सभी को उपस्थित चिह्नित करें' : 'Mark All Present'}
            </button>
          )}
        </div>

        {/* Empty State */}
        {sortedAndFilteredChildren.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-gray-100 dark:border-slate-800 shadow-sm py-12">
            <Users className="mx-auto text-gray-400 dark:text-slate-600 mb-3 animate-pulse" size={40} />
            <h4 className="text-sm font-bold text-gray-800 dark:text-white">
              {language === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No Children Found'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 max-w-[240px] mx-auto leading-relaxed font-medium">
              {language === 'hi'
                ? 'आपके खोज या फ़िल्टर के अनुकूल कोई बच्चा पंजीकृत नहीं है।'
                : 'Try changing your search query or selecting a different filter chip.'}
            </p>
          </div>
        )}

        {sortedAndFilteredChildren.map((child) => (
          <div
            key={child.id}
            onClick={() => onChildSelect(child.id)}
            className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm active:scale-[0.99] hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all text-left"
          >
            {/* Quick Attendance Checkbox Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleAttendance(child.id);
              }}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all active:scale-90 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                child.attendance === 'present'
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'border-slate-300 dark:border-slate-600 bg-transparent text-transparent'
              }`}
              title={language === 'hi' ? 'उपस्थिति बदलें' : 'Toggle Attendance'}
              aria-label={language === 'hi' ? `${child.nameHindi || child.name} की उपस्थिति बदलें` : `Toggle attendance for ${child.name}`}
            >
              <UserCheck size={12} className="text-white" strokeWidth={3} />
            </button>

            <div className="relative shrink-0 select-none">
              <img
                src={child.avatar}
                alt={child.name}
                className="w-14 h-14 rounded-xl object-cover bg-orange-50 border border-gray-100 dark:border-slate-800"
              />
              {child.attendance === 'present' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                  <UserCheck size={10} className="text-white" />
                </div>
              )}
              {child.attendance === 'absent' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                  <AlertTriangle size={10} className="text-white" />
                </div>
              )}
              {child.attendance === 'irregular' && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-sm">
                  <AlertTriangle size={10} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                  {language === 'hi' && child.nameHindi ? child.nameHindi : child.name}
                </h3>
                <span className="text-[11px] text-gray-400 dark:text-slate-500 shrink-0">({child.ageDisplay})</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    child.nutritionStatus === 'good'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                      : child.nutritionStatus === 'at-risk'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                  }`}
                >
                  {child.nutritionStatus === 'good' 
                    ? (language === 'hi' ? 'अच्छी स्थिति' : 'Good') 
                    : child.nutritionStatus === 'at-risk' 
                    ? (language === 'hi' ? 'गंभीर जोखिम' : 'At Risk') 
                    : (language === 'hi' ? 'निगरानी' : 'Monitoring')
                  }
                </span>
                {child.needsAttention && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 font-bold flex items-center gap-1">
                    <Heart size={8} className="fill-red-700 dark:fill-red-400" />
                    {language === 'hi' ? 'ध्यान दें' : 'Needs Attention'}
                  </span>
                )}
              </div>
              {child.observations.length > 0 && (
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 truncate">
                  {child.observations[0].note}
                </p>
              )}
            </div>

            {/* Progress ring with pathLength fixes */}
            <div className="shrink-0 flex flex-col items-center select-none">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15" 
                    fill="none" 
                    className="stroke-gray-100 dark:stroke-slate-800" 
                    strokeWidth="3" 
                    pathLength="100"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    className={child.developmentProgress >= 80 ? 'stroke-emerald-500' : child.developmentProgress >= 60 ? 'stroke-amber-500' : 'stroke-red-500'}
                    strokeWidth="3"
                    pathLength="100"
                    strokeDasharray={`${child.developmentProgress} ${100 - child.developmentProgress}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-slate-300">
                  {child.developmentProgress}%
                </span>
              </div>
            </div>

            <ChevronRight size={16} className="text-gray-300 dark:text-slate-600 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
