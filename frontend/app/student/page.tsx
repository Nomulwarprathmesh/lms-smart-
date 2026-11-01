import RequireRole from '@/components/RequireRole';
import DashboardShell from '@/components/DashboardShell';

const cards = [
  { title: 'My attendance', value: '–' },
  { title: 'Assignments due', value: '–' },
  { title: 'Next class', value: '–' },
];

export default function StudentPage() {
  return (
    <RequireRole role="STUDENT">
      <DashboardShell title="Student dashboard">
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <div key={c.title} className="rounded-lg border border-line bg-white p-5">
              <p className="text-sm text-ink/70">{c.title}</p>
              <p className="mt-2 text-3xl font-semibold">{c.value}</p>
            </div>
          ))}
        </div>
      </DashboardShell>
    </RequireRole>
  );
}
