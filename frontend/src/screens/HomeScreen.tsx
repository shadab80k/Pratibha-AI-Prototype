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
  Music,
  Palette,
  Activity,
} from 'lucide-react';
import type { Screen } from '../App';
import type { Child, HomeVisit } from '../types';
import type { TranslationStrings } from '../lib/translations';
import { useLanguage } from '../context/LanguageContext';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
  onChildSelect?: (childId: string) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  notificationCount: number;
  onNotificationClick: () => void;
  onOpenSidebar: () => void;
  childrenList: Child[];
  visitsList: HomeVisit[];
  workerName: string;
}

const quickActions = [
  { label: 'Record\nAttendance', labelHi: 'उपस्थिति', icon: CalendarCheck, color: 'bg-emerald-500', screen: 'children' as Screen },
  { label: 'Start\nActivity', labelHi: 'गतिविधि', icon: Sparkles, color: 'bg-violet-500', screen: 'activities' as Screen },
  { label: 'Voice\nReport', labelHi: 'आवाज़ रिपोर्ट', icon: Mic, color: 'bg-orange-500', screen: 'voice-report' as Screen },
  { label: 'Add\nObservation', labelHi: 'टिप्पणी', icon: PlusCircle, color: 'bg-sky-500', screen: 'children' as Screen },
];

const actionKeys: Record<string, string> = {
  'Record\nAttendance': 'recordAttendance',
  'Start\nActivity': 'startActivity',
  'Voice\nReport': 'voiceReport',
  'Add\nObservation': 'addObservation'
};

const alerts = [
  { icon: Users, text: '3 children absent for 5+ days', color: 'text-red-500', bg: 'bg-red-50' },
  { icon: FileText, text: 'Nutrition update pending', color: 'text-amber-500', bg: 'bg-amber-50' },
];

const alertKeys: Record<string, string> = {
  '3 children absent for 5+ days': 'absenteesAlert',
  'Nutrition update pending': 'nutritionAlert'
};

