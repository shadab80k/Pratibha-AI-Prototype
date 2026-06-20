import { Router } from 'express';
import { getDb } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// GET /api/visits — Get all home visits
router.get('/', (req, res) => {
  const workerId = (req as any).workerId;
  const db = getDb();
  const visits = db.prepare('SELECT * FROM home_visits WHERE worker_id = ? ORDER BY created_at DESC').all(workerId) as any[];

  const result = visits.map((v) => ({
    id: v.id,
    childName: v.child_name,
    parentName: v.parent_name,
    concern: v.concern,
    lastVisit: v.last_visit,
    suggestedTopics: JSON.parse(v.suggested_topics || '[]'),
    status: v.status,
  }));

  return res.json(result);
});

// POST /api/visits — Schedule a new visit
router.post('/', (req, res) => {
  const workerId = (req as any).workerId;
  const db = getDb();
  const { childName, parentName, concern, lastVisit, suggestedTopics } = req.body;

  if (!childName) {
    return res.status(400).json({ error: 'Child name is required' });
  }

  const visitId = 'visit-' + uuidv4().split('-')[0];
  const topics = suggestedTopics || [
    'Review language progress',
    'Discuss healthy snacks recipes',
    'Demonstrate simple counting games',
  ];

  db.prepare(`
    INSERT INTO home_visits (id, child_name, parent_name, concern, last_visit, suggested_topics, status, worker_id)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(visitId, childName, parentName || '', concern || '', lastVisit || 'Today', JSON.stringify(topics), workerId);

  return res.json({
    id: visitId,
    childName,
    parentName: parentName || '',
    concern: concern || '',
    lastVisit: lastVisit || 'Today',
    suggestedTopics: topics,
    status: 'pending',
  });
});

// PUT /api/visits/:id/complete — Mark visit as completed
router.put('/:id/complete', (req, res) => {
  const db = getDb();
  const visit = db.prepare('SELECT * FROM home_visits WHERE id = ?').get(req.params.id) as any;

  if (!visit) {
    return res.status(404).json({ error: 'Visit not found' });
  }

  db.prepare("UPDATE home_visits SET status = 'completed' WHERE id = ?").run(req.params.id);

  return res.json({
    id: visit.id,
    childName: visit.child_name,
    status: 'completed',
  });
});

export default router;
