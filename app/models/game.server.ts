import db from './database.server';

// TypeScript interfaces for better type safety
export interface Player {
  id: number;
  name: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  unit: string;
  created_at: string;
}

export interface PlayerStatus {
  player_name: string;
  category_name: string;
  unit: string;
  target_amount: number;
  current_progress: number;
  completion_percentage: number;
}

export interface ProgressEntry {
  id: number;
  playerName: string;
  categoryName: string;
  amount: number;
}

// ===== PLAYERS =====
export function createPlayer(name: string): Player {
  try {
    const stmt = db.prepare('INSERT INTO players (name) VALUES (?)');
    const result = stmt.run(name);
    return { 
      id: result.lastInsertRowid as number, 
      name,
      created_at: new Date().toISOString()
    };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error(`Player "${name}" already exists`);
    }
    throw error;
  }
}

export function getPlayer(name: string): Player | undefined {
  const stmt = db.prepare('SELECT * FROM players WHERE name = ?');
  return stmt.get(name) as Player | undefined;
}

export function getAllPlayers(): Player[] {
  const stmt = db.prepare('SELECT * FROM players ORDER BY name');
  return stmt.all() as Player[];
}

// ===== CATEGORIES =====
export function getAllCategories(): Category[] {
  const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
  return stmt.all() as Category[];
}

export function createCategory(name: string, unit: string): Category {
  const stmt = db.prepare('INSERT INTO categories (name, unit) VALUES (?, ?)');
  const result = stmt.run(name, unit);
  return { 
    id: result.lastInsertRowid as number, 
    name, 
    unit,
    created_at: new Date().toISOString()
  };
}

// ===== PLAYER COMMITMENTS =====
export function setPlayerCommitment(playerName: string, categoryName: string, targetAmount: number): void {
  // Get player and category IDs
  const player = getPlayer(playerName);
  if (!player) throw new Error(`Player "${playerName}" not found`);
  
  const category = db.prepare('SELECT * FROM categories WHERE name = ?').get(categoryName) as Category | undefined;
  if (!category) throw new Error(`Category "${categoryName}" not found`);
  
  // Insert or update commitment
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO player_commitments (player_id, category_id, target_amount) 
    VALUES (?, ?, ?)
  `);
  
  stmt.run(player.id, category.id, targetAmount);
}

export function getPlayerStatuses(playerName: string): PlayerStatus[] {
  const stmt = db.prepare(`
    SELECT 
      p.name as player_name,
      c.name as category_name,
      c.unit,
      pc.target_amount,
      COALESCE(SUM(pe.amount), 0) as current_progress,
      ROUND((COALESCE(SUM(pe.amount), 0) * 100.0 / pc.target_amount), 1) as completion_percentage
    FROM players p
    JOIN player_commitments pc ON p.id = pc.player_id
    JOIN categories c ON pc.category_id = c.id
    LEFT JOIN progress_entries pe ON pe.player_id = p.id AND pe.category_id = c.id
    WHERE p.name = ?
    GROUP BY p.id, c.id, pc.id
    ORDER BY c.name
  `);
  
  return stmt.all(playerName) as PlayerStatus[];
}

// ===== PROGRESS =====
export function addProgress(playerName: string, categoryName: string, amount: number): ProgressEntry {
  const player = getPlayer(playerName);
  if (!player) throw new Error(`Player "${playerName}" not found`);
  
  const category = db.prepare('SELECT * FROM categories WHERE name = ?').get(categoryName) as Category | undefined;
  if (!category) throw new Error(`Category "${categoryName}" not found`);
  
  const stmt = db.prepare(`
    INSERT INTO progress_entries (player_id, category_id, amount) 
    VALUES (?, ?, ?)
  `);
  
  const result = stmt.run(player.id, category.id, amount);
  return { 
    id: result.lastInsertRowid as number, 
    playerName, 
    categoryName, 
    amount 
  };
}

export interface PlayerProgress {
  category_name: string;
  unit: string;
  amount: number;
  recorded_at: string;
}

export function getPlayerProgress(playerName: string): PlayerProgress[] {
  const stmt = db.prepare(`
    SELECT 
      c.name as category_name,
      c.unit,
      pe.amount,
      pe.recorded_at
    FROM progress_entries pe
    JOIN categories c ON pe.category_id = c.id
    JOIN players p ON pe.player_id = p.id
    WHERE p.name = ?
    ORDER BY pe.recorded_at DESC
  `);

  return stmt.all(playerName) as PlayerProgress[];
}

export function getAllProgresses(): PlayerProgress[] {
  const stmt = db.prepare(`
    SELECT 
      c.name as category_name,
      c.unit,
      pe.amount,
      pe.recorded_at
    FROM progress_entries pe
    JOIN categories c ON pe.category_id = c.id
    JOIN players p ON pe.player_id = p.id
    ORDER BY pe.recorded_at DESC
  `);

  return stmt.all() as PlayerProgress[];
}

// ===== LEADERBOARD =====
export interface PlayerSummary {
  id: number;
  name: string;
  completion_score: number;
  max_completion_score: number;
  completion_percentage: number;
}

export function getSummaryPlayers(): PlayerSummary[] {
  const stmt = db.prepare(`
    SELECT 
      p.id as id,
      p.name as name,
      COALESCE(progress_totals.total_progress, 0) as completion_score,
      commitment_totals.total_target as max_completion_score,
      ROUND((COALESCE(progress_totals.total_progress, 0) * 100.0 / commitment_totals.total_target), 1) as completion_percentage
    FROM players p
    JOIN (
      SELECT 
        player_id,
        SUM(target_amount) as total_target
      FROM player_commitments
      GROUP BY player_id
    ) commitment_totals ON p.id = commitment_totals.player_id
    LEFT JOIN (
      SELECT 
        player_id,
        SUM(amount) as total_progress
      FROM progress_entries
      GROUP BY player_id
    ) progress_totals ON p.id = progress_totals.player_id
    ORDER BY completion_percentage DESC
  `);
  
  return stmt.all() as PlayerSummary[];
}

// ===== UTILITY =====
export function closeDatabase(): void {
  db.close();
}