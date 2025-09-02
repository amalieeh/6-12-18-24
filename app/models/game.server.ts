import type { User } from './auth.server';
import db from './database.server';

// TypeScript interfaces for better type safety
export interface Category {
  id: number;
  name: string;
  unit: string;
  created_at: string;
}

export interface UserStatus {
  user_name: string;
  category_name: string;
  unit: string;
  target_amount: number;
  current_progress: number;
  completion_percentage: number;
}

export interface ProgressEntry {
  id: number;
  userName: string;
  categoryName: string;
  amount: number;
}

// ===== USERS =====
export function getUser(name: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE name = ?');
  return stmt.get(name) as User | undefined;
}

export function getUserByUsername(username: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username) as User | undefined;
}

export function getAllUsers(): User[] {
  const stmt = db.prepare('SELECT * FROM users ORDER BY name');
  return stmt.all() as User[];
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

// ===== USER COMMITMENTS =====
export function setUserCommitment(userName: string, categoryName: string, targetAmount: number): void {
  // Get user and category IDs
  const user = getUser(userName);
  if (!user) throw new Error(`User "${userName}" not found`);
  
  const category = db.prepare('SELECT * FROM categories WHERE name = ?').get(categoryName) as Category | undefined;
  if (!category) throw new Error(`Category "${categoryName}" not found`);
  
  // Insert or update commitment
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO user_commitments (user_id, category_id, target_amount) 
    VALUES (?, ?, ?)
  `);
  
  stmt.run(user.id, category.id, targetAmount);
}

export function setUserCommitments(userName: string, commitments: { categoryName: string; targetAmount: number }[]): void {
  const user = getUser(userName);
  if (!user) throw new Error(`User "${userName}" not found`);

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO user_commitments (user_id, category_id, target_amount) 
    VALUES (?, ?, ?)
  `);

  const getCategoryStmt = db.prepare('SELECT id FROM categories WHERE name = ?');

  db.transaction(() => {
    for (const commitment of commitments) {
      const category = getCategoryStmt.get(commitment.categoryName) as { id: number } | undefined;
      if (!category) throw new Error(`Category "${commitment.categoryName}" not found`);
      insertStmt.run(user.id, category.id, commitment.targetAmount);
    }
  })();
}

export function getUserStatuses(userName: string): UserStatus[] {
  const stmt = db.prepare(`
    SELECT 
      u.name as user_name,
      c.name as category_name,
      c.unit,
      uc.target_amount,
      COALESCE(SUM(pe.amount), 0) as current_progress,
      ROUND((COALESCE(SUM(pe.amount), 0) * 100.0 / uc.target_amount), 1) as completion_percentage
    FROM users u
    JOIN user_commitments uc ON u.id = uc.user_id
    JOIN categories c ON uc.category_id = c.id
    LEFT JOIN progress_entries pe ON pe.user_id = u.id AND pe.category_id = c.id
    WHERE u.name = ?
    GROUP BY u.id, c.id, uc.id
    ORDER BY c.name
  `);
  
  return stmt.all(userName) as UserStatus[];
}

// ===== PROGRESS =====
export function addProgress(userName: string, categoryName: string, amount: number, addedByUserId?: number): ProgressEntry {
  const user = getUser(userName);
  if (!user) throw new Error(`User "${userName}" not found`);
  
  const category = db.prepare('SELECT * FROM categories WHERE name = ?').get(categoryName) as Category | undefined;
  if (!category) throw new Error(`Category "${categoryName}" not found`);
  
  const stmt = db.prepare(`
    INSERT INTO progress_entries (user_id, category_id, amount, added_by_user_id) 
    VALUES (?, ?, ?, ?)
  `);
  
  const result = stmt.run(user.id, category.id, amount, addedByUserId || null);
  return { 
    id: result.lastInsertRowid as number, 
    userName, 
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

export interface UserProgress {
  category_name: string;
  unit: string;
  amount: number;
  recorded_at: string;
  added_by_username?: string;
}

export function getUserProgress(userName: string): UserProgress[] {
  const stmt = db.prepare(`
    SELECT 
      c.name as category_name,
      c.unit,
      pe.amount,
      pe.recorded_at,
      u.username as added_by_username
    FROM progress_entries pe
    JOIN categories c ON pe.category_id = c.id
    JOIN users usr ON pe.user_id = usr.id
    LEFT JOIN users u ON pe.added_by_user_id = u.id
    WHERE usr.name = ?
    ORDER BY pe.recorded_at DESC
  `);

  return stmt.all(userName) as UserProgress[];
}

export function getAllProgresses(): UserProgress[] {
  const stmt = db.prepare(`
    SELECT 
      c.name as category_name,
      c.unit as unit,
      pe.amount as amount,
      pe.recorded_at as recorded_at,
      u.username as added_by_username
    FROM progress_entries pe
    JOIN categories c ON pe.category_id = c.id
    LEFT JOIN users u ON pe.added_by_user_id = u.id
    ORDER BY pe.recorded_at DESC
  `);
  
  return stmt.all() as UserProgress[];
}

// Get progress entries with audit trail for admin
export interface ProgressEntryWithAudit {
  id: number;
  user_name: string;
  category_name: string;
  amount: number;
  recorded_at: string;
  added_by_username?: string;
  added_by_user_id?: number;
}

export function getAllProgressEntriesWithAudit(): ProgressEntryWithAudit[] {
  const stmt = db.prepare(`
    SELECT 
      pe.id,
      u_owner.name as user_name,
      c.name as category_name,
      pe.amount,
      pe.recorded_at,
      u_added.username as added_by_username,
      pe.added_by_user_id
    FROM progress_entries pe
    JOIN users u_owner ON pe.user_id = u_owner.id
    JOIN categories c ON pe.category_id = c.id
    LEFT JOIN users u_added ON pe.added_by_user_id = u_added.id
    ORDER BY pe.recorded_at DESC
  `);
  
  return stmt.all() as ProgressEntryWithAudit[];
}

// ===== LEADERBOARD =====
export interface UserSummary {
  id: number;
  name: string;
  completion_score: number;
  max_completion_score: number;
  completion_percentage: number;
}

export function getSummaryUsers(): UserSummary[] {
  const stmt = db.prepare(`
    SELECT 
      u.id as id,
      u.name as name,
      COALESCE(progress_totals.total_progress, 0) as completion_score,
      commitment_totals.total_target as max_completion_score,
      ROUND((COALESCE(progress_totals.total_progress, 0) * 100.0 / commitment_totals.total_target), 1) as completion_percentage
    FROM users u
    JOIN (
      SELECT 
        user_id,
        SUM(target_amount) as total_target
      FROM user_commitments
      GROUP BY user_id
    ) commitment_totals ON u.id = commitment_totals.user_id
    LEFT JOIN (
      SELECT 
        user_id,
        SUM(amount) as total_progress
      FROM progress_entries
      GROUP BY user_id
    ) progress_totals ON u.id = progress_totals.user_id
    WHERE u.role = 'player'
    ORDER BY completion_percentage DESC
  `);
  
  return stmt.all() as UserSummary[];
}

// ===== UTILITY =====
export function closeDatabase(): void {
  db.close();
}