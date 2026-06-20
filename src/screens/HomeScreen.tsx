import React, { useMemo } from 'react';
import {
  Mic,
  Users,
  Sparkles,
  FileText,
  CalendarCheck,
  PlusCircle,
  Bell,
  CloudOff,
  Wifi,
  ChevronRight,
  TrendingUp,
  Clock,
  Heart,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import type { Screen } from '../App';
import type { Child, HomeVisit } from '../lib/api';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  onChildSelect?: (childId: string) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  notificationCount: number;
  onOpenSidebar: () => void;
  childrenList: Child[];
  visitsList: HomeVisit[];
  workerName: string;
  language: string;
}

const quickActions = [
  { label: 'Record\nAttendance', labelHi: 'उपस्थिति\nदर्ज करें', icon: CalendarCheck, color: 'bg-emerald-500', screen: 'children' as Screen },
  { label: 'Start\nActivity', labelHi: 'गतिविधि\nशुरू करें', icon: Sparkles, color: 'bg-violet-500', screen: 'activities' as Screen },
  { label: 'Voice\nReport', labelHi: 'आवाज़\nरिपोर्ट', icon: Mic, color: 'bg-orange-500', screen: 'voice-report' as Screen },
  { label: 'Home\nVisits', labelHi: 'गृह\nदौरा', icon: Calendar, color: 'bg-pink-500', screen: 'home-visits' as Screen },
  { label: 'AI\nAssistant', labelHi: 'एआई\nसहायक', icon: Sparkles, color: 'bg-indigo-500', screen: 'ai-assistant' as Screen },
  { label: 'Add\nObservation', labelHi: 'टिप्पणी\nजोड़ें', icon: PlusCircle, color: 'bg-sky-500', screen: 'children' as Screen },
];

