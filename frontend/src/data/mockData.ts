export interface Child {
  id: string;
  name: string;
  nameHindi: string;
  age: number;
  ageDisplay: string;
  gender: 'boy' | 'girl';
  avatar: string;
  attendance: 'present' | 'absent' | 'irregular';
  nutritionStatus: 'good' | 'at-risk' | 'monitoring';
  developmentProgress: number;
  lastVisit: string;
  parentName: string;
  parentPhone: string;
  address: string;
  observations: Observation[];
  milestones: Milestone[];
  aiInsights: string[];
  needsAttention: boolean;
  attendanceHistory: boolean[];
}

export interface Observation {
  id: string;
  date: string;
  note: string;
  category: string;
  type: 'voice' | 'text' | 'photo';
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  category: string;
  completed: boolean;
}

export interface Activity {
  id: string;
  title: string;
  titleHindi: string;
  category: string;
  ageGroup: string;
  duration: string;
  materials: string[];
  learningOutcome: string;
  icon: string;
  aiRecommended?: boolean;
}

export interface HomeVisit {
  id: string;
  childName: string;
  parentName: string;
  concern: string;
  lastVisit: string;
  suggestedTopics: string[];
  status: 'pending' | 'completed';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'reminder' | 'success' | 'info';
  time: string;
  read: boolean;
  action?: string;
}

export interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  summary: string;
  data: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
}

