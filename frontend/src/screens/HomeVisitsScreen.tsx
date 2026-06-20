import { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, CheckCircle2, Clock, MessageCircle, PlusCircle, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface HomeVisitsScreenProps {
  onBack: () => void;
  visitsList: any[];
  onCompleteVisit: (visitId: string) => void;
  childrenList: any[];
  onAddVisit: (childName: string, parentName: string, lastVisit: string, concern: string, suggestedTopics: string[]) => void;
}

// Concern Focus Areas and AI Suggested Topics
const CONCERN_TOPICS: Record<string, string[]> = {
  'General Care / Baseline': [
    'Review language progress',
    'Discuss healthy snacks recipes',
    'Demonstrate simple counting games'
  ],
  'Attendance & Engagement': [
    'Discuss attendance consistency and habits',
    'Identify barriers to daily center attendance',
    'Share fun morning routine tips to build habits'
  ],
  'Nutrition & Growth': [
    'Review weight/height growth charts',
    'Discuss protein-rich recipe ideas at home',
    'Examine micro-nutrient supplementation intake'
  ],
  'Health & Hygiene': [
    'Demonstrate proper handwashing steps',
    'Discuss safe drinking water storage',
    'Check nail and teeth cleanliness routine'
  ],
  'Cognitive & Language Development': [
    'Model reading picture books aloud with expressions',
    'Practice counting household objects games',
    'Introduce vocabulary-building rhyming words'
  ],
  'Social & Emotional Milestones': [
    'Discuss sharing and cooperative playtime',
    'Address emotional self-regulation tips',
    'Practice positive reinforcement strategies'
  ]
};

// Helper to convert relative mock dates or tomorrow to standard YYYY-MM-DD
export function getVisitDateString(lastVisit: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(lastVisit)) return lastVisit;
  
  const today = new Date();
  if (lastVisit === 'Tomorrow') {
    today.setDate(today.getDate() + 1);
  } else if (lastVisit.includes('2 weeks ago')) {
    today.setDate(today.getDate() - 14);
  } else if (lastVisit.includes('1 month ago')) {
    today.setMonth(today.getMonth() - 1);
  } else if (lastVisit.includes('3 weeks ago')) {
    today.setDate(today.getDate() - 21);
  } else if (lastVisit.includes('Next Monday')) {
    const day = today.getDay();
    const daysUntilNextMonday = (1 + 7 - day) % 7 || 7;
    today.setDate(today.getDate() + daysUntilNextMonday);
  } else if (lastVisit.includes('Next Friday')) {
    const day = today.getDay();
    const daysUntilNextFriday = (5 + 7 - day) % 7 || 7;
    today.setDate(today.getDate() + daysUntilNextFriday);
  } else {
    // Default fallback to tomorrow if parsing fails
    today.setDate(today.getDate() + 1);
  }
  return today.toISOString().split('T')[0];
}

