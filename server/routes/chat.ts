import { Router } from 'express';
import { getDb } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// AI response mapping (same as frontend mockData but served from backend)
const aiResponses: Record<string, string> = {
  'Which children missed attendance this week?':
    'This week, 3 children have irregular attendance:\n\n1. Rohan - Absent 4 days (needs home visit)\n2. Priya - Absent 3 days (parent called - illness)\n3. Kiran - Absent 2 days (family travel)\n\nWould you like me to schedule home visits?',
  'Suggest activity for shy children':
    'For shy children, I recommend these gentle activities:\n\n1. Pair Work - "Find a Friend" matching game\n2. Story Circle - Let them hold the picture book\n3. Clay Modeling - Non-verbal creative expression\n4. Nature Walk - Side-by-side exploration\n\nStart with 1:1 interaction before group activities.',
  'Who needs home visit?':
    '2 children need home visits:\n\n1. Rohan Kumar\n   - Parent: Sunita Devi\n   - Concern: Irregular attendance + nutrition\n   - Last visit: 2 weeks ago\n\n2. Aarav Singh\n   - Parent: Rajesh Kumar\n   - Concern: Nutrition monitoring\n   - Last visit: 1 month ago\n\nTap to view detailed visit guides.',
  'Generate nutrition summary':
    'Weekly Nutrition Summary (Oct 20-27):\n\nGood Status (16): Rani, Aarav, Ananya, Dev, Meera...\n\nMonitoring (3): Priya, Kiran, Sohan\n\nAt Risk (2): Rohan, Mini\n\nRecommendation: Follow up with Rohan and Mini families for meal planning support.',
  'Show children needing extra support':
    'Children needing extra support:\n\n1. Rohan (4.5 yrs)\n   - Attendance: Irregular\n   - Nutrition: At-risk\n   - Support: Home visit + nutrition plan\n\n2. Priya (3.2 yrs)\n   - Language: Delayed speech\n   - Support: Daily 1:1 reading time\n\n3. Kiran (4 yrs)\n   - Social: Shy, avoids group play\n   - Support: Pair activities with Dev',
};

function getAiResponse(message: string): string {
  // Check for exact match
  if (aiResponses[message]) return aiResponses[message];

  // Check for keyword match
  const lowerMsg = message.toLowerCase();
  for (const [key, value] of Object.entries(aiResponses)) {
    if (lowerMsg.includes(key.toLowerCase().split(' ')[0])) return value;
  }

  // Default response
  return 'I understand. Let me help you with that. You can ask me about:\n\n- Attendance tracking\n- Activity suggestions\n- Child development insights\n- Report generation\n- Home visit planning\n\nHow else can I assist you today?';
}

// GET /api/chat/history — Get chat history
router.get('/history', (req, res) => {
  const workerId = (req as any).workerId;
  const db = getDb();
  const messages = db.prepare('SELECT * FROM chat_messages WHERE worker_id = ? ORDER BY rowid ASC').all(workerId) as any[];

  const result = messages.map((m) => ({
    id: m.id,
    sender: m.sender,
    message: m.message,
    timestamp: m.timestamp,
  }));

  return res.json(result);
});

// POST /api/chat/message — Send message and get AI response
router.post('/message', (req, res) => {
  const workerId = (req as any).workerId;
  const db = getDb();
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const userMsgId = 'msg-' + uuidv4().split('-')[0];
  const aiMsgId = 'msg-' + uuidv4().split('-')[0];
  const timestamp = new Date().toISOString();
  const aiResponse = getAiResponse(message);

  // Save user message
  db.prepare('INSERT INTO chat_messages (id, sender, message, timestamp, worker_id) VALUES (?, ?, ?, ?, ?)').run(
    userMsgId, 'user', message, timestamp, workerId
  );

  // Save AI response
  const aiTimestamp = new Date(Date.now() + 1000).toISOString();
  db.prepare('INSERT INTO chat_messages (id, sender, message, timestamp, worker_id) VALUES (?, ?, ?, ?, ?)').run(
    aiMsgId, 'ai', aiResponse, aiTimestamp, workerId
  );

  return res.json({
    userMessage: { id: userMsgId, sender: 'user', message, timestamp },
    aiMessage: { id: aiMsgId, sender: 'ai', message: aiResponse, timestamp: aiTimestamp },
  });
});

// DELETE /api/chat/history — Clear chat history
router.delete('/history', (req, res) => {
  const workerId = (req as any).workerId;
  const db = getDb();
  db.prepare('DELETE FROM chat_messages WHERE worker_id = ?').run(workerId);
  return res.json({ message: 'Chat history cleared' });
});

export default router;
