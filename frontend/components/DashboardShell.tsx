"use client";
import { useEffect, useState } from 'react';
import { Role, User, session } from '@/lib/api';

const NAV: Record<Role, string[]> = {
  STUDENT: ['Dashboard', 'Attendance', 'Assignments', 'Live classes', 'Messages', 'Notices'],
  TEACHER: ['Dashboard', 'Take attendance', 'Assignments', 'Live classes', 'Messages', 'Notices'],
  HOD: ['Dashboard', 'Department attendance', 'Teachers', 'Approvals', 'Messages', 'Notices'],
  ADMIN: ['Dashboard', 'Users', 'Classes and subjects', 'University area', 'Audit logs', 'Settings'],
};

export default function DashboardShell({ title, children }: { title: string; children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => setUser(session.user), []);
  if (!user) return null;

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-line bg-white md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="px-5 py-4">
          <p className="text-lg font-semibold text-brand">Smart LMS</p>
          <p className="text-xs uppercase tracking-wide text-ink/60">{user.role.toLowerCase()} portal</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
          {NAV[user.role].map((item, i) => (
            <span
              key={item}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm ${
                i === 0 ? 'bg-brand text-white' : 'text-ink/50'
              }`}
            >
              {item}
              {i !== 0 && <span className="ml-2 text-[10px] uppercase">soon</span>}
            </span>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-line bg-white px-6 py-4">
          <h1 className="text-xl font-semibold">{title}</h1>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm sm:block">{user.name}</span>
            <button
              className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-paper"
              onClick={() => {
                session.clear();
                window.location.href = '/login';
              }}
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