export const HomeScreen = React.memo(function HomeScreen({
  onNavigate,
  onChildSelect,
  isOffline,
  onToggleOffline,
  notificationCount,
  onOpenSidebar,
  childrenList,
  visitsList,
  workerName,
  language,
}: HomeScreenProps) {
  // Memoize counts and child-related stats
  const {
    presentCount,
    totalCount,
    attendanceRate,
    goodNutritionCount,
    nutritionPercentage,
    needsAttentionChildren
  } = useMemo(() => {
    const list = childrenList || [];
    const total = list.length;
    const present = list.filter((c) => c.attendance === 'present').length;
    const rate = total > 0 ? Math.round((present / total) * 1000) / 10 : 0;
    const goodNutrition = list.filter((c) => c.nutritionStatus === 'good').length;
    const nutritionPct = total > 0 ? Math.round((goodNutrition / total) * 100) : 0;
    const attention = list.filter((c) => c.needsAttention);
    return {
      presentCount: present,
      totalCount: total,
      attendanceRate: rate,
      goodNutritionCount: goodNutrition,
      nutritionPercentage: nutritionPct,
      needsAttentionChildren: attention,
    };
  }, [childrenList]);

  // Memoize pending visits count
  const pendingVisitsCount = useMemo(() => {
    return (visitsList || []).filter((v) => v.status === 'pending').length;
  }, [visitsList]);

  // Memoize today's date formatted beautifully in Hindi or English
  const formattedDate = useMemo(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'short' };
    const locale = language === 'hi' ? 'hi-IN' : 'en-US';
    return today.toLocaleDateString(locale, options);
  }, [language]);

  // Memoize dynamic alerts (Reminders) to replace static notifications
  const dynamicAlerts = useMemo(() => {
    const list = [];
    const listChildren = childrenList || [];
    const absentCount = listChildren.filter(c => c.attendance === 'absent').length;
    const irregularCount = listChildren.filter(c => c.attendance === 'irregular').length;
    const totalAbsentOrIrregular = absentCount + irregularCount;

    if (totalAbsentOrIrregular > 0) {
      list.push({
        id: 'alert-attendance',
        icon: Users,
        text: language === 'hi' 
          ? `${totalAbsentOrIrregular} बच्चे आज अनुपस्थित/अनियमित हैं` 
          : `${totalAbsentOrIrregular} ${totalAbsentOrIrregular === 1 ? 'child is' : 'children are'} absent/irregular today`,
        color: 'text-red-500',
        bg: 'bg-red-50 dark:bg-red-950/20',
        screen: 'children' as Screen,
      });
    }

    // Nutrition update pending alert: count children with nutritionStatus !== 'good'
    const riskCount = listChildren.filter(c => c.nutritionStatus !== 'good').length;
    if (riskCount > 0) {
      list.push({
        id: 'alert-nutrition',
        icon: FileText,
        text: language === 'hi'
          ? `${riskCount} बच्चों का पोषण अपडेट लंबित है`
          : `Nutrition update pending for ${riskCount} ${riskCount === 1 ? 'child' : 'children'}`,
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        screen: 'reports' as Screen,
      });
    }

    return list;
  }, [childrenList, language]);

  // Memoize daily insight
  const dailyInsight = useMemo(() => {
    const list = childrenList || [];
    const rani = list.find(c => c.name === 'Rani' || c.nameHindi === 'रानी');
    if (rani) {
      const name = language === 'hi' ? rani.nameHindi : rani.name;
      if (language === 'hi') {
        return `“इस सप्ताह गतिविधियों में ${name} की भागीदारी में 40% सुधार हुआ है। समूह में कहानी सुनाने को बढ़ावा देते रहें!”`;
      } else {
        return `“${name}'s participation in language activities has improved by 40% this week. Keep encouraging group storytelling!”`;
      }
    }
    if (list.length > 0) {
      const firstChild = list[0];
      const name = language === 'hi' ? firstChild.nameHindi : firstChild.name;
      if (language === 'hi') {
        return `“${name} खेल-खेल में सीख रहा है। दैनिक गतिविधियों को प्रोत्साहित करें!”`;
      } else {
        return `“${name} is learning through play. Encourage daily activities!”`;
      }
    }
    return language === 'hi'
      ? "“आज की अंतर्दृष्टि: कोई बच्चा पंजीकृत नहीं है। कृपया बच्चों को जोड़ें।”"
      : "“Today's Insight: No children registered. Please register children to get insights.”";
  }, [childrenList, language]);

  // Memoize time saved card data
  const timeSaved = useMemo(() => {
    const list = childrenList || [];
    const totalObservations = list.reduce((acc, child) => acc + (child.observations?.length || 0), 0);
    const completedVisits = (visitsList || []).filter(v => v.status === 'completed').length;
    return 30 + (totalObservations * 5) + (completedVisits * 10);
  }, [childrenList, visitsList]);

  // Memoize AI Activity suggestion
  const aiActivitySuggestion = useMemo(() => {
    const list = childrenList || [];
    const supportNeededChildren = list.filter(c => c.needsAttention || c.developmentProgress < 75);
    const count = supportNeededChildren.length;
    
    const activityTitle = language === 'hi' ? 'कहानी वृत्त गतिविधि' : 'Story Circle Activity';
    let description = '';
    
    if (count > 0) {
      const primaryChild = language === 'hi' ? supportNeededChildren[0].nameHindi : supportNeededChildren[0].name;
      const othersCount = count - 1;
      if (language === 'hi') {
        description = othersCount > 0 
          ? `हाल के अवलोकनों के आधार पर, ${primaryChild} और ${othersCount} अन्य बच्चों को भाषा-केंद्रित समूह पाठन से लाभ होगा।`
          : `हाल के अवलोकनों के आधार पर, ${primaryChild} को भाषा-केंद्रित समूह पाठन से लाभ होगा।`;
      } else {
        description = othersCount > 0 
          ? `Based on recent observations, ${primaryChild} and ${othersCount} other${othersCount === 1 ? '' : 's'} would benefit from language-focused group reading.`
          : `Based on recent observations, ${primaryChild} would benefit from language-focused group reading.`;
      }
    } else {
      if (language === 'hi') {
        description = `सभी बच्चे अच्छी प्रगति कर रहे हैं! समूह गतिविधियों के माध्यम से उनकी सामाजिक क्षमताओं को बढ़ावा दें।`;
      } else {
        description = `All children are making great progress! Continue with group storytelling to boost social skills.`;
      }
    }
    
    return {
      title: activityTitle,
      description
    };
  }, [childrenList, language]);

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onOpenSidebar}
            className="flex items-center gap-3 text-left active:scale-95 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-xl"
            aria-label="Open sidebar menu"
          >
            <img
              src="./worker-sunita.png"
              alt="Sunita"
              className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
            />
            <div>
              <p className="text-xs text-gray-400 dark:text-slate-400 font-medium">
                {language === 'hi' ? 'स्वागत है' : 'Welcome'} • {formattedDate}
              </p>
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                {language === 'hi' ? `नमस्ते ${workerName}` : `Namaste ${workerName}`}
              </h2>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleOffline}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-orange-500 outline-none"
              title="Toggle offline mode"
              aria-label="Toggle offline mode"
            >
              {isOffline ? (
                <CloudOff size={20} className="text-gray-400" />
              ) : (
                <Wifi size={20} className="text-emerald-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => onNavigate('notifications')}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative focus-visible:ring-2 focus-visible:ring-orange-500 outline-none"
              title={language === 'hi' ? 'सूचनाएं' : 'Notifications'}
              aria-label={language === 'hi' ? 'सूचनाएं खोलें' : 'Open Notifications'}
            >
              <Bell size={20} className="text-gray-600 dark:text-slate-300" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Offline Banner */}
        {isOffline && (
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-900 rounded-xl border border-transparent dark:border-slate-800">
            <CloudOff size={16} className="text-gray-500 dark:text-slate-400" />
            <p className="text-xs text-gray-500 dark:text-slate-400 flex-1 font-medium">
              {language === 'hi' 
                ? 'ऑफलाइन मोड - सैंडबॉक्स लोकल सिंक सक्रिय' 
                : 'Offline mode - Sandbox local sync active'
              }
            </p>
            <span className="text-xs bg-amber-500/20 dark:bg-amber-500/10 px-2 py-0.5 rounded-full text-amber-700 dark:text-amber-400 font-bold">
              {language === 'hi' ? 'ऑटो-सिंक' : 'Auto-sync'}
            </span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Attendance Stat Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {language === 'hi' ? 'उपस्थिति' : 'Attendance'}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {presentCount}
              {totalCount > 0 && <span className="text-sm font-normal text-gray-400">/{totalCount}</span>}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              {totalCount > 0 
                ? (language === 'hi' ? `${attendanceRate}% उपस्थित आज` : `${attendanceRate}% present today`)
                : (language === 'hi' ? 'कोई बच्चा नहीं' : 'No children')
              }
            </p>
          </div>

          {/* Nutrition Stat Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-950/30 rounded-lg flex items-center justify-center">
                <Heart size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-xs text-gray-400 font-medium">
                {language === 'hi' ? 'पोषण स्तर' : 'Nutrition'}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {goodNutritionCount}
              {totalCount > 0 && <span className="text-sm font-normal text-gray-400">/{totalCount}</span>}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              {totalCount > 0 
                ? (language === 'hi' ? `${nutritionPercentage}% अच्छी स्थिति` : `${nutritionPercentage}% in good health`)
                : (language === 'hi' ? 'कोई बच्चा नहीं' : 'No children')
              }
            </p>
          </div>
        </div>

        {/* Needs Attention Highlight */}
        {totalCount > 0 && needsAttentionChildren.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl p-4 border border-red-100 dark:border-red-900/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle size={16} className="animate-bounce" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {language === 'hi' ? 'ध्यान देने की आवश्यकता' : 'Needs Attention'}
                </span>
              </div>
              <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/50 px-2.5 py-0.5 rounded-full">
                {needsAttentionChildren.length}
              </span>
            </div>
            <div className="space-y-2">
              {needsAttentionChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => onChildSelect?.(child.id)}
                  className="w-full flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-slate-800/80 shadow-sm active:scale-[0.98] transition-transform text-left outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={child.avatar} alt={child.name} className="w-8 h-8 rounded-full object-cover border border-red-200" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-white">
                        {language === 'hi' ? child.nameHindi : child.name}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">
                        {child.nutritionStatus === 'at-risk' 
                          ? (language === 'hi' ? 'पोषण: गंभीर जोखिम' : 'Nutrition: At-Risk')
                          : (language === 'hi' ? 'उपस्थिति: अनियमित' : 'Attendance: Irregular')
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-red-500">
                    <span className="text-xs font-medium">{language === 'hi' ? 'विवरण देखें' : 'View Profile'}</span>
                    <ChevronRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">
            {language === 'hi' ? 'त्वरित विकल्प' : 'Quick Actions'}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => onNavigate(action.screen)}
                  className="flex flex-col items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 active:scale-95 transition-all select-none outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center shadow-md shadow-slate-100 dark:shadow-none`}>
                    <Icon size={20} className="text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs text-gray-600 dark:text-slate-300 text-center leading-tight whitespace-pre-line font-semibold">
                    {language === 'hi' ? action.labelHi : action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Activity Suggestion */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-violet-500/10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-violet-200" />
                <span className="text-xs font-medium text-violet-200">
                  {language === 'hi' ? 'एआई अनुशंसित' : 'AI Recommended'}
                </span>
              </div>
              <h4 className="text-base font-semibold mb-1">{aiActivitySuggestion.title}</h4>
              <p className="text-xs text-violet-100 leading-relaxed">
                {aiActivitySuggestion.description}
              </p>
              <button
                onClick={() => onNavigate('activities')}
                className="mt-3 px-4 py-2 bg-white/20 rounded-xl text-xs font-medium active:bg-white/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {language === 'hi' ? 'गतिविधि देखें' : 'View Activity'}
              </button>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 ml-3">
              <BookIcon size={28} className="text-white" />
            </div>
          </div>
        </div>

        {/* Empty State Banner when no children */}
        {totalCount === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center shadow-sm border border-gray-100 dark:border-slate-800 py-10">
            <Users className="mx-auto text-gray-400 dark:text-slate-600 mb-3" size={40} />
            <h4 className="text-sm font-bold text-gray-800 dark:text-white">
              {language === 'hi' ? 'कोई बच्चा पंजीकृत नहीं है' : 'No Children Registered'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-2 max-w-[265px] mx-auto leading-relaxed font-medium">
              {language === 'hi' 
                ? 'अपने आंगनवाड़ी केंद्र डेटाबेस में बच्चों को जोड़ने के लिए सेटिंग्स में जाएं या सिंक करें।'
                : 'Add children to your Anganwadi database from the Settings tab or sync to pull online data.'
              }
            </p>
            <button
              onClick={() => onNavigate('settings')}
              className="mt-4 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl active:bg-orange-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              {language === 'hi' ? 'सेटिंग्स खोलें' : 'Open Settings'}
            </button>
          </div>
        )}

        {/* Alerts / Reminders */}
        {totalCount > 0 && dynamicAlerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                {language === 'hi' ? 'अनुस्मारक' : 'Reminders'}
              </h3>
              {pendingVisitsCount > 0 && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold">
                  {pendingVisitsCount} {language === 'hi' ? 'दौरे लंबित' : 'Visits Pending'}
                </span>
              )}
            </div>
            {dynamicAlerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <button
                  key={alert.id}
                  onClick={() => onNavigate(alert.screen)}
                  className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-transform text-left outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                >
                  <div className={`w-10 h-10 ${alert.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={alert.color} />
                  </div>
                  <span className="text-xs text-gray-700 dark:text-slate-300 flex-1 font-medium">{alert.text}</span>
                  <ChevronRight size={16} className="text-gray-300 dark:text-slate-500" />
                </button>
              );
            })}
          </div>
        )}

        {/* Daily Insight */}
        {totalCount > 0 && (
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-orange-500" />
              <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                {language === 'hi' ? 'आज का विचार' : "Today's Insight"}
              </span>
            </div>
            <p className="text-xs text-gray-700 dark:text-slate-300 leading-relaxed font-medium">
              {dailyInsight}
            </p>
          </div>
        )}

        {/* Time Saved Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-gray-800 dark:text-white">
                {language === 'hi' ? `${timeSaved} मिनट बचाए` : `${timeSaved} minutes saved`}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                {language === 'hi' ? 'इस सप्ताह रिपोर्टिंग समय में' : 'of reporting time this week'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('impact')}
              className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg active:bg-emerald-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {language === 'hi' ? 'देखें' : 'View'}
            </button>
          </div>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-center gap-2 py-2">
          <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-gray-400' : 'bg-emerald-500 animate-pulse'}`} />
          <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">
            {isOffline 
              ? (language === 'hi' ? 'अंतिम सिंक: 2 घंटे पहले' : 'Last synced: 2 hours ago') 
              : (language === 'hi' ? 'अभी सिंक हुआ' : 'Synced just now')
            }
          </p>
        </div>
      </div>
    </div>
  );
});

function BookIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
