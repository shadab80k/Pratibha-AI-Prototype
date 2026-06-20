import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Configure Prisma with connection pooling and logging
const prisma = new PrismaClient({
  log: process.env.NODE_ENV !== 'production'
    ? ['query', 'info', 'warn', 'error']
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db?connection_limit=5&pool_timeout=10'
    }
  }
});
import { authenticateToken } from './middleware/auth.js';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 100, // Limit each IP to 100 requests per window (bypassed in test)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 10000 : 5, // Limit each IP to 5 requests per window (bypassed in test)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes.' }
});

// Validation Schemas
const sendOtpSchema = z.object({
  workerId: z.string({ required_error: 'Worker ID and mobile number are required' }).trim().min(1, 'Worker ID and mobile number are required'),
  mobile: z.string({ required_error: 'Worker ID and mobile number are required' }).trim().min(1, 'Worker ID and mobile number are required')
});

const verifyOtpSchema = z.object({
  mobile: z.string({ required_error: 'Mobile number and verification OTP are required' }).trim().min(1, 'Mobile number and verification OTP are required'),
  otp: z.string({ required_error: 'Mobile number and verification OTP are required' }).trim().min(1, 'Mobile number and verification OTP are required')
});

const observationSchema = z.object({
  childId: z.string({ required_error: 'childId, note, and category are required' }).trim().min(1, 'childId, note, and category are required'),
  note: z.string({ required_error: 'childId, note, and category are required' }).trim().min(1, 'childId, note, and category are required'),
  category: z.string({ required_error: 'childId, note, and category are required' }).trim().min(1, 'childId, note, and category are required'),
  type: z.string().trim().optional(),
  imageUrl: z.string().trim().optional()
});

const attendanceSchema = z.object({
  childId: z.string({ required_error: 'childId and attendance status are required' }).trim().min(1, 'childId and attendance status are required'),
  attendance: z.enum(['present', 'absent', 'irregular'], {
    errorMap: () => ({ message: 'Invalid attendance status value' })
  })
});

const visitSchema = z.object({
  childName: z.string({ required_error: 'childName, parentName, and lastVisit are required' }).trim().min(1, 'childName, parentName, and lastVisit are required'),
  parentName: z.string({ required_error: 'childName, parentName, and lastVisit are required' }).trim().min(1, 'childName, parentName, and lastVisit are required'),
  lastVisit: z.string({ required_error: 'childName, parentName, and lastVisit are required' }).trim().min(1, 'childName, parentName, and lastVisit are required'),
  concern: z.string().trim().optional(),
  suggestedTopics: z.array(z.string()).optional()
});

const scheduleActivitySchema = z.object({
  activityId: z.string({ required_error: 'activityId, date, and targetChildrenIds are required' }).trim().min(1, 'activityId, date, and targetChildrenIds are required'),
  date: z.string({ required_error: 'activityId, date, and targetChildrenIds are required' }).trim().min(1, 'activityId, date, and targetChildrenIds are required'),
  targetChildrenIds: z.array(z.string(), { required_error: 'activityId, date, and targetChildrenIds are required' })
});

const syncSchema = z.object({
  lastSyncedAt: z.number().optional(),
  operations: z.array(
    z.object({
      type: z.string(),
      childName: z.string(),
      action: z.string().optional(),
      time: z.string().optional()
    }),
    { required_error: 'Operations array is required' }
  )
});

// Validation Middleware
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    // Combine error messages from Zod validation
    const errorMessages = result.error.issues.map(err => err.message).join(', ');
    return res.status(400).json({ error: errorMessages });
  }
  // Assigned parsed/trimmed values back to req.body
  req.body = result.data;
  next();
};

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is required");
  process.exit(1);
}

const app = express();
app.use(helmet());
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET;

const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
  allowedOrigins.push(...envOrigins);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(express.json());

// Apply general rate limiting to all /api routes
app.use('/api', generalLimiter);

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

