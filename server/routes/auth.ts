import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pratibha-ai-secret-key-2025';

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: 'Phone and password are required' });
  }

  const db = getDb();
  const worker = db.prepare('SELECT * FROM workers WHERE phone = ?').get(phone) as any;

  if (!worker) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const validPassword = bcrypt.compareSync(password, worker.password_hash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: worker.id, name: worker.name }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    token,
    worker: {
      id: worker.id,
      name: worker.name,
      phone: worker.phone,
      anganwadiBlock: worker.anganwadi_block,
      language: worker.language,
    },
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const workerId = (req as any).workerId;
  const db = getDb();
  const worker = db.prepare('SELECT id, name, phone, anganwadi_block, language FROM workers WHERE id = ?').get(workerId) as any;

  if (!worker) {
    return res.status(404).json({ error: 'Worker not found' });
  }

  return res.json({
    id: worker.id,
    name: worker.name,
    phone: worker.phone,
    anganwadiBlock: worker.anganwadi_block,
    language: worker.language,
  });
});

// PUT /api/auth/profile
router.put('/profile', (req, res) => {
  const workerId = (req as any).workerId;
  const { name, anganwadiBlock, language } = req.body;
  const db = getDb();

  const updates: string[] = [];
  const values: any[] = [];

  if (name) { updates.push('name = ?'); values.push(name); }
  if (anganwadiBlock) { updates.push('anganwadi_block = ?'); values.push(anganwadiBlock); }
  if (language) { updates.push('language = ?'); values.push(language); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(workerId);
  db.prepare(`UPDATE workers SET ${updates.join(', ')} WHERE id = ?`).run(...values);

  const worker = db.prepare('SELECT id, name, phone, anganwadi_block, language FROM workers WHERE id = ?').get(workerId) as any;

  return res.json({
    id: worker.id,
    name: worker.name,
    phone: worker.phone,
    anganwadiBlock: worker.anganwadi_block,
    language: worker.language,
  });
});

export default router;
