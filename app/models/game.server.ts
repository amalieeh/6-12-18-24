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

export interface PlayerCommitment {
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

export function getPlayerCommitments(playerName: string): PlayerCommitment[] {
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
  
  return stmt.all(playerName) as PlayerCommitment[];
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

export function getPlayerProgress(playerName: string): any[] {
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
  
  return stmt.all(playerName);
}

// ===== LEADERBOARD =====
export interface LeaderboardEntry {
  player_name: string;
  overall_completion: number;
}

export function getLeaderboard(): LeaderboardEntry[] {
  const stmt = db.prepare(`
    SELECT 
      p.name as player_name,
      ROUND(AVG(
        CASE 
          WHEN pc.target_amount > 0 THEN (COALESCE(prog.total_progress, 0) * 100.0 / pc.target_amount)
          ELSE 0 
        END
      ), 1) as overall_completion
    FROM players p
    JOIN player_commitments pc ON p.id = pc.player_id
    LEFT JOIN (
      SELECT 
        player_id, 
        category_id, 
        SUM(amount) as total_progress
      FROM progress_entries 
      GROUP BY player_id, category_id
    ) prog ON prog.player_id = pc.player_id AND prog.category_id = pc.category_id
    GROUP BY p.id, p.name
    ORDER BY overall_completion DESC
  `);
  
  return stmt.all() as LeaderboardEntry[];
}

// ===== UTILITY =====
export function closeDatabase(): void {
  db.close();
}