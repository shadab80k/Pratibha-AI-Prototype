// ─── Shared TypeScript Interfaces ─────────────────────────────────────────────
// Re-export core data types from mockData and define additional app-wide types.

export type {
  Child,
  Observation,
  Milestone,
  Activity,
  HomeVisit,
  Notification,
  ChatMessage,
} from './data/mockData';

// ─── App-Specific Types ──────────────────────────────────────────────────────

export interface ScheduledActivity {
  id: string;
  activityId: string;
  date: string;
  targetChildrenIds: string[];
  completed: boolean;
}

export interface PendingSyncItem {
  id: string;
  type: string;
  childName: string;
  action: string;
  time: string;
}

export interface ChildObservation {
  name: string;
  note: string;
  category: string;
  isAlert?: boolean;
}

export interface VoiceReportData {
  attendanceText: string;
  attendanceCount: number;
  childObservations: ChildObservation[];
}

export interface GeneratedReport {
  id: string;
  title: string;
  date: string;
  summary: string;
  type: 'attendance' | 'nutrition' | 'development' | 'weekly' | 'custom';
  data: Record<string, string | number>;
}

// ─── Web Speech API Declarations ─────────────────────────────────────────────
// Vendor-prefixed SpeechRecognition APIs are not in standard lib types.

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly confidence: number;
  readonly transcript: string;
}

export interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

// Extend Window to include vendor-prefixed APIs
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    webkitAudioContext?: typeof AudioContext;
  }
}

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

export interface ToastData {
  message: string;
  type: 'success' | 'info' | 'warning';
}