export const children: Child[] = [
  {
    id: '1',
    name: 'Rani',
    nameHindi: 'रानी',
    age: 4,
    ageDisplay: '4 years 2 months',
    gender: 'girl',
    avatar: '/child-rani.png',
    attendance: 'present',
    nutritionStatus: 'good',
    developmentProgress: 78,
    lastVisit: '2 days ago',
    parentName: 'Meera Devi',
    parentPhone: '98765 43210',
    address: 'Village Road, Block 3',
    observations: [
      { id: 'o1', date: 'Today', note: 'Rani recited a poem excellently in group activity', category: 'Language', type: 'voice' },
      { id: 'o2', date: 'Yesterday', note: 'Counted numbers 1 to 10 with peer help', category: 'Numeracy', type: 'text' },
      { id: 'o3', date: '3 days ago', note: 'Showed improvement in sharing toys during playtime', category: 'Social', type: 'voice' },
    ],
    milestones: [
      { id: 'm1', title: 'Counts to 10', date: '2 weeks ago', category: 'Numeracy', completed: true },
      { id: 'm2', title: 'Recognizes colors', date: '1 month ago', category: 'Cognitive', completed: true },
      { id: 'm3', title: 'Speaks in sentences', date: 'In progress', category: 'Language', completed: false },
    ],
    aiInsights: [
      'Participation improved this week',
      'Needs more language interaction',
      'Shows interest in group singing activities',
    ],
    needsAttention: false,
    attendanceHistory: [true, true, true, false, true, true, true, true, false, true, true, true, true, true],
  },
  {
    id: '2',
    name: 'Aarav',
    nameHindi: 'आरव',
    age: 5,
    ageDisplay: '5 years 1 month',
    gender: 'boy',
    avatar: '/child-aarav.png',
    attendance: 'present',
    nutritionStatus: 'monitoring',
    developmentProgress: 85,
    lastVisit: '1 week ago',
    parentName: 'Rajesh Kumar',
    parentPhone: '98765 12345',
    address: 'Main Street, Block 1',
    observations: [
      { id: 'o4', date: 'Today', note: 'Aarav helped clean up blocks without being asked', category: 'Social', type: 'voice' },
      { id: 'o5', date: '2 days ago', note: 'Drew a picture of his family with 4 members', category: 'Creativity', type: 'text' },
    ],
    milestones: [
      { id: 'm4', title: 'Writes own name', date: '3 weeks ago', category: 'Literacy', completed: true },
      { id: 'm5', title: 'Ties shoelaces', date: '1 month ago', category: 'Motor', completed: true },
      { id: 'm6', title: 'Understands shapes', date: 'In progress', category: 'Cognitive', completed: false },
    ],
    aiInsights: [
      'Great improvement in social behavior',
      'Monitor nutrition intake regularly',
      'Ready for advanced numeracy activities',
    ],
    needsAttention: true,
    attendanceHistory: [true, true, true, true, true, true, false, true, true, true, true, true, true, true],
  },
  {
    id: '3',
    name: 'Rohan',
    nameHindi: 'रोहन',
    age: 4,
    ageDisplay: '4 years 5 months',
    gender: 'boy',
    avatar: '/child-rohan.png',
    attendance: 'irregular',
    nutritionStatus: 'at-risk',
    developmentProgress: 62,
    lastVisit: '3 days ago',
    parentName: 'Sunita Devi',
    parentPhone: '98765 67890',
    address: 'Near Temple, Block 2',
    observations: [
      { id: 'o6', date: 'Yesterday', note: 'Rohan was quiet today, did not participate in group song', category: 'Emotional', type: 'voice' },
      { id: 'o7', date: '4 days ago', note: 'Enjoyed the clay modeling activity', category: 'Creativity', type: 'text' },
    ],
    milestones: [
      { id: 'm7', title: 'Recognizes own name', date: '2 months ago', category: 'Literacy', completed: true },
      { id: 'm8', title: 'Jumps with both feet', date: 'In progress', category: 'Motor', completed: false },
    ],
    aiInsights: [
      'Monitor attendance consistency - irregular pattern detected',
      'Nutrition status needs attention',
      'Responds well to creative activities - encourage more',
    ],
    needsAttention: true,
    attendanceHistory: [true, false, false, true, false, true, true, false, true, false, true, true, false, true],
  },
  {
    id: '4',
    name: 'Ananya',
    nameHindi: 'अनन्या',
    age: 5,
    ageDisplay: '5 years 3 months',
    gender: 'girl',
    avatar: '/child-ananya.png',
    attendance: 'present',
    nutritionStatus: 'good',
    developmentProgress: 92,
    lastVisit: '1 week ago',
    parentName: 'Lakshmi Devi',
    parentPhone: '98765 11111',
    address: 'School Lane, Block 4',
    observations: [
      { id: 'o8', date: 'Today', note: 'Ananya helped a younger child with puzzle activity', category: 'Social', type: 'voice' },
      { id: 'o9', date: 'Yesterday', note: 'Identified all shapes correctly in the game', category: 'Cognitive', type: 'text' },
    ],
    milestones: [
      { id: 'm9', title: 'Reads simple words', date: '1 week ago', category: 'Literacy', completed: true },
      { id: 'm10', title: 'Adds small numbers', date: '2 weeks ago', category: 'Numeracy', completed: true },
      { id: 'm11', title: 'Tells stories', date: '1 month ago', category: 'Language', completed: true },
    ],
    aiInsights: [
      'Excellent progress across all areas',
      'Shows leadership qualities with peers',
      'Ready for primary school transition activities',
    ],
    needsAttention: false,
    attendanceHistory: [true, true, true, true, true, true, true, true, true, true, true, true, true, true],
  },
  {
    id: '5',
    name: 'Dev',
    nameHindi: 'देव',
    age: 3,
    ageDisplay: '3 years 8 months',
    gender: 'boy',
    avatar: '/child-dev.png',
    attendance: 'present',
    nutritionStatus: 'good',
    developmentProgress: 70,
    lastVisit: '2 weeks ago',
    parentName: 'Anil Kumar',
    parentPhone: '98765 22222',
    address: 'River Side, Block 1',
    observations: [
      { id: 'o10', date: 'Today', note: 'Dev stacked 8 blocks before they fell', category: 'Motor', type: 'voice' },
      { id: 'o11', date: '3 days ago', note: 'Sang the alphabet song with the group', category: 'Language', type: 'text' },
    ],
    milestones: [
      { id: 'm12', title: 'Uses toilet independently', date: '1 month ago', category: 'Self-care', completed: true },
      { id: 'm13', title: 'Draws circles', date: '2 weeks ago', category: 'Creativity', completed: true },
      { id: 'm14', title: 'Counts to 5', date: 'In progress', category: 'Numeracy', completed: false },
    ],
    aiInsights: [
      'Good fine motor skill development',
      'Enjoys music and rhythm activities',
      'Encourage more peer interaction',
    ],
    needsAttention: false,
    attendanceHistory: [true, true, true, true, false, true, true, true, true, true, true, true, true, true],
  },
  {
    id: '6',
    name: 'Meera',
    nameHindi: 'मीरा',
    age: 4,
    ageDisplay: '4 years 1 month',
    gender: 'girl',
    avatar: '/child-meera.png',
    attendance: 'present',
    nutritionStatus: 'good',
    developmentProgress: 82,
    lastVisit: '5 days ago',
    parentName: 'Radha Devi',
    parentPhone: '98765 33333',
    address: 'Market Road, Block 3',
    observations: [
      { id: 'o12', date: 'Yesterday', note: 'Meera shared her tiffin with Priya today', category: 'Social', type: 'voice' },
      { id: 'o13', date: '4 days ago', note: 'Completed the pattern matching game correctly', category: 'Cognitive', type: 'text' },
    ],
    milestones: [
      { id: 'm15', title: 'Hops on one foot', date: '3 weeks ago', category: 'Motor', completed: true },
      { id: 'm16', title: 'Knows days of week', date: 'In progress', category: 'Cognitive', completed: false },
    ],
    aiInsights: [
      'Very social and caring with peers',
      'Strong cognitive development',
      'Needs encouragement in physical activities',
    ],
    needsAttention: false,
    attendanceHistory: [true, true, true, true, true, true, true, true, true, true, true, false, true, true],
  },
];

