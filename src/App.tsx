import { useState, useCallback } from 'react';
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
import { BottomNav } from './components/BottomNav';
import { Toast } from './components/Toast';
// App state management

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
  | 'impact';

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
  const [notificationCount, setNotificationCount] = useState(3);
  // Notification badge state

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

  const showNavTabs = ['home', 'children', 'activities', 'reports', 'ai-assistant'].includes(screen);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start">
      <div className="w-full max-w-[430px] min-h-screen bg-[#F9FAFB] relative flex flex-col shadow-2xl">
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide pb-20">
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
              onLogin={() => {
                showToast('Welcome Sunita Ji!', 'success');
                navigateTo('home');
              }}
            />
          )}
          {screen === 'home' && (
            <HomeScreen
              onNavigate={navigateTo}
              onChildSelect={selectChild}
              isOffline={isOffline}
              onToggleOffline={() => setIsOffline(!isOffline)}
              notificationCount={notificationCount}
              onNotificationClick={() => navigateTo('notifications')}
            />
          )}
          {screen === 'children' && (
            <ChildrenScreen onChildSelect={selectChild} />
          )}
          {screen === 'child-profile' && selectedChildId && (
            <ChildProfileScreen
              childId={selectedChildId}
              onBack={goBack}
              onNavigate={navigateTo}
            />
          )}
          {screen === 'voice-report' && (
            <VoiceReportScreen
              onBack={goBack}
              onComplete={() => {
                showToast('Report saved! Synced when online.', 'success');
                goBack();
              }}
            />
          )}
          {screen === 'activities' && (
            <ActivitiesScreen onBack={goBack} />
          )}
          {screen === 'ai-assistant' && (
            <AiAssistantScreen onBack={goBack} />
          )}
          {screen === 'reports' && (
            <ReportsScreen onBack={goBack} onNavigate={navigateTo} />
          )}
          {screen === 'home-visits' && (
            <HomeVisitsScreen onBack={goBack} />
          )}
          {screen === 'notifications' && (
            <NotificationsScreen
              onBack={goBack}
              onNavigate={navigateTo}
              onRead={() => setNotificationCount(0)}
            />
          )}
          {screen === 'offline' && (
            <OfflineScreen onBack={goBack} />
          )}
          {screen === 'impact' && (
            <ImpactScreen onBack={goBack} />
          )}
        </main>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Bottom Navigation */}
        {showNavTabs && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            notificationCount={notificationCount}
          />
        )}
      </div>
    </div>
  );
}

export default App;
