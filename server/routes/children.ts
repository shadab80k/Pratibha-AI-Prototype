import { Router } from 'express';
import { getDb } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/children — Get all children for the worker
router.get('/', (req, res) => {
  const workerId = (req as any).workerId;
  const db = getDb();

  const children = db.prepare('SELECT * FROM children WHERE worker_id = ? ORDER BY name').all(workerId) as any[];

  const result = children.map((child) => {
    const observations = db.prepare('SELECT * FROM observations WHERE child_id = ? ORDER BY created_at DESC').all(child.id) as any[];
    const milestones = db.prepare('SELECT * FROM milestones WHERE child_id = ?').all(child.id) as any[];
    const attendanceRows = db.prepare('SELECT present FROM attendance_history WHERE child_id = ? ORDER BY date ASC').all(child.id) as any[];

    return {
      id: child.id,
      name: child.name,
      nameHindi: child.name_hindi,
      age: child.age,
      ageDisplay: child.age_display,
      gender: child.gender,
      avatar: child.avatar,
      attendance: child.attendance,
      nutritionStatus: child.nutrition_status,
      developmentProgress: child.development_progress,
      lastVisit: child.last_visit,
      parentName: child.parent_name,
      parentPhone: child.parent_phone,
      address: child.address,
      needsAttention: child.needs_attention === 1,
      aiInsights: JSON.parse(child.ai_insights || '[]'),
      observations: observations.map((o) => ({
        id: o.id,
        date: o.date,
        note: o.note,
        category: o.category,
        type: o.type,
      })),
      milestones: milestones.map((m) => ({
        id: m.id,
        title: m.title,
        date: m.date,
        category: m.category,
        completed: m.completed === 1,
      })),
      attendanceHistory: attendanceRows.map((a: any) => a.present === 1),
    };
  });

  return res.json(result);
});

// GET /api/children/:id — Get single child with full data
router.get('/:id', (req, res) => {
  const db = getDb();
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get(req.params.id) as any;

  if (!child) {
    return res.status(404).json({ error: 'Child not found' });
  }

  const observations = db.prepare('SELECT * FROM observations WHERE child_id = ? ORDER BY created_at DESC').all(child.id) as any[];
  const milestones = db.prepare('SELECT * FROM milestones WHERE child_id = ?').all(child.id) as any[];
  const attendanceRows = db.prepare('SELECT present FROM attendance_history WHERE child_id = ? ORDER BY date ASC').all(child.id) as any[];

  return res.json({
    id: child.id,
    name: child.name,
    nameHindi: child.name_hindi,
    age: child.age,
    ageDisplay: child.age_display,
    gender: child.gender,
    avatar: child.avatar,
    attendance: child.attendance,
    nutritionStatus: child.nutrition_status,
    developmentProgress: child.development_progress,
    lastVisit: child.last_visit,
    parentName: child.parent_name,
    parentPhone: child.parent_phone,
    address: child.address,
    needsAttention: child.needs_attention === 1,
    aiInsights: JSON.parse(child.ai_insights || '[]'),
    observations: observations.map((o) => ({
      id: o.id,
      date: o.date,
      note: o.note,
      category: o.category,
      type: o.type,
    })),
    milestones: milestones.map((m) => ({
      id: m.id,
      title: m.title,
      date: m.date,
      category: m.category,
      completed: m.completed === 1,
    })),
    attendanceHistory: attendanceRows.map((a: any) => a.present === 1),
  });
});

