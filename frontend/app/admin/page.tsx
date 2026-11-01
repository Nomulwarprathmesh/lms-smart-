'use client';

import { useCallback, useEffect, useState } from 'react';
import RequireRole from '@/components/RequireRole';
import DashboardShell from '@/components/DashboardShell';
import { api } from '@/lib/api';

type Department = { id: string; name: string };
type Hod = {
  id: string;
  name: string;
  loginId: string;
  email: string;
  phone: string | null;
  department: { id: string; name: string } | null;
  designation: string | null;
  isActive: boolean;
};

export default function AdminPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hods, setHods] = useState<Hod[]>([]);
  const [overview, setOverview] = useState({ hods: 0, teachers: 0, students: 0, departments: 0 });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState<{ loginId: string; temporaryPassword: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showCredentialsPassword, setShowCredentialsPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    employeeId: '',
    departmentId: '',
    designation: 'Head of Department',
    qualification: '',
    joiningDate: '',
    password: '',
  });

  const load = useCallback(async () => {
    const [overviewData, departmentData, hodData] = await Promise.all([
      api<typeof overview>('/admin/overview'),
      api<Department[]>('/admin/departments'),
      api<Hod[]>('/admin/hods'),
    ]);
    setOverview(overviewData);
    setDepartments(departmentData);
    setHods(hodData);
    setForm((current) => {
      if (current.employeeId) return current;
      const ids = hodData.map((hod: Hod) => hod.loginId.match(/^HOD(\d+)$/i)?.[1] || '0');
      const nextNumber = Math.max(0, ...ids.map((id: string) => Number(id))) + 1;
      return { ...current, employeeId: `HOD${String(nextNumber).padStart(3, '0')}` };
    });
  }, []);

  useEffect(() => { load().catch((err) => setError(err instanceof Error ? err.message : 'Failed to load admin data')); }, [load]);

  async function createHod(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setCredentials(null);
    try {
      const result = await api<{ hod: Hod; credentials: { loginId: string; temporaryPassword: string } }>(
        '/admin/hods',
        {
          json: {
            ...form,
            qualification: form.qualification || undefined,
            password: form.password || undefined,
          },
        },
      );
      setCredentials(result.credentials);
      setShowCredentialsPassword(false);
      setMessage('HOD account created successfully.');
      setForm({ fullName: '', email: '', phone: '', employeeId: '', departmentId: '', designation: 'Head of Department', qualification: '', joiningDate: '', password: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create HOD');
    }
  }

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <RequireRole role="ADMIN">
      <DashboardShell title="Admin dashboard">
        <section className="mb-6 rounded-lg border border-line bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">Create HOD</h2>
          <form onSubmit={createHod} className="grid gap-3 md:grid-cols-2">
            {[
              ['fullName', 'Full name', 'text'],
              ['email', 'Email', 'email'],
              ['phone', 'Phone', 'tel'],
              ['employeeId', 'Employee ID', 'text'],
              ['designation', 'Designation', 'text'],
              ['qualification', 'Qualification (optional)', 'text'],
              ['joiningDate', 'Joining date', 'date'],
            ].map(([field, label, type]) => (
              <label key={field} className="text-sm">
                {label}
                <input
                  required={!['qualification'].includes(field)}
                  readOnly={field === 'employeeId'}
                  type={type}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => update(field as keyof typeof form, e.target.value)}
                  className={`mt-1 w-full rounded-md border border-line px-3 py-2 ${field === 'employeeId' ? 'bg-paper text-ink/70' : ''}`}
                />
              </label>
            ))}
            <label className="text-sm">
              Temporary password (optional)
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  className="w-full rounded-md border border-line px-3 py-2 pr-16"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-brand"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>
            <label className="text-sm md:col-span-2">
              Department
              <select required value={form.departmentId} onChange={(e) => update('departmentId', e.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2">
                <option value="">Select department</option>
                {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
              </select>
            </label>
            <button className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white md:col-span-2">Create HOD</button>
          </form>
          {message && <p role="status" className="mt-3 text-sm text-green-700">{message}</p>}
          {credentials && (
            <div className="mt-3 rounded-md border border-brand/30 bg-brand/5 p-3 text-sm">
              Login ID: <strong>{credentials.loginId}</strong><br />
              Temporary password:{' '}
              <strong>{showCredentialsPassword ? credentials.temporaryPassword : '••••••••••••'}</strong>
              <button
                type="button"
                onClick={() => setShowCredentialsPassword((visible) => !visible)}
                className="ml-2 rounded border border-brand/30 px-2 py-0.5 text-xs text-brand"
              >
                {showCredentialsPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          )}
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['HODs', overview.hods],
            ['Teachers', overview.teachers],
            ['Students', overview.students],
            ['Departments', overview.departments],
          ].map(([title, value]) => (
            <div key={String(title)} className="rounded-lg border border-line bg-white p-5">
              <p className="text-sm text-ink/70">{title}</p>
              <p className="mt-2 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-lg border border-line bg-white">
          <h2 className="border-b border-line px-5 py-4 font-semibold">HOD accounts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead><tr className="text-ink/60"><th className="px-5 py-3">Name</th><th>Login ID</th><th>Email</th><th>Department</th><th>Status</th></tr></thead>
              <tbody>{hods.map((hod) => (
                <tr key={hod.id} className="border-t border-line"><td className="px-5 py-3">{hod.name}</td><td>{hod.loginId}</td><td>{hod.email}</td><td>{hod.department?.name || '–'}</td><td>{hod.isActive ? 'Active' : 'Inactive'}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      </DashboardShell>
    </RequireRole>
  );
}
