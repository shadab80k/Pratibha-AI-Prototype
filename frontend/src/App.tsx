import { useRef, useEffect } from 'react';
import { SplashScreen } from './screens/SplashScreen';
import { LanguageScreen } from './screens/LanguageScreen';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ChildrenScreen } from './screens/ChildrenScreen';
import { ChildProfileScreen } from './screens/ChildProfileScreen';
import { VoiceReportScreen } from './screens/VoiceReportScreen';
import { ActivitiesScreen } from './screens/ActivitiesScreen';
import { AiAssistantScreen } from './screens/AiAssistantScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { HomeVisitsScreen } from './screens/HomeVisitsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { OfflineScreen } from './screens/OfflineScreen';
import { ImpactScreen } from './screens/ImpactScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { CloudOff, Wifi, Battery } from 'lucide-react';
import { LanguageProvider, useLanguage, type LanguageCode } from './context/LanguageContext';
import { AppProvider } from './context/AppContext';
import { STORAGE_KEYS } from './lib/constants';

export type { Screen, Tab, ToastData } from './types';
import { useAuth } from './hooks/useAuth';
import { useChildren } from './hooks/useChildren';
import { useVisits } from './hooks/useVisits';
import { useNotifications } from './hooks/useNotifications';
import { useOffline } from './hooks/useOffline';
import { useScheduledActivities } from './hooks/useScheduledActivities';
import { useAppLayout } from './hooks/useAppLayout';

