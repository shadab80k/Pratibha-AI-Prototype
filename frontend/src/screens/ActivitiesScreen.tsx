import { useState } from 'react';
import { ArrowLeft, Sparkles, Clock, Users, Package, ChevronDown, ChevronUp, Calendar, Plus, X } from 'lucide-react';
import { activities } from '../data/mockData';
import { useLanguage } from '../context/LanguageContext';

interface ActivitiesScreenProps {
  onBack: () => void;
  childrenList: any[];
  scheduledActivities: any[];
  onScheduleActivity: (activityId: string, date: string, targetChildrenIds: string[]) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

const categories = ['All', 'Language', 'Cognitive', 'Creativity', 'Numeracy', 'Movement', 'Science'];

export function ActivitiesScreen({ onBack, childrenList, scheduledActivities, onScheduleActivity, showToast }: ActivitiesScreenProps) {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Calendar states
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Scheduling Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [targetActivityId, setTargetActivityId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState(todayStr);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  // Localized texts
  const translations: Record<string, Record<string, string>> = {
    en: {
      activities: 'Activities',
      aiRecommendedToday: 'AI Recommended for Today',
      aiRecomDesc: 'Based on learning observations, these activities address development lags or boost attendance.',
      learningOutcome: 'Learning Outcome',
      materialsNeeded: 'Materials Needed',
      startActivity: 'Start Activity',
      startingActivity: 'Starting activity "{title}"...',
      scheduleActivity: 'Schedule Activity',
      scheduleTitle: 'Schedule Activity',
      selectDate: 'Select Date',
      selectChildren: 'Select Children',
      allChildren: 'All Children',
      cancel: 'Cancel',
      confirmSchedule: 'Confirm Schedule',
      scheduledFor: 'Scheduled for {date}',
      noScheduled: 'No activities scheduled for this day. Tap "Schedule Activity" on any card below to plan one!',
      forChildLag: '🎯 Recommended for {name} ({lagType} lag)',
      forChildAttendance: '🎯 Recommended for {name} (Attendance boost)',
    },
    hi: {
      activities: 'गतिविधियां',
      aiRecommendedToday: 'आज के लिए एआई अनुशंसित',
      aiRecomDesc: 'सीखने के अवलोकनों के आधार पर, ये गतिविधियाँ विकास के अंतराल को दूर करती हैं या उपस्थिति बढ़ाती हैं।',
      learningOutcome: 'सीखने का परिणाम',
      materialsNeeded: 'आवश्यक सामग्री',
      startActivity: 'गतिविधि शुरू करें',
      startingActivity: 'गतिविधि "{title}" शुरू हो रही है...',
      scheduleActivity: 'शेड्यूल करें',
      scheduleTitle: 'गतिविधि शेड्यूल करें',
      selectDate: 'तारीख चुनें',
      selectChildren: 'बच्चों को चुनें',
      allChildren: 'सभी बच्चे',
      cancel: 'रद्द करें',
      confirmSchedule: 'शेड्यूल की पुष्टि करें',
      scheduledFor: '{date} के लिए शेड्यूल किया गया',
      noScheduled: 'इस दिन के लिए कोई गतिविधि शेड्यूल नहीं है। योजना बनाने के लिए नीचे दिए गए किसी भी कार्ड पर "शेड्यूल करें" पर टैप करें!',
      forChildLag: '🎯 {name} के लिए अनुशंसित ({lagType} अंतराल)',
      forChildAttendance: '🎯 {name} के लिए अनुशंसित (उपस्थिति बढ़ाने के लिए)',
    },
    bn: {
      activities: 'কার্যক্রম',
      aiRecommendedToday: 'আজকের জন্য এআই অনুমোদিত',
      aiRecomDesc: 'শেখার পর্যবেক্ষণের উপর ভিত্তি করে, এই কার্যক্রমগুলি বিকাশ সংক্রান্ত ঘাটতি সমাধান করে বা উপস্থিতি বাড়ায়।',
      learningOutcome: 'শিক্ষার ফলাফল',
      materialsNeeded: 'প্রয়োজনীয় উপাদান',
      startActivity: 'কার্যক্রম শুরু করুন',
      startingActivity: 'কার্যক্রম "{title}" শুরু হচ্ছে...',
      scheduleActivity: 'তফসিল করুন',
      scheduleTitle: 'কার্যক্রমের সময়সূচী',
      selectDate: 'তারিখ নির্বাচন করুন',
      selectChildren: 'শিশু নির্বাচন করুন',
      allChildren: 'সব শিশু',
      cancel: 'বাতিল করুন',
      confirmSchedule: 'সময়সূচী নিশ্চিত করুন',
      scheduledFor: '{date} এর জন্য নির্ধারিত',
      noScheduled: 'এই দিনের জন্য কোনো কার্যক্রম নির্ধারিত নেই। পরিকল্পনা করতে নিচের যেকোনো কার্ডে "তফসিল করুন" এ ট্যাপ করুন!',
      forChildLag: '🎯 {name}-এর জন্য প্রস্তাবিত ({lagType} ঘাটতি)',
      forChildAttendance: '🎯 {name}-এর জন্য প্রস্তাবিত (উপস্থিতি বৃদ্ধি)',
    },
    mr: {
      activities: 'उपक्रम',
      aiRecommendedToday: 'आजचे एआई शिफारस केलेले',
      aiRecomDesc: 'शिकण्याच्या निरीक्षणांवर आधारित, हे उपक्रम विकासातील अंतर भरून काढतात किंवा उपस्थिती वाढवतात.',
      learningOutcome: 'अध्ययन निष्पत्ती',
      materialsNeeded: 'लागणारे साहित्य',
      startActivity: 'उपक्रम सुरू करा',
      startingActivity: 'उपक्रम "{title}" सुरू होत आहे...',
      scheduleActivity: 'शेड्यूल करा',
      scheduleTitle: 'उपक्रम शेड्यूल करा',
      selectDate: 'तारीख निवडा',
      selectChildren: 'मुले निवडा',
      allChildren: 'सर्व मुले',
      cancel: 'रद्द करा',
      confirmSchedule: 'शेड्यूलची खात्री करा',
      scheduledFor: '{date} साठी नियोजित',
      noScheduled: 'या दिवसासाठी कोणताही उपक्रम शेड्यूल केलेला नाही. प्लॅन करण्यासाठी खालील कोणत्याही कार्डवर "शेड्यूल करा" टॅप करा!',
      forChildLag: '🎯 {name} साठी शिफारस केलेले ({lagType} कमतरता)',
      forChildAttendance: '🎯 {name} साठी शिफारस केलेले (उपस्थिती वाढवण्यासाठी)',
    }
  };

  const tLocal = (key: string, replacements?: Record<string, string>) => {
    let text = translations[language]?.[key] || translations['en']?.[key] || key;
    if (replacements) {
      Object.keys(replacements).forEach((k) => {
        text = text.replace(`{${k}}`, replacements[k]);
      });
    }
    return text;
  };

  // Generate Week Days slider strip
  const getWeekDays = () => {
    const days = [];
    const now = new Date();
    // Render 7 days window (2 days back, today, 4 days forward)
    for (let i = -2; i < 5; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayName: d.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : language === 'bn' ? 'bn-IN' : 'en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        isToday: i === 0,
      });
    }
    return days;
  };

