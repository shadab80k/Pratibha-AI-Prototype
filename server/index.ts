import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { initializeDatabase, getDb } from './db.js';
import { seedDatabase } from './seed.js';
import authRoutes from './routes/auth.js';
import childrenRoutes from './routes/children.js';
import activitiesRoutes from './routes/activities.js';
import visitsRoutes from './routes/visits.js';
import notificationsRoutes from './routes/notifications.js';
import reportsRoutes from './routes/reports.js';
import chatRoutes from './routes/chat.js';
import voiceReportRoutes from './routes/voice-report.js';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'pratibha-ai-secret-key-2025';

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// JWT Auth Middleware (skip for login and public routes)
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const publicPaths = ['/api/auth/login', '/api/health', '/api/admin/reset'];
  if (publicPaths.includes(req.originalUrl)) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string };
    (req as any).workerId = decoded.id;
    (req as any).workerName = decoded.name;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Apply auth middleware to all /api routes
app.use('/api', authMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/voice-report', voiceReportRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin reset — Re-seeds entire database
app.post('/api/admin/reset', (_req, res) => {
  const db = getDb();
  // Drop all data
  db.exec(`
    DELETE FROM chat_messages;
    DELETE FROM observations;
    DELETE FROM milestones;
    DELETE FROM attendance_history;
    DELETE FROM notifications;
    DELETE FROM reports;
    DELETE FROM home_visits;
    DELETE FROM children;
    DELETE FROM activities;
    DELETE FROM workers;
  `);

  // Re-seed
  seedDatabase();

  res.json({ message: 'Database reset to initial state' });
});

// Start server
initializeDatabase();
seedDatabase();

app.listen(PORT, () => {
  console.log(`\n🚀 Pratibha AI Backend running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Login credentials: phone=9876543210, password=1234\n`);
});
