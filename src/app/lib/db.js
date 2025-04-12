import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dbPath = path.resolve(process.cwd(), 'data.sqlite3')

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '')
}

const db = new Database(dbPath)

db.exec(`
CREATE TABLE IF NOT EXISTS problems (
  id INTEGER PRIMARY KEY,
  title TEXT,
  tags TEXT,
  difficulty TEXT,
  status_last TEXT,
  status_tried INTEGER,
  status_passed INTEGER,
  status_partial INTEGER,
  favorite INTEGER,
  link TEXT,
  note TEXT
);
CREATE TABLE IF NOT EXISTS problem_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  problem_id INTEGER,
  date TEXT,
  status TEXT,
  duration INTEGER
);
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  content TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS problem_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  description TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS set_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  set_id INTEGER,
  problem_id INTEGER
);
`)

export default db