export function HomeVisitsScreen({
  onBack,
  visitsList,
  onCompleteVisit,
  childrenList,
  onAddVisit,
}: HomeVisitsScreenProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [showForm, setShowForm] = useState(false);
  const [selectedChild, setSelectedChild] = useState('');
  const [parentName, setParentName] = useState('');
  const [visitDate, setVisitDate] = useState(() => {
    // Default to tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [concern, setConcern] = useState('General Care / Baseline');

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Suggested Topics preview
  const currentSuggestedTopics = CONCERN_TOPICS[concern] || CONCERN_TOPICS['General Care / Baseline'];

  const handleAddVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild.trim()) return;

    let targetParent = parentName;
    if (!targetParent) {
      const match = childrenList.find(c => c.name === selectedChild);
      targetParent = match ? match.parentName : 'Parent';
    }

    onAddVisit(selectedChild, targetParent, visitDate, concern, currentSuggestedTopics);
    
    // Reset Form
    setSelectedChild('');
    setParentName('');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setVisitDate(tomorrow.toISOString().split('T')[0]);
    setConcern('General Care / Baseline');
    setShowForm(false);
  };

  const handleOpenScheduleForm = () => {
    if (selectedCalendarDate) {
      setVisitDate(selectedCalendarDate);
    }
    setShowForm(true);
  };

  // Filter visits for current day in calendar selection
  const activeFilteredVisits = selectedCalendarDate
    ? visitsList.filter(v => getVisitDateString(v.lastVisit) === selectedCalendarDate)
    : visitsList;

  const pending = activeFilteredVisits.filter((v) => v.status === 'pending');
  const completed = activeFilteredVisits.filter((v) => v.status === 'completed');

  // Generate Month Grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const paddingArray = Array.from({ length: firstDayIndex }, () => null);
  const calendarCells = [...paddingArray, ...daysArray];
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-45 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-white">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Home Visits</h1>
          </div>
          <button
            onClick={handleOpenScheduleForm}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold active:scale-95 transition-all shadow-md shadow-orange-500/10"
          >
            {showForm ? <X size={14} /> : <PlusCircle size={14} />}
            {showForm ? 'Cancel' : 'Schedule'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        
        {/* Toggle between List & Calendar */}
        <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl shrink-0">
          <button 
            onClick={() => { setViewMode('list'); setSelectedCalendarDate(null); }}
            className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'list' 
                ? 'bg-white dark:bg-slate-800 text-gray-800 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            List View
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'calendar' 
                ? 'bg-white dark:bg-slate-800 text-gray-800 dark:text-white shadow-sm' 
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
            }`}
          >
            Calendar View
          </button>
        </div>

        {/* Schedule Form Card */}
        {showForm && (
          <form 
            onSubmit={handleAddVisitSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-md border border-orange-100 dark:border-slate-800 space-y-3 animate-slideDown"
          >
            <h3 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">Schedule New Visit</h3>
            
            <div>
              <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1">SELECT CHILD</label>
              <div className="relative">
                <select
                  value={selectedChild}
                  onChange={(e) => {
                    setSelectedChild(e.target.value);
                    const match = childrenList.find(c => c.name === e.target.value);
                    if (match) setParentName(match.parentName);
                  }}
                  className="w-full text-xs p-2.5 bg-gray-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none appearance-none cursor-pointer"
                  required
                >
                  <option value="">-- Choose Child --</option>
                  {childrenList.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1">PARENT NAME</label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Parent's Name"
                className="w-full text-xs p-2.5 bg-gray-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1">VISIT DATE</label>
              <div className="relative">
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none cursor-pointer"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1">FOCUS CONCERN</label>
              <div className="relative">
                <select
                  value={concern}
                  onChange={(e) => setConcern(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none appearance-none cursor-pointer"
                >
                  {Object.keys(CONCERN_TOPICS).map((topicKey) => (
                    <option key={topicKey} value={topicKey}>{topicKey}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* AI Suggested Topics Preview */}
            <div className="p-3 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/30">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MessageCircle size={12} className="text-violet-500" />
                <span className="text-[10px] font-bold text-violet-750 dark:text-violet-400">Dynamic AI Suggested Topics</span>
              </div>
              <div className="space-y-1">
                {currentSuggestedTopics.map((topic, i) => (
                  <p key={i} className="text-[10px] text-gray-650 dark:text-slate-350 leading-relaxed">• {topic}</p>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold active:scale-[0.98] transition-all shadow-md"
            >
              Add to Visits Planner
            </button>
          </form>
        )}

        {/* Calendar Grid Mode */}
        {viewMode === 'calendar' && (
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 shrink-0">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">{monthName} {year}</h3>
              <div className="flex items-center gap-1">
                <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-white transition-all">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-white transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Weekday Titles */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase">
              <span>S</span>
              <span>M</span>
              <span>T</span>
              <span>W</span>
              <span>T</span>
              <span>F</span>
              <span>S</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = selectedCalendarDate === dateStr;
                
                // Fetch matches
                const dayVisits = visitsList.filter(v => getVisitDateString(v.lastVisit) === dateStr);
                const hasPending = dayVisits.some(v => v.status === 'pending');
                const hasCompleted = dayVisits.some(v => v.status === 'completed');

                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => {
                      setSelectedCalendarDate(isSelected ? null : dateStr);
                    }}
                    className={`aspect-square rounded-xl text-xs font-semibold flex flex-col items-center justify-center relative transition-all ${
                      isSelected
                        ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20 scale-105'
                        : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{day}</span>
                    {/* Status dot markers */}
                    <div className="flex gap-0.5 mt-0.5 absolute bottom-1.5">
                      {hasPending && (
                        <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-amber-500'}`} />
                      )}
                      {hasCompleted && (
                        <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedCalendarDate && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800 text-[10px]">
                <span className="text-gray-500 dark:text-slate-400">
                  Showing visits for <strong className="text-gray-800 dark:text-white font-semibold">{selectedCalendarDate}</strong>
                </span>
                <button
                  onClick={() => setSelectedCalendarDate(null)}
                  className="text-orange-500 hover:underline font-semibold"
                >
                  Show All Dates
                </button>
              </div>
            )}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-amber-600 dark:text-amber-450" />
              <span className="text-xs text-amber-600 dark:text-amber-450 font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{pending.length}</p>
            <p className="text-xs text-gray-550 dark:text-slate-400">visits to complete</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-450" />
              <span className="text-xs text-emerald-600 dark:text-emerald-450 font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{completed.length}</p>
            <p className="text-xs text-gray-555 dark:text-slate-400">this month</p>
          </div>
        </div>

        {/* Pending Visits */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">
            {selectedCalendarDate ? `Pending Visits (${selectedCalendarDate})` : 'Pending Visits'}
          </h3>
          <div className="space-y-3">
            {pending.map((visit) => (
              <div key={visit.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 animate-fadeIn">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-amber-600 dark:text-amber-405" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate pr-2">{visit.childName}&apos;s Home</h4>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-450 rounded-full font-medium shrink-0">
                        Pending
                      </span>
                    </div>
                    <p className="text-xs text-gray-550 dark:text-slate-400 mt-0.5">Parent: {visit.parentName}</p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-450 font-medium mt-1">Focus: {visit.concern || 'General Care'}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar size={10} />
                      Due: {visit.lastVisit}
                    </p>

                    {/* AI Suggested Topics */}
                    {visit.suggestedTopics && visit.suggestedTopics.length > 0 && (
                      <div className="mt-3 p-3 bg-violet-50 dark:bg-violet-950/20 rounded-xl border border-violet-100 dark:border-violet-900/30">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle size={12} className="text-violet-500 dark:text-violet-400" />
                          <span className="text-[10px] font-medium text-violet-700 dark:text-violet-400">AI Discussion Focus</span>
                        </div>
                        <div className="space-y-1.5">
                          {visit.suggestedTopics.map((topic: string, i: number) => (
                            <div key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-violet-400 dark:bg-violet-500 rounded-full mt-1 shrink-0" />
                              <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed">{topic}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => onCompleteVisit(visit.id)}
                      className="mt-3 w-full h-10 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl active:scale-[0.98] transition-all outline-none shadow-sm shadow-orange-500/10 dark:shadow-none"
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {pending.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 text-center p-4">
                <CheckCircle2 size={36} className="text-emerald-500 mb-2" />
                <p className="text-xs font-semibold text-gray-800 dark:text-white">
                  {selectedCalendarDate ? 'No Pending Visits today' : 'All Visits Done!'}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1">
                  {selectedCalendarDate 
                    ? `No home visits are scheduled on ${selectedCalendarDate}.` 
                    : 'Excellent! No pending home visits left on your schedule.'}
                </p>
                {selectedCalendarDate && (
                  <button
                    onClick={handleOpenScheduleForm}
                    className="mt-3 text-xs bg-orange-50 hover:bg-orange-100 dark:bg-slate-800 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95"
                  >
                    Schedule Visit for this day
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Completed Visits */}
        {completed.length > 0 && (
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">
              {selectedCalendarDate ? `Completed Visits (${selectedCalendarDate})` : 'Completed Visits'}
            </h3>
            <div className="space-y-3">
              {completed.map((visit) => (
                <div key={visit.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} className="text-emerald-650 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 dark:text-white truncate">{visit.childName}&apos;s Home</h4>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Parent: {visit.parentName}</p>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Focus: {visit.concern || 'General Care'}</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full font-medium shrink-0">
                      Completed
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
