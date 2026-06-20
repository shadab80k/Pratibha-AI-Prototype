import { useState, useEffect } from 'react';
import { saveMedia, getMedia } from '../lib/indexedDb';
import {
  ArrowLeft,
  Mic,
  Sparkles,
  FileText,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Camera,
  X,
  Loader2,
  Square,
  Activity,
  Award,
} from 'lucide-react';
import type { Screen } from '../App';
import { useLanguage } from '../context/LanguageContext';

interface ChildProfileScreenProps {
  childId: string;
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  childrenList: any[];
  onAddObservation: (childId: string, note: string, category: string, type?: 'voice' | 'text' | 'photo', imageUrl?: string) => void;
}

type Tab = 'overview' | 'milestones' | 'observations';

const profileTranslations: Record<string, Record<string, string>> = {
  en: {
    voiceNoteTitle: 'Voice Recorder',
    listeningFor: 'Listening for {name}...',
    recording: 'Recording...',
    processing: 'AI Speech-to-Text...',
    stopAndTranscribe: 'Stop & Done',
    suggestedActivityTitle: 'AI Recommendation Engine',
    analyzingData: 'Analyzing developmental data...',
    milestoneLags: 'Checking milestone lags...',
    assignBtn: 'Assign to {name}',
    successAssign: 'Activity assigned to {name} successfully!',
    cameraTitle: 'Capture Observation',
    cameraInstruction: 'Frame the child activity and click Capture',
    captureBtn: 'Capture Photo',
    savePhotoBtn: 'Save Captured Photo',
    cancel: 'Cancel',
    addPhotoBtn: 'Camera Photo',
    photoLabel: 'Photo',
    transcribingDone: 'Transcribed successfully!',
    successPhotoSave: 'Photo observation logged successfully!',
  },
  hi: {
    voiceNoteTitle: 'आवाज़ रिकॉर्डर',
    listeningFor: '{name} के लिए सुन रहे हैं...',
    recording: 'रिकॉर्डिंग चालू है...',
    processing: 'एआई वाक्-से-पाठ (STT)...',
    stopAndTranscribe: 'रोकें और समाप्त करें',
    suggestedActivityTitle: 'एआई अनुशंसा इंजन',
    analyzingData: 'विकास संबंधी डेटा का विश्लेषण...',
    milestoneLags: 'मील के पत्थर अंतराल की जाँच...',
    assignBtn: '{name} को सौंपें',
    successAssign: '{name} को गतिविधि सफलतापूर्वक सौंपी गई!',
    cameraTitle: 'अवलोकन कैप्चर करें',
    cameraInstruction: 'बच्चे की गतिविधि को फ्रेम करें और कैप्चर पर क्लिक करें',
    captureBtn: 'फ़ोटो कैप्चर करें',
    savePhotoBtn: 'कैप्चर की गई फ़ोटो सहेजें',
    cancel: 'रद्द करें',
    addPhotoBtn: 'कैमरा फ़ोटो',
    photoLabel: 'फ़ोटो',
    transcribingDone: 'सफलतापूर्वक ट्रांसक्राइब किया गया!',
    successPhotoSave: 'फोटो अवलोकन सफलतापूर्वक दर्ज किया गया!',
  },
  bn: {
    voiceNoteTitle: 'ভয়েস রেকর্ডার',
    listeningFor: '{name}-এর জন্য শুনছি...',
    recording: 'রেকর্ডিং হচ্ছে...',
    processing: 'এআই স্পিচ-টু-টেক্সট...',
    stopAndTranscribe: 'থামুন ও শেষ করুন',
    suggestedActivityTitle: 'এআই সুপারিশ ইঞ্জিন',
    analyzingData: 'বিকাশ সংক্রান্ত ডেটা বিশ্লেষণ...',
    milestoneLags: 'মাইলেস্টোন ফাঁক পরীক্ষা...',
    assignBtn: '{name}-কে বরাদ্দ করুন',
    successAssign: 'কার্যক্রম সফলভাবে {name}-কে বরাদ্দ করা হয়েছে!',
    cameraTitle: 'পর্যবেক্ষণ ক্যাপচার',
    cameraInstruction: 'শিশুর কার্যক্রম ফ্রেম করুন এবং ক্যাপচারে ক্লিক করুন',
    captureBtn: 'ছবি ক্যাপচার করুন',
    savePhotoBtn: 'ক্যাপচার করা ছবি সংরক্ষণ করুন',
    cancel: 'বাতিল করুন',
    addPhotoBtn: 'ক্যামেরা ছবি',
    photoLabel: 'ছবি',
    transcribingDone: 'সফলভাবে প্রতিলিপি করা হয়েছে!',
    successPhotoSave: 'ছবি পর্যবেক্ষণ সফলভাবে সংরক্ষণ করা হয়েছে!',
  },
  mr: {
    voiceNoteTitle: 'आवाज रेकॉर्डर',
    listeningFor: '{name} साठी ऐकत आहे...',
    recording: 'रेकॉर्डिंग सुरू आहे...',
    processing: 'एआय स्पीच-टू-टेक्स्ट...',
    stopAndTranscribe: 'थांबवा आणि पूर्ण करा',
    suggestedActivityTitle: 'एआय शिफारस इंजिन',
    analyzingData: 'विकासात्मक डेटाचे विश्लेषण...',
    milestoneLags: 'मैल टप्पे तपासात आहे...',
    assignBtn: '{name} ला नियुक्त करा',
    successAssign: 'कृती यशस्वीरित्या {name} ला नियुक्त केली!',
    cameraTitle: 'निरीक्षण कॅप्चर करा',
    cameraInstruction: 'मुलाच्या कृती फ्रेम करा आणि कॅप्चरवर क्लिक करा',
    captureBtn: 'फोटो कॅप्चर करा',
    savePhotoBtn: 'कॅप्चर केलेला फोटो जतन करा',
    cancel: 'रद्द करा',
    addPhotoBtn: 'कॅमेरा फोटो',
    photoLabel: 'फोटो',
    transcribingDone: 'यशस्वीरित्या प्रतिलिपीत केले!',
    successPhotoSave: 'फोटो निरीक्षण यशस्वीरित्या नोंदवले गेले!',
  }
};

