import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { readDb, writeDb } from './db.js';
import { authenticateToken } from './middleware/auth.js';

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'pratibha_secret_key_12345';

app.use(cors());
app.use(express.json());

// Global Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API Request] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Active OTPs memory store
const activeOtps = new Map();

// Send OTP Route
app.post('/api/auth/send-otp', (req, res) => {
  const { workerId, mobile } = req.body;

  if (!workerId || !mobile) {
    return res.status(400).json({ error: 'Worker ID and mobile number are required' });
  }

  const cleanWorkerId = workerId.trim().toUpperCase();
  const cleanMobile = mobile.trim();

  // Read workers from db.json
  const db = readDb();
  const worker = db.workers.find(w => w.id === cleanWorkerId && w.mobile === cleanMobile);

  if (!worker) {
    return res.status(404).json({ error: 'Worker ID or mobile number not registered' });
  }

  // Generate a random 4-digit OTP code
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  activeOtps.set(cleanMobile, { otp, worker });

  console.log(`[OTP Services] Generated code ${otp} for ${cleanMobile}`);

  return res.json({ success: true, otp });
});

// Verify OTP Route
app.post('/api/auth/verify-otp', (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ error: 'Mobile number and verification OTP are required' });
  }

  const cleanMobile = mobile.trim();
  const cleanOtp = otp.trim();

  const record = activeOtps.get(cleanMobile);

  if (!record || record.otp !== cleanOtp) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  // Clear OTP from memory after successful verification
  activeOtps.delete(cleanMobile);

  const { worker } = record;
  console.log(`[Auth Services] OTP verified successfully for worker ${worker.id} (${cleanMobile})`);
  const token = jwt.sign(
    { id: worker.id, name: worker.name, mobile: worker.mobile, block: worker.block },
    SECRET_KEY,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    worker: {
      id: worker.id,
      name: worker.name,
      block: worker.block,
      mobile: worker.mobile
    }
  });
});

// Validate Token Route
app.get('/api/auth/validate', authenticateToken, (req, res) => {
  return res.json({
    valid: true,
    worker: {
      id: req.user.id,
      name: req.user.name,
      block: req.user.block,
      mobile: req.user.mobile
    }
  });
});

// GET Children
app.get('/api/children', authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.children);
});

// POST Observation
app.post('/api/children/observation', authenticateToken, (req, res) => {
  const { childId, note, category, type, imageUrl } = req.body;

  if (!childId || !note || !category) {
    return res.status(400).json({ error: 'childId, note, and category are required' });
  }

  const db = readDb();
  const child = db.children.find(c => c.id === childId);

  if (!child) {
    return res.status(444).json({ error: 'Child not found' });
  }

  const newObs = {
    id: 'obs-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    date: 'Today',
    note,
    category,
    type: type || 'text',
    ...(imageUrl ? { imageUrl } : {})
  };

  child.observations = [newObs, ...child.observations];
  writeDb(db);

  res.json({ message: 'Observation added successfully', child });
});

// PUT Attendance
app.put('/api/children/attendance', authenticateToken, (req, res) => {
  const { childId, attendance } = req.body;

  if (!childId || !attendance) {
    return res.status(400).json({ error: 'childId and attendance status are required' });
  }

  if (!['present', 'absent', 'irregular'].includes(attendance)) {
    return res.status(400).json({ error: 'Invalid attendance status value' });
  }

  const db = readDb();
  const child = db.children.find(c => c.id === childId);

  if (!child) {
    return res.status(404).json({ error: 'Child not found' });
  }

  const isCurrentlyPresent = child.attendance === 'present';
  const nextAttendance = attendance;
  
  if (child.attendanceHistory && child.attendanceHistory.length > 0) {
    child.attendanceHistory[child.attendanceHistory.length - 1] = (nextAttendance === 'present');
  }

  child.attendance = nextAttendance;
  writeDb(db);

  res.json({ message: 'Attendance status updated', child });
});

// GET Visits
app.get('/api/visits', authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.homeVisits);
});

// POST Schedule Visit
app.post('/api/visits', authenticateToken, (req, res) => {
  const { childName, parentName, lastVisit, concern, suggestedTopics } = req.body;

  if (!childName || !parentName || !lastVisit) {
    return res.status(400).json({ error: 'childName, parentName, and lastVisit are required' });
  }

  const db = readDb();
  const newVisit = {
    id: 'visit-' + Date.now(),
    childName,
    parentName,
    lastVisit,
    concern: concern || 'General Care',
    suggestedTopics: suggestedTopics || [
      'Review language progress',
      'Discuss healthy snacks recipes',
      'Demonstrate simple counting games'
    ],
    status: 'pending'
  };

  db.homeVisits = [newVisit, ...db.homeVisits];
  writeDb(db);

  res.json({ message: 'Home visit scheduled', visit: newVisit });
});

// PUT Complete Visit
app.put('/api/visits/:id/complete', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const visit = db.homeVisits.find(v => v.id === id);

  if (!visit) {
    return res.status(404).json({ error: 'Home visit not found' });
  }

  visit.status = 'completed';
  writeDb(db);

  res.json({ message: 'Home visit completed', visit });
});

// GET Notifications
app.get('/api/notifications', authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.notifications);
});

// PUT Read All Notifications
app.put('/api/notifications/read-all', authenticateToken, (req, res) => {
  const db = readDb();
  db.notifications = db.notifications.map(n => ({ ...n, read: true }));
  writeDb(db);
  res.json({ message: 'All notifications marked as read', notifications: db.notifications });
});

