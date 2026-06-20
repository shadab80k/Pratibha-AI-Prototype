import { useState, useCallback, useEffect } from 'react';
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
import {
  childrenApi, visitsApi, notificationsApi, voiceReportApi, authApi, adminApi,
  setAuthToken, getAuthToken,
} from './lib/api';
import type { Child, HomeVisit, AppNotification } from './lib/api';
import { CloudOff, Wifi, Battery } from 'lucide-react';

export type Screen =
  | 'splash'
  | 'language'
  | 'login'
  | 'home'
  | 'children'
  | 'child-profile'
  | 'voice-report'
  | 'activities'
  | 'ai-assistant'
  | 'reports'
  | 'home-visits'
  | 'notifications'
  | 'offline'
  | 'impact'
  | 'settings';

export type Tab = 'home' | 'children' | 'activities' | 'reports' | 'ai-assistant';

const tabToScreen: Record<Tab, Screen> = {
  home: 'home',
  children: 'children',
  activities: 'activities',
  reports: 'reports',
  'ai-assistant': 'ai-assistant',
};

const screenToTab: Record<string, Tab> = {
  home: 'home',
  children: 'children',
  activities: 'activities',
  reports: 'reports',
  'ai-assistant': 'ai-assistant',
};

export interface ToastData {
  message: string;
  type: 'success' | 'info' | 'warning';
}