export const activities: Activity[] = [
  {
    id: 'a1',
    title: 'Rhyme Time',
    titleHindi: 'कविता समय',
    category: 'Language',
    ageGroup: '3-5 years',
    duration: '15 mins',
    materials: ['Picture cards', 'Rhyme book'],
    learningOutcome: 'Vocabulary building and phonetic awareness',
    icon: 'Music',
    aiRecommended: true,
  },
  {
    id: 'a2',
    title: 'Color Sorting Game',
    titleHindi: 'रंग वर्गीकरण',
    category: 'Cognitive',
    ageGroup: '3-4 years',
    duration: '10 mins',
    materials: ['Colored beads', 'Bowls'],
    learningOutcome: 'Color recognition and classification skills',
    icon: 'Palette',
    aiRecommended: false,
  },
  {
    id: 'a3',
    title: 'Finger Painting',
    titleHindi: 'उंगली चित्रकारी',
    category: 'Creativity',
    ageGroup: '3-5 years',
    duration: '20 mins',
    materials: ['Non-toxic paint', 'Chart paper'],
    learningOutcome: 'Fine motor skills and creative expression',
    icon: 'Paintbrush',
    aiRecommended: true,
  },
  {
    id: 'a4',
    title: 'Number Counting Walk',
    titleHindi: 'गिनती टहलना',
    category: 'Numeracy',
    ageGroup: '4-5 years',
    duration: '15 mins',
    materials: ['Number cards', 'Chalk'],
    learningOutcome: 'Number recognition and counting skills',
    icon: 'Calculator',
    aiRecommended: false,
  },
  {
    id: 'a5',
    title: 'Simon Says',
    titleHindi: 'सिमन कहता है',
    category: 'Movement',
    ageGroup: '3-5 years',
    duration: '10 mins',
    materials: ['Open space'],
    learningOutcome: 'Following instructions and gross motor skills',
    icon: 'Activity',
    aiRecommended: false,
  },
  {
    id: 'a6',
    title: 'Story Circle',
    titleHindi: 'कहानी वृत्त',
    category: 'Language',
    ageGroup: '4-5 years',
    duration: '20 mins',
    materials: ['Picture story book'],
    learningOutcome: 'Listening skills and imagination',
    icon: 'BookOpen',
    aiRecommended: true,
  },
  {
    id: 'a7',
    title: 'Clay Modeling',
    titleHindi: 'मिट्टी मॉडलिंग',
    category: 'Creativity',
    ageGroup: '3-5 years',
    duration: '25 mins',
    materials: ['Clay or dough', 'Rolling pin'],
    learningOutcome: 'Fine motor skills and shape recognition',
    icon: 'Circle',
    aiRecommended: false,
  },
  {
    id: 'a8',
    title: 'Nature Walk',
    titleHindi: 'प्रकृति भ्रमण',
    category: 'Science',
    ageGroup: '4-5 years',
    duration: '20 mins',
    materials: ['Collection bag', 'Magnifying glass'],
    learningOutcome: 'Observation skills and nature awareness',
    icon: 'TreePine',
    aiRecommended: false,
  },
];

