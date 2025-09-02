import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create database file in project root (one level up from app/)
const dbPath = path.join(__dirname, '../../gamedata.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
  // Users table (replaces both users and players)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sessions table for session management
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User commitments (what each user chose to do)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_commitments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      target_amount INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      UNIQUE(user_id, category_id)
    )
  `);

  // Progress tracking - now includes who added the entry
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      added_by_user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (added_by_user_id) REFERENCES users(id)
    )
  `);

  // Insert default categories if they don't exist
  const categoryCheck = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  
  if (categoryCheck.count === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (name, unit) VALUES (?, ?)');
    
    insertCategory.run('Eating', 'donuts');
    insertCategory.run('Drinking', 'beers');
    insertCategory.run('Running', 'km');
    insertCategory.run('Fapping', 'events');

    console.log('✅ Default categories added');
  }
}

// Initialize database on import
initializeDatabase();

// Initialize default data after database setup
import("../utils/init-data");

console.log(`✅ Database initialized at: ${dbPath}`);

export default db;