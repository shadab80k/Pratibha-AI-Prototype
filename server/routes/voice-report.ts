import { Router } from 'express';
import { getDb } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/voice-report/save — Save parsed voice report items
router.post('/save', (req, res) => {
  const db = getDb();
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const results: { childName: string; observationId: string; status: string }[] = [];

  const saveAll = db.transaction(() => {
    for (const item of items) {
      const { childName, note, type } = item;

      // Find child by name (case-insensitive for English, or matching Hindi name)
      const child = db.prepare('SELECT id, name, parent_name, worker_id FROM children WHERE LOWER(name) = LOWER(?) OR name_hindi = ?').get(childName, childName) as any;

      if (child) {
        const obsId = 'v-obs-' + uuidv4().split('-')[0];
        const category = type === 'alert' ? 'Emotional' : 'Social';

        db.prepare('INSERT INTO observations (id, child_id, date, note, category, type) VALUES (?, ?, ?, ?, ?, ?)').run(
          obsId, child.id, 'Today', note, category, 'voice'
        );

        // Check note for attendance updates
        const noteLower = note.toLowerCase();
        const absentKeywords = ['absent', 'away', 'missing', 'not present', 'not here', 'irregular', 'अनुपस्थित', 'गैरहाजिर', 'छुट्टी', 'नहीं आया', 'नहीं आई'];
        const presentKeywords = ['present', 'here', 'arrived', 'attended', 'उपस्थित', 'हाजिर', 'आया', 'आई', 'आए'];
        
        let attendanceStatus: 'present' | 'absent' | 'irregular' | null = null;
        if (absentKeywords.some(kw => noteLower.includes(kw))) {
          attendanceStatus = noteLower.includes('irregular') ? 'irregular' : 'absent';
        } else if (presentKeywords.some(kw => noteLower.includes(kw))) {
          attendanceStatus = 'present';
        }

        if (attendanceStatus) {
          db.prepare('UPDATE children SET attendance = ? WHERE id = ?').run(attendanceStatus, child.id);

          const today = new Date().toISOString().split('T')[0];
          const existing = db.prepare('SELECT id FROM attendance_history WHERE child_id = ? AND date = ?').get(child.id, today) as any;
          if (existing) {
            db.prepare('UPDATE attendance_history SET present = ? WHERE id = ?').run(attendanceStatus === 'present' ? 1 : 0, existing.id);
          } else {
            db.prepare('INSERT INTO attendance_history (child_id, date, present) VALUES (?, ?, ?)').run(child.id, today, attendanceStatus === 'present' ? 1 : 0);
          }
        }

        // If it's an alert or absent, flag the child for attention, create notification, and schedule home visit
        if (type === 'alert' || attendanceStatus === 'absent' || attendanceStatus === 'irregular') {
          db.prepare('UPDATE children SET needs_attention = 1 WHERE id = ?').run(child.id);

          // Create notification
          const notifId = 'notif-' + uuidv4().split('-')[0];
          const notifTitle = type === 'alert' ? 'Attention Alert' : 'Attendance Alert';
          const notifMessage = type === 'alert'
            ? `${child.name} flagged for attention: "${note}"`
            : `${child.name} was marked ${attendanceStatus} today.`;
          
          db.prepare(`
            INSERT INTO notifications (id, title, message, type, time, read, action, worker_id)
            VALUES (?, ?, ?, ?, 'Just now', 0, ?, ?)
          `).run(notifId, notifTitle, notifMessage, type === 'alert' ? 'alert' : 'reminder', 'children', child.worker_id || 'AW-4521');

          // Schedule home visit if not already pending
          const existingVisit = db.prepare("SELECT id FROM home_visits WHERE child_name = ? AND status = 'pending'").get(child.name) as any;
          if (!existingVisit) {
            const visitId = 'visit-' + uuidv4().split('-')[0];
            const concern = type === 'alert' ? `Voice Report flag: ${note}` : `Marked ${attendanceStatus} today`;
            const suggestedTopics = JSON.stringify(
              type === 'alert'
                ? ['Discuss home atmosphere', 'Check emotional well-being', 'Counsel parents']
                : ['Discuss regular attendance', 'Check child health', 'Share progress']
            );
            db.prepare(`
              INSERT INTO home_visits (id, child_name, parent_name, concern, last_visit, suggested_topics, status, worker_id)
              VALUES (?, ?, ?, ?, 'Today', ?, 'pending', ?)
            `).run(visitId, child.name, child.parent_name || 'Parent', concern, suggestedTopics, child.worker_id || 'AW-4521');
          }
        }

        results.push({ childName: child.name, observationId: obsId, status: 'saved' });
      } else {
        results.push({ childName, observationId: '', status: 'child_not_found' });
      }
    }
  });

  saveAll();

  return res.json({
    message: `Voice report saved: ${results.filter((r) => r.status === 'saved').length} observation(s) registered`,
    results,
  });
});

export default router;
