import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Child, HomeVisit, Notification as AppNotification, ScheduledActivity, PendingSyncItem, VoiceReportData, Screen, Tab, ToastData } from '../types';
import { apiCall, ApiError } from '../lib/apiClient';
import { STORAGE_KEYS } from '../lib/constants';
import { children as initialChildren, homeVisits as initialVisits, notifications as initialNotifications, activities } from '../data/mockData';
import { useLanguage } from './LanguageContext';

export interface AppContextType {
  // Auth state
  workerName: string;
  setWorkerName: React.Dispatch<React.SetStateAction<string>>;
  workerId: string;
  setWorkerId: React.Dispatch<React.SetStateAction<string>>;
  anganwadiBlock: string;
  setAnganwadiBlock: React.Dispatch<React.SetStateAction<string>>;
  screen: Screen;
  setScreen: React.Dispatch<React.SetStateAction<Screen>>;
  prevScreen: Screen | null;
  setPrevScreen: React.Dispatch<React.SetStateAction<Screen | null>>;
  activeTab: Tab;
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
  navigateTo: (newScreen: Screen) => void;
  goBack: () => void;
  handleTabChange: (tab: Tab) => void;
  
  // Children state
  childrenList: Child[];
  setChildrenList: React.Dispatch<React.SetStateAction<Child[]>>;
  selectedChildId: string | null;
  setSelectedChildId: React.Dispatch<React.SetStateAction<string | null>>;
  selectChild: (childId: string) => void;
  toggleAttendance: (childId: string) => Promise<void>;
  addObservation: (childId: string, note: string, category: string, type?: 'voice' | 'text' | 'photo', imageUrl?: string) => Promise<void>;
  syncVoiceReport: (reportData?: VoiceReportData) => void;
  loadDataFromServer: () => Promise<void>;
  
  // Visits state
  visitsList: HomeVisit[];
  setVisitsList: React.Dispatch<React.SetStateAction<HomeVisit[]>>;
  completeVisit: (visitId: string) => Promise<void>;
  handleAddVisit: (childName: string, parentName: string, lastVisit: string, concern: string, suggestedTopics: string[]) => Promise<void>;
  
  // Notifications state
  notificationsList: AppNotification[];
  setNotificationsList: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  notificationCount: number;
  setNotificationCount: React.Dispatch<React.SetStateAction<number>>;
  handleClearNotifications: () => void;
  handleMarkNotificationsRead: () => Promise<void>;
  handleDeleteNotification: (id: string) => Promise<void>;
  
  // Offline state
  isOffline: boolean;
  setIsOffline: React.Dispatch<React.SetStateAction<boolean>>;
  pendingSync: PendingSyncItem[];
  setPendingSync: React.Dispatch<React.SetStateAction<PendingSyncItem[]>>;
  registerOfflineAction: (type: string, childName: string, action: string) => void;
  toggleOffline: () => void;
  handleSyncNow: () => Promise<void>;
  
  // Activities state
  scheduledActivities: ScheduledActivity[];
  setScheduledActivities: React.Dispatch<React.SetStateAction<ScheduledActivity[]>>;
  handleScheduleActivity: (activityId: string, date: string, targetChildrenIds: string[]) => Promise<void>;
  
