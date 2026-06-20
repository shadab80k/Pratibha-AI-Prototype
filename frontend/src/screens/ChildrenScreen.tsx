import { useState } from 'react';
import { Search, Filter, ChevronRight, AlertTriangle, Heart, UserCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { Child } from '../types';

interface ChildrenScreenProps {
  onChildSelect: (childId: string) => void;
  childrenList: Child[];
  onToggleAttendance: (childId: string) => void;
}

type FilterType = 'all' | 'attention' | 'nutrition' | 'attendance';

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'attention', label: 'Needs Attention' },
  { key: 'nutrition', label: 'Nutrition Risk' },
  { key: 'attendance', label: 'Irregular' },
];

const filterTranslations: Record<string, Record<string, string>> = {
  en: { all: 'All', attention: 'Needs Attention', nutrition: 'Nutrition Risk', attendance: 'Irregular' },
  hi: { all: 'सभी', attention: 'ध्यान दें', nutrition: 'पोषण जोखिम', attendance: 'अनियमित' },
  bn: { all: 'সব', attention: 'মনোযোগ প্রয়োজন', nutrition: 'পুষ্টির ঝুঁকি', attendance: 'অনিয়মিত' },
  mr: { all: 'सर्व', attention: 'लक्ष देणे गरजेचे', nutrition: 'पोषण जोखीम', attendance: 'अनियमित' }
};

const sortTranslations: Record<string, Record<string, string>> = {
  en: { sortBy: 'Sort By:', name: 'Name', age: 'Age', progress: 'Progress' },
  hi: { sortBy: 'क्रमबद्ध करें:', name: 'नाम', age: 'आयु', progress: 'प्रगति' },
  bn: { sortBy: 'সাজান:', name: 'নাম', age: 'বয়স', progress: 'অগ্রগতি' },
  mr: { sortBy: 'क्रमवारी लावा:', name: 'नाव', age: 'वय', progress: 'प्रगती' }
};

export function ChildrenScreen({ onChildSelect, childrenList, onToggleAttendance }: ChildrenScreenProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'progress'>('name');

  // Extended search: filter by name, nameHindi, parentName, or address
  const filteredChildren = childrenList.filter((child) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      child.name.toLowerCase().includes(query) ||
      (child.nameHindi && child.nameHindi.toLowerCase().includes(query)) ||
      (child.parentName && child.parentName.toLowerCase().includes(query)) ||
      (child.address && child.address.toLowerCase().includes(query));

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

  // Sort logic based on active sort state
  const sortedChildren = [...filteredChildren].sort((a, b) => {
    if (sortBy === 'name') {
      const nameA = language === 'hi' && a.nameHindi ? a.nameHindi : a.name;
      const nameB = language === 'hi' && b.nameHindi ? b.nameHindi : b.name;
      return nameA.localeCompare(nameB);
    } else if (sortBy === 'age') {
      return a.age - b.age; // youngest first
    } else if (sortBy === 'progress') {
      return b.developmentProgress - a.developmentProgress; // highest progress first
    }
    return 0;
  });

  const searchPlaceholderText =
    language === 'hi'
      ? 'नाम, माता-पिता या पते से खोजें...'
      : language === 'bn'
      ? 'নাম, অভিভাবক বা ঠিকানা দিয়ে খুঁজুন...'
      : language === 'mr'
      ? 'नाव, पालक किंवा पत्त्याद्वारे शोधा...'
      : 'Search by name, parent, or address...';

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-3">{t('childrenTab')}</h1>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-xl px-3 h-10">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholderText}
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
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 select-none ${
              activeFilter === filter.key
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'bg-white dark:bg-slate-900 text-gray-650 dark:text-slate-300 border border-gray-200 dark:border-slate-800'
            }`}
          >
            {filterTranslations[language]?.[filter.key] || filter.label}
          </button>
        ))}
      </div>

      {/* Sort Controls */}
      <div className="px-4 pb-3 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
        <span className="font-semibold">{sortTranslations[language]?.sortBy || 'Sort By:'}</span>
        <div className="flex gap-2">
          {[
            { key: 'name', label: 'Name' },
            { key: 'age', label: 'Age' },
            { key: 'progress', label: 'Progress' }
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key as 'name' | 'age' | 'progress')}
              type="button"
              className={`px-3 py-1.5 rounded-xl font-bold select-none active:scale-95 transition-all ${
                sortBy === opt.key
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-gray-650 dark:text-slate-350 border border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700'
              }`}
            >
              {sortTranslations[language]?.[opt.key] || opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Children List */}
      <div className="px-4 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {sortedChildren.length} {language === 'hi' ? 'बच्चे' : language === 'bn' ? 'শিশু' : language === 'mr' ? 'मुले' : 'children'}
          </p>
        </div>

        {sortedChildren.map((child) => {
          const childName = language === 'hi' && child.nameHindi ? child.nameHindi : child.name;
          return (
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
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <UserCheck size={10} className="text-white" />
                  </div>
                )}
                {child.attendance === 'absent' && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <AlertTriangle size={10} className="text-white" />
                  </div>
                )}
                {child.attendance === 'irregular' && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                    <AlertTriangle size={10} className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">{childName}</h3>
                  <span className="text-xs text-gray-400 dark:text-slate-500">({child.ageDisplay})</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      child.nutritionStatus === 'good'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450'
                        : child.nutritionStatus === 'at-risk'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-450'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-450'
                    }`}
                  >
                    {child.nutritionStatus === 'good'
                      ? (language === 'hi' ? 'अच्छा' : language === 'bn' ? 'ভালো' : language === 'mr' ? 'चांगले' : 'Good')
                      : child.nutritionStatus === 'at-risk'
                      ? (language === 'hi' ? 'जोखिम' : language === 'bn' ? 'ঝুঁকি' : language === 'mr' ? 'धोका' : 'At Risk')
                      : (language === 'hi' ? 'निगरानी' : language === 'bn' ? 'পর্যবেক্ষণ' : language === 'mr' ? 'निरीक्षण' : 'Monitoring')}
                  </span>
                  {child.needsAttention && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-450 font-medium flex items-center gap-1">
                      <Heart size={8} />
                      {language === 'hi' ? 'ध्यान दें' : language === 'bn' ? 'মনোযোগ দিন' : language === 'mr' ? 'लक्ष द्या' : 'Needs Attention'}
                    </span>
                  )}
                </div>
                {child.observations && child.observations.length > 0 && (
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 truncate">
                    {child.observations[0].note}
                  </p>
                )}
              </div>

              {/* Progress ring */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" fill="none" className="stroke-gray-100 dark:stroke-slate-800" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      className={child.developmentProgress >= 80 ? 'stroke-emerald-500' : child.developmentProgress >= 60 ? 'stroke-amber-500' : 'stroke-red-500'}
                      strokeWidth="3"
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
          );
        })}
      </div>
    </div>
  );
}
