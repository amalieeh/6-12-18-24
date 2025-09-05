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
export async function getUser(name: string): Promise<User | undefined> {
  const stmt = db.prepare('SELECT * FROM users WHERE name = ?');
  return await stmt.get(name) as User | undefined;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return await stmt.get(username) as User | undefined;
}

export async function getAllUsers(): Promise<User[]> {
  const stmt = db.prepare('SELECT * FROM users ORDER BY name');
  return await stmt.all() as unknown as User[];
}

// ===== CATEGORIES =====
export async function getAllCategories(): Promise<Category[]> {
  const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
  return await stmt.all() as unknown as Category[];
}

export async function createCategory(name: string, unit: string): Promise<Category> {
  const stmt = db.prepare('INSERT INTO categories (name, unit) VALUES (?, ?)');
  const result = await stmt.run(name, unit);
  return { 
    id: result.lastInsertRowid as number, 
    name, 
    unit,
    created_at: new Date().toISOString()
  };
}

// ===== USER COMMITMENTS =====
export async function setUserCommitment(userName: string, categoryName: string, targetAmount: number): Promise<void> {
  // Get user and category IDs
  const user = await getUser(userName);
  if (!user) throw new Error(`User "${userName}" not found`);
  
  const category = await db.get('SELECT * FROM categories WHERE name = ?', [categoryName]) as Category | undefined;
  if (!category) throw new Error(`Category "${categoryName}" not found`);
  
  // Insert or update commitment
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO user_commitments (user_id, category_id, target_amount) 
    VALUES (?, ?, ?)
  `);
  
  await stmt.run(user.id, category.id, targetAmount);
}

export async function setUserCommitments(userName: string, commitments: { categoryName: string; targetAmount: number }[]): Promise<void> {
  const user = await getUser(userName);
  if (!user) throw new Error(`User "${userName}" not found`);

  // For now, let's process without transactions to avoid the rollback issue
  // TODO: Investigate proper transaction handling with Turso later
  const insertStmt = db.prepare('INSERT OR REPLACE INTO user_commitments (user_id, category_id, target_amount) VALUES (?, ?, ?)');
  
  for (const commitment of commitments) {
    const category = await db.get('SELECT id FROM categories WHERE name = ?', [commitment.categoryName]) as { id: number } | undefined;
    if (!category) throw new Error(`Category "${commitment.categoryName}" not found`);
    
    await insertStmt.run(user.id, category.id, commitment.targetAmount);
  }
}

export async function getUserStatuses(userName: string): Promise<UserStatus[]> {
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
  
  return await stmt.all(userName) as unknown as UserStatus[];
}

// ===== PROGRESS =====
export async function addProgress(userName: string, categoryName: string, amount: number, addedByUserId?: number): Promise<ProgressEntry> {
  const user = await getUser(userName);
  if (!user) throw new Error(`User "${userName}" not found`);
  
  const category = await db.get('SELECT * FROM categories WHERE name = ?', [categoryName]) as unknown as Category | undefined;
  if (!category) throw new Error(`Category "${categoryName}" not found`);
  
  const stmt = db.prepare(`
    INSERT INTO progress_entries (user_id, category_id, amount, added_by_user_id) 
    VALUES (?, ?, ?, ?)
  `);
  
  const result = await stmt.run(user.id, category.id, amount, addedByUserId || null);
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

export async function getPlayerProgress(playerName: string): Promise<PlayerProgress[]> {
  const stmt = db.prepare(`
    SELECT 
      c.name as category_name,
      c.unit,
      pe.amount,
      pe.recorded_at
    FROM progress_entries pe
    JOIN categories c ON pe.category_id = c.id
    JOIN users u ON pe.user_id = u.id
    WHERE u.name = ?
    ORDER BY pe.recorded_at DESC
  `);

  return await stmt.all(playerName) as unknown as PlayerProgress[];
}

export interface UserProgress {
  category_name: string;
  unit: string;
  amount: number;
  recorded_at: string;
  added_by_username?: string;
}

export async function getUserProgress(userName: string): Promise<UserProgress[]> {
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

  return await stmt.all(userName) as unknown as UserProgress[];
}

export async function getAllProgresses(): Promise<UserProgress[]> {
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
  
  return await stmt.all() as unknown as UserProgress[];
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

export async function getAllProgressEntriesWithAudit(): Promise<ProgressEntryWithAudit[]> {
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
  
  return await stmt.all() as unknown as ProgressEntryWithAudit[];
}

// ===== LEADERBOARD =====
export interface UserSummary {
  id: number;
  name: string;
  completion_score: number;
  max_completion_score: number;
  completion_percentage: number;
}

export async function getSummaryUsers(): Promise<UserSummary[]> {
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
  
  return await stmt.all() as unknown as UserSummary[];
}

// ===== UTILITY =====
// Note: Turso connections are managed automatically, no manual close needed
export function closeDatabase(): void {
  // No-op for Turso - connections are managed automatically
  console.log("Database connections are managed automatically with Turso");
}