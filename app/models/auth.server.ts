import crypto from 'crypto';
import db from './database.server';

export interface User {
  id: number;
  username: string;
  name: string;
  role: 'player' | 'admin';
  created_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

// Hash password using Node.js crypto
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate session ID
function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create a new user
export function createUser(username: string, password: string, name: string, role: 'player' | 'admin' = 'player'): User {
  try {
    const passwordHash = hashPassword(password);
    const stmt = db.prepare('INSERT INTO users (username, name, password_hash, role) VALUES (?, ?, ?, ?)');
    const result = stmt.run(username, name, passwordHash, role);
    
    return {
      id: result.lastInsertRowid as number,
      username,
      name,
      role,
      created_at: new Date().toISOString()
    };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error(`Username "${username}" already exists`);
    }
    throw error;
  }
}

// Authenticate user
export function authenticateUser(username: string, password: string): User | null {
  const passwordHash = hashPassword(password);
  const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND password_hash = ?');
  const user = stmt.get(username, passwordHash) as User | undefined;
  
  if (user) {
    // Remove password_hash from returned user object
    const { password_hash, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }
  
  return null;
}

// Create session
export function createSession(userId: number): Session {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  
  const stmt = db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)');
  stmt.run(sessionId, userId, expiresAt.toISOString());
  
  return {
    id: sessionId,
    user_id: userId,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString()
  };
}

// Get session
export function getSession(sessionId: string): { session: Session; user: User } | null {
  const stmt = db.prepare(`
    SELECT 
      s.*,
      u.id as user_id,
      u.username,
      u.name,
      u.role,
      u.created_at as user_created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `);
  
  const result = stmt.get(sessionId) as any;
  
  if (result) {
    return {
      session: {
        id: result.id,
        user_id: result.user_id,
        expires_at: result.expires_at,
        created_at: result.created_at
      },
      user: {
        id: result.user_id,
        username: result.username,
        name: result.name,
        role: result.role,
        created_at: result.user_created_at
      }
    };
  }
  
  return null;
}

// Delete session (logout)
export function deleteSession(sessionId: string): void {
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  stmt.run(sessionId);
}

// Clean up expired sessions
export function cleanupExpiredSessions(): void {
  const stmt = db.prepare('DELETE FROM sessions WHERE expires_at <= datetime(\'now\')');
  stmt.run();
}

// Get user by ID
export function getUserById(userId: number): User | null {
  const stmt = db.prepare('SELECT id, username, name, role, created_at FROM users WHERE id = ?');
  const user = stmt.get(userId) as User | undefined;
  return user || null;
}

// Get all users (admin only)
export function getAllUsers(): User[] {
  const stmt = db.prepare('SELECT id, username, name, role, created_at FROM users ORDER BY username');
  return stmt.all() as User[];
}

// Check if user can edit user data
export function canEditUser(currentUser: User, targetUserId: number): boolean {
  // Admin can edit anyone
  if (currentUser.role === 'admin') {
    return true;
  }
  
  // Users can only edit their own data
  if (currentUser.role === 'player' && currentUser.id === targetUserId) {
    return true;
  }
  
  return false;
}
