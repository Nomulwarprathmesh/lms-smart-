const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type Role = 'ADMIN' | 'HOD' | 'TEACHER' | 'STUDENT';
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
};

export const homeFor = (role: Role) => `/${role.toLowerCase()}`;

export const session = {
  get token(): string | null {
    return typeof window === 'undefined' ? null : localStorage.getItem('lms_token');
  },
  get user(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('lms_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      this.clear();
      return null;
    }
  },
  save(token: string, user: User) {
    localStorage.setItem('lms_token', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
  },
};

export async function api<T>(path: string, opts: { method?: string; json?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (session.token) headers.Authorization = 'Bearer ' + session.token;

  let body: string | undefined;
  if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  }

  const res = await fetch(`${API}${path}`, {
    method: opts.method || (body ? 'POST' : 'GET'),
    headers,
    body,
  });
  const data = await res.json().catch(() => ({})) as {
    message?: string | string[];
  };

  if (res.status === 401 && !path.startsWith('/auth/login')) {
    session.clear();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired');
  }
  if (!res.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Something went wrong',
    );
  }
  return data as T;
}
