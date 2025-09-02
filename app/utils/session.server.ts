import { redirect } from "react-router";
import { cleanupExpiredSessions, deleteSession, getSession, type User } from "~/models/auth.server";

const SESSION_COOKIE_NAME = "session";

// Get user from request
export async function getUserFromRequest(request: Request): Promise<User | null> {
  const sessionId = getCookieFromRequest(request, SESSION_COOKIE_NAME);
  
  if (!sessionId) {
    return null;
  }

  // Clean up expired sessions
  cleanupExpiredSessions();
  
  const sessionData = getSession(sessionId);
  
  if (!sessionData) {
    return null;
  }

  return sessionData.user;
}

// Require user to be logged in
export async function requireUser(request: Request): Promise<User> {
  const user = await getUserFromRequest(request);
  
  if (!user) {
    throw redirect("/login");
  }
  
  return user;
}

// Require admin user
export async function requireAdmin(request: Request): Promise<User> {
  const user = await requireUser(request);
  
  if (user.role !== 'admin') {
    throw redirect("/unauthorized");
  }
  
  return user;
}

// Create session cookie
export function createSessionCookie(sessionId: string): string {
  return `${SESSION_COOKIE_NAME}=${sessionId}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`;
}

// Create logout cookie (to clear the session)
export function createLogoutCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}

// Get cookie value from request
function getCookieFromRequest(request: Request, name: string): string | null {
  const cookie = request.headers.get("Cookie");
  if (!cookie) return null;

  const match = cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// Logout user
export async function logout(request: Request): Promise<Response> {
  const sessionId = getCookieFromRequest(request, SESSION_COOKIE_NAME);
  
  if (sessionId) {
    deleteSession(sessionId);
  }
  
  return redirect("/login", {
    headers: {
      "Set-Cookie": createLogoutCookie(),
    },
  });
}