  // Dynamic AI personalization logic per activity
  const getRecommendationReason = (activity: any) => {
    if (!childrenList || childrenList.length === 0) return null;

    // Check if any child has low developmental progress and matching lag
    for (const child of childrenList) {
      if (child.developmentProgress < 75) {
        // Find if this activity category matches the child's incomplete milestone categories
        // or fits Rani's language lag, or Aarav's cognitive lag
        if (child.name === 'Rani' && activity.category === 'Language') {
          return tLocal('forChildLag', { name: child.name, lagType: 'Language' });
        }
        if (child.name === 'Aarav' && activity.category === 'Cognitive') {
          return tLocal('forChildLag', { name: child.name, lagType: 'Cognitive' });
        }
      }
      
      // Attendance boost check
      if (child.attendance === 'irregular' && child.name === 'Rohan' && (activity.category === 'Movement' || activity.category === 'Language')) {
        return tLocal('forChildAttendance', { name: child.name });
      }
    }
    
    // Fallback default recommendation
    if (activity.aiRecommended) {
      return language === 'hi' ? '🎯 कक्षा की औसत प्रगति बढ़ाने के लिए अनुशंसित' : '🎯 Recommended to boost class average progress';
    }

    return null;
  };

  // Get active activities filtered by Category
  const filteredActivities = activeCategory === 'All'
    ? activities
    : activities.filter((a) => a.category === activeCategory);