// PUT /api/children/:id/attendance — Toggle attendance
router.put('/:id/attendance', (req, res) => {
  const db = getDb();
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get(req.params.id) as any;

  if (!child) {
    return res.status(404).json({ error: 'Child not found' });
  }

  const { attendance } = req.body;
  const newAttendance = attendance || (child.attendance === 'present' ? 'absent' : 'present');

  db.prepare('UPDATE children SET attendance = ? WHERE id = ?').run(newAttendance, child.id);

  // Update latest attendance history entry
  const today = new Date().toISOString().split('T')[0];
  const existing = db.prepare('SELECT id FROM attendance_history WHERE child_id = ? AND date = ?').get(child.id, today) as any;

  if (existing) {
    db.prepare('UPDATE attendance_history SET present = ? WHERE id = ?').run(newAttendance === 'present' ? 1 : 0, existing.id);
  } else {
    db.prepare('INSERT INTO attendance_history (child_id, date, present) VALUES (?, ?, ?)').run(child.id, today, newAttendance === 'present' ? 1 : 0);
  }

  return res.json({ id: child.id, name: child.name, attendance: newAttendance });
});

// POST /api/children/mark-all-present — Bulk mark all present
router.post('/mark-all-present', (req, res) => {
  const workerId = (req as any).workerId;
  const db = getDb();

  db.prepare("UPDATE children SET attendance = 'present' WHERE worker_id = ?").run(workerId);

  const today = new Date().toISOString().split('T')[0];
  const children = db.prepare('SELECT id FROM children WHERE worker_id = ?').all(workerId) as any[];

  const upsert = db.transaction(() => {
    for (const child of children) {
      const existing = db.prepare('SELECT id FROM attendance_history WHERE child_id = ? AND date = ?').get(child.id, today) as any;
      if (existing) {
        db.prepare('UPDATE attendance_history SET present = 1 WHERE id = ?').run(existing.id);
      } else {
        db.prepare('INSERT INTO attendance_history (child_id, date, present) VALUES (?, ?, 1)').run(child.id, today);
      }
    }
  });
  upsert();

  return res.json({ message: 'All children marked present', count: children.length });
});

// POST /api/children/:id/observations — Add observation
router.post('/:id/observations', (req, res) => {
  const db = getDb();
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get(req.params.id) as any;

  if (!child) {
    return res.status(404).json({ error: 'Child not found' });
  }

  const { note, category, type } = req.body;

  if (!note) {
    return res.status(400).json({ error: 'Note is required' });
  }

  const obsId = 'obs-' + uuidv4().split('-')[0];
  const obsType = type || 'text';
  const obsCategory = category || 'General';

  db.prepare('INSERT INTO observations (id, child_id, date, note, category, type) VALUES (?, ?, ?, ?, ?, ?)').run(
    obsId, child.id, 'Today', note, obsCategory, obsType
  );

  return res.json({
    id: obsId,
    date: 'Today',
    note,
    category: obsCategory,
    type: obsType,
    childName: child.name,
  });
});

// PUT /api/children/:id/milestones/:mid — Update milestone
router.put('/:id/milestones/:mid', (req, res) => {
  const db = getDb();
  const { completed } = req.body;

  db.prepare('UPDATE milestones SET completed = ? WHERE id = ? AND child_id = ?').run(
    completed ? 1 : 0, req.params.mid, req.params.id
  );

  const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(req.params.mid) as any;

  if (!milestone) {
    return res.status(404).json({ error: 'Milestone not found' });
  }

  return res.json({
    id: milestone.id,
    title: milestone.title,
    date: milestone.date,
    category: milestone.category,
    completed: milestone.completed === 1,
  });
});

// POST /api/children — Add new child
router.post('/', (req, res) => {
  const workerId = (req as any).workerId;
  const db = getDb();
  const { name, nameHindi, age, ageDisplay, gender, parentName, parentPhone, address } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const childId = uuidv4().split('-')[0];

  db.prepare(`
    INSERT INTO children (id, name, name_hindi, age, age_display, gender, avatar, attendance, nutrition_status, development_progress, last_visit, parent_name, parent_phone, address, needs_attention, ai_insights, worker_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'present', 'good', 0, 'New', ?, ?, ?, 0, '[]', ?)
  `).run(childId, name, nameHindi || '', age || 3, ageDisplay || `${age || 3} years`, gender || 'boy', './child-default.png', parentName || '', parentPhone || '', address || '', workerId);

  return res.json({ id: childId, name, message: 'Child added successfully' });
});

export default router;
