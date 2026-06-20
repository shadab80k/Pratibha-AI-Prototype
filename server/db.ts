import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'pratibha.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function initializeDatabase(): void {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS workers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      anganwadi_block TEXT DEFAULT 'Anganwadi Block 3',
      language TEXT DEFAULT 'en',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS children (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_hindi TEXT,
      age INTEGER,
      age_display TEXT,
      gender TEXT CHECK(gender IN ('boy','girl')),
      avatar TEXT,
      attendance TEXT DEFAULT 'present',
      nutrition_status TEXT DEFAULT 'good',
      development_progress INTEGER DEFAULT 0,
      last_visit TEXT,
      parent_name TEXT,
      parent_phone TEXT,
      address TEXT,
      needs_attention INTEGER DEFAULT 0,
      ai_insights TEXT DEFAULT '[]',
      worker_id TEXT REFERENCES workers(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS observations (
      id TEXT PRIMARY KEY,
      child_id TEXT REFERENCES children(id) ON DELETE CASCADE,
      date TEXT,
      note TEXT,
      category TEXT,
      type TEXT CHECK(type IN ('voice','text','photo')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      child_id TEXT REFERENCES children(id) ON DELETE CASCADE,
      title TEXT,
      date TEXT,
      category TEXT,
      completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS attendance_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id TEXT REFERENCES children(id) ON DELETE CASCADE,
      date TEXT,
      present INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      title_hindi TEXT,
      category TEXT,
      age_group TEXT,
      duration TEXT,
      materials TEXT DEFAULT '[]',
      learning_outcome TEXT,
      icon TEXT,
      ai_recommended INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS home_visits (
      id TEXT PRIMARY KEY,
      child_name TEXT,
      parent_name TEXT,
      concern TEXT,
      last_visit TEXT,
      suggested_topics TEXT DEFAULT '[]',
      status TEXT DEFAULT 'pending',
      worker_id TEXT REFERENCES workers(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT,
      message TEXT,
      type TEXT,
      time TEXT,
      read INTEGER DEFAULT 0,
      action TEXT,
      worker_id TEXT REFERENCES workers(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      title TEXT,
      date TEXT,
      type TEXT,
      summary TEXT,
      data TEXT DEFAULT '{}',
      worker_id TEXT REFERENCES workers(id)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      sender TEXT CHECK(sender IN ('user','ai')),
      message TEXT,
      timestamp TEXT,
      worker_id TEXT REFERENCES workers(id)
    );
  `);

  console.log('✅ Database tables initialized');
}
