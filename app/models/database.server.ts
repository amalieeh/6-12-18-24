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
  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Players table
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Player commitments (what each player chose to do)
  db.exec(`
    CREATE TABLE IF NOT EXISTS player_commitments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      target_amount INTEGER NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (category_id) REFERENCES categories(id),
      UNIQUE(player_id, category_id)
    )
  `);

  // Progress tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      category_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Insert default categories if they don't exist
  const categoryCheck = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  
  if (categoryCheck.count === 0) {
    const insertCategory = db.prepare('INSERT INTO categories (name, unit) VALUES (?, ?)');
    
    insertCategory.run('Running', 'km');
    insertCategory.run('Drinking', 'beers');
    insertCategory.run('Eating Donuts', 'donuts');
    insertCategory.run('Pull-ups', 'reps');
    
    console.log('✅ Default categories added');
  }
}

// Initialize database on import
initializeDatabase();

console.log(`✅ Database initialized at: ${dbPath}`);

export default db;