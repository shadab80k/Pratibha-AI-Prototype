import { Router } from 'express';
import { getDb } from '../db.js';

const router = Router();

// GET /api/activities — Get all activities
router.get('/', (_req, res) => {
  const db = getDb();
  const activities = db.prepare('SELECT * FROM activities ORDER BY ai_recommended DESC, title ASC').all() as any[];

  const result = activities.map((a) => ({
    id: a.id,
    title: a.title,
    titleHindi: a.title_hindi,
    category: a.category,
    ageGroup: a.age_group,
    duration: a.duration,
    materials: JSON.parse(a.materials || '[]'),
    learningOutcome: a.learning_outcome,
    icon: a.icon,
    aiRecommended: a.ai_recommended === 1,
  }));

  return res.json(result);
});

// GET /api/activities/recommended — Get AI-recommended activities
router.get('/recommended', (_req, res) => {
  const db = getDb();
  const activities = db.prepare('SELECT * FROM activities WHERE ai_recommended = 1 ORDER BY title ASC').all() as any[];

  const result = activities.map((a) => ({
    id: a.id,
    title: a.title,
    titleHindi: a.title_hindi,
    category: a.category,
    ageGroup: a.age_group,
    duration: a.duration,
    materials: JSON.parse(a.materials || '[]'),
    learningOutcome: a.learning_outcome,
    icon: a.icon,
    aiRecommended: true,
  }));

  return res.json(result);
});

export default router;