// DELETE Notification
app.delete('/api/notifications/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = readDb();
  db.notifications = db.notifications.filter(n => n.id !== id);
  writeDb(db);
  res.json({ message: 'Notification deleted' });
});

// POST Schedule Activity
app.post('/api/activities/schedule', authenticateToken, (req, res) => {
  const { activityId, date, targetChildrenIds } = req.body;

  if (!activityId || !date || !targetChildrenIds) {
    return res.status(400).json({ error: 'activityId, date, and targetChildrenIds are required' });
  }

  const db = readDb();
  const newSchedule = {
    id: 'sched-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    activityId,
    date,
    targetChildrenIds,
    completed: false
  };

  db.scheduledActivities = [...(db.scheduledActivities || []), newSchedule];
  writeDb(db);

  res.json({ message: 'Activity scheduled', schedule: newSchedule });
});

// POST Sync Queue Endpoint
app.post('/api/sync', authenticateToken, (req, res) => {
  const { operations } = req.body;

  if (!operations || !Array.isArray(operations)) {
    return res.status(400).json({ error: 'Operations array is required' });
  }

  const db = readDb();

  operations.forEach(op => {
    // Expected operation fields: type, childName, action, time
    // Let's implement smart syncing by trying to parse the action description
    const actionText = op.action || '';
    
    if (op.type === 'Attendance') {
      const child = db.children.find(c => c.name.toLowerCase() === op.childName.toLowerCase());
      if (child) {
        const toAbsent = actionText.toLowerCase().includes('absent');
        const nextAttendance = toAbsent ? 'absent' : 'present';
        child.attendance = nextAttendance;
        if (child.attendanceHistory && child.attendanceHistory.length > 0) {
          child.attendanceHistory[child.attendanceHistory.length - 1] = !toAbsent;
        }
      }
    } 
    else if (op.type === 'Observation') {
      const child = db.children.find(c => c.name.toLowerCase() === op.childName.toLowerCase());
      if (child) {
        // Extract note from action text if possible, e.g. "Logged Language note"
        // Let's add a generic observation note from the sync log
        const categoryMatch = actionText.match(/Logged (\w+) note/) || [null, 'General'];
        const category = categoryMatch[1];
        
        const newObs = {
          id: 'obs-sync-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          date: 'Synced',
          note: `Observation uploaded from sync log: ${actionText}`,
          category: category,
          type: 'text'
        };
        child.observations = [newObs, ...child.observations];
      }
    } 
    else if (op.type === 'Home Visit') {
      // Find visit by childName and status pending
      const visit = db.homeVisits.find(v => v.childName.toLowerCase() === op.childName.toLowerCase() && v.status === 'pending');
      if (visit && actionText.toLowerCase().includes('complete')) {
        visit.status = 'completed';
      } else if (actionText.toLowerCase().includes('schedule')) {
        // Scheduled a new visit
        const dateMatch = actionText.match(/for ([\w\d\s,]+)/) || [null, 'Next week'];
        const concernMatch = actionText.match(/\(([^)]+)\)/) || [null, 'General Care'];
        
        db.homeVisits = [{
          id: 'visit-sync-' + Date.now(),
          childName: op.childName,
          parentName: 'Parent of ' + op.childName,
          lastVisit: dateMatch[1],
          concern: concernMatch[1],
          suggestedTopics: [
            'Review language progress',
            'Discuss healthy snacks recipes',
            'Demonstrate simple counting games'
          ],
          status: 'pending'
        }, ...db.homeVisits];
      }
    }
    else if (op.type === 'Activity') {
      // e.g. Scheduled Rhyme Time for 2026-06-20
      const activityMatch = actionText.match(/Scheduled (.+?) for/);
      const dateMatch = actionText.match(/for ([\d-]+)/);
      if (dateMatch) {
        const scheduledDate = dateMatch[1];
        const activityName = activityMatch ? activityMatch[1] : 'Scheduled Activity';
        
        db.scheduledActivities = [...(db.scheduledActivities || []), {
          id: 'sched-sync-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          activityId: 'a1', // default fallback activity id
          date: scheduledDate,
          targetChildrenIds: ['1', '2'], // mock targets
          completed: false
        }];
      }
    }
    else if (op.type === 'Voice Report') {
      // Sync voice report
      // Add simulated observation for the first child or children matching
      db.children.forEach(c => {
        if (c.id === '1') {
          c.observations = [{
            id: 'v-obs-sync-' + Date.now(),
            date: 'Today',
            note: 'Voice report synced observation: Child is showing positive learning improvements.',
            category: 'Language',
            type: 'voice'
          }, ...c.observations];
        }
      });
    }
  });

  // Write sync modifications
  writeDb(db);

  // Add a sync success notification on server database
  const syncNotif = {
    id: 'n-sync-res-' + Date.now(),
    title: 'Database Synced',
    message: `${operations.length} client action logs uploaded and synchronized successfully.`,
    type: 'success',
    time: 'Just now',
    read: false
  };
  db.notifications = [syncNotif, ...db.notifications];
  writeDb(db);

  res.json({
    message: 'Synchronization successful',
    children: db.children,
    homeVisits: db.homeVisits,
    notifications: db.notifications,
    scheduledActivities: db.scheduledActivities || []
  });
});

app.listen(PORT, () => {
  console.log(`Pratibha AI backend server running on http://localhost:${PORT}`);
});