export function HomeScreen({
  onNavigate,
  onChildSelect: _onChildSelect,
  isOffline,
  onToggleOffline,
  notificationCount,
  onNotificationClick,
  onOpenSidebar,
  childrenList,
  visitsList,
  workerName,
}: HomeScreenProps) {
  const { t, language } = useLanguage();
  const presentCount = childrenList.filter((c) => c.attendance === 'present').length;
  const totalCount = childrenList.length;
  const goodNutritionCount = childrenList.filter((c) => c.nutritionStatus === 'good').length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 1000) / 10 : 0;
  
  // Calculate pending visits dynamically from visitsList state
  const pendingVisitsCount = visitsList.filter((v) => v.status === 'pending').length;

  // Dynamic AI recommended activity based on child state lags
  const childrenNeedingSupport = childrenList.filter(
    (c) => c.needsAttention || c.attendance === 'irregular' || c.nutritionStatus !== 'good'
  );
  const supportChild = childrenNeedingSupport.length > 0 ? childrenNeedingSupport[0] : childrenList[0];
  
  let recTitle = '';
  let recDesc = '';
  let recIcon = 'BookOpen';

  if (supportChild) {
    const isHindi = language === 'hi';
    const isBengali = language === 'bn';
    const isMarathi = language === 'mr';
    const childName = isHindi && supportChild.nameHindi ? supportChild.nameHindi : supportChild.name;
    
    if (supportChild.attendance === 'irregular') {
      recTitle = isHindi ? 'सिमन कहता है गतिविधि' : isBengali ? 'সিমন বলে কার্যক্রম' : isMarathi ? 'सिमन म्हणतो कृती' : 'Simon Says Activity';
      recDesc = isHindi 
        ? `${childName} की हजेरी में सुधार के लिए सामूहिक गतिविधि 'सिमन कहता है' कराएं।`
        : isBengali 
        ? `${childName}-এর উপস্থিতি উন্নত করতে মজার গ্রুপ গেম 'সিমন বলে' খেলান।`
        : isMarathi
        ? `${childName} च्या उपस्थिती सुधारण्यासाठी 'सिमन म्हणतो' ही खेळकर कृती करा।`
        : `Boost ${childName}'s attendance and energy today with a fun group activity: 'Simon Says'.`;
      recIcon = 'Activity';
    } else if (supportChild.nutritionStatus === 'at-risk' || supportChild.nutritionStatus === 'monitoring') {
      recTitle = isHindi ? 'रंग वर्गीकरण खेल' : isBengali ? 'রঙের শ্রেণীবিন্যাস খেলা' : isMarathi ? 'रंग वर्गीकरण खेळ' : 'Color Sorting Game';
      recDesc = isHindi
        ? `${childName} के संज्ञानात्मक विकास और ध्यान सुधार के लिए आज 'रंग वर्गीकरण खेल' की सिफारिश की जाती है।`
        : isBengali
        ? `${childName}-এর পুষ্টি ও মনোযোগের উন্নয়নের জন্য রঙের শ্রেণীবিন্যাস খেলা আজ প্রস্তাবিত।`
        : isMarathi
        ? `${childName} च्या पोषण आणि लक्ष केंद्रीत करण्यासाठी रंग वर्गीकरण खेळाची शिफारस केली जाते।`
        : `For ${childName}'s cognitive and fine-motor development, a 'Color Sorting Game' is recommended today.`;
      recIcon = 'Palette';
    } else {
      recTitle = isHindi ? 'कहानी वृत्त गतिविधि' : isBengali ? 'গল্পের বৃত্ত কার্যক্রম' : isMarathi ? 'गोष्ट वर्तुळ कृती' : 'Story Circle Activity';
      recDesc = isHindi
        ? `हाल के अवलोकनों के अनुसार, ${childName} को आज भाषा-केंद्रित 'कहानी वृत्त' गतिविधि से लाभ होगा।`
        : isBengali
        ? `সাম্প্রতিক পর্যবেক্ষণের উপর ভিত্তি করে, ${childName} আজ ভাষা-ভিত্তিক 'গল্পের বৃত্ত' থেকে উপকৃত হবে।`
        : isMarathi
        ? `अलीकडील निरीक्षणांच्या आधारे, ${childName} ला भाषा-केंद्रित गोष्ट वाचनाचा फायदा होईल।`
        : `Based on recent observations, ${childName} would benefit from a language-focused Story Circle today.`;
      recIcon = 'BookOpen';
    }
  } else {
    recTitle = t('storyCircle');
    recDesc = t('storyCircleDesc');
    recIcon = 'BookOpen';
  }

  // Dynamic daily insight generated from latest child observations
  let latestObs: { childName: string; note: string; category: string } | null = null;
  let newestObsId = 0;
  for (const c of childrenList) {
    if (c.observations && Array.isArray(c.observations)) {
      for (const o of c.observations) {
        if (o.id.startsWith('obs-') || o.id.startsWith('v-obs-')) {
          const timestamp = parseInt(o.id.split('-').pop() || '0');
          if (timestamp > newestObsId) {
            newestObsId = timestamp;
            latestObs = { childName: c.nameHindi && language === 'hi' ? c.nameHindi : c.name, note: o.note, category: o.category };
          }
        }
      }
    }
  }

  let dailyInsight = '';
  const isHindi = language === 'hi';
  const isBengali = language === 'bn';
  const isMarathi = language === 'mr';

  if (latestObs) {
    dailyInsight = isHindi
      ? `आज का सुझाव: ${latestObs.childName} के संबंध में आज दर्ज की गई टिप्पणी "${latestObs.note}" के आधार पर काम बढ़ाएं।`
      : isBengali
      ? `আজকের পরামর্শ: ${latestObs.childName}-এর জন্য আজ নথিভুক্ত করা মন্তব্য "${latestObs.note}"-এর ভিত্তিতে কাজ চালিয়ে যান।`
      : isMarathi
      ? `आजचा सल्ला: ${latestObs.childName} साठी आज नोंदवलेली नोंद "${latestObs.note}" च्या आधारे काम पुढे वाढवा।`
      : `AI Insight: Based on today's logged note for ${latestObs.childName} (${latestObs.category}), continue encouraging their progress.`;
  } else {
    dailyInsight = isHindi
      ? `आज की अंतर्दृष्टि: आपकी उपस्थिति दर ${attendanceRate}% है। ${presentCount} बच्चे उपस्थित हैं। पोषण ट्रैकिंग अपडेट रखें!`
      : isBengali
      ? `আজকের অন্তর্দৃষ্টি: আপনার উপস্থিতি হার ${attendanceRate}%। ${presentCount} জন শিশু উপস্থিত আছে। পুষ্টি ট্র্যাকিং আপডেট রাখুন!`
      : isMarathi
      ? `आजची अंतर्दृष्टी: तुमचा हजेरी दर ${attendanceRate}% आहे। ${presentCount} मुले हजर आहेत। पोषण ट्रॅकिंग अपडेट ठेवा!`
      : t('raniInsight');
  }

  // Dynamic Time Saved Calculation
  const observationsCount = childrenList.reduce((acc, c) => acc + (c.observations ? c.observations.length : 0), 0);
  const timeSaved = 60 + (observationsCount * 2) + (presentCount * 1.5) - (pendingVisitsCount * 2.5);
  const displayTimeSaved = Math.max(30, Math.round(timeSaved));

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 pt-10 pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onOpenSidebar}
            className="flex items-center gap-3 text-left active:scale-95 transition-transform outline-none"
          >
            <img
              src="/worker-sunita.png"
              alt="Sunita"
              className="w-10 h-10 rounded-full object-cover border-2 border-orange-200"
            />
            <div>
              <p className="text-xs text-gray-400">{t('welcome')}</p>
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">{t('namaste', { name: workerName })}</h2>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleOffline}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle offline mode"
            >
              {isOffline ? (
                <CloudOff size={20} className="text-gray-400" />
              ) : (
                <Wifi size={20} className="text-emerald-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={onNotificationClick}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
            >
              <Bell size={20} className="text-gray-650 dark:text-slate-350" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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
            <p className="text-xs text-gray-500 dark:text-slate-400 flex-1 font-medium">{t('offlineMode')}</p>
            <span className="text-[9px] bg-amber-500/20 dark:bg-amber-500/10 px-2 py-0.5 rounded-full text-amber-700 dark:text-amber-450 font-bold">Auto-sync</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center">
                <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs text-gray-400 font-medium">{t('attendanceCard')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {presentCount}
              <span className="text-sm font-normal text-gray-400">/{totalCount}</span>
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-450 mt-1 font-medium">
              {t('presentToday', { present: presentCount, total: totalCount })}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-950/30 rounded-lg flex items-center justify-center">
                <Heart size={16} className="text-amber-600 dark:text-amber-405" />
              </div>
              <span className="text-xs text-gray-400 font-medium">{t('nutritionCard')}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {goodNutritionCount}
              <span className="text-sm font-normal text-gray-400">/{totalCount}</span>
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-450 mt-1 font-medium">
              {t('goodStatus', { good: goodNutritionCount, total: totalCount })}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3">{t('quickActions')}</h3>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => onNavigate(action.screen)}
                  className="flex flex-col items-center gap-2 active:scale-95 transition-transform select-none"
                >
                  <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center shadow-md`}>
                    <Icon size={24} className="text-white" strokeWidth={2} />
                  </div>
                  <span className="text-[11px] text-gray-600 dark:text-slate-350 text-center leading-tight whitespace-pre-line font-medium">
                    {t((actionKeys[action.label] || action.label) as keyof TranslationStrings)}
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
                <span className="text-xs font-medium text-violet-200">{t('aiRecommended')}</span>
              </div>
              <h4 className="text-base font-semibold mb-1">{recTitle}</h4>
              <p className="text-xs text-violet-100 leading-relaxed">
                {recDesc}
              </p>
              <button
                onClick={() => onNavigate('activities')}
                className="mt-3 px-4 py-2 bg-white/20 rounded-xl text-xs font-medium active:bg-white/30 transition-colors"
              >
                {t('viewActivity')}
              </button>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 ml-3">
              {recIcon === 'Activity' && <Activity size={28} className="text-white" />}
              {recIcon === 'Palette' && <Palette size={28} className="text-white" />}
              {recIcon === 'Music' && <Music size={28} className="text-white" />}
              {recIcon === 'BookOpen' && <BookIcon size={28} className="text-white" />}
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">{t('reminders')}</h3>
            {pendingVisitsCount > 0 && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-bold">
                {t('visitsPending', { count: pendingVisitsCount })}
              </span>
            )}
          </div>
          {alerts.map((alert, i) => {
            const Icon = alert.icon;
            return (
              <button
                key={i}
                onClick={() => onNavigate('children')}
                className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-transform text-left"
              >
                <div className={`w-10 h-10 ${alert.bg} dark:bg-slate-950 rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={alert.color} />
                </div>
                <span className="text-sm text-gray-700 dark:text-slate-300 flex-1">{t((alertKeys[alert.text] || alert.text) as keyof TranslationStrings)}</span>
                <ChevronRight size={16} className="text-gray-300 dark:text-slate-500" />
              </button>
            );
          })}
        </div>

        {/* Daily Insight */}
        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-4 border border-orange-100 dark:border-orange-900/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-orange-500" />
            <span className="text-xs font-medium text-orange-600 dark:text-orange-450">{t('todayInsight')}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
            {dailyInsight}
          </p>
        </div>

        {/* Time Saved Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-emerald-600 dark:text-emerald-450" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {language === 'hi' ? `${displayTimeSaved} मिनट बचाए` : language === 'bn' ? `${displayTimeSaved} মিনিট বাঁচানো হয়েছে` : language === 'mr' ? `${displayTimeSaved} मिनिटे वाचली` : `${displayTimeSaved} minutes saved`}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('timeSavedDesc')}</p>
            </div>
            <button
              onClick={() => onNavigate('impact')}
              className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg active:bg-emerald-650 transition-colors"
            >
              {t('viewBtn')}
            </button>
          </div>
        </div>

        {/* Last Sync */}
        <div className="flex items-center justify-center gap-2 py-2">
          <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-gray-400' : 'bg-emerald-500 animate-pulse'}`} />
          <p className="text-[11px] text-gray-400 dark:text-slate-500">
            {isOffline ? t('lastSynced') : t('syncedNow')}
          </p>
        </div>
      </div>
    </div>
  );
}

function BookIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
