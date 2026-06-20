import { getDb } from './db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export function seedDatabase(): void {
  const db = getDb();

  // Check if already seeded
  const workerCount = db.prepare('SELECT COUNT(*) as count FROM workers').get() as { count: number };
  if (workerCount.count > 0) {
    console.log('ℹ️  Database already seeded, skipping');
    return;
  }

  console.log('🌱 Seeding database with initial data...');

  const workerId = 'AW-4521';
  const passwordHash = bcrypt.hashSync('1234', 10);

  // Seed worker
  db.prepare(`
    INSERT INTO workers (id, name, phone, password_hash, anganwadi_block, language)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(workerId, 'Sunita Ji', '9876543210', passwordHash, 'Anganwadi Block 3', 'en');

  // Seed children
  const childrenData = [
    {
      id: '1', name: 'Rani', nameHindi: 'रानी', age: 4, ageDisplay: '4 years 2 months',
      gender: 'girl', avatar: './child-rani.png', attendance: 'present',
      nutritionStatus: 'good', developmentProgress: 78, lastVisit: '2 days ago',
      parentName: 'Meera Devi', parentPhone: '98765 43210', address: 'Village Road, Block 3',
      needsAttention: false,
      aiInsights: ['Participation improved this week', 'Needs more language interaction', 'Shows interest in group singing activities'],
      attendanceHistory: [true, true, true, false, true, true, true, true, false, true, true, true, true, true],
    },
    {
      id: '2', name: 'Aarav', nameHindi: 'आरव', age: 5, ageDisplay: '5 years 1 month',
      gender: 'boy', avatar: './child-aarav.png', attendance: 'present',
      nutritionStatus: 'monitoring', developmentProgress: 85, lastVisit: '1 week ago',
      parentName: 'Rajesh Kumar', parentPhone: '98765 12345', address: 'Main Street, Block 1',
      needsAttention: true,
      aiInsights: ['Great improvement in social behavior', 'Monitor nutrition intake regularly', 'Ready for advanced numeracy activities'],
      attendanceHistory: [true, true, true, true, true, true, false, true, true, true, true, true, true, true],
    },
    {
      id: '3', name: 'Rohan', nameHindi: 'रोहन', age: 4, ageDisplay: '4 years 5 months',
      gender: 'boy', avatar: './child-rohan.png', attendance: 'irregular',
      nutritionStatus: 'at-risk', developmentProgress: 62, lastVisit: '3 days ago',
      parentName: 'Sunita Devi', parentPhone: '98765 67890', address: 'Near Temple, Block 2',
      needsAttention: true,
      aiInsights: ['Monitor attendance consistency - irregular pattern detected', 'Nutrition status needs attention', 'Responds well to creative activities - encourage more'],
      attendanceHistory: [true, false, false, true, false, true, true, false, true, false, true, true, false, true],
    },
    {
      id: '4', name: 'Ananya', nameHindi: 'अनन्या', age: 5, ageDisplay: '5 years 3 months',
      gender: 'girl', avatar: './child-ananya.png', attendance: 'present',
      nutritionStatus: 'good', developmentProgress: 92, lastVisit: '1 week ago',
      parentName: 'Lakshmi Devi', parentPhone: '98765 11111', address: 'School Lane, Block 4',
      needsAttention: false,
      aiInsights: ['Excellent progress across all areas', 'Shows leadership qualities with peers', 'Ready for primary school transition activities'],
      attendanceHistory: [true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    },
    {
      id: '5', name: 'Dev', nameHindi: 'देव', age: 3, ageDisplay: '3 years 8 months',
      gender: 'boy', avatar: './child-dev.png', attendance: 'present',
      nutritionStatus: 'good', developmentProgress: 70, lastVisit: '2 weeks ago',
      parentName: 'Anil Kumar', parentPhone: '98765 22222', address: 'River Side, Block 1',
      needsAttention: false,
      aiInsights: ['Good fine motor skill development', 'Enjoys music and rhythm activities', 'Encourage more peer interaction'],
      attendanceHistory: [true, true, true, true, false, true, true, true, true, true, true, true, true, true],
    },
    {
      id: '6', name: 'Meera', nameHindi: 'मीरा', age: 4, ageDisplay: '4 years 1 month',
      gender: 'girl', avatar: './child-meera.png', attendance: 'present',
      nutritionStatus: 'good', developmentProgress: 82, lastVisit: '5 days ago',
      parentName: 'Radha Devi', parentPhone: '98765 33333', address: 'Market Road, Block 3',
      needsAttention: false,
      aiInsights: ['Very social and caring with peers', 'Strong cognitive development', 'Needs encouragement in physical activities'],
      attendanceHistory: [true, true, true, true, true, true, true, true, true, true, true, false, true, true],
    },
  ];

  const insertChild = db.prepare(`
    INSERT INTO children (id, name, name_hindi, age, age_display, gender, avatar, attendance, nutrition_status, development_progress, last_visit, parent_name, parent_phone, address, needs_attention, ai_insights, worker_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertObs = db.prepare(`
    INSERT INTO observations (id, child_id, date, note, category, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMilestone = db.prepare(`
    INSERT INTO milestones (id, child_id, title, date, category, completed)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertAttendance = db.prepare(`
    INSERT INTO attendance_history (child_id, date, present)
    VALUES (?, ?, ?)
  `);

  // Observations data
  const observationsData: Record<string, { id: string; date: string; note: string; category: string; type: string }[]> = {
    '1': [
      { id: 'o1', date: 'Today', note: 'Rani recited a poem excellently in group activity', category: 'Language', type: 'voice' },
      { id: 'o2', date: 'Yesterday', note: 'Counted numbers 1 to 10 with peer help', category: 'Numeracy', type: 'text' },
      { id: 'o3', date: '3 days ago', note: 'Showed improvement in sharing toys during playtime', category: 'Social', type: 'voice' },
    ],
    '2': [
      { id: 'o4', date: 'Today', note: 'Aarav helped clean up blocks without being asked', category: 'Social', type: 'voice' },
      { id: 'o5', date: '2 days ago', note: 'Drew a picture of his family with 4 members', category: 'Creativity', type: 'text' },
    ],
    '3': [
      { id: 'o6', date: 'Yesterday', note: 'Rohan was quiet today, did not participate in group song', category: 'Emotional', type: 'voice' },
      { id: 'o7', date: '4 days ago', note: 'Enjoyed the clay modeling activity', category: 'Creativity', type: 'text' },
    ],
    '4': [
      { id: 'o8', date: 'Today', note: 'Ananya helped a younger child with puzzle activity', category: 'Social', type: 'voice' },
      { id: 'o9', date: 'Yesterday', note: 'Identified all shapes correctly in the game', category: 'Cognitive', type: 'text' },
    ],
    '5': [
      { id: 'o10', date: 'Today', note: 'Dev stacked 8 blocks before they fell', category: 'Motor', type: 'voice' },
      { id: 'o11', date: '3 days ago', note: 'Sang the alphabet song with the group', category: 'Language', type: 'text' },
    ],
    '6': [
      { id: 'o12', date: 'Yesterday', note: 'Meera shared her tiffin with Priya today', category: 'Social', type: 'voice' },
      { id: 'o13', date: '4 days ago', note: 'Completed the pattern matching game correctly', category: 'Cognitive', type: 'text' },
    ],
  };

  // Milestones data
  const milestonesData: Record<string, { id: string; title: string; date: string; category: string; completed: boolean }[]> = {
    '1': [
      { id: 'm1', title: 'Counts to 10', date: '2 weeks ago', category: 'Numeracy', completed: true },
      { id: 'm2', title: 'Recognizes colors', date: '1 month ago', category: 'Cognitive', completed: true },
      { id: 'm3', title: 'Speaks in sentences', date: 'In progress', category: 'Language', completed: false },
    ],
    '2': [
      { id: 'm4', title: 'Writes own name', date: '3 weeks ago', category: 'Literacy', completed: true },
      { id: 'm5', title: 'Ties shoelaces', date: '1 month ago', category: 'Motor', completed: true },
      { id: 'm6', title: 'Understands shapes', date: 'In progress', category: 'Cognitive', completed: false },
    ],
    '3': [
      { id: 'm7', title: 'Recognizes own name', date: '2 months ago', category: 'Literacy', completed: true },
      { id: 'm8', title: 'Jumps with both feet', date: 'In progress', category: 'Motor', completed: false },
    ],
    '4': [
      { id: 'm9', title: 'Reads simple words', date: '1 week ago', category: 'Literacy', completed: true },
      { id: 'm10', title: 'Adds small numbers', date: '2 weeks ago', category: 'Numeracy', completed: true },
      { id: 'm11', title: 'Tells stories', date: '1 month ago', category: 'Language', completed: true },
    ],
    '5': [
      { id: 'm12', title: 'Uses toilet independently', date: '1 month ago', category: 'Self-care', completed: true },
      { id: 'm13', title: 'Draws circles', date: '2 weeks ago', category: 'Creativity', completed: true },
      { id: 'm14', title: 'Counts to 5', date: 'In progress', category: 'Numeracy', completed: false },
    ],
    '6': [
      { id: 'm15', title: 'Hops on one foot', date: '3 weeks ago', category: 'Motor', completed: true },
      { id: 'm16', title: 'Knows days of week', date: 'In progress', category: 'Cognitive', completed: false },
    ],
  };

  // Insert everything in a transaction
  const seedAll = db.transaction(() => {
    for (const child of childrenData) {
      insertChild.run(
        child.id, child.name, child.nameHindi, child.age, child.ageDisplay,
        child.gender, child.avatar, child.attendance, child.nutritionStatus,
        child.developmentProgress, child.lastVisit, child.parentName,
        child.parentPhone, child.address, child.needsAttention ? 1 : 0,
        JSON.stringify(child.aiInsights), workerId
      );

      // Insert attendance history
      child.attendanceHistory.forEach((present, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (child.attendanceHistory.length - 1 - index));
        insertAttendance.run(child.id, date.toISOString().split('T')[0], present ? 1 : 0);
      });

      // Insert observations
      if (observationsData[child.id]) {
        for (const obs of observationsData[child.id]) {
          insertObs.run(obs.id, child.id, obs.date, obs.note, obs.category, obs.type);
        }
      }

      // Insert milestones
      if (milestonesData[child.id]) {
        for (const ms of milestonesData[child.id]) {
          insertMilestone.run(ms.id, child.id, ms.title, ms.date, ms.category, ms.completed ? 1 : 0);
        }
      }
    }

    // Seed activities
    const insertActivity = db.prepare(`
      INSERT INTO activities (id, title, title_hindi, category, age_group, duration, materials, learning_outcome, icon, ai_recommended)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const activitiesData = [
      { id: 'a1', title: 'Rhyme Time', titleHindi: 'कविता समय', category: 'Language', ageGroup: '3-5 years', duration: '15 mins', materials: ['Picture cards', 'Rhyme book'], learningOutcome: 'Vocabulary building and phonetic awareness', icon: 'Music', aiRecommended: true },
      { id: 'a2', title: 'Color Sorting Game', titleHindi: 'रंग वर्गीकरण', category: 'Cognitive', ageGroup: '3-4 years', duration: '10 mins', materials: ['Colored beads', 'Bowls'], learningOutcome: 'Color recognition and classification skills', icon: 'Palette', aiRecommended: false },
      { id: 'a3', title: 'Finger Painting', titleHindi: 'उंगली चित्रकारी', category: 'Creativity', ageGroup: '3-5 years', duration: '20 mins', materials: ['Non-toxic paint', 'Chart paper'], learningOutcome: 'Fine motor skills and creative expression', icon: 'Paintbrush', aiRecommended: true },
      { id: 'a4', title: 'Number Counting Walk', titleHindi: 'गिनती टहलना', category: 'Numeracy', ageGroup: '4-5 years', duration: '15 mins', materials: ['Number cards', 'Chalk'], learningOutcome: 'Number recognition and counting skills', icon: 'Calculator', aiRecommended: false },
      { id: 'a5', title: 'Simon Says', titleHindi: 'सिमन कहता है', category: 'Movement', ageGroup: '3-5 years', duration: '10 mins', materials: ['Open space'], learningOutcome: 'Following instructions and gross motor skills', icon: 'Activity', aiRecommended: false },
      { id: 'a6', title: 'Story Circle', titleHindi: 'कहानी वृत्त', category: 'Language', ageGroup: '4-5 years', duration: '20 mins', materials: ['Picture story book'], learningOutcome: 'Listening skills and imagination', icon: 'BookOpen', aiRecommended: true },
      { id: 'a7', title: 'Clay Modeling', titleHindi: 'मिट्टी मॉडलिंग', category: 'Creativity', ageGroup: '3-5 years', duration: '25 mins', materials: ['Clay or dough', 'Rolling pin'], learningOutcome: 'Fine motor skills and shape recognition', icon: 'Circle', aiRecommended: false },
      { id: 'a8', title: 'Nature Walk', titleHindi: 'प्रकृति भ्रमण', category: 'Science', ageGroup: '4-5 years', duration: '20 mins', materials: ['Collection bag', 'Magnifying glass'], learningOutcome: 'Observation skills and nature awareness', icon: 'TreePine', aiRecommended: false },
    ];

    for (const act of activitiesData) {
      insertActivity.run(act.id, act.title, act.titleHindi, act.category, act.ageGroup, act.duration, JSON.stringify(act.materials), act.learningOutcome, act.icon, act.aiRecommended ? 1 : 0);
    }

    // Seed home visits
    const insertVisit = db.prepare(`
      INSERT INTO home_visits (id, child_name, parent_name, concern, last_visit, suggested_topics, status, worker_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const visitsData = [
      { id: 'v1', childName: 'Rohan', parentName: 'Sunita Devi', concern: 'Irregular attendance and nutrition monitoring', lastVisit: '2 weeks ago', suggestedTopics: ['Discuss importance of regular attendance', 'Share nutrition tips for home meals', 'Encourage play-based learning at home'], status: 'pending' },
      { id: 'v2', childName: 'Aarav', parentName: 'Rajesh Kumar', concern: 'Nutrition status needs monitoring', lastVisit: '1 month ago', suggestedTopics: ['Follow up on nutrition plan', 'Discuss healthy snack options', 'Share progress report'], status: 'pending' },
      { id: 'v3', childName: 'Rani', parentName: 'Meera Devi', concern: 'Language development support at home', lastVisit: '3 weeks ago', suggestedTopics: ['Demonstrate reading aloud techniques', 'Suggest Hindi-English bilingual activities', 'Share language development milestones'], status: 'completed' },
    ];

    for (const visit of visitsData) {
      insertVisit.run(visit.id, visit.childName, visit.parentName, visit.concern, visit.lastVisit, JSON.stringify(visit.suggestedTopics), visit.status, workerId);
    }

    // Seed notifications
    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, title, message, type, time, read, action, worker_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const notifsData = [
      { id: 'n1', title: 'Attendance Alert', message: '3 children (Rohan, Priya, Kiran) absent for 5+ days', type: 'alert', time: '2 hours ago', read: false, action: 'children' },
      { id: 'n2', title: 'Nutrition Update Pending', message: 'Weekly nutrition report for 6 children needs updating', type: 'reminder', time: '4 hours ago', read: false, action: 'reports' },
      { id: 'n3', title: 'Monthly Report Due', message: 'October monthly report must be submitted by tomorrow', type: 'reminder', time: '6 hours ago', read: false, action: 'reports' },
      { id: 'n4', title: 'Home Visit Reminder', message: '2 home visits pending for Rohan and Aarav', type: 'reminder', time: 'Yesterday', read: true, action: 'home-visits' },
      { id: 'n5', title: 'AI Insight', message: 'Rani shows improved participation in language activities!', type: 'success', time: 'Yesterday', read: true, action: 'children' },
      { id: 'n6', title: 'New Activity Available', message: 'New Diwali-themed art activity added to the library', type: 'info', time: '2 days ago', read: true, action: 'activities' },
    ];

    for (const notif of notifsData) {
      insertNotif.run(notif.id, notif.title, notif.message, notif.type, notif.time, notif.read ? 1 : 0, notif.action, workerId);
    }

    // Seed reports
    const insertReport = db.prepare(`
      INSERT INTO reports (id, title, date, type, summary, data, worker_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const reportsData = [
      { id: 'r1', title: 'Daily Attendance Report', date: 'Today', type: 'attendance', summary: '18 out of 21 children present (85.7%)', data: { present: 18, absent: 3, total: 21 } },
      { id: 'r2', title: 'Weekly Nutrition Summary', date: 'This Week', type: 'nutrition', summary: '16 children in Good status, 3 Monitoring, 2 At-risk', data: { good: 16, monitoring: 3, atRisk: 2 } },
      { id: 'r3', title: 'Development Milestones', date: 'October 2025', type: 'development', summary: '12 new milestones achieved by 8 children', data: { milestones: 12, children: 8 } },
      { id: 'r4', title: 'Home Visit Records', date: 'This Month', type: 'visits', summary: '5 home visits completed, 2 pending', data: { completed: 5, pending: 2 } },
      { id: 'r5', title: 'Monthly Impact Report', date: 'October 2025', type: 'impact', summary: '90 minutes of reporting time saved this week', data: { timeSaved: 90, activitiesCompleted: 24, observationsLogged: 45 } },
    ];

    for (const report of reportsData) {
      insertReport.run(report.id, report.title, report.date, report.type, report.summary, JSON.stringify(report.data), workerId);
    }
  });

  seedAll();
  console.log('✅ Database seeded with initial data');
}
