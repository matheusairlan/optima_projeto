// Simple client-side auth with fixed credentials.
const USERS: Record<string, { password: string; role: "admin" | "user" }> = {
  admin: { password: "admin123", role: "admin" },
  optima: { password: "optima123", role: "user" },
};

const KEY = "optima_auth";

export type Session = { username: string; role: "admin" | "user" };

export function login(username: string, password: string): Session | null {
  const u = USERS[username];
  if (!u || u.password !== password) return null;
  const session: Session = { username, role: u.role };
  localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  localStorage.removeItem(KEY);
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