export const homeVisits: HomeVisit[] = [
  {
    id: 'v1',
    childName: 'Rohan',
    parentName: 'Sunita Devi',
    concern: 'Irregular attendance and nutrition monitoring',
    lastVisit: '2 weeks ago',
    suggestedTopics: [
      'Discuss importance of regular attendance',
      'Share nutrition tips for home meals',
      'Encourage play-based learning at home',
    ],
    status: 'pending',
  },
  {
    id: 'v2',
    childName: 'Aarav',
    parentName: 'Rajesh Kumar',
    concern: 'Nutrition status needs monitoring',
    lastVisit: '1 month ago',
    suggestedTopics: [
      'Follow up on nutrition plan',
      'Discuss healthy snack options',
      'Share progress report',
    ],
    status: 'pending',
  },
  {
    id: 'v3',
    childName: 'Rani',
    parentName: 'Meera Devi',
    concern: 'Language development support at home',
    lastVisit: '3 weeks ago',
    suggestedTopics: [
      'Demonstrate reading aloud techniques',
      'Suggest Hindi-English bilingual activities',
      'Share language development milestones',
    ],
    status: 'completed',
  },
];

export const notifications: Notification[] = [
  {
    id: 'n1',
    title: 'Attendance Alert',
    message: '3 children (Rohan, Priya, Kiran) absent for 5+ days',
    type: 'alert',
    time: '2 hours ago',
    read: false,
    action: 'children',
  },
  {
    id: 'n2',
    title: 'Nutrition Update Pending',
    message: 'Weekly nutrition report for 6 children needs updating',
    type: 'reminder',
    time: '4 hours ago',
    read: false,
    action: 'reports',
  },
  {
    id: 'n3',
    title: 'Monthly Report Due',
    message: 'October monthly report must be submitted by tomorrow',
    type: 'reminder',
    time: '6 hours ago',
    read: false,
    action: 'reports',
  },
  {
    id: 'n4',
    title: 'Home Visit Reminder',
    message: '2 home visits pending for Rohan and Aarav',
    type: 'reminder',
    time: 'Yesterday',
    read: true,
    action: 'home-visits',
  },
  {
    id: 'n5',
    title: 'AI Insight',
    message: 'Rani shows improved participation in language activities!',
    type: 'success',
    time: 'Yesterday',
    read: true,
    action: 'children',
  },
  {
    id: 'n6',
    title: 'New Activity Available',
    message: 'New Diwali-themed art activity added to the library',
    type: 'info',
    time: '2 days ago',
    read: true,
    action: 'activities',
  },
];

