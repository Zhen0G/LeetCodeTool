import Database from 'better-sqlite3'
import { join } from 'path'

const db = new Database(join(process.cwd(), 'data.sqlite3'))

db.pragma('journal_mode = WAL')

db.exec(`
CREATE TABLE IF NOT EXISTS problems (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  tags TEXT,
  difficulty TEXT,
  status_last TEXT DEFAULT 'Not Started',
  status_stats TEXT,
  favorite INTEGER DEFAULT 0,
  link TEXT NOT NULL,
  note TEXT DEFAULT '',
  history TEXT
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS problem_sets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  problems TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

export default db;
