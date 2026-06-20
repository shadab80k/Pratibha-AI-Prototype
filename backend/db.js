import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

export function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      return { children: [], homeVisits: [], notifications: [], scheduledActivities: [] };
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading from JSON database:', error);
    return { children: [], homeVisits: [], notifications: [], scheduledActivities: [] };
  }
}

export function writeDb(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to JSON database:', error);
    return false;
  }
}
