import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';

interface Report { id: string; title: string; body: string; date: string; }

export default function StaffReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [form, setForm] = useState({ title: '', body: '' });

  const submit = () => {
    if (!form.title.trim()) return;
    setReports([{ id: Date.now().toString(), title: form.title, body: form.body, date: new Date().toLocaleDateString() }, ...reports]);
    setForm({ title: '', body: '' });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Daily Reports</h1>
      <Card>
        <h2 className="font-lexend font-bold text-on-surface mb-3">New Report</h2>
        <div className="space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Report title"
            className="w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm focus:outline-none" />
          <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Report details..." rows={4}
            className="w-full px-4 py-2.5 rounded-xl bg-surface-low border border-outline-variant/50 font-jakarta text-sm focus:outline-none resize-none" />
          <Button onClick={submit} className="rounded-full">Submit Report</Button>
        </div>
      </Card>
      {reports.length === 0 ? <EmptyState message="No reports today." /> : (
        <div className="space-y-3">
          {reports.map(r => (
            <Card key={r.id}>
              <p className="font-jakarta font-bold text-on-surface">{r.title}</p>
              <p className="text-sm text-on-surface-variant mt-1">{r.body}</p>
              <p className="text-xs text-on-surface-variant mt-2">{r.date}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