export const reports: Report[] = [
  {
    id: 'r1',
    title: 'Daily Attendance Report',
    date: 'Today',
    type: 'attendance',
    summary: '18 out of 21 children present (85.7%)',
    data: { present: 18, absent: 3, total: 21 },
  },
  {
    id: 'r2',
    title: 'Weekly Nutrition Summary',
    date: 'This Week',
    type: 'nutrition',
    summary: '16 children in Good status, 3 Monitoring, 2 At-risk',
    data: { good: 16, monitoring: 3, atRisk: 2 },
  },
  {
    id: 'r3',
    title: 'Development Milestones',
    date: 'October 2025',
    type: 'development',
    summary: '12 new milestones achieved by 8 children',
    data: { milestones: 12, children: 8 },
  },
  {
    id: 'r4',
    title: 'Home Visit Records',
    date: 'This Month',
    type: 'visits',
    summary: '5 home visits completed, 2 pending',
    data: { completed: 5, pending: 2 },
  },
  {
    id: 'r5',
    title: 'Monthly Impact Report',
    date: 'October 2025',
    type: 'impact',
    summary: '90 minutes of reporting time saved this week',
    data: { timeSaved: 90, activitiesCompleted: 24, observationsLogged: 45 },
  },
];

export const aiResponses: Record<string, string> = {
  'Which children missed attendance this week?':
    'This week, 3 children have irregular attendance:\n\n1. Rohan - Absent 4 days (needs home visit)\n2. Priya - Absent 3 days (parent called - illness)\n3. Kiran - Absent 2 days (family travel)\n\nWould you like me to schedule home visits?',
  'Suggest activity for shy children':
    'For shy children, I recommend these gentle activities:\n\n1. Pair Work - "Find a Friend" matching game\n2. Story Circle - Let them hold the picture book\n3. Clay Modeling - Non-verbal creative expression\n4. Nature Walk - Side-by-side exploration\n\nStart with 1:1 interaction before group activities.',
  'Who needs home visit?':
    '2 children need home visits:\n\n1. Rohan Kumar\n   - Parent: Sunita Devi\n   - Concern: Irregular attendance + nutrition\n   - Last visit: 2 weeks ago\n\n2. Aarav Singh\n   - Parent: Rajesh Kumar\n   - Concern: Nutrition monitoring\n   - Last visit: 1 month ago\n\nTap to view detailed visit guides.',
  'Generate nutrition summary':
    'Weekly Nutrition Summary (Oct 20-27):\n\nGood Status (16): Rani, Aarav, Ananya, Dev, Meera...\n\nMonitoring (3): Priya, Kiran, Sohan\n\nAt Risk (2): Rohan, Mini\n\nRecommendation: Follow up with Rohan and Mini families for meal planning support.',
  'Show children needing extra support':
    'Children needing extra support:\n\n1. Rohan (4.5 yrs)\n   - Attendance: Irregular\n   - Nutrition: At-risk\n   - Support: Home visit + nutrition plan\n\n2. Priya (3.2 yrs)\n   - Language: Delayed speech\n   - Support: Daily 1:1 reading time\n\n3. Kiran (4 yrs)\n   - Social: Shy, avoids group play\n   - Support: Pair activities with Dev',
  default:
    'I understand. Let me help you with that. You can ask me about:\n\n- Attendance tracking\n- Activity suggestions\n- Child development insights\n- Report generation\n- Home visit planning\n\nHow else can I assist you today?',
};

export const impactData = {
  timeSaved: 90,
  timeSavedPrevious: 65,
  paperworkReduced: 78,
  childEngagement: 85,
  attendanceImprovement: 12,
  activitiesCompleted: 24,
  homeVisitsCompleted: 5,
  observationsLogged: 45,
  weeklyImprovement: [
    { week: 'Week 1', engagement: 65, attendance: 70 },
    { week: 'Week 2', engagement: 70, attendance: 72 },
    { week: 'Week 3', engagement: 75, attendance: 75 },
    { week: 'Week 4', engagement: 82, attendance: 80 },
    { week: 'This Week', engagement: 85, attendance: 85 },
  ],
};

export const languageOptions = [
  { code: 'hi', label: 'हिन्दी', labelEn: 'Hindi' },
  { code: 'en', label: 'English', labelEn: 'English' },
  { code: 'bn', label: 'বাংলা', labelEn: 'Bengali' },
  { code: 'mr', label: 'मराठी', labelEn: 'Marathi' },
];