function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const [isOffline, setIsOffline] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Data from backend API
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [visitsList, setVisitsList] = useState<HomeVisit[]>([]);
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>([]);
  const [pendingSync, setPendingSync] = useState<{ id: string; type: string; childName: string; action: string; time: string }[]>([]);
  const [workerName, setWorkerName] = useState('Sunita Ji');
  const [workerId, setWorkerId] = useState('AW-4521');
  const [anganwadiBlock, setAnganwadiBlock] = useState('Anganwadi Block 3');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    const handleResize = () => {
      const targetWidth = 440;
      const targetHeight = 834;
      const margin = 24;

      const availableWidth = window.innerWidth - margin;
      const availableHeight = window.innerHeight - margin;

      const scaleX = availableWidth / targetWidth;
      const scaleY = availableHeight / targetHeight;

      setScale(Math.min(scaleX, scaleY, 1.0));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Fetch all data from backend after login
  const fetchAllData = useCallback(async () => {
    try {
      const [children, visits, notifications] = await Promise.all([
        childrenApi.getAll(),
        visitsApi.getAll(),
        notificationsApi.getAll(),
      ]);
      setChildrenList(children);
      setVisitsList(visits);
      setNotificationsList(notifications);
      setNotificationCount(notifications.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      authApi.getProfile().then((profile) => {
        setWorkerName(profile.name);
        setWorkerId(profile.id);
        setAnganwadiBlock(profile.anganwadiBlock);
        setLanguage(profile.language);
        fetchAllData();
      }).catch(() => {
        // Token expired or invalid, clear it
        setAuthToken(null);
      });
    }
  }, [fetchAllData]);

  const navigateTo = useCallback(
    (newScreen: Screen) => {
      setPrevScreen(screen);
      setScreen(newScreen);
      if (screenToTab[newScreen]) {
        setActiveTab(screenToTab[newScreen]);
      }
    },
    [screen]
  );

  const goBack = useCallback(() => {
    if (prevScreen) {
      setScreen(prevScreen);
      if (screenToTab[prevScreen]) {
        setActiveTab(screenToTab[prevScreen]);
      }
      setPrevScreen(null);
    } else {
      navigateTo('home');
    }
  }, [prevScreen, navigateTo]);

  const handleTabChange = useCallback(
    (tab: Tab) => {
      setActiveTab(tab);
      setScreen(tabToScreen[tab]);
      setPrevScreen(null);
    },
    []
  );

  const showToast = useCallback((message: string, type: ToastData['type'] = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const selectChild = useCallback(
    (childId: string) => {
      setSelectedChildId(childId);
      navigateTo('child-profile');
    },
    [navigateTo]
  );

  const handleOpenSidebar = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  // Interactive callbacks — now backed by API
  const registerOfflineAction = useCallback((type: string, childName: string, action: string) => {
    if (isOffline) {
      setPendingSync((prev) => [
        { id: 'sync-' + Date.now(), type, childName, action, time: 'Just now' },
        ...prev
      ]);
    }
  }, [isOffline]);

  const toggleOffline = useCallback(() => {
    setIsOffline((prev) => {
      const next = !prev;
      showToast(next ? 'Working offline - Local Sync enabled' : 'Connected back online!', next ? 'warning' : 'success');
      return next;
    });
  }, [showToast]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      showToast(next ? 'Dark Mode theme active!' : 'Light Mode theme active!', 'info');
      return next;
    });
  }, [showToast]);

  const toggleAttendance = useCallback(async (childId: string) => {
    try {
      const result = await childrenApi.toggleAttendance(childId);
      setChildrenList((prev) =>
        prev.map((c) => {
          if (c.id === childId) {
            const nextAttendance = result.attendance as Child['attendance'];
            const nextHistory = [...c.attendanceHistory];
            if (nextHistory.length > 0) {
              nextHistory[nextHistory.length - 1] = nextAttendance === 'present';
            }
            return { ...c, attendance: nextAttendance, attendanceHistory: nextHistory };
          }
          return c;
        })
      );
      showToast(`${result.name} marked ${result.attendance === 'present' ? 'Present' : 'Absent'}!`, 'info');
      registerOfflineAction('Attendance', result.name, `Toggled attendance to ${result.attendance}`);
    } catch (err) {
      showToast('Failed to update attendance', 'warning');
    }
  }, [showToast, registerOfflineAction]);

  const markAllPresent = useCallback(async () => {
    try {
      await childrenApi.markAllPresent();
      setChildrenList((prev) =>
        prev.map((c) => {
          const nextHistory = [...c.attendanceHistory];
          if (nextHistory.length > 0) nextHistory[nextHistory.length - 1] = true;
          return { ...c, attendance: 'present', attendanceHistory: nextHistory };
        })
      );
      showToast('All children marked Present!', 'success');
    } catch (err) {
      showToast('Failed to mark all present', 'warning');
    }
  }, [showToast]);

  const addObservation = useCallback(async (childId: string, note: string, category: string) => {
    try {
      const result = await childrenApi.addObservation(childId, note, category);
      setChildrenList((prev) =>
        prev.map((c) => {
          if (c.id === childId) {
            return {
              ...c,
              observations: [{ id: result.id, date: result.date, note: result.note, category: result.category, type: result.type }, ...c.observations],
            };
          }
          return c;
        })
      );
      showToast(`Added observation for ${result.childName}!`, 'success');
      registerOfflineAction('Observation', result.childName, `Logged ${category} note`);
    } catch (err) {
      showToast('Failed to add observation', 'warning');
    }
  }, [showToast, registerOfflineAction]);

  const completeVisit = useCallback(async (visitId: string) => {
    try {
      const result = await visitsApi.complete(visitId);
      setVisitsList((prev) =>
        prev.map((v) => (v.id === visitId ? { ...v, status: 'completed' as const } : v))
      );
      showToast(`Home visit for ${result.childName} marked complete!`, 'success');
      registerOfflineAction('Home Visit', result.childName, 'Completed visit check-in');
    } catch (err) {
      showToast('Failed to complete visit', 'warning');
    }
  }, [showToast, registerOfflineAction]);

  const handleSaveVoiceReport = useCallback(async (items: { childName: string; note: string; type: 'observation' | 'alert' }[]) => {
    if (items.length === 0) {
      showToast('No observations recognized to save!', 'warning');
      return false;
    }
    try {
      const result = await voiceReportApi.save(items);
      // Refresh all lists to ensure attendance, notifications, and scheduled home visits sync immediately
      await fetchAllData();
      showToast(result.message, 'success');
      registerOfflineAction('Voice Report', 'Multiple Children', `Logged ${items.length} observations`);
      return true;
    } catch (err) {
      showToast('Failed to save voice report', 'warning');
      return false;
    }
  }, [showToast, registerOfflineAction, fetchAllData]);

  const handleAddVisit = useCallback(async (childName: string, parentName: string, lastVisit: string) => {
    try {
      const newVisit = await visitsApi.create({ childName, parentName, lastVisit });
      setVisitsList(prev => [newVisit, ...prev]);
      showToast(`Home visit for ${childName} scheduled!`, 'success');
      registerOfflineAction('Home Visit', childName, `Scheduled visit for ${lastVisit}`);
    } catch (err) {
      showToast('Failed to schedule visit', 'warning');
    }
  }, [showToast, registerOfflineAction]);

  const handleResetData = useCallback(async () => {
    try {
      await adminApi.resetDatabase();
      await fetchAllData();
      setNotificationCount(3);
      setWorkerName('Sunita Ji');
      setWorkerId('AW-4521');
      setAnganwadiBlock('Anganwadi Block 3');
      showToast('Database reset to initial defaults!', 'success');
    } catch (err) {
      showToast('Failed to reset database', 'warning');
    }
  }, [showToast, fetchAllData]);

  const handleSyncNow = useCallback(() => {
    setPendingSync([]);
    showToast('Database fully synced to central server!', 'success');
  }, [showToast]);

  const handleClearNotifications = useCallback(async () => {
    try {
      await notificationsApi.clearAll();
      setNotificationsList([]);
      setNotificationCount(0);
      showToast('Notification center cleared!', 'info');
    } catch (err) {
      showToast('Failed to clear notifications', 'warning');
    }
  }, [showToast]);

  const handleLogin = useCallback(async (phone: string, password: string) => {
    try {
      const { token, worker } = await authApi.login(phone, password);
      setAuthToken(token);
      setWorkerName(worker.name);
      setWorkerId(worker.id);
      setAnganwadiBlock(worker.anganwadiBlock);
      setLanguage(worker.language);
      await fetchAllData();
      showToast(`Welcome ${worker.name}!`, 'success');
      navigateTo('home');
    } catch (err) {
      showToast('Login failed — check phone & password', 'warning');
    }
  }, [showToast, navigateTo, fetchAllData]);

  const handleUpdateProfile = useCallback(async (data: { name?: string; anganwadiBlock?: string }) => {
    try {
      const updated = await authApi.updateProfile(data);
      setWorkerName(updated.name);
      setAnganwadiBlock(updated.anganwadiBlock);
      showToast('Profile updated!', 'success');
    } catch (err) {
      showToast('Failed to update profile', 'warning');
    }
  }, [showToast]);

  const showNavTabs = ['home', 'children', 'activities', 'reports', 'ai-assistant'].includes(screen);

  return (
    <div className="min-h-screen w-screen bg-[#0f172a] bg-gradient-to-tr from-[#020617] via-[#0f172a] to-[#1e1b4b] flex items-center justify-center p-3 overflow-y-auto overflow-x-hidden">
      {/* Outer alignment container that has the EXACT scaled size so that it flows perfectly and centers inside the viewport without overflowing */}
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
        {/* Visual Scaling Wrapper - Renders elements at high resolution, then scales down visually to fit viewport perfectly */}
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

          {/* Phone Case Container - Restored to Native Smartphone Dimensions */}
          <div className="relative w-[390px] h-[812px] bg-[#0b0f19] rounded-[55px] border-[11px] border-[#334155] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden select-none ring-1 ring-slate-800/50">
          
          {/* Dynamic Bezel Highlight */}
          <div className="absolute inset-0 rounded-[44px] border border-white/5 pointer-events-none z-50" />

          {/* Dynamic Island / Camera punch hole */}
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6.5 bg-black rounded-full z-50 flex items-center justify-between px-3 shadow-[inset_0_1px_3px_rgba(255,255,255,0.2)]">
            <div className="w-3.5 h-3.5 bg-[#0f1015] rounded-full border border-slate-800/80 flex items-center justify-center">
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
            <main className="flex-1 overflow-y-auto scrollbar-hide dark:bg-slate-950">
              {screen === 'splash' && <SplashScreen onStart={() => navigateTo('login')} />}
              {screen === 'language' && (
                <LanguageScreen
                  selected={language}
                  onSelect={setLanguage}
                  onContinue={() => navigateTo('login')}
                />
              )}
              {screen === 'login' && (
                <LoginScreen
                  onLogin={handleLogin}
                />
              )}
              {screen === 'home' && (
                <HomeScreen
                  onNavigate={navigateTo}
                  onChildSelect={selectChild}
                  isOffline={isOffline}
                  onToggleOffline={toggleOffline}
                  notificationCount={notificationCount}
                  onOpenSidebar={handleOpenSidebar}
                  childrenList={childrenList}
                  visitsList={visitsList}
                  workerName={workerName}
                  language={language}
                />
              )}
              {screen === 'children' && (
                <ChildrenScreen
                  onChildSelect={selectChild}
                  childrenList={childrenList}
                  onToggleAttendance={toggleAttendance}
                  onMarkAllPresent={markAllPresent}
                  language={language}
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
                  onComplete={async (parsedData) => {
                    const success = await handleSaveVoiceReport(parsedData);
                    if (success) {
                      goBack();
                    }
                  }}
                  childrenList={childrenList}
                  language={language}
                />
              )}
              {screen === 'activities' && (
                <ActivitiesScreen
                  onBack={goBack}
                  language={language}
                  childrenList={childrenList}
                  onAddObservation={addObservation}
                />
              )}
              {screen === 'ai-assistant' && (
                <AiAssistantScreen
                  onBack={goBack}
                  isOffline={isOffline}
                  language={language}
                  onAddObservation={addObservation}
                  childrenList={childrenList}
                  visitsList={visitsList}
                />
              )}
              {screen === 'reports' && (
                <ReportsScreen
                  onBack={goBack}
                  onNavigate={navigateTo}
                  childrenList={childrenList}
                  visitsList={visitsList}
                />
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
                  onRead={() => setNotificationCount(0)}
                  notificationsList={notificationsList}
                  onClearNotifications={handleClearNotifications}
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
                <ImpactScreen onBack={goBack} />
              )}
              {screen === 'settings' && (
                <SettingsScreen
                  onBack={goBack}
                  workerName={workerName}
                  setWorkerName={(name: string) => { setWorkerName(name); handleUpdateProfile({ name }); }}
                  workerId={workerId}
                  setWorkerId={setWorkerId}
                  anganwadiBlock={anganwadiBlock}
                  setAnganwadiBlock={(block: string) => { setAnganwadiBlock(block); handleUpdateProfile({ anganwadiBlock: block }); }}
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

export default App;
