import { useState } from 'react';
import { ArrowLeft, Sparkles, Clock, Users, Package, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { activities } from '../data/mockData';

interface ActivitiesScreenProps {
  onBack: () => void;
}

const categories = ['All', 'Language', 'Cognitive', 'Creativity', 'Numeracy', 'Movement', 'Science'];

export function ActivitiesScreen({ onBack }: ActivitiesScreenProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activeCategory === 'All'
    ? activities
    : activities.filter((a) => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-slate-300">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Activities</h1>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all active:scale-95 select-none ${
                activeCategory === cat
                  ? 'bg-violet-500 text-white shadow-md shadow-violet-200'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-350 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* AI Recommended Section */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 text-white shadow-md shadow-violet-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Star size={14} className="text-violet-200" />
            <span className="text-xs font-medium text-violet-200">AI Recommended for Today</span>
          </div>
          <p className="text-sm leading-relaxed text-violet-50">
            Based on attendance and learning observations, these activities would benefit your children most today.
          </p>
        </div>

        {/* Activity Cards */}
        <div className="space-y-3">
          {filtered.map((activity) => {
            const isExpanded = expandedId === activity.id;
            const Icon = Sparkles;

            return (
              <div
                key={activity.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all ${
                  activity.aiRecommended
                    ? 'border-violet-200 dark:border-violet-900/50 shadow-sm shadow-violet-50 dark:shadow-none'
                    : 'border-gray-100 dark:border-slate-800/80 shadow-sm'
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                  className="w-full p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform text-slate-800 dark:text-white"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    activity.aiRecommended ? 'bg-violet-100 dark:bg-violet-950/40' : 'bg-gray-100 dark:bg-slate-800'
                  }`}>
                    <Icon size={22} className={activity.aiRecommended ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-slate-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{activity.title}</h3>
                      {activity.aiRecommended && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 rounded-full font-medium shrink-0">
                          AI
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-slate-400">
                        <Clock size={10} />
                        {activity.duration}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-slate-400">
                        <Users size={10} />
                        {activity.ageGroup}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-650 dark:text-slate-350">
                        {activity.category}
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
                        <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-1">Learning Outcome</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{activity.learningOutcome}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                          <Package size={10} className="text-slate-400" />
                          Materials Needed
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {activity.materials.map((mat, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-600 dark:text-slate-350"
                            >
                              {mat}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button className="w-full h-10 bg-violet-500 text-white text-sm font-medium rounded-xl active:scale-95 transition-transform mt-2 shadow-md shadow-violet-500/20">
                        Start Activity
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