  // Layout state
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  toggleDarkMode: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  toast: ToastData | null;
  setToast: React.Dispatch<React.SetStateAction<ToastData | null>>;
  showToast: (message: string, type?: ToastData['type']) => void;
  handleResetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screen, setScreen] = useState<Screen>('splash');
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const { language } = useLanguage();
  const [isOffline, setIsOffline] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.IS_OFFLINE) === 'true';
  });
  const [toast, setToast] = useState<ToastData | null>(null);
  
  // Dynamic states for interactive simulator initialized from localStorage if available
  const [childrenList, setChildrenList] = useState<Child[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.CHILDREN);
    return local ? JSON.parse(local) : initialChildren;
  });
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.SCHEDULED_ACTIVITIES);
    return local ? JSON.parse(local) : [];
  });
  const [visitsList, setVisitsList] = useState<HomeVisit[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.VISITS);
    return local ? JSON.parse(local) : initialVisits;
  });
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return local ? JSON.parse(local) : initialNotifications;
  });
  const [notificationCount, setNotificationCount] = useState<number>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const list: AppNotification[] = local ? JSON.parse(local) : initialNotifications;
    return list.filter((n: AppNotification) => !n.read).length;
  });
  const [pendingSync, setPendingSync] = useState<PendingSyncItem[]>(() => {
    const local = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
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
      const token = localStorage.getItem(STORAGE_KEYS.JWT);
      const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
      const pinEnabled = localStorage.getItem(STORAGE_KEYS.PIN_ENABLED) === 'true';

      const savedWorkerId = localStorage.getItem(STORAGE_KEYS.WORKER_ID);
      const savedWorkerName = localStorage.getItem(STORAGE_KEYS.WORKER_NAME);
      const savedBlock = localStorage.getItem(STORAGE_KEYS.ANGANWADI_BLOCK);

      if (savedWorkerId) setWorkerId(savedWorkerId);
      if (savedWorkerName) setWorkerName(savedWorkerName);
      if (savedBlock) setAnganwadiBlock(savedBlock);

      if (token) {
        try {
          const data = await apiCall('/auth/validate', {
            method: 'GET'
          });

          if (data.valid && data.worker) {
            setWorkerId(data.worker.id);
            setWorkerName(data.worker.name);
            setAnganwadiBlock(data.worker.block);
            
            localStorage.setItem(STORAGE_KEYS.WORKER_ID, data.worker.id);
            localStorage.setItem(STORAGE_KEYS.WORKER_NAME, data.worker.name);
            localStorage.setItem(STORAGE_KEYS.ANGANWADI_BLOCK, data.worker.block);
          }
          if (pinEnabled) {
            setScreen('login');
          } else {
            setScreen('home');
            setActiveTab('home');
          }
        } catch (err: any) {
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            // Token expired or invalid, log out
            localStorage.removeItem(STORAGE_KEYS.JWT);
            localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
            localStorage.removeItem(STORAGE_KEYS.WORKER_ID);
            localStorage.removeItem(STORAGE_KEYS.WORKER_NAME);
            localStorage.removeItem(STORAGE_KEYS.ANGANWADI_BLOCK);
            localStorage.removeItem(STORAGE_KEYS.MOBILE);
            setScreen('login');
          } else {
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
      const token = localStorage.getItem(STORAGE_KEYS.JWT);
      if (!token) return;
      
      const serverChildren = await apiCall('/children');
      setChildrenList(serverChildren);
      
      const serverVisits = await apiCall('/visits');
      setVisitsList(serverVisits);
      
      const serverNotifications = await apiCall('/notifications');
      setNotificationsList(serverNotifications);

      // Record successful baseline synchronization timestamp
      localStorage.setItem(STORAGE_KEYS.LAST_SYNCED_AT, String(Date.now()));
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
    localStorage.setItem(STORAGE_KEYS.CHILDREN, JSON.stringify(childrenList));
  }, [childrenList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULED_ACTIVITIES, JSON.stringify(scheduledActivities));
  }, [scheduledActivities]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visitsList));
  }, [visitsList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notificationsList));
    const unread = notificationsList.filter((n: AppNotification) => !n.read).length;
    setNotificationCount(unread);
  }, [notificationsList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(pendingSync));
  }, [pendingSync]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_OFFLINE, String(isOffline));
  }, [isOffline]);

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

  const navigateTo = useCallback(
    (newScreen: Screen) => {
      if (newScreen === 'login') {
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
        localStorage.removeItem(STORAGE_KEYS.WORKER_ID);
        localStorage.removeItem(STORAGE_KEYS.WORKER_NAME);
        localStorage.removeItem(STORAGE_KEYS.ANGANWADI_BLOCK);
        localStorage.removeItem(STORAGE_KEYS.MOBILE);
        localStorage.removeItem(STORAGE_KEYS.JWT);
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
    if (!['home', 'children', 'activities', 'reports', 'ai-assistant', 'settings', 'home-visits', 'notifications', 'offline', 'impact'].includes(screen)) return;

    const interval = setInterval(() => {
      const eventType = Math.floor(Math.random() * 3);
      if (eventType === 0) {
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

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          new Notification(newNotif.title, {
            body: newNotif.message,
            icon: '/splash-illustration.jpg'
          });
        }
      } else if (eventType === 1) {
        setChildrenList(prev => {
          let updated = false;
          const newList = prev.map(c => {
            if (!updated && (c.attendance === 'absent' || c.attendance === 'irregular')) {
              updated = true;
              const text = language === 'hi' 
                ? `${c.nameHindi || c.name} केंद्र पर पहुँच चुके हैं (देरी से आगमन)` 
                : `${c.name} arrived late at the center (Checked In)`;
              
              showToast(text, 'success');
              
              if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                new Notification(language === 'hi' ? 'देरी से आगमन' : 'Late Check-In', {
                  body: text,
                  icon: '/splash-illustration.jpg'
                });
              }

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
        showToast(language === 'hi' ? 'पृष्ठभूमि डेटा सिंक पूरा हुआ!' : 'Background auto-sync complete!', 'success');
      }
    }, 35000);

    return () => clearInterval(interval);
  }, [screen, language, showToast]);

  const selectChild = useCallback(
    (childId: string) => {
      setSelectedChildId(childId);
      navigateTo('child-profile');
    },
    [navigateTo]
  );

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

  const syncVoiceReport = useCallback((reportData?: VoiceReportData) => {
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
        const lastSyncedAtVal = Number(localStorage.getItem(STORAGE_KEYS.LAST_SYNCED_AT) || '0');
        const response = await apiCall('/sync', {
          method: 'POST',
          body: JSON.stringify({ 
            operations: pendingSync,
            lastSyncedAt: lastSyncedAtVal
          })
        });
        
        if (response.children) setChildrenList(response.children);
        if (response.homeVisits) setVisitsList(response.homeVisits);
        if (response.notifications) setNotificationsList(response.notifications);
        if (response.scheduledActivities) setScheduledActivities(response.scheduledActivities);
        
        localStorage.setItem(STORAGE_KEYS.LAST_SYNCED_AT, String(Date.now()));
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
      const hasUnread = prev.some((n: AppNotification) => !n.read);
      if (!hasUnread) return prev;
      hadUnread = true;
      return prev.map((n: AppNotification) => ({ ...n, read: true }));
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
    setNotificationsList((prev) => prev.filter((n: AppNotification) => n.id !== id));
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

  return (
    <AppContext.Provider
      value={{
        workerName,
        setWorkerName,
        workerId,
        setWorkerId,
        anganwadiBlock,
        setAnganwadiBlock,
        screen,
        setScreen,
        prevScreen,
        setPrevScreen,
        activeTab,
        setActiveTab,
        navigateTo,
        goBack,
        handleTabChange,
        childrenList,
        setChildrenList,
        selectedChildId,
        setSelectedChildId,
        selectChild,
        toggleAttendance,
        addObservation,
        syncVoiceReport,
        loadDataFromServer,
        visitsList,
        setVisitsList,
        completeVisit,
        handleAddVisit,
        notificationsList,
        setNotificationsList,
        notificationCount,
        setNotificationCount,
        handleClearNotifications,
        handleMarkNotificationsRead,
        handleDeleteNotification,
        isOffline,
        setIsOffline,
        pendingSync,
        setPendingSync,
        registerOfflineAction,
        toggleOffline,
        handleSyncNow,
        scheduledActivities,
        setScheduledActivities,
        handleScheduleActivity,
        isDarkMode,
        setIsDarkMode,
        toggleDarkMode,
        isSidebarOpen,
        setIsSidebarOpen,
        scale,
        setScale,
        toast,
        setToast,
        showToast,
        handleResetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
