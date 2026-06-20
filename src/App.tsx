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
import { children as initialChildren, homeVisits as initialVisits, notifications as initialNotifications, activities } from './data/mockData';
import { CloudOff, Wifi, Battery } from 'lucide-react';
import { LanguageProvider, useLanguage, type LanguageCode } from './context/LanguageContext';

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

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('pratibha_jwt');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    }
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication token expired or invalid');
      localStorage.removeItem('pratibha_jwt');
    }
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

function AppContent() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const [isOffline, setIsOffline] = useState(() => {
    return localStorage.getItem('pratibha_is_offline') === 'true';
  });
  const [toast, setToast] = useState<ToastData | null>(null);
  
  // Dynamic states for interactive simulator initialized from localStorage if available
  const [childrenList, setChildrenList] = useState<any[]>(() => {
    const local = localStorage.getItem('pratibha_children');
    return local ? JSON.parse(local) : initialChildren;
  });
  const [scheduledActivities, setScheduledActivities] = useState<any[]>(() => {
    const local = localStorage.getItem('pratibha_scheduled_activities');
    return local ? JSON.parse(local) : [];
  });
  const [visitsList, setVisitsList] = useState<any[]>(() => {
    const local = localStorage.getItem('pratibha_visits');
    return local ? JSON.parse(local) : initialVisits;
  });
  const [notificationsList, setNotificationsList] = useState<any[]>(() => {
    const local = localStorage.getItem('pratibha_notifications');
    return local ? JSON.parse(local) : initialNotifications;
  });
  const [notificationCount, setNotificationCount] = useState<number>(() => {
    const local = localStorage.getItem('pratibha_notifications');
    const list = local ? JSON.parse(local) : initialNotifications;
    return list.filter((n: any) => !n.read).length;
  });
  const [pendingSync, setPendingSync] = useState<{ id: string; type: string; childName: string; action: string; time: string }[]>(() => {
    const local = localStorage.getItem('pratibha_pending_sync');
    return local ? JSON.parse(local) : [];
  });
  
  const [workerName, setWorkerName] = useState('Sunita Ji');
  const [workerId, setWorkerId] = useState('AW-4521');
  const [anganwadiBlock, setAnganwadiBlock] = useState('Anganwadi Block 3');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [scale, setScale] = useState(0.8);

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('pratibha_jwt');
      const rememberMe = localStorage.getItem('pratibha_remember_me') === 'true';
      const pinEnabled = localStorage.getItem('pratibha_pin_enabled') === 'true';

      const savedWorkerId = localStorage.getItem('pratibha_worker_id');
      const savedWorkerName = localStorage.getItem('pratibha_worker_name');
      const savedBlock = localStorage.getItem('pratibha_anganwadi_block');

      if (savedWorkerId) setWorkerId(savedWorkerId);
      if (savedWorkerName) setWorkerName(savedWorkerName);
      if (savedBlock) setAnganwadiBlock(savedBlock);

      if (token) {
        try {
          const response = await fetch(`${API_BASE}/auth/validate`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.valid && data.worker) {
              setWorkerId(data.worker.id);
              setWorkerName(data.worker.name);
              setAnganwadiBlock(data.worker.block);
              
              localStorage.setItem('pratibha_worker_id', data.worker.id);
              localStorage.setItem('pratibha_worker_name', data.worker.name);
              localStorage.setItem('pratibha_anganwadi_block', data.worker.block);
            }
            if (pinEnabled) {
              setScreen('login');
            } else {
              setScreen('home');
              setActiveTab('home');
            }
          } else if (response.status === 401 || response.status === 403) {
            // Token expired or invalid, log out
            localStorage.removeItem('pratibha_jwt');
            localStorage.removeItem('pratibha_remember_me');
            localStorage.removeItem('pratibha_worker_id');
            localStorage.removeItem('pratibha_worker_name');
            localStorage.removeItem('pratibha_anganwadi_block');
            localStorage.removeItem('pratibha_mobile');
            setScreen('login');
          } else {
            // Other server error: fallback to local session if rememberMe is enabled
            if (rememberMe) {
              if (pinEnabled) {
                setScreen('login');
              } else {
                setScreen('home');
                setActiveTab('home');
              }
            } else {
              setScreen('login');
            }
          }
        } catch (err) {
          console.warn('Session verification failed (server unreachable). Bypassing checks:', err);
          // Offline bypass
          if (rememberMe) {
            if (pinEnabled) {
              setScreen('login');
            } else {
              setScreen('home');
              setActiveTab('home');
            }
          } else {
            setScreen('login');
          }
        }
      } else {
        // No token
        if (rememberMe) {
          if (pinEnabled) {
            setScreen('login');
          } else {
            setScreen('home');
            setActiveTab('home');
          }
        }
      }
    };

    validateSession();
  }, []);

  const loadDataFromServer = useCallback(async () => {
    if (isOffline) return;
    try {
      const token = localStorage.getItem('pratibha_jwt');
      if (!token) return;
      
      const serverChildren = await apiCall('/children');
      setChildrenList(serverChildren);
      
      const serverVisits = await apiCall('/visits');
      setVisitsList(serverVisits);
      
      const serverNotifications = await apiCall('/notifications');
      setNotificationsList(serverNotifications);
    } catch (err) {
      console.warn('Backend server unreachable. Using local cache:', err);
    }
  }, [isOffline]);

  useEffect(() => {
    const isDashboard = ['home', 'children', 'activities', 'reports', 'ai-assistant', 'settings', 'home-visits', 'notifications', 'offline', 'impact'].includes(screen);
    if (isDashboard) {
      loadDataFromServer();
    }
  }, [screen, loadDataFromServer]);

  // Write changes to localStorage to persist state data
  useEffect(() => {
    localStorage.setItem('pratibha_children', JSON.stringify(childrenList));
  }, [childrenList]);

  useEffect(() => {
    localStorage.setItem('pratibha_scheduled_activities', JSON.stringify(scheduledActivities));
  }, [scheduledActivities]);

  useEffect(() => {
    localStorage.setItem('pratibha_visits', JSON.stringify(visitsList));
  }, [visitsList]);

  useEffect(() => {
    localStorage.setItem('pratibha_notifications', JSON.stringify(notificationsList));
    const unread = notificationsList.filter((n: any) => !n.read).length;
    setNotificationCount(unread);
  }, [notificationsList]);

  useEffect(() => {
    localStorage.setItem('pratibha_pending_sync', JSON.stringify(pendingSync));
  }, [pendingSync]);

  useEffect(() => {
    localStorage.setItem('pratibha_is_offline', String(isOffline));
  }, [isOffline]);

  useEffect(() => {
    const handleResize = () => {
      // Target dimensions including margins for buttons and chassis bezel curves
      const targetWidth = 440;
      const targetHeight = 834;
      const margin = 24;

      const availableWidth = window.innerWidth - margin;
      const availableHeight = window.innerHeight - margin;

      const scaleX = availableWidth / targetWidth;
      const scaleY = availableHeight / targetHeight;

      // Use the smaller scale factor, and cap it at 1.0
      setScale(Math.min(scaleX, scaleY, 1.0));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const navigateTo = useCallback(
    (newScreen: Screen) => {
      if (newScreen === 'login') {
        localStorage.removeItem('pratibha_remember_me');
        localStorage.removeItem('pratibha_worker_id');
        localStorage.removeItem('pratibha_worker_name');
        localStorage.removeItem('pratibha_anganwadi_block');
        localStorage.removeItem('pratibha_mobile');
        localStorage.removeItem('pratibha_jwt');
      }
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

  // Real-time background update simulation
  useEffect(() => {
    // Only run simulator if logged in (i.e. screen is a dashboard screen)
    if (!['home', 'children', 'activities', 'reports', 'ai-assistant', 'settings', 'home-visits', 'notifications', 'offline', 'impact'].includes(screen)) return;

    const interval = setInterval(() => {
      const eventType = Math.floor(Math.random() * 3);
      if (eventType === 0) {
        // Parent notification event
        const newNotif = {
          id: 'n-sim-' + Date.now(),
          title: language === 'hi' ? 'अभिभावक का संदेश' : language === 'bn' ? 'অভিভাবকের বার্তা' : language === 'mr' ? 'पालकांचा संदेश' : 'Parent Message',
          message: language === 'hi' 
            ? 'राजेश कुमार (आरव के पिता) ने गृह गतिविधि पूरी की।' 
            : 'Rajesh Kumar (Aarav parent) logged a home activity.',
          type: 'info' as const,
          time: 'Just now',
          read: false,
          action: 'home-visits',
        };
        setNotificationsList(prev => [newNotif, ...prev]);
        setNotificationCount(c => c + 1);
        showToast(language === 'hi' ? 'नया अभिभावक अपडेट मिला!' : 'New parent update received!', 'info');

        // Trigger native push notification
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(newNotif.title, {
            body: newNotif.message,
            icon: '/splash-illustration.jpg'
          });
        }
      } else if (eventType === 1) {
        // Late arrival / attendance update
        setChildrenList(prev => {
          let updated = false;
          const newList = prev.map(c => {
            if (!updated && (c.attendance === 'absent' || c.attendance === 'irregular')) {
              updated = true;
              const text = language === 'hi' 
                ? `${c.nameHindi || c.name} केंद्र पर पहुँच चुके हैं (देरी से आगमन)` 
                : `${c.name} arrived late at the center (Checked In)`;
              
              showToast(text, 'success');
              
              // Trigger native push notification
              if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                new Notification(language === 'hi' ? 'देरी से आगमन' : 'Late Check-In', {
                  body: text,
                  icon: '/splash-illustration.jpg'
                });
              }

              // Add observation
              const newObs = {
                id: 'obs-sim-' + Date.now(),
                date: 'Today',
                note: language === 'hi' ? 'देरी से आगमन - उपस्थिति दर्ज की गई।' : 'Late arrival - checked in automatically.',
                category: 'Attendance',
                type: 'text' as const,
              };
              
              return {
                ...c,
                attendance: 'present' as const,
                observations: [newObs, ...c.observations]
              };
            }
            return c;
          });
          return newList;
        });
      } else {
        // Database Sync update
        showToast(language === 'hi' ? 'पृष्ठभूमि डेटा सिंक पूरा हुआ!' : 'Background auto-sync complete!', 'success');
      }
    }, 35000); // every 35 seconds

    return () => clearInterval(interval);
  }, [screen, language, showToast]);

  const selectChild = useCallback(
    (childId: string) => {
      setSelectedChildId(childId);
      navigateTo('child-profile');
    },
    [navigateTo]
  );

  // Interactive callbacks
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
    let success = false;
    let nextAttendance: 'present' | 'absent' | 'irregular' = 'present';
    let childName = '';

    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          childName = c.name;
          const isCurrentlyPresent = c.attendance === 'present';
          nextAttendance = isCurrentlyPresent ? 'absent' : 'present';
          const nextHistory = [...c.attendanceHistory];
          if (nextHistory.length > 0) {
            nextHistory[nextHistory.length - 1] = !isCurrentlyPresent;
          }
          showToast(`${c.name} marked ${nextAttendance === 'present' ? 'Present' : 'Absent'}!`, 'info');
          return {
            ...c,
            attendance: nextAttendance,
            attendanceHistory: nextHistory,
          };
        }
        return c;
      })
    );

    if (!isOffline) {
      try {
        await apiCall('/children/attendance', {
          method: 'PUT',
          body: JSON.stringify({ childId, attendance: nextAttendance })
        });
        success = true;
      } catch (err) {
        console.warn('Failed to sync attendance with server. Storing offline action:', err);
      }
    }

    if (!success) {
      registerOfflineAction('Attendance', childName, `Toggled attendance to ${nextAttendance}`);
    }
  }, [showToast, registerOfflineAction, isOffline]);

  const addObservation = useCallback(async (childId: string, note: string, category: string, type: 'voice' | 'text' | 'photo' = 'text', imageUrl?: string) => {
    let success = false;
    let childName = '';

    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id === childId) {
          childName = c.name;
          const newObs = {
            id: 'obs-' + Date.now(),
            date: 'Today',
            note,
            category,
            type,
            ...(imageUrl ? { imageUrl } : {}),
          };
          showToast(`Added observation for ${c.name}!`, 'success');
          return {
            ...c,
            observations: [newObs, ...c.observations],
          };
        }
        return c;
      })
    );

    if (!isOffline) {
      try {
        await apiCall('/children/observation', {
          method: 'POST',
          body: JSON.stringify({ childId, note, category, type, imageUrl })
        });
        success = true;
      } catch (err) {
        console.warn('Failed to sync observation with server. Storing offline action:', err);
      }
    }

    if (!success) {
      registerOfflineAction('Observation', childName, `Logged ${category} note`);
    }
  }, [showToast, registerOfflineAction, isOffline]);

  const completeVisit = useCallback(async (visitId: string) => {
    let success = false;
    let childName = '';

    setVisitsList((prev) =>
      prev.map((v) => {
        if (v.id === visitId) {
          childName = v.childName;
          showToast(`Home visit for ${v.childName} marked complete!`, 'success');
          return { ...v, status: 'completed' as const };
        }
        return v;
      })
    );

    if (!isOffline) {
      try {
        await apiCall(`/visits/${visitId}/complete`, {
          method: 'PUT'
        });
        success = true;
      } catch (err) {
        console.warn('Failed to sync visit completion with server. Storing offline action:', err);
      }
    }

    if (!success) {
      registerOfflineAction('Home Visit', childName, 'Completed visit check-in');
    }
  }, [showToast, registerOfflineAction, isOffline]);

  const syncVoiceReport = useCallback((reportData?: { 
    childObservations: { name: string; note: string; category: string; isAlert?: boolean }[];
    attendanceCount?: number;
  }) => {
    setChildrenList((prev) => {
      if (reportData && reportData.childObservations && reportData.childObservations.length > 0) {
        return prev.map((c) => {
          const childNameLower = c.name.toLowerCase();
          const match = reportData.childObservations.find(
            (obs) => childNameLower.includes(obs.name.toLowerCase()) || obs.name.toLowerCase().includes(childNameLower)
          );

          if (match) {
            const newObs = {
              id: 'v-obs-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
              date: 'Today',
              note: match.note,
              category: match.category,
              type: 'voice' as const,
            };
            return {
              ...c,
              needsAttention: match.isAlert ? true : c.needsAttention,
              observations: [newObs, ...c.observations],
              attendance: 'present' as const
            };
          }
          return c;
        });
      }

      return prev.map((c) => {
        if (c.id === '1') { 
          return {
            ...c,
            observations: [
              { id: 'v-obs-1', date: 'Today', note: 'Excellent participation in poem activity. Shows confidence in group settings.', category: 'Language', type: 'voice' },
              ...c.observations,
            ],
          };
        }
        if (c.id === '2') {
          return {
            ...c,
            observations: [
              { id: 'v-obs-2', date: 'Today', note: 'Demonstrated sharing behavior with peers without prompting. Social skills improving.', category: 'Social', type: 'voice' },
              ...c.observations,
            ],
          };
        }
        if (c.id === '3') {
          return {
            ...c,
            needsAttention: true,
            observations: [
              { id: 'v-obs-3', date: 'Today', note: 'Quiet today, did not participate actively. Monitor emotional well-being.', category: 'Emotional', type: 'voice' },
              ...c.observations,
            ],
          };
        }
        return c;
      });
    });

    if (reportData?.attendanceCount !== undefined) {
      const count = reportData.attendanceCount;
      setChildrenList((prev) => {
        const presentCount = prev.filter(c => c.attendance === 'present').length;
        if (presentCount !== count) {
          let diff = count - presentCount;
          return prev.map((c) => {
            if (diff > 0 && c.attendance !== 'present') {
              diff--;
              return { ...c, attendance: 'present' as const };
            } else if (diff < 0 && c.attendance === 'present') {
              diff++;
              return { ...c, attendance: 'absent' as const };
            }
            return c;
          });
        }
        return prev;
      });
    }

    showToast(
      language === 'hi' ? 'आवाज रिपोर्ट बच्चों के रिकॉर्ड में सिंक हो गई है!' : 'Voice report synced to children records!', 
      'success'
    );
    registerOfflineAction('Voice Report', 'Multiple Children', 'Synced voice dictation transcript');
  }, [showToast, registerOfflineAction, language]);

  const handleScheduleActivity = useCallback(async (activityId: string, date: string, targetChildrenIds: string[]) => {
    let success = false;
    setScheduledActivities((prev) => [
      ...prev,
      {
        id: 'sched-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        activityId,
        date,
        targetChildrenIds,
        completed: false,
      }
    ]);
    const activityName = activities.find(a => a.id === activityId)?.title || 'Activity';
    showToast(`${activityName} scheduled for ${date}!`, 'success');

    if (!isOffline) {
      try {
        await apiCall('/activities/schedule', {
          method: 'POST',
          body: JSON.stringify({ activityId, date, targetChildrenIds })
        });
        success = true;
      } catch (err) {
        console.warn('Failed to sync scheduled activity with server. Storing offline action:', err);
      }
    }

    if (!success) {
      registerOfflineAction('Activity', 'Multiple Children', `Scheduled ${activityName} for ${date}`);
    }
  }, [showToast, registerOfflineAction, isOffline]);

  const handleAddVisit = useCallback(async (childName: string, parentName: string, lastVisit: string, concern: string, suggestedTopics: string[]) => {
    let success = false;
    const newVisit = {
      id: 'visit-' + Date.now(),
      childName,
      parentName,
      lastVisit,
      status: 'pending' as const,
      concern: concern || 'General Care',
      suggestedTopics: suggestedTopics && suggestedTopics.length > 0 ? suggestedTopics : [
        'Review language progress',
        'Discuss healthy snacks recipes',
        'Demonstrate simple counting games'
      ]
    };
    setVisitsList(prev => [newVisit, ...prev]);
    showToast(`Home visit for ${childName} scheduled!`, 'success');

    if (!isOffline) {
      try {
        await apiCall('/visits', {
          method: 'POST',
          body: JSON.stringify({ childName, parentName, lastVisit, concern, suggestedTopics })
        });
        success = true;
      } catch (err) {
        console.warn('Failed to sync scheduled visit with server. Storing offline action:', err);
      }
    }

    if (!success) {
      registerOfflineAction('Home Visit', childName, `Scheduled visit for ${lastVisit} (${concern || 'General'})`);
    }
  }, [showToast, registerOfflineAction, isOffline]);

  const handleResetData = useCallback(() => {
    setChildrenList(initialChildren);
    setVisitsList(initialVisits);
    setNotificationsList(initialNotifications);
    setPendingSync([]);
    setNotificationCount(3);
    setWorkerName('Sunita Ji');
    setWorkerId('AW-4521');
    setAnganwadiBlock('Anganwadi Block 3');
    showToast('Simulator sandbox reset to initial defaults!', 'success');
  }, [showToast]);

  const handleSyncNow = useCallback(async () => {
    const count = pendingSync.length;
    if (count === 0) {
      showToast(language === 'hi' ? 'कोई लंबित डेटा सिंक करने के लिए नहीं है।' : 'No pending data to sync.', 'info');
      return;
    }

    let success = false;
    if (!isOffline) {
      try {
        const response = await apiCall('/sync', {
          method: 'POST',
          body: JSON.stringify({ operations: pendingSync })
        });
        
        if (response.children) setChildrenList(response.children);
        if (response.homeVisits) setVisitsList(response.homeVisits);
        if (response.notifications) setNotificationsList(response.notifications);
        if (response.scheduledActivities) setScheduledActivities(response.scheduledActivities);
        
        success = true;
      } catch (err) {
        console.warn('Failed to sync queue with server:', err);
        showToast(language === 'hi' ? 'सिंक विफल - सर्वर अनुपलब्ध है' : 'Sync failed - server is unreachable', 'warning');
      }
    }

    if (success || isOffline) {
      setPendingSync([]);
      
      const syncNotif = {
        id: 'n-sync-' + Date.now(),
        title: 'Database Synced',
        message: isOffline 
          ? `Simulated sync: ${count} pending logs cleared locally.` 
          : `${count} pending logs uploaded and synced with central Anganwadi server successfully.`,
        type: 'success' as const,
        time: 'Just now',
        read: false,
      };
      setNotificationsList(prev => [syncNotif, ...prev]);
      
      showToast(
        language === 'hi' 
          ? 'डेटाबेस सफलतापूर्वक सिंक हो गया!' 
          : 'Database fully synced!', 
        'success'
      );
    }
  }, [showToast, pendingSync, language, isOffline]);

  const handleClearNotifications = useCallback(() => {
    setNotificationsList([]);
    setNotificationCount(0);
    showToast('Notification center cleared!', 'info');
  }, [showToast]);

  const handleMarkNotificationsRead = useCallback(async () => {
    let hadUnread = false;
    setNotificationsList((prev) => {
      const hasUnread = prev.some((n: any) => !n.read);
      if (!hasUnread) return prev;
      hadUnread = true;
      return prev.map((n: any) => ({ ...n, read: true }));
    });

    if (hadUnread && !isOffline) {
      try {
        await apiCall('/notifications/read-all', {
          method: 'PUT',
        });
      } catch (err) {
        console.warn('Failed to sync notification read status with server:', err);
      }
    }
  }, [isOffline]);

  const handleDeleteNotification = useCallback(async (id: string) => {
    setNotificationsList((prev) => prev.filter((n: any) => n.id !== id));
    if (!isOffline) {
      try {
        await apiCall(`/notifications/${id}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.warn('Failed to delete notification on server:', err);
      }
    }
  }, [isOffline]);

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
                    const name = localStorage.getItem('pratibha_worker_name') || (id === 'AW-1234' ? 'Saraswati Devi' : (id === 'AW-4521' ? 'Sunita Ji' : 'Anganwadi Worker'));
                    const block = localStorage.getItem('pratibha_anganwadi_block') || 'Anganwadi Block 3';
                    setWorkerId(id);
                    setWorkerName(name);
                    setAnganwadiBlock(block);
                    
                    if (remember) {
                      localStorage.setItem('pratibha_remember_me', 'true');
                      localStorage.setItem('pratibha_worker_id', id);
                      localStorage.setItem('pratibha_worker_name', name);
                      localStorage.setItem('pratibha_anganwadi_block', block);
                      localStorage.setItem('pratibha_mobile', mob);
                    } else {
                      localStorage.removeItem('pratibha_remember_me');
                      localStorage.removeItem('pratibha_worker_id');
                      localStorage.removeItem('pratibha_worker_name');
                      localStorage.removeItem('pratibha_anganwadi_block');
                      localStorage.removeItem('pratibha_mobile');
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
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
