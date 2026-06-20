import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// GET /api/notifications — Get all notifications
router.get('/', (req, res) => {
  const workerId = (req as any).workerId;
  const db = getDb();
  const notifications = db.prepare('SELECT * FROM notifications WHERE worker_id = ? ORDER BY read ASC, rowid DESC').all(workerId) as any[];

  const result = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    time: n.time,
    read: n.read === 1,
    action: n.action,
  }));

  return res.json(result);
});

// PUT /api/notifications/:id/read — Mark single notification as read
router.put('/:id/read', (req, res) => {
  const db = getDb();
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
  return res.json({ id: req.params.id, read: true });
});

// PUT /api/notifications/read-all — Mark all notifications as read
router.put('/read-all', (req, res) => {
  const workerId = (req as any).workerId;
  const db = getDb();
  db.prepare('UPDATE notifications SET read = 1 WHERE worker_id = ?').run(workerId);
  return res.json({ message: 'All notifications marked as read' });
});

// DELETE /api/notifications — Clear all notifications
router.delete('/', (req, res) => {
  const workerId = (req as any).workerId;
  const db = getDb();
  db.prepare('DELETE FROM notifications WHERE worker_id = ?').run(workerId);
  return res.json({ message: 'All notifications cleared' });
});

export default router;
