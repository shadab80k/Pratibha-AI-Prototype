export interface TranslationStrings {
  back: string;
  continue: string;
  save: string;
  cancel: string;
  offlineMode: string;
  syncNow: string;
  syncedNow: string;
  lastSynced: string;
  getStarted: string;
  tagline: string;
  chooseLanguage: string;
  languageSubtitle: string;
  welcomeBack: string;
  loginSubtitle: string;
  workerIdLabel: string;
  workerIdPlaceholder: string;
  mobileLabel: string;
  mobilePlaceholder: string;
  offlineBannerTitle: string;
  offlineBannerDesc: string;
  rememberMe: string;
  loginBtn: string;
  terms: string;
  emptyFieldsErr: string;
  invalidIdErr: string;
  invalidMobileErr: string;
  verifyOtpTitle: string;
  enterOtpSent: string;
  mockOtpHint: string;
  verifyBtn: string;
  resendBtn: string;
  backToLogin: string;
  invalidOtpErr: string;
  welcome: string;
  namaste: string;
  attendanceCard: string;
  nutritionCard: string;
  presentToday: string;
  goodStatus: string;
  quickActions: string;
  recordAttendance: string;
  startActivity: string;
  voiceReport: string;
  addObservation: string;
  aiRecommended: string;
  storyCircle: string;
  storyCircleDesc: string;
  viewActivity: string;
  reminders: string;
  visitsPending: string;
  absenteesAlert: string;
  nutritionAlert: string;
  todayInsight: string;
  raniInsight: string;
  timeSavedTitle: string;
  timeSavedDesc: string;
  viewBtn: string;
  homeTab: string;
  childrenTab: string;
  activitiesTab: string;
  reportsTab: string;
  aiAssistantTab: string;
  toolsTitle: string;
  homeVisits: string;
  impact: string;
  offlineSync: string;
  notifications: string;
  settings: string;
  togglesTitle: string;
  darkTheme: string;
  logout: string;
  editProfile: string;
  workerName: string;
  workerId: string;
  anganwadiBlock: string;
  appPreferences: string;
  voiceSpeed: string;
  soundAlerts: string;
  databaseTitle: string;
  resetBtn: string;
  resetHint: string;
  securityTitle: string;
  securityDesc: string;
  saveBtn: string;
  speedSlow: string;
  speedNormal: string;
  speedFast: string;
}