function IndexedDbImage({ mediaId, fallbackUrl }: { mediaId: string; fallbackUrl: string }) {
  const [src, setSrc] = useState(fallbackUrl);

  useEffect(() => {
    if (!mediaId || !mediaId.startsWith('photo-')) return;
    
    let active = true;
    let objectUrl = '';
    
    getMedia(mediaId).then((media) => {
      if (media && media.blob && active) {
        objectUrl = URL.createObjectURL(media.blob);
        setSrc(objectUrl);
      }
    }).catch(err => {
      console.warn('Failed to load image from IndexedDB:', err);
    });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [mediaId, fallbackUrl]);

  return <img src={src} className="w-full h-full object-cover" alt="Observation capture" />;
}

export function ChildProfileScreen({
  childId,
  onBack,
  onNavigate: _onNavigate,
  childrenList,
  onAddObservation,
}: ChildProfileScreenProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [obsCategory, setObsCategory] = useState('Language');
  const [obsNote, setObsNote] = useState('');

  // Modals States
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'processing' | 'done'>('idle');
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [waveform, setWaveform] = useState<number[]>(new Array(15).fill(4));

  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [suggestState, setSuggestState] = useState<'analyzing' | 'recommended'>('analyzing');

  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraState, setCameraState] = useState<'preview' | 'captured'>('preview');
  const [cameraFlash, setCameraFlash] = useState(false);

  const child = childrenList.find((c) => c.id === childId);

  // Localization translator helper
  const pt = (key: string, variables?: Record<string, string>) => {
    const trans = profileTranslations[language] || profileTranslations['en'];
    let text = trans[key] || profileTranslations['en'][key] || key;
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), v);
      });
    }
    return text;
  };

  // Recording Timer effect
  useEffect(() => {
    let timerInterval: ReturnType<typeof setInterval>;
    let waveInterval: ReturnType<typeof setInterval>;

    if (isVoiceModalOpen && voiceState === 'recording') {
      timerInterval = setInterval(() => {
        setRecordingTimer((prev) => prev + 1);
      }, 1000);

      waveInterval = setInterval(() => {
        setWaveform((prev) => prev.map(() => Math.floor(Math.random() * 25) + 3));
      }, 150);
    } else {
      setRecordingTimer(0);
      setWaveform(new Array(15).fill(4));
    }

    return () => {
      clearInterval(timerInterval);
      clearInterval(waveInterval);
    };
  }, [isVoiceModalOpen, voiceState]);

  // AI Suggestion loading transition effect
  useEffect(() => {
    if (isSuggestModalOpen && suggestState === 'analyzing') {
      console.log(`[AI Engine] Analyzing development data for child: ${child?.name || childId}`);
      const timer = setTimeout(() => {
        setSuggestState('recommended');
        console.log(`[AI Engine] Recommendation ready for child: ${child?.name || childId}`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuggestModalOpen, suggestState, childId, child]);

  if (!child) return null;

  const presentCount = child.attendanceHistory.filter(Boolean).length;
  const attendanceRate = Math.round((presentCount / child.attendanceHistory.length) * 100);

  // Voice note processing trigger
  const triggerStopRecording = () => {
    setVoiceState('processing');
    setTimeout(() => {
      setVoiceState('done');
      let transcript = '';
      if (child.id === '1') {
        transcript = language === 'hi'
          ? 'रानी ने आज कविता पाठ में बेहतरीन प्रदर्शन किया। समूह गतिविधियों में उसका आत्मविश्वास काफी बढ़ा हुआ था।'
          : language === 'bn'
          ? 'রানী আজ কবিতা আবৃতিতে চমৎকার পারফরম্যান্স করেছে। গ্রুপ কার্যকলাপে তার আত্মবিশ্বাস ছিল দারুণ।'
          : language === 'mr'
          ? 'राणीने आज वर्गात छान कविता म्हटली। सामूहिक खेळात तिचा आत्मविश्वास खूप सुधारला आहे।'
          : 'Rani recited simple poems today during story class. Vocal clarity has improved significantly.';
      } else if (child.id === '2') {
        transcript = language === 'hi'
          ? 'आरव ने आज ब्लॉक बिल्डिंग में सक्रिय रूप से भाग लिया और बाद में ब्लॉक समेटने में मदद की।'
          : language === 'bn'
          ? 'আরাভ আজ ব্লক তৈরিতে সক্রিয়ভাবে অংশ নিয়েছিল এবং পরে ব্লক গুছিয়ে রাখতে সাহায্য করেছে।'
          : language === 'mr'
          ? 'आरवने आज ब्लॉक रचण्यात सक्रिय सहभाग घेतला आणि खेळणी जागेवर ठेवायला मदत केली।'
          : 'Aarav participated actively in block-stacking and clean-up, showing strong cognitive and motor skills.';
      } else {
        transcript = language === 'hi'
          ? `आज ${child.nameHindi || child.name} ने रचनात्मक खेलों में सुंदर सहयोग दिया। प्रगति स्थिर है।`
          : language === 'bn'
          ? `আজ ${child.name}-এর পারফরম্যান্স সুন্দর ছিল। ক্রিয়েটিভ কাজে সে আগ্রহ দেখিয়েছে।`
          : language === 'mr'
          ? `आज ${child.name} ने खेळात छान रस दाखवला। विकास स्थिर आणि समाधानकारक आहे।`
          : `${child.name} engaged beautifully in creative play today. Progress is steady.`;
      }
      
      onAddObservation(child.id, transcript, obsCategory, 'voice');
      setTimeout(() => {
        setIsVoiceModalOpen(false);
        setVoiceState('idle');
      }, 1500);
    }, 2000);
  };

  // AI Activity Suggestion Setup
  let recommendedActivity = { title: 'Rhyme Time', category: 'Language', reason: '' };
  if (child.id === '1') {
    recommendedActivity = {
      title: language === 'hi' ? 'कहानी वृत्त' : language === 'bn' ? 'গল্পের বৃত্ত' : language === 'mr' ? 'गोष्ट वर्तुळ' : 'Story Circle',
      category: 'Language',
      reason: language === 'hi'
        ? "रानी के 'भाषा विकास' और बातचीत के कौशल में सुधार के लिए यह गतिविधि सहायक होगी।"
        : "Encourages narrative skill building to clear Rani's lagging 'Speaks in sentences' milestone."
    };
  } else if (child.id === '2') {
    recommendedActivity = {
      title: language === 'hi' ? 'रंग वर्गीकरण खेल' : language === 'bn' ? 'রঙের খেলা' : language === 'mr' ? 'रंग वर्गीकरण' : 'Color Sorting Game',
      category: 'Cognitive',
      reason: language === 'hi'
        ? "आरव के 'संज्ञानात्मक विकास' और ब्लॉक-पैटर्न पहचान कौशल को बढ़ाने के लिए उपयोगी है।"
        : "Strengthens shape and color classification rules for Aarav's 'Understands shapes' milestone."
    };
  } else {
    recommendedActivity = {
      title: language === 'hi' ? 'सिमन कहता है' : language === 'bn' ? 'সিমন বলে' : language === 'mr' ? 'सिमन म्हणतो' : 'Simon Says',
      category: 'Movement',
      reason: language === 'hi'
        ? `${child.nameHindi || child.name} के हजेरी अंतर और समूह संवाद सुधार के लिए यह खेल अनुशंसित है।`
        : `Structured physical play builds group collaboration and targets active attendance for ${child.name}.`
    };
  }

  // Camera Shutter Trigger
  const handleShutterClick = () => {
    setCameraFlash(true);
    setTimeout(() => setCameraFlash(false), 150);
    setCameraState('captured');
  };

  // Save Photo Observation
  const handleSavePhotoObs = async () => {
    const photoNote = language === 'hi'
      ? `कैप्चर किया गया फ़ोटो अवलोकन: गतिविधि ट्रैक रिकॉर्ड।`
      : language === 'bn'
      ? `ক্যাপচার করা ছবি পর্যবেক্ষণ: কার্যক্রম ট্র্যাকিং রেকর্ড।`
      : language === 'mr'
      ? `कॅप्चर केलेले फोटो निरीक्षण: कृती ट्रॅकिंग रेकॉर्ड।`
      : `Captured check-in photo observation: activity progress tracking.`;

    let mediaId = '';
    try {
      const res = await fetch(child.avatar);
      const photoBlob = await res.blob();
      mediaId = 'photo-' + Date.now();
      await saveMedia(mediaId, photoBlob, photoBlob.type || 'image/png');
      console.log('Saved photo blob to IndexedDB with ID:', mediaId);
    } catch (e) {
      console.warn('Failed to save photo blob to IndexedDB:', e);
    }
      
    onAddObservation(child.id, photoNote, obsCategory, 'photo', mediaId || child.avatar);
    setIsCameraModalOpen(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-3 px-4 pt-10 pb-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 active:scale-95 transition-all text-gray-700 dark:text-slate-350"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
            {language === 'hi' ? 'बच्चे की प्रोफाइल' : language === 'bn' ? 'শিশুর প্রোফাইল' : language === 'mr' ? 'मुलाचे प्रोफाइल' : 'Child Profile'}
          </h1>
        </div>
      </header>

      {/* Hero Profile */}
      <div className="bg-white dark:bg-slate-900 px-4 py-6 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <img
            src={child.avatar}
            alt={child.name}
            className="w-20 h-20 rounded-2xl object-cover bg-orange-100 shadow-md"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {language === 'hi' && child.nameHindi ? child.nameHindi : child.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">{child.ageDisplay}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                child.attendance === 'present'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450'
                  : child.attendance === 'irregular'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-450'
                  : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-450'
              }`}>
                {child.attendance === 'present'
                  ? (language === 'hi' ? 'आज उपस्थित' : language === 'bn' ? 'আজ উপস্থিত' : language === 'mr' ? 'आज हजर' : 'Present Today')
                  : child.attendance === 'irregular'
                  ? (language === 'hi' ? 'अनियमित' : language === 'bn' ? 'অনিয়মিত' : language === 'mr' ? 'अनियमित' : 'Irregular')
                  : (language === 'hi' ? 'अनुपस्थित' : language === 'bn' ? 'অনুপস্থিত' : language === 'mr' ? 'गैरहजर' : 'Absent')}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                child.nutritionStatus === 'good'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450'
                  : child.nutritionStatus === 'at-risk'
                  ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-450'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-450'
              }`}>
                {child.nutritionStatus === 'good'
                  ? (language === 'hi' ? 'पोषण अच्छा' : language === 'bn' ? 'পুষ্টি ভালো' : language === 'mr' ? 'पोषण चांगले' : 'Nutrition Good')
                  : child.nutritionStatus === 'at-risk'
                  ? (language === 'hi' ? 'पोषण जोखिम' : language === 'bn' ? 'পুষ্টি ঝুঁকিপূর্ণ' : language === 'mr' ? 'पोषण धोक्यात' : 'Nutrition At-Risk')
                  : (language === 'hi' ? 'पोषण निगरानी' : language === 'bn' ? 'পুষ্টি পর্যবেক্ষণ' : language === 'mr' ? 'पोषण निरीक्षण' : 'Nutrition Monitoring')}
              </span>
            </div>
          </div>
        </div>

        {/* Parent Info */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-950 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold">
                {language === 'hi' ? 'अभिभावक' : language === 'bn' ? 'অভিভাবক' : language === 'mr' ? 'पालक' : 'Parent'}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-350">{child.parentName}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-semibold">
                {language === 'hi' ? 'फ़ोन' : language === 'bn' ? 'ফোন' : language === 'mr' ? 'फोन' : 'Phone'}
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-slate-350">{child.parentPhone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
        {(['overview', 'milestones', 'observations'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors select-none ${
              activeTab === tab
                ? 'text-orange-650 dark:text-orange-500 border-b-2 border-orange-500 dark:border-orange-500'
                : 'text-gray-400 dark:text-slate-500'
            }`}
          >
            {tab === 'overview' ? (language === 'hi' ? 'अवलोकन' : language === 'bn' ? 'ওভারভিউ' : language === 'mr' ? 'आढावा' : 'Overview')
             : tab === 'milestones' ? (language === 'hi' ? 'मील के पत्थर' : language === 'bn' ? 'মাইলেস্টোন' : language === 'mr' ? 'मैल टप्पे' : 'Milestones')
             : (language === 'hi' ? 'टिप्पणियाँ' : language === 'bn' ? 'পর্যবেক্ষণ' : language === 'mr' ? 'निरीक्षणे' : 'Observations')}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Attendance Graph */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                  <Calendar size={16} className="text-orange-500" />
                  {language === 'hi' ? 'उपस्थिति (पिछले 14 दिन)' : language === 'bn' ? 'উপস্থিতি (গত ১৪ দিন)' : language === 'mr' ? 'हजेरी (गेले १४ दिवस)' : 'Attendance (Last 14 days)'}
                </h3>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-450">{attendanceRate}%</span>
              </div>
              <div className="flex gap-1">
                {child.attendanceHistory.map((present: boolean, i: number) => (
                  <div
                    key={i}
                    className={`flex-1 h-8 rounded-md ${
                      present ? 'bg-emerald-400 dark:bg-emerald-500/85' : 'bg-red-300 dark:bg-red-950/60'
                    }`}
                    title={present ? 'Present' : 'Absent'}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-gray-400 dark:text-slate-500">14 {language === 'hi' ? 'दिन पहले' : language === 'bn' ? 'দিন আগে' : language === 'mr' ? 'दिवसांपूर्वी' : 'days ago'}</span>
                <span className="text-[10px] text-gray-400 dark:text-slate-500">{language === 'hi' ? 'आज' : language === 'bn' ? 'আজ' : language === 'mr' ? 'आज' : 'Today'}</span>
              </div>
            </div>

            {/* Development Progress */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-orange-500" />
                {language === 'hi' ? 'विकास की प्रगति' : language === 'bn' ? 'বিকাশ অগ্রগতি' : language === 'mr' ? 'विकासाची प्रगती' : 'Development Progress'}
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Language', labelLoc: language === 'hi' ? 'भाषा' : language === 'bn' ? 'ভাষা' : language === 'mr' ? 'भाषा' : 'Language', value: Math.min(child.developmentProgress + 5, 100), color: 'bg-sky-500' },
                  { label: 'Numeracy', labelLoc: language === 'hi' ? 'संख्या ज्ञान' : language === 'bn' ? 'গণনা জ্ঞান' : language === 'mr' ? 'अंकज्ञान' : 'Numeracy', value: Math.min(child.developmentProgress - 5, 100), color: 'bg-violet-500' },
                  { label: 'Social', labelLoc: language === 'hi' ? 'सामाजिक' : language === 'bn' ? 'সামাজিক' : language === 'mr' ? 'सामाजिक' : 'Social', value: Math.min(child.developmentProgress + 10, 100), color: 'bg-emerald-500' },
                  { label: 'Motor', labelLoc: language === 'hi' ? 'शारीरिक विकास' : language === 'bn' ? 'শারীরিক বিকাশ' : language === 'mr' ? 'शारीरिक विकास' : 'Motor', value: Math.min(child.developmentProgress - 10, 100), color: 'bg-amber-500' },
                ].map((skill) => (
                  <div key={skill.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-650 dark:text-slate-350">{skill.labelLoc}</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-slate-200">{skill.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-slate-950 rounded-full overflow-hidden">
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
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-900/60 dark:to-slate-850/60 rounded-2xl p-4 border border-orange-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-orange-500" />
                <h3 className="text-sm font-semibold text-orange-850 dark:text-orange-400">AI Insights</h3>
              </div>
              <div className="space-y-2">
                {child.aiInsights.map((insight: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-orange-400 dark:text-orange-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-705 dark:text-slate-300 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Milestones Tab */}
        {activeTab === 'milestones' && (
          <div className="space-y-3">
            {child.milestones.map((milestone: any) => (
              <div
                key={milestone.id}
                className={`p-4 rounded-2xl border ${
                  milestone.completed
                    ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50'
                    : 'bg-white border-gray-100 dark:bg-slate-900 dark:border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      milestone.completed ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-800'
                    }`}
                  >
                    {milestone.completed ? (
                      <CheckCircle2 size={20} className="text-white" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-400 dark:border-slate-650 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-semibold ${milestone.completed ? 'text-emerald-800 dark:text-emerald-400' : 'text-gray-650 dark:text-slate-300'}`}>
                      {milestone.title}
                    </h4>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{milestone.category} &middot; {milestone.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Observations Tab */}
        {activeTab === 'observations' && (
          <div className="space-y-3">
            {/* Add Observation Form */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-orange-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-orange-650 dark:text-orange-400 mb-2 uppercase tracking-wide">
                {language === 'hi' ? 'अवलोकन जोड़ें' : language === 'bn' ? 'পর্যবেক্ষণ যোগ করুন' : language === 'mr' ? 'निरीक्षण जोडा' : 'Add Observation'}
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">
                    {language === 'hi' ? 'श्रेणी' : language === 'bn' ? 'বিভাগ' : language === 'mr' ? 'श्रेणी' : 'Category'}
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {['Language', 'Numeracy', 'Social', 'Cognitive', 'Motor', 'Emotional'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setObsCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${
                          obsCategory === cat
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 mb-1 uppercase">
                    {language === 'hi' ? 'अवलोकन विवरण' : language === 'bn' ? 'পর্যবেক্ষণ নোট' : language === 'mr' ? 'निरीक्षण नोंद' : 'Observation Note'}
                  </label>
                  <textarea
                    value={obsNote}
                    onChange={(e) => setObsNote(e.target.value)}
                    placeholder={language === 'hi' ? 'विवरण यहाँ टाइप करें...' : 'Type observation details...'}
                    rows={2}
                    className="w-full text-xs p-2.5 border border-slate-205 dark:border-slate-850 dark:bg-slate-950 dark:text-white rounded-xl focus:border-orange-500 focus:outline-none resize-none"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!obsNote.trim()) return;
                      onAddObservation(child.id, obsNote, obsCategory, 'text');
                      setObsNote('');
                    }}
                    disabled={!obsNote.trim()}
                    className="flex-1 h-9 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold active:scale-[0.97] transition-all"
                  >
                    {t('save')}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setIsCameraModalOpen(true);
                      setCameraState('preview');
                    }}
                    className="flex-1 h-9 bg-sky-500 hover:bg-sky-650 text-white rounded-xl text-xs font-semibold active:scale-[0.97] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Camera size={14} />
                    {pt('addPhotoBtn')}
                  </button>
                </div>
              </div>
            </div>

            {child.observations && child.observations.map((obs: any) => (
              <div key={obs.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-800/85">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    obs.type === 'voice' 
                      ? 'bg-orange-100 dark:bg-orange-950/20' 
                      : obs.type === 'photo'
                      ? 'bg-emerald-100 dark:bg-emerald-950/20'
                      : 'bg-sky-100 dark:bg-sky-950/20'
                  }`}>
                    {obs.type === 'voice' ? (
                      <Mic size={14} className="text-orange-500 dark:text-orange-400" />
                    ) : obs.type === 'photo' ? (
                      <Camera size={14} className="text-emerald-500 dark:text-emerald-400" />
                    ) : (
                      <FileText size={14} className="text-sky-500 dark:text-sky-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-slate-250 leading-relaxed">{obs.note}</p>
                    
                    {/* Dynamic Image observation thumbnail */}
                    {obs.type === 'photo' && (
                      <div className="mt-2.5 w-full max-w-[220px] h-32 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-inner relative bg-slate-100 dark:bg-slate-950">
                        {obs.imageUrl && obs.imageUrl.startsWith('photo-') ? (
                          <IndexedDbImage mediaId={obs.imageUrl} fallbackUrl={child.avatar} />
                        ) : (
                          <img 
                            src={obs.imageUrl || child.avatar} 
                            className="w-full h-full object-cover" 
                            alt="Observation capture check-in" 
                          />
                        )}
                        <div className="absolute top-1.5 left-1.5 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md text-[9px] text-white font-bold tracking-wide uppercase flex items-center gap-1">
                          <Camera size={8} />
                          {pt('photoLabel')}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded-full text-gray-500 dark:text-slate-400 font-medium">
                        {obs.category}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500">{obs.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons at the bottom */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              setIsVoiceModalOpen(true);
              setVoiceState('recording');
            }}
            className="flex items-center justify-center gap-2 p-3 bg-orange-500 text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-md shadow-orange-500/20"
          >
            <Mic size={16} />
            {language === 'hi' ? 'आवाज़ नोट' : language === 'bn' ? 'ভয়েস নোট' : language === 'mr' ? 'आवाज टिपण' : 'Voice Note'}
          </button>
          <button
            onClick={() => {
              setIsSuggestModalOpen(true);
              setSuggestState('analyzing');
            }}
            className="flex items-center justify-center gap-2 p-3 bg-violet-500 text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-md shadow-violet-500/20"
          >
            <Sparkles size={16} />
            {language === 'hi' ? 'सुझाव गतिविधि' : language === 'bn' ? 'কার্যক্রম প্রস্তাব' : language === 'mr' ? 'शिफारस कृती' : 'Suggest Activity'}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VOICE RECORDING SIMULATOR MODAL */}
      {/* ========================================================================= */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center rounded-[44px] p-4 pointer-events-auto overflow-hidden">
          <div className="w-full bg-[#1e293b] rounded-[32px] border border-slate-700/60 p-6 flex flex-col items-center animate-slide-up text-white shadow-2xl">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-6">
              <span className="text-sm font-bold text-slate-400 tracking-wide uppercase">{pt('voiceNoteTitle')}</span>
              <button 
                onClick={() => {
                  setIsVoiceModalOpen(false);
                  setVoiceState('idle');
                }}
                className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-all outline-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Listening instructions */}
            <div className="text-center mb-8">
              {voiceState === 'recording' && (
                <>
                  <p className="text-orange-400 text-base font-semibold mb-1 animate-pulse">{pt('recording')}</p>
                  <p className="text-slate-400 text-xs">{pt('listeningFor', { name: child.name })}</p>
                </>
              )}
              {voiceState === 'processing' && (
                <>
                  <p className="text-sky-400 text-base font-semibold mb-1">{pt('processing')}</p>
                  <p className="text-slate-450 text-xs animate-pulse">Speech-to-Text conversion...</p>
                </>
              )}
              {voiceState === 'done' && (
                <>
                  <p className="text-emerald-400 text-base font-bold mb-1">✔ {pt('transcribingDone')}</p>
                  <p className="text-slate-450 text-xs">Logged to child observations</p>
                </>
              )}
            </div>

            {/* Circle Mic Button / wave rings */}
            <div className="relative flex flex-col items-center mb-8">
              {voiceState === 'recording' && (
                <div className="absolute w-36 h-36 rounded-full border border-orange-500/20 animate-ping pointer-events-none" />
              )}
              <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl ${
                voiceState === 'recording' ? 'bg-red-500 shadow-red-500/20' : voiceState === 'processing' ? 'bg-sky-500 animate-pulse' : 'bg-emerald-500'
              }`}>
                {voiceState === 'recording' ? (
                  <Square size={22} className="text-white" fill="white" />
                ) : voiceState === 'processing' ? (
                  <Loader2 size={32} className="text-white animate-spin" />
                ) : (
                  <CheckCircle2 size={36} className="text-white" />
                )}
              </div>

              {/* Scrolling wave preview */}
              <div className="flex items-center gap-[3.5px] h-12 mt-6">
                {waveform.map((h, i) => (
                  <div 
                    key={i} 
                    className={`w-1 rounded-full transition-all duration-150 ${
                      voiceState === 'recording' ? 'bg-orange-500' : 'bg-slate-700'
                    }`} 
                    style={{ height: `${h}px` }} 
                  />
                ))}
              </div>
            </div>

            {/* Timer / Control */}
            <div className="w-full flex flex-col items-center gap-4 mt-2">
              <span className="text-xl font-mono font-bold tracking-widest text-slate-350">{formatTime(recordingTimer)}</span>
              {voiceState === 'recording' && (
                <button
                  onClick={triggerStopRecording}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 active:scale-95 transition-transform rounded-2xl text-xs font-bold shadow-md shadow-orange-500/10"
                >
                  {pt('stopAndTranscribe')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI RECOMMENDATION ACTIVITY SUGGESTION MODAL */}
      {/* ========================================================================= */}
      {isSuggestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center rounded-[44px] p-4 pointer-events-auto overflow-hidden">
          <div className="w-full bg-[#2e1065] bg-gradient-to-tr from-[#1e1b4b] to-[#2e1065] rounded-[32px] border border-violet-850 p-6 flex flex-col items-center animate-slide-up text-white shadow-2xl">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-400 animate-pulse" />
                <span className="text-sm font-bold text-violet-300 tracking-wide uppercase">{pt('suggestedActivityTitle')}</span>
              </div>
              <button 
                onClick={() => setIsSuggestModalOpen(false)}
                className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-all outline-none"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            {suggestState === 'analyzing' ? (
              <div className="w-full py-8 flex flex-col items-center justify-center gap-4">
                <Loader2 size={40} className="text-violet-400 animate-spin" />
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-slate-200">{pt('analyzingData')}</p>
                  <p className="text-xs text-slate-400 leading-none">{pt('milestoneLags')}</p>
                </div>
              </div>
            ) : (
              <div className="w-full space-y-5 animate-fade-in">
                {/* Recommended activity details */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-4 shadow-inner">
                  <div className="w-12 h-12 bg-violet-500 rounded-xl flex items-center justify-center shrink-0">
                    {recommendedActivity.category === 'Language' ? (
                      <Mic size={24} className="text-white" />
                    ) : recommendedActivity.category === 'Cognitive' ? (
                      <FileText size={24} className="text-white" />
                    ) : (
                      <Activity size={24} className="text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-[9px] bg-violet-500/20 px-2 py-0.5 rounded-full text-violet-300 font-bold uppercase">
                      {recommendedActivity.category}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">{recommendedActivity.title}</h4>
                    <p className="text-xs text-violet-200/90 mt-1 leading-relaxed">{recommendedActivity.reason}</p>
                  </div>
                </div>

                {/* Score alert badge */}
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300">
                  <Award size={16} className="shrink-0" />
                  <p className="text-[10px] font-semibold leading-normal">
                    This selection is tailored to improve development progress on {child.name}'s milestone check.
                  </p>
                </div>

                {/* Assign buttons */}
                <button
                  type="button"
                  onClick={() => {
                    alert(pt('successAssign', { name: child.name }));
                    setIsSuggestModalOpen(false);
                  }}
                  className="w-full h-12 bg-violet-600 hover:bg-violet-700 active:scale-95 transition-transform rounded-2xl text-xs font-bold shadow-md shadow-violet-700/20"
                >
                  {pt('assignBtn', { name: child.name })}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHOTO CAPTURE CAMERA SIMULATOR MODAL */}
      {/* ========================================================================= */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#020617] rounded-[44px] flex flex-col pointer-events-auto text-white overflow-hidden">
          {/* Header */}
          <header className="flex items-center justify-between px-6 pt-10 pb-4 border-b border-slate-900 bg-slate-950/80 z-20">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{pt('cameraTitle')}</span>
            <button 
              onClick={() => setIsCameraModalOpen(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X size={16} />
            </button>
          </header>

          {/* Viewport Frame */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
            {cameraState === 'preview' ? (
              <div className="w-full h-full relative flex flex-col items-center justify-between p-6">
                {/* Camera guide grid */}
                <div className="absolute inset-4 border border-white/20 rounded-2xl grid grid-cols-3 grid-rows-3 pointer-events-none">
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-r border-b border-white/10" />
                  <div className="border-b border-white/10" />
                  <div className="border-r border-white/10" />
                  <div className="border-r border-white/10" />
                  <div className="border-transparent" />
                </div>

                {/* Simulated Lens Viewport */}
                <div className="w-48 h-48 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center opacity-60 mt-20">
                  <Camera size={44} className="text-white/40" />
                </div>

                <p className="text-xs text-slate-400 text-center bg-black/60 px-4 py-2 rounded-full mb-10 z-10">
                  📷 {pt('cameraInstruction')}
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-between p-6">
                {/* Captured Photo Frame */}
                <div className="w-full max-w-[300px] h-[300px] mt-10 rounded-3xl overflow-hidden border-4 border-slate-700 bg-slate-900 relative shadow-2xl">
                  <img 
                    src={child.avatar} 
                    className="w-full h-full object-cover" 
                    alt="Captured activity" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs font-bold text-white/90">Captured: Just Now</span>
                  </div>
                </div>

                <p className="text-xs text-slate-350 bg-slate-900 px-4 py-1.5 rounded-full border border-slate-800 text-center mb-10">
                  ✔ {pt('successPhotoSave')}
                </p>
              </div>
            )}

            {/* Flash Effect Container */}
            {cameraFlash && (
              <div className="absolute inset-0 bg-white z-50 transition-opacity duration-150 animate-fade-out" />
            )}
          </div>

          {/* Shutter Panel */}
          <footer className="h-28 bg-slate-950 flex items-center justify-center px-8 z-20">
            {cameraState === 'preview' ? (
              <button 
                onClick={handleShutterClick}
                className="w-16 h-16 rounded-full bg-white border-[5px] border-slate-800 active:scale-90 transition-transform shadow-lg outline-none"
                title={pt('captureBtn')}
              />
            ) : (
              <div className="w-full flex gap-3">
                <button
                  onClick={() => setCameraState('preview')}
                  className="flex-1 h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors select-none active:scale-95"
                >
                  {pt('cancel')}
                </button>
                <button
                  onClick={handleSavePhotoObs}
                  className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors select-none active:scale-95 shadow-md shadow-orange-500/10"
                >
                  {pt('savePhotoBtn')}
                </button>
              </div>
            )}
          </footer>
        </div>
      )}
    </div>
  );
}