function AppContent() {
  const mainRef = useRef<HTMLElement>(null);
  const { language, setLanguage, t } = useLanguage();

  const {
    workerName,
    setWorkerName,
    workerId,
    setWorkerId,
    anganwadiBlock,
    setAnganwadiBlock,
    screen,
    navigateTo,
    goBack,
    handleTabChange,
    activeTab,
  } = useAuth();

  const {
    childrenList,
    selectedChildId,
    selectChild,
    toggleAttendance,
    addObservation,
    syncVoiceReport,
    loadDataFromServer,
  } = useChildren();

  const {
    visitsList,
    completeVisit,
    handleAddVisit,
  } = useVisits();

  const {
    notificationsList,
    notificationCount,
    handleClearNotifications,
    handleMarkNotificationsRead,
    handleDeleteNotification,
  } = useNotifications();

  const {
    isOffline,
    pendingSync,
    toggleOffline,
    handleSyncNow,
  } = useOffline();

  const {
    scheduledActivities,
    handleScheduleActivity,
  } = useScheduledActivities();

  const {
    isDarkMode,
    toggleDarkMode,
    isSidebarOpen,
    setIsSidebarOpen,
    scale,
    toast,
    setToast,
    showToast,
    handleResetData,
  } = useAppLayout();

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [screen]);

  const showNavTabs = ['home', 'children', 'activities', 'reports', 'ai-assistant'].includes(screen);

  return (
    <div className="min-h-screen w-screen bg-[#0f172a] bg-gradient-to-tr from-[#020617] via-[#0f172a] to-[#1e1b4b] flex items-center justify-center p-3 overflow-y-auto overflow-x-hidden">
      <div 
        style={{ 
          width: 390 * scale, 
          height: 812 * scale,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <div 
          style={{
            position: 'absolute',
            width: 390,
            height: 812,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {/* Volume Rocker & Power Button Mockups */}
          <div className="absolute top-28 -left-[14px] w-[3px] h-10 bg-[#334155] rounded-l-md" />
          <div className="absolute top-44 -left-[14px] w-[3px] h-14 bg-[#334155] rounded-l-md" />
          <div className="absolute top-60 -left-[14px] w-[3px] h-14 bg-[#334155] rounded-l-md" />
          <div className="absolute top-36 -right-[14px] w-[3px] h-16 bg-[#334155] rounded-r-md" />

          {/* Phone Case Container */}
          <div className="relative w-[390px] h-[812px] bg-[#0b0f19] rounded-[55px] border-[11px] border-[#334155] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden select-none ring-1 ring-slate-800/50">
            <div className="absolute inset-0 rounded-[44px] border border-white/5 pointer-events-none z-50" />

            {/* Dynamic Island / Camera punch hole */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6.5 bg-black rounded-full z-50 flex items-center justify-between px-3 shadow-[inset_0_1px_3px_rgba(255,255,255,0.2)]">
              <div className="w-3.5 h-3.5 bg-[#0f1015] rounded-full border border-slate-800/85 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#081b33] rounded-full opacity-60 shadow-inner" />
              </div>
              <div className="w-8 h-1 bg-[#101010] rounded-full" />
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </div>

            {/* Inner Screen Container */}
            <div className={`phone-screen w-full h-full bg-[#F9FAFB] dark:bg-slate-950 rounded-[44px] overflow-hidden relative flex flex-col ${
              isDarkMode ? 'dark' : ''
            }`}>
              {/* Status Bar Overlay */}
              {screen !== 'splash' && (
                <div className={`absolute top-0 left-0 right-0 h-10 px-6 flex items-center justify-between text-[11px] font-semibold z-45 bg-transparent pointer-events-none select-none ${
                  screen === 'voice-report' 
                    ? 'text-white' 
                    : 'text-gray-800 dark:text-white'
                }`}>
                  <div>9:41</div>
                  <div className="flex items-center gap-1.5 pointer-events-auto">
                    {isOffline ? (
                      <CloudOff size={11} className="text-gray-400 dark:text-slate-400" />
                    ) : (
                      <Wifi size={11} className="text-emerald-500 dark:text-emerald-400 animate-pulse" />
                    )}
                    <Battery size={13} className={screen === 'voice-report' ? 'text-white' : 'text-gray-800 dark:text-white'} />
                  </div>
                </div>
              )}
              
              <main 
                ref={mainRef} 
                className={`flex-1 scrollbar-hide dark:bg-slate-950 ${
                  ['ai-assistant', 'voice-report'].includes(screen) ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'
                }`}
              >
                {screen === 'splash' && <SplashScreen onStart={() => navigateTo('language')} />}
                {screen === 'language' && (
                  <LanguageScreen
                    selected={language}
                    onSelect={(code) => setLanguage(code as LanguageCode)}
                    onContinue={() => navigateTo('login')}
                  />
                )}
                {screen === 'login' && (
                  <LoginScreen
                    onLogin={(id, mob, remember) => {
                      const name = localStorage.getItem(STORAGE_KEYS.WORKER_NAME) || (id === 'AW-1234' ? 'Saraswati Devi' : (id === 'AW-4521' ? 'Sunita Ji' : 'Anganwadi Worker'));
                      const block = localStorage.getItem(STORAGE_KEYS.ANGANWADI_BLOCK) || 'Anganwadi Block 3';
                      setWorkerId(id);
                      setWorkerName(name);
                      setAnganwadiBlock(block);
                      
                      if (remember) {
                        localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
                        localStorage.setItem(STORAGE_KEYS.WORKER_ID, id);
                        localStorage.setItem(STORAGE_KEYS.WORKER_NAME, name);
                        localStorage.setItem(STORAGE_KEYS.ANGANWADI_BLOCK, block);
                        localStorage.setItem(STORAGE_KEYS.MOBILE, mob);
                      } else {
                        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
                        localStorage.removeItem(STORAGE_KEYS.WORKER_ID);
                        localStorage.removeItem(STORAGE_KEYS.WORKER_NAME);
                        localStorage.removeItem(STORAGE_KEYS.ANGANWADI_BLOCK);
                        localStorage.removeItem(STORAGE_KEYS.MOBILE);
                      }
                      showToast(t('namaste', { name }), 'success');
                      navigateTo('home');
                      loadDataFromServer();
                    }}
                  />
                )}
                {screen === 'home' && (
                  <HomeScreen
                    onNavigate={navigateTo}
                    onChildSelect={selectChild}
                    isOffline={isOffline}
                    onToggleOffline={toggleOffline}
                    notificationCount={notificationCount}
                    onNotificationClick={() => navigateTo('notifications')}
                    onOpenSidebar={() => setIsSidebarOpen(true)}
                    childrenList={childrenList}
                    visitsList={visitsList}
                    workerName={workerName}
                  />
                )}
                {screen === 'children' && (
                  <ChildrenScreen
                    onChildSelect={selectChild}
                    childrenList={childrenList}
                    onToggleAttendance={toggleAttendance}
                  />
                )}
                {screen === 'child-profile' && selectedChildId && (
                  <ChildProfileScreen
                    childId={selectedChildId}
                    onBack={goBack}
                    onNavigate={navigateTo}
                    childrenList={childrenList}
                    onAddObservation={addObservation}
                  />
                )}
                {screen === 'voice-report' && (
                  <VoiceReportScreen
                    onBack={goBack}
                    onComplete={(reportData) => {
                      syncVoiceReport(reportData);
                      goBack();
                    }}
                  />
                )}
                {screen === 'activities' && (
                  <ActivitiesScreen
                    onBack={goBack}
                    childrenList={childrenList}
                    scheduledActivities={scheduledActivities}
                    onScheduleActivity={handleScheduleActivity}
                    showToast={showToast}
                  />
                )}
                {screen === 'ai-assistant' && (
                  <AiAssistantScreen onBack={goBack} childrenList={childrenList} />
                )}
                {screen === 'reports' && (
                  <ReportsScreen onBack={goBack} onNavigate={navigateTo} childrenList={childrenList} />
                )}
                {screen === 'home-visits' && (
                  <HomeVisitsScreen
                    onBack={goBack}
                    visitsList={visitsList}
                    onCompleteVisit={completeVisit}
                    childrenList={childrenList}
                    onAddVisit={handleAddVisit}
                  />
                )}
                {screen === 'notifications' && (
                  <NotificationsScreen
                    onBack={goBack}
                    onNavigate={navigateTo}
                    onRead={handleMarkNotificationsRead}
                    notificationsList={notificationsList}
                    onClearNotifications={handleClearNotifications}
                    onDeleteNotification={handleDeleteNotification}
                  />
                )}
                {screen === 'offline' && (
                  <OfflineScreen
                    onBack={goBack}
                    isOffline={isOffline}
                    pendingSync={pendingSync}
                    onSync={handleSyncNow}
                  />
                )}
                {screen === 'impact' && (
                  <ImpactScreen
                    onBack={goBack}
                    childrenList={childrenList}
                    visitsList={visitsList}
                    scheduledActivities={scheduledActivities}
                  />
                )}
                {screen === 'settings' && (
                  <SettingsScreen
                    onBack={goBack}
                    workerName={workerName}
                    setWorkerName={setWorkerName}
                    workerId={workerId}
                    setWorkerId={setWorkerId}
                    anganwadiBlock={anganwadiBlock}
                    setAnganwadiBlock={setAnganwadiBlock}
                    onResetData={handleResetData}
                  />
                )}
              </main>

              {toast && (
                <Toast
                  message={toast.message}
                  type={toast.type}
                  onClose={() => setToast(null)}
                />
              )}

              {showNavTabs && (
                <BottomNav
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  notificationCount={notificationCount}
                />
              )}

              <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                currentScreen={screen}
                onNavigate={navigateTo}
                isOffline={isOffline}
                onToggleOffline={toggleOffline}
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                workerName={workerName}
                workerId={workerId}
                anganwadiBlock={anganwadiBlock}
              />

              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/25 dark:bg-white/20 rounded-full z-50 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </LanguageProvider>
  );
}

export default App;