// Placeholder function for future SMS gateway integration
function sendOtpViaSms(mobile, otp) {
  console.log(`[SMS Gateway Placeholder] Sending OTP ${otp} to mobile number ${mobile}`);
}

// Send OTP Route
app.post('/api/auth/send-otp', authLimiter, validate(sendOtpSchema), async (req, res) => {
  try {
    const { workerId, mobile } = req.body;

    const cleanWorkerId = workerId.toUpperCase();
    const cleanMobile = mobile;

    // Read workers from SQLite database
    const worker = await prisma.worker.findFirst({
      where: { id: cleanWorkerId, mobile: cleanMobile }
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker ID or mobile number not registered' });
    }

    // Generate a random 4-digit OTP code
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const createdAt = Date.now();
    activeOtps.set(cleanMobile, { otp, worker, createdAt });

    // Simulate sending OTP via SMS
    sendOtpViaSms(cleanMobile, otp);

    // Log code to console for development/testing only
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[OTP Services] Generated code ${otp} for ${cleanMobile}`);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[Send OTP Error]', err);
    return res.status(500).json({ error: 'Internal server error while sending OTP' });
  }
});

// Verify OTP Route
app.post('/api/auth/verify-otp', authLimiter, validate(verifyOtpSchema), (req, res) => {
  const { mobile, otp } = req.body;

  const cleanMobile = mobile;
  const cleanOtp = otp;

  const record = activeOtps.get(cleanMobile);

  if (!record) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  // Check if OTP has expired (5 minutes = 300,000 milliseconds)
  const isExpired = Date.now() - record.createdAt > 5 * 60 * 1000;
  if (isExpired) {
    activeOtps.delete(cleanMobile);
    return res.status(400).json({ error: 'Verification code has expired' });
  }

  if (record.otp !== cleanOtp) {
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
app.get('/api/children', authenticateToken, async (req, res) => {
  try {
    const children = await prisma.child.findMany({
      include: {
        observations: { orderBy: { id: 'desc' } },
        milestones: true,
        attendances: true
      }
    });

    const formattedChildren = children.map(child => {
      const sortedAttendances = [...child.attendances].sort((a, b) => {
        const getOffset = (d) => {
          if (d === 'Today') return 0;
          if (d === 'Yesterday') return 1;
          const match = d.match(/^(\d+) days ago$/);
          return match ? parseInt(match[1]) : 999;
        };
        return getOffset(b.date) - getOffset(a.date);
      });

      const attendanceHistory = sortedAttendances.map(att => att.status === 'present');
      const todayAttendance = child.attendances.find(att => att.date === 'Today');
      const attendance = todayAttendance ? todayAttendance.status : 'present';

      return {
        ...child,
        attendance,
        attendanceHistory,
        aiInsights: JSON.parse(child.aiInsights || '[]'),
        observations: child.observations.map(obs => ({
          ...obs,
          imageUrl: obs.imageUrl || undefined
        }))
      };
    });

    res.json(formattedChildren);
  } catch (err) {
    console.error('[GET Children Error]', err);
    return res.status(500).json({ error: 'Failed to fetch children data' });
  }
});

// POST Observation
app.post('/api/children/observation', authenticateToken, validate(observationSchema), async (req, res) => {
  try {
    const { childId, note, category, type, imageUrl } = req.body;

    const childExists = await prisma.child.findUnique({ where: { id: childId } });
    if (!childExists) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const newObsId = 'obs-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    await prisma.observation.create({
      data: {
        id: newObsId,
        date: 'Today',
        note,
        category,
        type: type || 'text',
        imageUrl: imageUrl || null,
        childId
      }
    });

    const updatedChild = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        observations: { orderBy: { id: 'desc' } },
        milestones: true,
        attendances: true
      }
    });

    const sortedAttendances = [...updatedChild.attendances].sort((a, b) => {
      const getOffset = (d) => {
        if (d === 'Today') return 0;
        if (d === 'Yesterday') return 1;
        const match = d.match(/^(\d+) days ago$/);
        return match ? parseInt(match[1]) : 999;
      };
      return getOffset(b.date) - getOffset(a.date);
    });
    const attendanceHistory = sortedAttendances.map(att => att.status === 'present');
    const todayAttendance = updatedChild.attendances.find(att => att.date === 'Today');
    const attendance = todayAttendance ? todayAttendance.status : 'present';

    const formattedChild = {
      ...updatedChild,
      attendance,
      attendanceHistory,
      aiInsights: JSON.parse(updatedChild.aiInsights || '[]'),
      observations: updatedChild.observations.map(obs => ({
        ...obs,
        imageUrl: obs.imageUrl || undefined
      }))
    };

    res.json({ message: 'Observation added successfully', child: formattedChild });
  } catch (err) {
    console.error('[POST Observation Error]', err);
    return res.status(500).json({ error: 'Failed to add observation' });
  }
});

// PUT Attendance
app.put('/api/children/attendance', authenticateToken, validate(attendanceSchema), async (req, res) => {
  try {
    const { childId, attendance } = req.body;

    const childExists = await prisma.child.findUnique({ where: { id: childId } });
    if (!childExists) {
      return res.status(404).json({ error: 'Child not found' });
    }

    // Upsert 'Today' attendance
    const todayRecord = await prisma.attendance.findFirst({
      where: { childId, date: 'Today' }
    });

    if (todayRecord) {
      await prisma.attendance.update({
        where: { id: todayRecord.id },
        data: { status: attendance }
      });
    } else {
      await prisma.attendance.create({
        data: {
          childId,
          date: 'Today',
          status: attendance
        }
      });
    }

    const updatedChild = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        observations: { orderBy: { id: 'desc' } },
        milestones: true,
        attendances: true
      }
    });

    const sortedAttendances = [...updatedChild.attendances].sort((a, b) => {
      const getOffset = (d) => {
        if (d === 'Today') return 0;
        if (d === 'Yesterday') return 1;
        const match = d.match(/^(\d+) days ago$/);
        return match ? parseInt(match[1]) : 999;
      };
      return getOffset(b.date) - getOffset(a.date);
    });
    const attendanceHistory = sortedAttendances.map(att => att.status === 'present');
    const todayAttendance = updatedChild.attendances.find(att => att.date === 'Today');
    const attendanceStatus = todayAttendance ? todayAttendance.status : 'present';

    const formattedChild = {
      ...updatedChild,
      attendance: attendanceStatus,
      attendanceHistory,
      aiInsights: JSON.parse(updatedChild.aiInsights || '[]'),
      observations: updatedChild.observations.map(obs => ({
        ...obs,
        imageUrl: obs.imageUrl || undefined
      }))
    };

    res.json({ message: 'Attendance status updated', child: formattedChild });
  } catch (err) {
    console.error('[PUT Attendance Error]', err);
    return res.status(500).json({ error: 'Failed to update attendance' });
  }
});

// GET Visits
app.get('/api/visits', authenticateToken, async (req, res) => {
  try {
    const visits = await prisma.homeVisit.findMany({ orderBy: { id: 'desc' } });
    const formattedVisits = visits.map(v => ({
      ...v,
      suggestedTopics: JSON.parse(v.suggestedTopics || '[]')
    }));
    res.json(formattedVisits);
  } catch (err) {
    console.error('[GET Visits Error]', err);
    return res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

// POST Schedule Visit
app.post('/api/visits', authenticateToken, validate(visitSchema), async (req, res) => {
  try {
    const { childName, parentName, lastVisit, concern, suggestedTopics } = req.body;

    const matchingChild = await prisma.child.findFirst({
      where: { name: { equals: childName } }
    });
    const childId = matchingChild ? matchingChild.id : null;

    const newVisitId = 'visit-' + Date.now();
    const newVisit = await prisma.homeVisit.create({
      data: {
        id: newVisitId,
        childId,
        childName,
        parentName,
        lastVisit,
        concern: concern || 'General Care',
        suggestedTopics: JSON.stringify(suggestedTopics || [
          'Review language progress',
          'Discuss healthy snacks recipes',
          'Demonstrate simple counting games'
        ]),
        status: 'pending'
      }
    });

    res.json({
      message: 'Home visit scheduled',
      visit: {
        ...newVisit,
        suggestedTopics: JSON.parse(newVisit.suggestedTopics)
      }
    });
  } catch (err) {
    console.error('[POST Visit Error]', err);
    return res.status(500).json({ error: 'Failed to schedule visit' });
  }
});

// PUT Complete Visit
app.put('/api/visits/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const visitExists = await prisma.homeVisit.findUnique({ where: { id } });
    if (!visitExists) {
      return res.status(404).json({ error: 'Home visit not found' });
    }

    const updatedVisit = await prisma.homeVisit.update({
      where: { id },
      data: { status: 'completed' }
    });

    res.json({
      message: 'Home visit completed',
      visit: {
        ...updatedVisit,
        suggestedTopics: JSON.parse(updatedVisit.suggestedTopics)
      }
    });
  } catch (err) {
    console.error('[PUT Complete Visit Error]', err);
    return res.status(500).json({ error: 'Failed to complete visit' });
  }
});

// GET Notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({ orderBy: { id: 'desc' } });
    res.json(notifications);
  } catch (err) {
    console.error('[GET Notifications Error]', err);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT Read All Notifications
app.put('/api/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      data: { read: true }
    });
    const notifications = await prisma.notification.findMany({ orderBy: { id: 'desc' } });
    res.json({ message: 'All notifications marked as read', notifications });
  } catch (err) {
    console.error('[PUT Read All Notifications Error]', err);
    return res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// DELETE Notification
app.delete('/api/notifications/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.notification.delete({ where: { id } });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(404).json({ error: 'Notification not found' });
  }
});

// POST Schedule Activity
app.post('/api/activities/schedule', authenticateToken, validate(scheduleActivitySchema), async (req, res) => {
  try {
    const { activityId, date, targetChildrenIds } = req.body;

    const newScheduleId = 'sched-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const newSchedule = await prisma.scheduledActivity.create({
      data: {
        id: newScheduleId,
        activityId,
        date,
        targetChildrenIds: JSON.stringify(targetChildrenIds),
        completed: false
      }
    });

    res.json({
      message: 'Activity scheduled',
      schedule: {
        ...newSchedule,
        targetChildrenIds: JSON.parse(newSchedule.targetChildrenIds)
      }
    });
  } catch (err) {
    console.error('[POST Schedule Activity Error]', err);
    return res.status(500).json({ error: 'Failed to schedule activity' });
  }
});

// POST Sync Queue Endpoint
app.post('/api/sync', authenticateToken, validate(syncSchema), async (req, res) => {
  try {
    const { operations, lastSyncedAt = 0 } = req.body;
    const clientSyncThreshold = new Date(lastSyncedAt);

    for (const op of operations) {
      const actionText = op.action || '';

      if (op.type === 'Attendance') {
        const child = await prisma.child.findFirst({
          where: { name: { equals: op.childName } }
        });
        if (child) {
          const toAbsent = actionText.toLowerCase().includes('absent');
          const nextAttendance = toAbsent ? 'absent' : 'present';

          // Conflict check
          if (child.lastModified > clientSyncThreshold) {
            console.warn(`[Sync Conflict] Child '${child.name}' edited by another worker. Server lastModified: ${child.lastModified.toISOString()}, Client baseline: ${clientSyncThreshold.toISOString()}. Applying LWW (Client value: ${nextAttendance}).`);
            
            await prisma.notification.create({
              data: {
                id: 'n-conf-att-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                title: 'Sync Conflict: ' + child.name,
                message: `Attendance for ${child.name} was edited by someone else on the server. Server had: ${child.attendance || 'present'}. Applied client version: ${nextAttendance}.`,
                type: 'alert',
                time: 'Just now',
                read: false
              }
            });
          }
          
          const todayRecord = await prisma.attendance.findFirst({
            where: { childId: child.id, date: 'Today' }
          });
          if (todayRecord) {
            await prisma.attendance.update({
              where: { id: todayRecord.id },
              data: { status: nextAttendance }
            });
          } else {
            await prisma.attendance.create({
              data: {
                childId: child.id,
                date: 'Today',
                status: nextAttendance
              }
            });
          }

          // Update child lastModified
          await prisma.child.update({
            where: { id: child.id },
            data: { lastModified: new Date() }
          });
        }
      } 
      else if (op.type === 'Observation') {
        const child = await prisma.child.findFirst({
          where: { name: { equals: op.childName } }
        });
        if (child) {
          const categoryMatch = actionText.match(/Logged (\w+) note/) || [null, 'General'];
          const category = categoryMatch[1];
          
          if (child.lastModified > clientSyncThreshold) {
            console.warn(`[Sync Conflict Alert] Adding observation for '${child.name}' whose record was modified on server.`);
            await prisma.notification.create({
              data: {
                id: 'n-conf-obs-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                title: 'Sync Notice: ' + child.name,
                message: `Added observation for ${child.name} during sync. Note: "${actionText}". Child profile was also updated on the server by another worker.`,
                type: 'info',
                time: 'Just now',
                read: false
              }
            });
          }

          const newObsId = 'obs-sync-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
          await prisma.observation.create({
            data: {
              id: newObsId,
              date: 'Synced',
              note: `Observation uploaded from sync log: ${actionText}`,
              category: category,
              type: 'text',
              childId: child.id
            }
          });

          await prisma.child.update({
            where: { id: child.id },
            data: { lastModified: new Date() }
          });
        }
      } 
      else if (op.type === 'Home Visit') {
        const child = await prisma.child.findFirst({
          where: { name: { equals: op.childName } }
        });

        if (actionText.toLowerCase().includes('complete')) {
          const visit = await prisma.homeVisit.findFirst({
            where: { 
              childName: { equals: op.childName },
              status: 'pending'
            }
          });
          if (visit) {
            if (visit.lastModified > clientSyncThreshold) {
              console.warn(`[Sync Conflict] Home Visit for '${op.childName}' edited by another worker. Server lastModified: ${visit.lastModified.toISOString()}, Client baseline: ${clientSyncThreshold.toISOString()}. Applying LWW (Completed status).`);
              await prisma.notification.create({
                data: {
                  id: 'n-conf-hv-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                  title: 'Sync Conflict: Home Visit',
                  message: `Home visit status for ${op.childName} was updated on the server. Applied client version: completed.`,
                  type: 'alert',
                  time: 'Just now',
                  read: false
                }
              });
            }

            await prisma.homeVisit.update({
              where: { id: visit.id },
              data: { status: 'completed', lastModified: new Date() }
            });
          }
        } else if (actionText.toLowerCase().includes('schedule')) {
          const dateMatch = actionText.match(/for ([\w\d\s,]+)/) || [null, 'Next week'];
          const concernMatch = actionText.match(/\(([^)]+)\)/) || [null, 'General Care'];
          const newVisitId = 'visit-sync-' + Date.now();
          
          await prisma.homeVisit.create({
            data: {
              id: newVisitId,
              childId: child ? child.id : null,
              childName: op.childName,
              parentName: child ? child.parentName : ('Parent of ' + op.childName),
              lastVisit: dateMatch[1],
              concern: concernMatch[1],
              suggestedTopics: JSON.stringify([
                'Review language progress',
                'Discuss healthy snacks recipes',
                'Demonstrate simple counting games'
              ]),
              status: 'pending',
              lastModified: new Date()
            }
          });
        }
      }
      else if (op.type === 'Activity') {
        const dateMatch = actionText.match(/for ([\d-]+)/);
        if (dateMatch) {
          const scheduledDate = dateMatch[1];
          const newScheduleId = 'sched-sync-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
          
          await prisma.scheduledActivity.create({
            data: {
              id: newScheduleId,
              activityId: 'a1',
              date: scheduledDate,
              targetChildrenIds: JSON.stringify(['1', '2']),
              completed: false,
              lastModified: new Date()
            }
          });
        }
      }
      else if (op.type === 'Voice Report') {
        const newObsId = 'v-obs-sync-' + Date.now();
        await prisma.observation.create({
          data: {
            id: newObsId,
            date: 'Today',
            note: 'Voice report synced observation: Child is showing positive learning improvements.',
            category: 'Language',
            type: 'voice',
            childId: '1'
          }
        });
      }
    }

    const syncNotifId = 'n-sync-res-' + Date.now();
    await prisma.notification.create({
      data: {
        id: syncNotifId,
        title: 'Database Synced',
        message: `${operations.length} client action logs uploaded and synchronized successfully.`,
        type: 'success',
        time: 'Just now',
        read: false
      }
    });

    const children = await prisma.child.findMany({
      include: {
        observations: { orderBy: { id: 'desc' } },
        milestones: true,
        attendances: true
      }
    });

    const formattedChildren = children.map(child => {
      const sortedAttendances = [...child.attendances].sort((a, b) => {
        const getOffset = (d) => {
          if (d === 'Today') return 0;
          if (d === 'Yesterday') return 1;
          const match = d.match(/^(\d+) days ago$/);
          return match ? parseInt(match[1]) : 999;
        };
        return getOffset(b.date) - getOffset(a.date);
      });

      const attendanceHistory = sortedAttendances.map(att => att.status === 'present');
      const todayAttendance = child.attendances.find(att => att.date === 'Today');
      const attendance = todayAttendance ? todayAttendance.status : 'present';

      return {
        ...child,
        attendance,
        attendanceHistory,
        aiInsights: JSON.parse(child.aiInsights || '[]'),
        observations: child.observations.map(obs => ({
          ...obs,
          imageUrl: obs.imageUrl || undefined
        }))
      };
    });

    const visits = await prisma.homeVisit.findMany({ orderBy: { id: 'desc' } });
    const formattedVisits = visits.map(v => ({
      ...v,
      suggestedTopics: JSON.parse(v.suggestedTopics || '[]')
    }));

    const notifications = await prisma.notification.findMany({ orderBy: { id: 'desc' } });
    
    const scheduledActivities = await prisma.scheduledActivity.findMany();
    const formattedScheduledActivities = scheduledActivities.map(sa => ({
      ...sa,
      targetChildrenIds: JSON.parse(sa.targetChildrenIds || '[]')
    }));

    res.json({
      message: 'Synchronization successful',
      children: formattedChildren,
      homeVisits: formattedVisits,
      notifications,
      scheduledActivities: formattedScheduledActivities
    });
  } catch (err) {
    console.error('[POST Sync Error]', err);
    return res.status(500).json({ error: 'Synchronization failed due to a server error' });
  }
});

// POST AI Chat Proxy (Server-side Gemini forwarder)
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  const { contents, stream = false } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[AI Chat Error] GEMINI_API_KEY is not configured in backend .env');
    return res.status(500).json({ error: 'Gemini API Key is not configured on the server. Please add it to your backend .env file.' });
  }

  const model = 'gemini-2.5-flash';
  const action = stream ? 'streamGenerateContent' : 'generateContent';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${action}?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contents })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI Chat Error] Gemini API returned status ${response.status}: ${errorText}`);
      return res.status(response.status).json({ error: `Gemini API error: ${errorText}` });
    }

    if (stream) {
      // Set SSE/Stream headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (err) {
    console.error('[AI Chat Proxy Error]', err);
    return res.status(500).json({ error: 'Failed to communicate with Gemini API' });
  }
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { app };

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Pratibha AI backend server running on http://localhost:${PORT}`);
  });
}