  // Filter scheduled activities for the selected date
  const scheduledForSelectedDate = scheduledActivities.filter((sa) => sa.date === selectedDate);

  // Handle scheduling submit
  const openScheduleModal = (activityId: string) => {
    setTargetActivityId(activityId);
    setScheduleDate(selectedDate);
    setSelectedChildren(childrenList.map(c => c.id)); // select all by default
    setIsScheduleModalOpen(true);
  };

  const handleConfirmSchedule = () => {
    if (targetActivityId) {
      onScheduleActivity(targetActivityId, scheduleDate, selectedChildren);
      setIsScheduleModalOpen(false);
      setTargetActivityId(null);
    }
  };

  const toggleChildSelection = (childId: string) => {
    setSelectedChildren(prev => 
      prev.includes(childId) ? prev.filter(id => id !== childId) : [...prev, childId]
    );
  };

  const toggleSelectAllChildren = () => {
    if (selectedChildren.length === childrenList.length) {
      setSelectedChildren([]);
    } else {
      setSelectedChildren(childrenList.map(c => c.id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 pb-20 relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-slate-350 outline-none">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">{tLocal('activities')}</h1>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 select-none outline-none ${
                activeCategory === cat
                  ? 'bg-violet-500 text-white shadow-md shadow-violet-200 dark:shadow-none'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-350 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Week Calendar Strip Selector */}
      <div className="px-4 py-3 bg-white dark:bg-slate-900/60 border-b border-gray-100 dark:border-slate-800">
        <div className="flex justify-between gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {getWeekDays().map((day) => (
            <button
              key={day.dateStr}
              onClick={() => setSelectedDate(day.dateStr)}
              className={`flex-1 min-w-[45px] py-2 rounded-2xl flex flex-col items-center justify-center transition-all select-none active:scale-95 outline-none ${
                selectedDate === day.dateStr
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-100 dark:shadow-none'
                  : 'bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-slate-400 border border-gray-100 dark:border-slate-800'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-tight opacity-75">{day.dayName}</span>
              <span className="text-sm font-extrabold mt-1">{day.dayNum}</span>
              {day.isToday && (
                <span className={`w-1 h-1 rounded-full mt-1 ${selectedDate === day.dateStr ? 'bg-white' : 'bg-orange-500'}`} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Scheduled Activities for Selected Day */}
        <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-gray-150 dark:border-slate-800/80 p-4">
          <h2 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Calendar size={13} className="text-orange-500" />
            {tLocal('scheduledFor', { date: selectedDate === todayStr ? 'Today' : selectedDate })}
          </h2>

          {scheduledForSelectedDate.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-slate-500 leading-relaxed text-center py-4">
              {tLocal('noScheduled')}
            </p>
          ) : (
            <div className="space-y-3">
              {scheduledForSelectedDate.map((sched) => {
                const activityDetails = activities.find(a => a.id === sched.activityId);
                if (!activityDetails) return null;
                return (
                  <div key={sched.id} className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white truncate">{activityDetails.title}</h4>
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
                        <span>🕒 {activityDetails.duration}</span>
                        <span>•</span>
                        <span>👥 {sched.targetChildrenIds.length} children</span>
                      </p>
                    </div>
                    <div className="flex -space-x-1 overflow-hidden shrink-0">
                      {sched.targetChildrenIds.slice(0, 3).map((childId: string) => {
                        const childObj = childrenList.find(c => c.id === childId);
                        if (!childObj) return null;
                        return (
                          <img
                            key={childId}
                            src={childObj.avatar}
                            alt={childObj.name}
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                          />
                        );
                      })}
                      {sched.targetChildrenIds.length > 3 && (
                        <div className="inline-flex h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-350 ring-2 ring-white dark:ring-slate-900">
                          +{sched.targetChildrenIds.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Recommendations Header Info */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 text-white shadow-md shadow-violet-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-violet-200" />
            <span className="text-xs font-bold uppercase tracking-wider text-violet-200">{tLocal('aiRecommendedToday')}</span>
          </div>
          <p className="text-xs leading-relaxed text-violet-50">
            {tLocal('aiRecomDesc')}
          </p>
        </div>

        {/* Activity Cards */}
        <div className="space-y-3">
          {filteredActivities.map((activity) => {
            const isExpanded = expandedId === activity.id;
            const recReason = getRecommendationReason(activity);
            const isRec = recReason !== null;

            return (
              <div
                key={activity.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all ${
                  isRec
                    ? 'border-violet-300 dark:border-violet-900/60 shadow-sm shadow-violet-50 dark:shadow-none'
                    : 'border-gray-100 dark:border-slate-800/80 shadow-sm'
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : activity.id)}
                  className="w-full p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform text-slate-800 dark:text-white outline-none"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isRec ? 'bg-violet-100 dark:bg-violet-950/40' : 'bg-gray-100 dark:bg-slate-800'
                  }`}>
                    <Sparkles size={22} className={isRec ? 'text-violet-600 dark:text-violet-400' : 'text-gray-550 dark:text-slate-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                        {language === 'hi' && activity.titleHindi ? activity.titleHindi : activity.title}
                      </h3>
                      {isRec && (
                        <span className="text-[9px] px-2 py-0.5 bg-violet-100 dark:bg-violet-950/60 text-violet-750 dark:text-violet-300 rounded-full font-bold uppercase shrink-0">
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

                {/* AI Rationale Badge */}
                {isRec && (
                  <div className="mx-4 px-3 py-2 bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 rounded-xl text-[10px] font-semibold text-violet-700 dark:text-violet-300 flex items-center gap-1.5 mb-2 leading-tight">
                    <Sparkles size={11} className="shrink-0 animate-pulse" />
                    <span>{recReason}</span>
                  </div>
                )}

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-slate-800 pt-3">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-750 dark:text-slate-300 mb-1">{tLocal('learningOutcome')}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{activity.learningOutcome}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-750 dark:text-slate-300 mb-1 flex items-center gap-1">
                          <Package size={10} className="text-slate-400" />
                          {tLocal('materialsNeeded')}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {activity.materials.map((mat: string, i: number) => (
                            <span
                              key={i}
                              className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-slate-800 rounded-lg text-gray-600 dark:text-slate-350 border border-gray-200/40 dark:border-slate-800/40"
                            >
                              {mat}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => {
                            const title = language === 'hi' && activity.titleHindi ? activity.titleHindi : activity.title;
                            showToast(tLocal('startingActivity', { title }), 'success');
                          }}
                          className="flex-1 h-10 bg-violet-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-transform shadow-md shadow-violet-500/10 outline-none"
                        >
                          {tLocal('startActivity')}
                        </button>
                        <button
                          onClick={() => openScheduleModal(activity.id)}
                          className="h-10 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-1.5 text-xs font-bold outline-none"
                        >
                          <Calendar size={13} />
                          {tLocal('scheduleActivity')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ACTIVITY SCHEDULING MODAL */}
      {/* ========================================================================= */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-850 w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scale-up">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Calendar size={16} className="text-orange-500" />
                {tLocal('scheduleTitle')}
              </h3>
              <button 
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Date Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase">{tLocal('selectDate')}</label>
                <input 
                  type="date" 
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full h-11 px-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-medium text-gray-700 dark:text-slate-200 outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Children Selection List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase">{tLocal('selectChildren')}</label>
                  <button 
                    onClick={toggleSelectAllChildren}
                    className="text-[10px] font-bold text-orange-500 hover:text-orange-650"
                  >
                    {selectedChildren.length === childrenList.length ? 'Clear All' : tLocal('allChildren')}
                  </button>
                </div>
                
                <div className="border border-gray-100 dark:border-slate-850 rounded-2xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
                  {childrenList.map((child) => {
                    const isSelected = selectedChildren.includes(child.id);
                    return (
                      <button
                        key={child.id}
                        onClick={() => toggleChildSelection(child.id)}
                        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <img src={child.avatar} alt={child.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <span className="text-xs font-semibold text-gray-750 dark:text-slate-350">{child.name}</span>
                        </div>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300 dark:border-slate-650 bg-transparent'
                        }`}>
                          {isSelected && <Plus size={10} strokeWidth={4} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 dark:bg-slate-900/60 border-t border-gray-100 dark:border-slate-800 shrink-0 flex gap-2">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="flex-1 h-11 bg-white hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-slate-200 border border-gray-200 dark:border-slate-750 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
              >
                {tLocal('cancel')}
              </button>
              <button
                onClick={handleConfirmSchedule}
                disabled={selectedChildren.length === 0}
                className="flex-1 h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-md shadow-orange-500/10"
              >
                {tLocal('confirmSchedule')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
