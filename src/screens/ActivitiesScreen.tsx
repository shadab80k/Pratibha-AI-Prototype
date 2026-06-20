import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Users,
  Package,
  ChevronDown,
  ChevronUp,
  Star,
  Search,
  X,
  Check,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { activities as mockActivities } from '../data/mockData';
import { activitiesApi } from '../lib/api';
import type { Child, Activity } from '../lib/api';

interface ActivitiesScreenProps {
  onBack: () => void;
  language: string;
  childrenList: Child[];
  onAddObservation: (childId: string, note: string, category: string) => void;
}

const categories = ['All', 'Language', 'Cognitive', 'Creativity', 'Numeracy', 'Movement', 'Science'];

const categoryLabels: Record<string, { en: string; hi: string }> = {
  All: { en: 'All', hi: 'सभी' },
  Language: { en: 'Language', hi: 'भाषा' },
  Cognitive: { en: 'Cognitive', hi: 'संज्ञानात्मक' },
  Creativity: { en: 'Creativity', hi: 'रचनात्मकता' },
  Numeracy: { en: 'Numeracy', hi: 'संख्यात्मकता' },
  Movement: { en: 'Movement', hi: 'शारीरिक' },
  Science: { en: 'Science', hi: 'विज्ञान' },
};

export function ActivitiesScreen({ onBack, language, childrenList, onAddObservation }: ActivitiesScreenProps) {
  const [activitiesList, setActivitiesList] = useState<Activity[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    activitiesApi.getAll()
      .then((data) => {
        if (data && data.length > 0) {
          setActivitiesList(data);
        } else {
          setActivitiesList(mockActivities);
        }
      })
      .catch((err) => {
        console.error("Failed to load activities from API:", err);
        setActivitiesList(mockActivities);
      });
  }, []);

  // Completion timer states
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [participatingChildren, setParticipatingChildren] = useState<string[]>([]);

  // Case-insensitive filtering of activities
  const filtered = useMemo(() => {
    return activitiesList.filter((activity) => {
      const title = language === 'hi' ? activity.titleHindi : activity.title;
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            activity.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeCategory === 'All'
        ? true
        : activity.category.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [activitiesList, activeCategory, searchQuery, language]);

  // AI recommended banner logic
  const aiRecommendedActivities = useMemo(() => {
    return activitiesList.filter((a) => a.aiRecommended);
  }, [activitiesList]);

  const showAiBanner = aiRecommendedActivities.length > 0;

  const recommendedText = useMemo(() => {
    if (aiRecommendedActivities.length === 0) return '';
    const titles = aiRecommendedActivities.map((a) => language === 'hi' ? a.titleHindi : a.title);
    if (language === 'hi') {
      return `उपस्थिति और सीखने के अवलोकनों के आधार पर, आज आपके बच्चों को इनसे सबसे अधिक लाभ होगा: ${titles.join(', ')}।`;
    }
    return `Based on attendance and learning observations, today your children would benefit most from: ${titles.join(', ')}.`;
  }, [aiRecommendedActivities, language]);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false);
      setShowCompletionModal(true);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const handleStartActivity = (activity: Activity) => {
    setActiveActivity(activity);
    const minutes = parseInt(activity.duration) || 15;
    setTimerSeconds(minutes * 60);
    setTimerActive(true);

    // Smart default: Select all currently present children as participants
    const presentChildrenIds = childrenList
      .filter((c) => c.attendance === 'present')
      .map((c) => c.id);
    setParticipatingChildren(presentChildrenIds);
  };

  const handleCompleteActivity = () => {
    if (!activeActivity) return;

    // Log participation observations back to parent state
    const category = activeActivity.category;
    const note = language === 'hi'
      ? `सफलतापूर्वक '${activeActivity.titleHindi}' गतिविधि में भाग लिया।`
      : `Successfully completed activity: '${activeActivity.title}'.`;

    participatingChildren.forEach((childId) => {
      onAddObservation(childId, note, category);
    });

    // Reset states
    setActiveActivity(null);
    setShowCompletionModal(false);
    setParticipatingChildren([]);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              {language === 'hi' ? 'गतिविधियां' : 'Activities'}
            </h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-xl px-3 h-10 mb-3 border border-transparent focus-within:border-violet-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'गतिविधि खोजें...' : 'Search activities...'}
            className="flex-1 bg-transparent text-xs text-gray-700 dark:text-white placeholder-gray-400 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 outline-none"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => {
            const label = categoryLabels[cat]?.[language === 'hi' ? 'hi' : 'en'] || cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all active:scale-95 select-none outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  activeCategory === cat
                    ? 'bg-violet-500 text-white shadow-md shadow-violet-200 dark:shadow-none'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {/* Dynamic AI Recommended Section */}
        {showAiBanner && (
          <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 text-white shadow-md shadow-violet-500/10">
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} className="text-violet-200 fill-violet-200" />
              <span className="text-xs font-semibold text-violet-200">
                {language === 'hi' ? 'एआई अनुशंसित' : 'AI Recommended for Today'}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-violet-50">
              {recommendedText}
            </p>
          </div>
        )}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-gray-100 dark:border-slate-800 shadow-sm py-12">
            <Package className="mx-auto text-gray-400 dark:text-slate-600 mb-3 animate-pulse" size={40} />
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white">
              {language === 'hi' ? 'कोई गतिविधि नहीं मिली' : 'No Activities Found'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 max-w-[240px] mx-auto leading-relaxed">
              {language === 'hi'
                ? 'इस श्रेणी या खोज शब्द के लिए कोई गतिविधि उपलब्ध नहीं है।'
                : 'Try changing your search query or selecting a different category filter.'}
            </p>
          </div>
        )}

        {/* Activity Cards */}
        <div className="space-y-3">
          {filtered.map((activity) => {
            const isExpanded = expandedId === activity.id;
            // Dynamically lookup the Lucide icon from lucide-react
            const Icon = (Icons as any)[activity.icon] || Sparkles;

            return (
              <div
                key={activity.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all ${
                  activity.aiRecommended
                    ? 'border-violet-200 dark:border-violet-900/50 shadow-sm shadow-violet-50 dark:shadow-none'
                    : 'border-gray-100 dark:border-slate-800 shadow-sm'
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                  className="w-full p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform text-slate-800 dark:text-white outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-2xl"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    activity.aiRecommended ? 'bg-violet-100 dark:bg-violet-950/40' : 'bg-gray-100 dark:bg-slate-800'
                  }`}>
                    <Icon size={22} className={activity.aiRecommended ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-slate-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3
                        className="text-sm font-semibold text-gray-800 dark:text-white truncate"
                        title={language === 'hi' ? activity.titleHindi : activity.title}
                      >
                        {language === 'hi' ? activity.titleHindi : activity.title}
                      </h3>
                      {activity.aiRecommended && (
                        <span className="text-[10px] px-2 py-0.5 bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 rounded-full font-bold shrink-0">
                          AI
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                        <Clock size={12} />
                        {activity.duration}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                        <Users size={12} />
                        {activity.ageGroup}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-600 dark:text-slate-300">
                        {language === 'hi'
                          ? (categoryLabels[activity.category.charAt(0).toUpperCase() + activity.category.slice(1).toLowerCase()]?.hi || activity.category)
                          : (categoryLabels[activity.category.charAt(0).toUpperCase() + activity.category.slice(1).toLowerCase()]?.en || activity.category)
                        }
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-gray-400 dark:text-slate-500" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400 dark:text-slate-500" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-800 pt-3">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1">
                          {language === 'hi' ? 'सीखने के परिणाम' : 'Learning Outcome'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{activity.learningOutcome}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                          <Package size={12} className="text-slate-400" />
                          {language === 'hi' ? 'आवश्यक सामग्री' : 'Materials Needed'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {activity.materials.map((mat, i) => (
                            <span
                              key={`${activity.id}-mat-${i}`}
                              className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-600 dark:text-slate-300 font-medium"
                            >
                              {mat}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartActivity(activity)}
                        className="w-full h-10 bg-violet-500 hover:bg-violet-600 text-white text-xs font-bold rounded-xl active:scale-95 transition-transform mt-2 shadow-md shadow-violet-500/20 dark:shadow-none outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                      >
                        {language === 'hi' ? 'गतिविधि शुरू करें' : 'Start Activity'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timer Progress Overlay */}
      {activeActivity && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-[340px] border border-gray-200 dark:border-slate-800 shadow-2xl space-y-6 text-center animate-scaleIn">
            <div>
              <span className="text-xs bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                {language === 'hi' ? 'गतिविधि प्रगति पर है' : 'Activity in Progress'}
              </span>
              <h3 className="text-base font-bold text-gray-800 dark:text-white mt-3">
                {language === 'hi' ? activeActivity.titleHindi : activeActivity.title}
              </h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                {language === 'hi' ? 'समूह गतिविधि सत्र' : 'Group Learning Session'}
              </p>
            </div>

            {/* Timer Clock Circle */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100 dark:stroke-slate-800" strokeWidth="2.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="none"
                  className="stroke-violet-500 transition-all duration-1000"
                  strokeWidth="2.5"
                  strokeDasharray={`${(timerSeconds / (parseInt(activeActivity.duration) * 60)) * 100} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">
                  {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase">
                  {language === 'hi' ? 'शेष समय' : 'Remaining'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setTimerActive(!timerActive)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 ${
                  timerActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {timerActive ? (language === 'hi' ? 'रोकें' : 'Pause') : (language === 'hi' ? 'शुरू करें' : 'Resume')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerActive(false);
                  setShowCompletionModal(true);
                }}
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md"
              >
                {language === 'hi' ? 'पूरा करें' : 'Complete'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveActivity(null);
                setTimerActive(false);
              }}
              className="text-xs text-gray-400 hover:text-gray-500 dark:text-slate-500 font-bold outline-none"
            >
              {language === 'hi' ? 'गतिविधि रद्द करें' : 'Cancel Activity'}
            </button>
          </div>
        </div>
      )}

      {/* Participating Checklist Overlay */}
      {showCompletionModal && activeActivity && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-[340px] border border-gray-200 dark:border-slate-800 shadow-2xl space-y-4 text-left animate-scaleIn">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-white">
                {language === 'hi' ? 'भागीदारी दर्ज करें' : 'Record Participation'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                {language === 'hi'
                  ? 'किन बच्चों ने इस गतिविधि में भाग लिया?'
                  : 'Select children who participated in this activity:'}
              </p>
            </div>

            {/* Checklist */}
            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
              {childrenList.map((child) => {
                const isChecked = participatingChildren.includes(child.id);
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => {
                      setParticipatingChildren((prev) =>
                        isChecked ? prev.filter((id) => id !== child.id) : [...prev, child.id]
                      );
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left active:scale-[0.98] transition-all outline-none ${
                      isChecked
                        ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/10'
                        : 'border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={child.avatar} alt={child.name} className="w-7 h-7 rounded-full object-cover border border-gray-100" />
                      <span className="text-xs font-semibold text-gray-800 dark:text-white">
                        {language === 'hi' ? child.nameHindi : child.name}
                      </span>
                    </div>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      isChecked ? 'bg-violet-500 border-violet-500 text-white' : 'border-gray-300 dark:border-slate-600'
                    }`}>
                      {isChecked && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                className="flex-1 h-10 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold active:scale-95 transition-all outline-none"
              >
                {language === 'hi' ? 'पीछे' : 'Back'}
              </button>
              <button
                type="button"
                onClick={handleCompleteActivity}
                disabled={participatingChildren.length === 0}
                className="flex-1 h-10 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md disabled:opacity-50 outline-none"
              >
                {language === 'hi' ? 'सुरक्षित करें' : 'Save & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