export const translations: Record<string, TranslationStrings> = {
  en: {
    back: 'Back',
    continue: 'Continue',
    save: 'Save',
    cancel: 'Cancel',
    offlineMode: 'Offline mode - Sandbox local sync active',
    syncNow: 'Sync Now',
    syncedNow: 'Synced just now',
    lastSynced: 'Last synced: 2 hours ago',
    getStarted: 'Get Started',
    tagline: 'Less paperwork. More child engagement.',
    chooseLanguage: 'Choose Your Language',
    languageSubtitle: 'अपनी भाषा चुनें / তোমার भाषा चয়ন कर',
    welcomeBack: 'Welcome Back!',
    loginSubtitle: 'Login to your Anganwadi account',
    workerIdLabel: 'Worker ID',
    workerIdPlaceholder: 'Enter Worker ID',
    mobileLabel: 'Mobile Number',
    mobilePlaceholder: 'Enter Mobile Number',
    offlineBannerTitle: 'Works offline completely',
    offlineBannerDesc: 'All information will sync automatically when internet becomes available. No internet needed to use the app.',
    rememberMe: 'Remember me / Auto-login',
    loginBtn: 'Continue',
    terms: 'By continuing, you agree to our Terms of Service',
    emptyFieldsErr: 'Please fill in both Worker ID and Mobile Number.',
    invalidIdErr: 'Worker ID must start with "AW-" followed by digits (e.g. AW-4521).',
    invalidMobileErr: 'Please enter a valid 10-digit mobile number.',
    verifyOtpTitle: 'Verify OTP',
    enterOtpSent: 'Enter 4-digit OTP sent to {mobile}',
    mockOtpHint: 'Enter 1234 to proceed (Mock Verification)',
    verifyBtn: 'Verify & Log In',
    resendBtn: 'Resend OTP',
    backToLogin: 'Back to Login',
    invalidOtpErr: 'Invalid OTP code. Please enter 1234.',
    welcome: 'Welcome',
    namaste: 'Namaste {name}',
    attendanceCard: 'Attendance',
    nutritionCard: 'Nutrition',
    presentToday: '{present}/{total} present today',
    goodStatus: '{good}/{total} Good status',
    quickActions: 'Quick Actions',
    recordAttendance: 'Record\nAttendance',
    startActivity: 'Start\nActivity',
    voiceReport: 'Voice\nReport',
    addObservation: 'Add\nObservation',
    aiRecommended: 'AI Recommended',
    storyCircle: 'Story Circle Activity',
    storyCircleDesc: 'Based on recent observations, Rani and 3 others would benefit from language-focused group reading.',
    viewActivity: 'View Activity',
    reminders: 'Reminders',
    visitsPending: '{count} Visits Pending',
    absenteesAlert: '3 children absent for 5+ days',
    nutritionAlert: 'Nutrition update pending',
    todayInsight: "Today's Insight",
    raniInsight: "Rani's participation in language activities has improved by 40% this week. Keep encouraging group storytelling!",
    timeSavedTitle: '90 minutes saved',
    timeSavedDesc: 'of reporting time this week',
    viewBtn: 'View',
    homeTab: 'Home',
    childrenTab: 'Children',
    activitiesTab: 'Activities',
    reportsTab: 'Reports',
    aiAssistantTab: 'AI Help',
    toolsTitle: 'Tools & Planners',
    homeVisits: 'Home Visits Planner',
    impact: 'Impact & Analytics',
    offlineSync: 'Offline Sync Center',
    notifications: 'Notifications Hub',
    settings: 'Settings & Preferences',
    togglesTitle: 'Simulator Toggles',
    darkTheme: 'Dark Theme',
    logout: 'Logout from Account',
    editProfile: 'Edit Profile Details',
    workerName: 'Worker Name',
    workerId: 'Worker ID',
    anganwadiBlock: 'Anganwadi Center Block',
    appPreferences: 'App Preferences',
    voiceSpeed: 'Voice Guidance Speed',
    soundAlerts: 'Sound Success Alerts',
    databaseTitle: 'Simulator Database',
    resetBtn: 'Reset All Mock Data',
    resetHint: 'Clears dynamic edits, attendance toggles, visit completions, and sync queues, restoring all simulator values to defaults.',
    securityTitle: 'System Security',
    securityDesc: 'All observation notes and child records are locally encrypted on-device. When syncing is triggered online, data transfers securely over SSL.',
    saveBtn: 'Save Preferences',
    speedSlow: 'Slow',
    speedNormal: 'Normal',
    speedFast: 'Fast'
  },
  hi: {
    back: 'पीछे',
    continue: 'जारी रखें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    offlineMode: 'ऑफ़लाइन मोड - सैंडबॉक्स स्थानीय सिंक सक्रिय',
    syncNow: 'अभी सिंक करें',
    syncedNow: 'अभी-अभी सिंक किया गया',
    lastSynced: 'अंतिम सिंक: 2 घंटे पहले',
    getStarted: 'शुरू करें',
    tagline: 'कम कागजी काम। बच्चों के साथ अधिक जुड़ाव।',
    chooseLanguage: 'अपनी भाषा चुनें',
    languageSubtitle: 'Choose Your Language / तुमची भाषा निवडा',
    welcomeBack: 'आपका स्वागत है!',
    loginSubtitle: 'अपने आंगनवाड़ी खाते में लॉग इन करें',
    workerIdLabel: 'कार्यकर्ता आईडी',
    workerIdPlaceholder: 'कार्यकर्ता आईडी दर्ज करें',
    mobileLabel: 'मोबाइल नंबर',
    mobilePlaceholder: 'मोबाइल नंबर दर्ज करें',
    offlineBannerTitle: 'पूरी तरह से ऑफ़लाइन काम करता है',
    offlineBannerDesc: 'इंटरनेट उपलब्ध होने पर सभी जानकारी स्वचालित रूप से सिंक हो जाएगी। ऐप का उपयोग करने के लिए इंटरनेट की आवश्यकता नहीं है।',
    rememberMe: 'मुझे याद रखें / ऑटो-लॉगिन',
    loginBtn: 'जारी रखें',
    terms: 'जारी रखकर, आप हमारी सेवा की शर्तों से सहमत होते हैं',
    emptyFieldsErr: 'कृपया कार्यकर्ता आईडी और मोबाइल नंबर दोनों भरें।',
    invalidIdErr: 'कार्यकर्ता आईडी "AW-" से शुरू होनी चाहिए और उसके बाद अंक होने चाहिए (जैसे AW-4521)।',
    invalidMobileErr: 'कृपया एक मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।',
    verifyOtpTitle: 'ओटीपी सत्यापित करें',
    enterOtpSent: '{mobile} पर भेजा गया 4-अंकीय ओटीपी दर्ज करें',
    mockOtpHint: 'आगे बढ़ने के लिए 1234 दर्ज करें (मॉक सत्यापन)',
    verifyBtn: 'सत्यापित करें और लॉग इन करें',
    resendBtn: 'ओटीपी पुनः भेजें',
    backToLogin: 'लॉगिन पर वापस जाएं',
    invalidOtpErr: 'अमान्य ओटीपी कोड। कृपया 1234 दर्ज करें।',
    welcome: 'स्वागत है',
    namaste: 'नमस्ते {name}',
    attendanceCard: 'उपस्थिति',
    nutritionCard: 'पोषण',
    presentToday: 'आज {present}/{total} उपस्थित हैं',
    goodStatus: '{good}/{total} अच्छा पोषण स्तर',
    quickActions: 'त्वरित कार्य',
    recordAttendance: 'उपस्थिति\nदर्ज करें',
    startActivity: 'गतिविधि\nशुरू करें',
    voiceReport: 'आवाज़\nरिपोर्ट',
    addObservation: 'टिप्पणी\nजोड़ें',
    aiRecommended: 'एआई अनुशंसित',
    storyCircle: 'कहानी वृत्त गतिविधि',
    storyCircleDesc: 'हाल के अवलोकनों के आधार पर, रानी और 3 अन्य को भाषा-केंद्रित समूह पढ़ने से लाभ होगा।',
    viewActivity: 'गतिविधि देखें',
    reminders: 'अनुस्मारक',
    visitsPending: '{count} गृह दौरे लंबित',
    absenteesAlert: '3 बच्चे 5+ दिनों से अनुपस्थित हैं',
    nutritionAlert: 'पोषण अपडेट लंबित',
    todayInsight: 'आज की अंतर्दृष्टि',
    raniInsight: 'भाषा गतिविधियों में रानी की भागीदारी में इस सप्ताह 40% सुधार हुआ है। समूह कहानी सुनाने को प्रोत्साहित करते रहें!',
    timeSavedTitle: '90 मिनट बचाए गए',
    timeSavedDesc: 'इस सप्ताह रिपोर्टिंग समय का',
    viewBtn: 'देखें',
    homeTab: 'होम',
    childrenTab: 'बच्चे',
    activitiesTab: 'गतिविधियाँ',
    reportsTab: 'रिपोर्ट',
    aiAssistantTab: 'एआई सहायता',
    toolsTitle: 'उपकरण और योजनाकार',
    homeVisits: 'गृह दौरा योजनाकार',
    impact: 'प्रभाव और विश्लेषण',
    offlineSync: 'ऑफ़लाइन सिंक केंद्र',
    notifications: 'अधिसूचना केंद्र',
    settings: 'सेटिंग्स और प्राथमिकताएं',
    togglesTitle: 'सिम्युलेटर टॉगल',
    darkTheme: 'डार्क थीम',
    logout: 'खाते से लॉग आउट करें',
    editProfile: 'प्रोफ़ाइल विवरण संपादित करें',
    workerName: 'कार्यकर्ता का नाम',
    workerId: 'कार्यकर्ता आईडी',
    anganwadiBlock: 'आंगनवाड़ी केंद्र ब्लॉक',
    appPreferences: 'ऐप प्राथमिकताएं',
    voiceSpeed: 'आवाज मार्गदर्शन गति',
    soundAlerts: 'सफलता ध्वनि अलर्ट',
    databaseTitle: 'सिम्युलेटर डेटाबेस',
    resetBtn: 'सभी मॉक डेटा रीसेट करें',
    resetHint: 'सभी सिम्युलेटर मानों को डिफ़ॉल्ट पर पुनर्स्थापित करते हुए, संपादन, उपस्थिति टॉगल और सिंक कतारों को साफ करता है।',
    securityTitle: 'प्रणाली सुरक्षा',
    securityDesc: 'सभी अवलोकन नोट और बच्चों के रिकॉर्ड डिवाइस पर स्थानीय रूप से एन्क्रिप्ट किए गए हैं। जब सिंक चालू होता है, तो डेटा सुरक्षित रूप से एसएसएल पर स्थानांतरित होता है।',
    saveBtn: 'प्राथमिकताएं सहेजें',
    speedSlow: 'धीमा',
    speedNormal: 'सामान्य',
    speedFast: 'तेज़'
  },
  bn: {
    back: 'ফিরে যান',
    continue: 'চালিয়ে যান',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল করুন',
    offlineMode: 'অফলাইন মোড - স্যান্ডবক্স স্থানীয় সিঙ্ক সক্রিয়',
    syncNow: 'এখন সিঙ্ক করুন',
    syncedNow: 'এইমাত্র সিঙ্ক করা হয়েছে',
    lastSynced: 'সর্বশেষ সিঙ্ক: ২ ঘণ্টা আগে',
    getStarted: 'শুরু করুন',
    tagline: 'কম কাগজের কাজ। বাচ্চাদের সাথে বেশি ব্যস্ততা।',
    chooseLanguage: 'আপনার ভাষা চয়ন করুন',
    languageSubtitle: 'Choose Your Language / अपनी भाषा चुनें',
    welcomeBack: 'স্বাগতম!',
    loginSubtitle: 'আপনার অঙ্গনওয়াড়ি অ্যাকাউন্টে লগ ইন করুন',
    workerIdLabel: 'কর্মী আইডি',
    workerIdPlaceholder: 'কর্মী আইডি লিখুন',
    mobileLabel: 'মোবাইল নম্বর',
    mobilePlaceholder: 'মোবাইল নম্বর লিখুন',
    offlineBannerTitle: 'সম্পূর্ণ অফলাইনে কাজ করে',
    offlineBannerDesc: 'ইন্টারনেট উপলব্ধ হলে সমস্ত তথ্য স্বয়ংক্রিয়ভাবে সিঙ্ক হবে। অ্যাপ ব্যবহারের জন্য ইন্টারনেটের প্রয়োজন নেই।',
    rememberMe: 'আমাকে মনে রাখুন / অটো-লগইন',
    loginBtn: 'চালিয়ে যান',
    terms: 'চালিয়ে যাওয়ার মাধ্যমে, আপনি আমাদের পরিষেবার শর্তাবলীতে সম্মত হন',
    emptyFieldsErr: 'দয়া করে কর্মী আইডি এবং মোবাইল নম্বর উভয়ই পূরণ করুন।',
    invalidIdErr: 'কর্মী আইডি অবশ্যই "AW-" দিয়ে শুরু হতে হবে এবং তারপরে সংখ্যা থাকতে হবে (যেমন AW-4521)।',
    invalidMobileErr: 'দয়া করে একটি বৈধ ১০-অঙ্কের মোবাইল নম্বর লিখুন।',
    verifyOtpTitle: 'ওটিপি যাচাই করুন',
    enterOtpSent: '{mobile} নম্বরে পাঠানো ৪-অঙ্কের ওটিপি লিখুন',
    mockOtpHint: 'এগিয়ে যেতে 1234 লিখুন (মক যাচাইকরণ)',
    verifyBtn: 'যাচাই করুন এবং লগ ইন করুন',
    resendBtn: 'ওটিপি পুনরায় পাঠান',
    backToLogin: 'লগইনে ফিরে যান',
    invalidOtpErr: 'অকার্যকর ওটিপি কোড। দয়া করে 1234 লিখুন।',
    welcome: 'স্বাগতম',
    namaste: 'নমস্তে {name}',
    attendanceCard: 'উপস্থিতি',
    nutritionCard: 'পুষ্টি',
    presentToday: 'আজ {present}/{total} উপস্থিত আছে',
    goodStatus: '{good}/{total} ভালো পুষ্টির মান',
    quickActions: 'দ্রুত পদক্ষেপ',
    recordAttendance: 'উপস্থিতি\nনথিভুক্ত করুন',
    startActivity: 'কার্যক্রম\nশুরু করুন',
    voiceReport: 'ভয়েস\nরিপোর্ট',
    addObservation: 'মন্তব্য\nযোগ করুন',
    aiRecommended: 'এআই প্রস্তাবিত',
    storyCircle: 'গল্পের বৃত্ত কার্যক্রম',
    storyCircleDesc: 'সাম্প্রতিক পর্যবেক্ষণের উপর ভিত্তি করে, রানী এবং আরও ৩ জন ভাষা-ভিত্তিক গ্রুপ রিডিং থেকে উপকৃত হবে।',
    viewActivity: 'কার্যক্রম দেখুন',
    reminders: 'অনুস্মারক',
    visitsPending: '{count}টি হোম ভিজিট মুলতুবি',
    absenteesAlert: '৩ জন শিশু ৫+ দিন ধরে অনুপস্থিত',
    nutritionAlert: 'পুষ্টি আপডেট মুলতুবি',
    todayInsight: 'আজকের অন্তর্দৃষ্টি',
    raniInsight: 'ভাষা কার্যকলাপে রানীর অংশগ্রহণ এই সপ্তাহে ৪০% উন্নত হয়েছে। গ্রুপ গল্প বলাকে উৎসাহিত করতে থাকুন!',
    timeSavedTitle: '৯০ মিনিট বেঁচেছে',
    timeSavedDesc: 'এই সপ্তাহে রিপোর্টিং সময়ের',
    viewBtn: 'দেখুন',
    homeTab: 'হোম',
    childrenTab: 'শিশু',
    activitiesTab: 'কার্যক্রম',
    reportsTab: 'রিপোর্ট',
    aiAssistantTab: 'এআই সাহায্য',
    toolsTitle: 'সরঞ্জাম ও পরিকল্পনাকারী',
    homeVisits: 'হোম ভিজিট পরিকল্পনাকারী',
    impact: 'প্রভাব ও বিশ্লেষণ',
    offlineSync: 'অফলাইন সিঙ্ক সেন্টার',
    notifications: 'বিজ্ঞপ্তি কেন্দ্র',
    settings: 'সেটিংস ও পছন্দসমূহ',
    togglesTitle: 'সিমুলেটর টগলস',
    darkTheme: 'ডার্ক থিম',
    logout: 'অ্যাকাউন্ট থেকে লগ আউট করুন',
    editProfile: 'প্রোফাইল বিবরণ সম্পাদনা করুন',
    workerName: 'কর্মীর নাম',
    workerId: 'কর্মী আইডি',
    anganwadiBlock: 'অঙ্গনওয়াড়ি কেন্দ্র ব্লক',
    appPreferences: 'অ্যাপের পছন্দসমূহ',
    voiceSpeed: 'ভয়েস গাইডেন্স স্পিড',
    soundAlerts: 'সাউন্ড সাকসেস অ্যালার্ট',
    databaseTitle: 'সিমুলেটর ডাটাবেস',
    resetBtn: 'সমস্ত মক ডেটা রিসেট করুন',
    resetHint: 'সমস্ত সিমুলেটর মান ডিফল্ট অবস্থায় ফিরিয়ে আনার জন্য আপনার করা পরিবর্তন এবং সিঙ্ক তালিকা সাফ করে।',
    securityTitle: 'সিস্টেম নিরাপত্তা',
    securityDesc: 'সমস্ত মন্তব্য নোট এবং শিশুদের রেকর্ড ডিভাইসে স্থানীয়ভাবে এনক্রিপ্ট করা থাকে। সিঙ্ক অন করা হলে ডেটা নিরাপদে SSL দ্বারা স্থানান্তরিত হয়।',
    saveBtn: 'পছন্দসমূহ সংরক্ষণ করুন',
    speedSlow: 'ধীর',
    speedNormal: 'স্বাভাবিক',
    speedFast: 'দ্রুত'
  },
  mr: {
    back: 'मागे',
    continue: 'पुढे जा',
    save: 'जतन करा',
    cancel: 'रद्द करा',
    offlineMode: 'ऑफलाईन मोड - सँडबॉक्स स्थानिक सिंक सक्रिय',
    syncNow: 'आता सिंक करा',
    syncedNow: 'आत्ताच सिंक केले',
    lastSynced: 'शेवटचे सिंक: २ तासांपूर्वी',
    getStarted: 'सुरू करा',
    tagline: 'कमी कागदपत्रे. मुलांसोबत अधिक सहभाग.',
    chooseLanguage: 'तुमची भाषा निवडा',
    languageSubtitle: 'Choose Your Language / अपनी भाषा चुनें',
    welcomeBack: 'स्वागत आहे!',
    loginSubtitle: 'तुमच्या अंगणवाडी खात्यात लॉग इन करा',
    workerIdLabel: 'कार्यकर्ता आयडी',
    workerIdPlaceholder: 'कार्यकर्ता आयडी प्रविष्ट करा',
    mobileLabel: 'मोबाईल नंबर',
    mobilePlaceholder: 'मोबाईल नंबर प्रविष्ट करा',
    offlineBannerTitle: 'पूर्णपणे ऑफलाईन काम करते',
    offlineBannerDesc: 'इंटरनेट उपलब्ध झाल्यावर सर्व माहिती स्वयंचलितपणे सिंक होईल. ॲप वापरण्यासाठी इंटरनेटची आवश्यकता नाही.',
    rememberMe: 'मला लक्षात ठेवा / ऑटो-लॉगिन',
    loginBtn: 'पुढे जा',
    terms: 'पुढे चालू ठेवून, आपण आमच्या सेवा शर्तींशी सहमत आहात',
    emptyFieldsErr: 'कृपया कार्यकर्ता आयडी आणि मोबाईल नंबर दोन्ही भरा.',
    invalidIdErr: 'कार्यकर्ता आयडी "AW-" ने सुरू होऊन पुढे अंक असणे आवश्यक आहे (उदा. AW-4521).',
    invalidMobileErr: 'कृपया वैध १०-अंकी मोबाईल नंबर प्रविष्ट करा.',
    verifyOtpTitle: 'ओटीपी सत्यापित करा',
    enterOtpSent: '{mobile} वर पाठवलेला ४-अंकी ओटीपी प्रविष्ट करा',
    mockOtpHint: 'पुढे जाण्यासाठी 1234 प्रविष्ट करा (मॉक पडताळणी)',
    verifyBtn: 'सत्यापित करा आणि लॉग इन करा',
    resendBtn: 'ओटीपी पुन्हा पाठवा',
    backToLogin: 'लॉगिनवर परत जा',
    invalidOtpErr: 'अवैध ओटीपी कोड. कृपया 1234 प्रविष्ट करा.',
    welcome: 'स्वागत आहे',
    namaste: 'नमस्ते {name}',
    attendanceCard: 'हजेरी',
    nutritionCard: 'पोषण',
    presentToday: 'आज {present}/{total} हजर आहेत',
    goodStatus: '{good}/{total} चांगली पोषण पातळी',
    quickActions: 'त्वरित कृती',
    recordAttendance: 'हजेरी\nनोंदवा',
    startActivity: 'कृती\nसुरू करा',
    voiceReport: 'आवाज\nअहवाल',
    addObservation: 'नोंद\nजोडा',
    aiRecommended: 'एआय शिफारस केलेले',
    storyCircle: 'गोष्ट वर्तुळ कृती',
    storyCircleDesc: 'अलीकडील निरीक्षणांच्या आधारे, राणी आणि इतर ३ जणांना भाषा-केंद्रित गट वाचनाचा फायदा होईल.',
    viewActivity: 'कृती पहा',
    reminders: 'स्मरणपत्रे',
    visitsPending: '{count} गृह भेटी प्रलंबित',
    absenteesAlert: '३ मुले ५+ दिवसांपासून गैरहजर आहेत',
    nutritionAlert: 'पोषण अपडेट प्रलंबित',
    todayInsight: 'आजची माहिती',
    raniInsight: 'भाषा कृतींमध्ये राणीचा सहभाग या आठवड्यात ४०% सुधारला आहे. गट कथा सांगण्यास प्रोत्साहन देत राहा!',
    timeSavedTitle: '९० मिनिटे वाचली',
    timeSavedDesc: 'या आठवड्यात अहवाल देण्याच्या वेळेची',
    viewBtn: 'पहा',
    homeTab: 'होम',
    childrenTab: 'मुले',
    activitiesTab: 'कृती',
    reportsTab: 'अहवाल',
    aiAssistantTab: 'एआय मदत',
    toolsTitle: 'साधने आणि नियोजक',
    homeVisits: 'गृह भेट नियोजक',
    impact: 'प्रभाव आणि विश्लेषण',
    offlineSync: 'ऑफलाईन सिंक केंद्र',
    notifications: 'सूचना केंद्र',
    settings: 'सेटिंग्ज आणि पसंती',
    togglesTitle: 'सिम्युलेटर टॉगल',
    darkTheme: 'डार्क थीम',
    logout: 'खात्यातून लॉग आउट करा',
    editProfile: 'प्रोफाइल तपशील संपादित करा',
    workerName: 'कार्यकर्त्याचे नाव',
    workerId: 'कार्यकर्ता आयडी',
    anganwadiBlock: 'अंगणवाडी केंद्र ब्लॉक',
    appPreferences: 'अॅप प्राधान्ये',
    voiceSpeed: 'आवाज मार्गदर्शन गती',
    soundAlerts: 'यशस्वी ध्वनी सूचना',
    databaseTitle: 'सिम्युलेटर डेटाबेस',
    resetBtn: 'सर्व मॉक डेटा रीसेट करा',
    resetHint: 'तुम्ही केलेले बदल, हजेरी टॉगल आणि सिंक रांगा साफ करतो आणि सिम्युलेटर डीफॉल्ट पुनर्संचयित करतो.',
    securityTitle: 'प्रणाली सुरक्षा',
    securityDesc: 'सर्व निरीक्षण नोंदी आणि मुलांचे रेकॉर्ड डिव्हाइसवर स्थानिक पातळीवर सुरक्षितपणे एनक्रिप्ट केलेले आहेत. सिंक चालू झाल्यावर डेटा एसएसएलवर हस्तांतरित होतो.',
    saveBtn: 'प्राधान्ये जतन करा',
    speedSlow: 'हळू',
    speedNormal: 'सामान्य',
    speedFast: 'जलद'
  }
};
