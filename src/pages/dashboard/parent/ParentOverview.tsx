import React from 'react';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';

export default function ParentOverview() {
  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Parent Overview</h1>
      <Card variant="primary-tinted">
        <p className="font-jakarta font-bold text-on-surface">Parent Portal</p>
        <p className="text-sm text-on-surface-variant mt-1">Monitor your child's activities, reports, and updates from the school.</p>
      </Card>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'My Children', href: '/dashboard/parent/children', emoji: '👶' },
          { label: 'Reports', href: '/dashboard/parent/reports', emoji: 'list' },
          { label: 'Messages', href: '/dashboard/parent/messages', emoji: 'message' },
        ].map(l => (
          <a key={l.href} href={l.href} className="bg-surface-lowest rounded-xl p-4 flex items-center gap-3 hover:bg-primary-container transition-colors group">
            <span className="text-2xl">{l.emoji}</span>
            <span className="font-jakarta font-bold text-sm text-on-surface group-hover:text-primary">{l.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
