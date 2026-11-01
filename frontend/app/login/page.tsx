"use client";

import { useState } from 'react';
import { Role, api, homeFor, session } from '@/lib/api';

const ROLES: { role: Role; label: string; demo: string }[] = [
  { role: 'STUDENT', label: 'Student', demo: 'student@lms.test' },
  { role: 'TEACHER', label: 'Teacher', demo: 'teacher@lms.test' },
  { role: 'HOD', label: 'HOD', demo: 'hod@lms.test' },
  { role: 'ADMIN', label: 'Admin', demo: 'ADMIN001' },
];

export default function LoginPage() {
  const [role, setRole] = useState<Role>('STUDENT');
  const [identifier, setIdentifier] = useState('student@lms.test');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function pick(r: (typeof ROLES)[number]) {
    setRole(r.role);
    setIdentifier(r.demo);
    setError('');
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api<{ accessToken: string; user: { id: string; name: string; email: string; role: Role; mustChangePassword: boolean } }>(
        '/auth/login',
        { json: { identifier, password, role } },
      );
      session.save(res.accessToken, res.user);
      window.location.href = res.user.mustChangePassword ? '/change-password' : homeFor(res.user.role);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold">Smart LMS</h1>
      <p className="mb-6 mt-1 text-sm text-ink/70">Sign in to your university portal.</p>

      <div role="tablist" aria-label="Sign in as" className="mb-4 grid grid-cols-4 gap-1 rounded-lg bg-line/60 p-1">
        {ROLES.map((r) => (
          <button
            key={r.role}
            role="tab"
            aria-selected={role === r.role}
            onClick={() => pick(r)}
            className={`rounded-md py-2 text-sm ${role === r.role ? 'bg-white font-medium shadow-sm' : 'text-ink/70'}`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-lg border border-line bg-white p-5">
        <label className="block text-sm">
          Email or ID
          <input required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">
          Password
          <div className="relative mt-1">
            <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-line px-3 py-2 pr-16 text-sm" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-brand">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-md bg-brand py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">
          {busy ? 'Signing in…' : `Sign in as ${ROLES.find((r) => r.role === role)?.label}`}
        </button>
      </form>
      <p className="mt-4 text-xs text-ink/60">Demo password for all accounts: Password@123</p>
    </main>
  );
}
