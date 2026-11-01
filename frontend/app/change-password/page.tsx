'use client';

import { useState } from 'react';
import { api, homeFor, session } from '@/lib/api';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await api('/auth/change-password', {
        json: { currentPassword, newPassword },
      });
      const user = session.user;
      if (!user) {
        window.location.href = '/login';
        return;
      }
      session.save(session.token || '', { ...user, mustChangePassword: false });
      window.location.href = homeFor(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change password');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold">Change password</h1>
      <p className="mb-6 mt-1 text-sm text-ink/70">
        You must set a new password before continuing.
      </p>
      <form onSubmit={submit} className="space-y-4 rounded-lg border border-line bg-white p-5">
        <label className="block text-sm">
          Current password
          <input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          New password
          <input required type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
        </label>
        <label className="block text-sm">
          Confirm new password
          <input required type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-md bg-brand py-2 text-sm font-medium text-white disabled:opacity-50">
          {busy ? 'Changing…' : 'Change password'}
        </button>
      </form>
    </main>
  );
}
