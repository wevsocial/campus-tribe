import React from 'react';
import EmptyState from '../../../components/ui/EmptyState';

export default function ParentReports() {
  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Daily Reports</h1>
      <EmptyState message="No reports available. Reports will appear here when staff submit daily updates for your child." />
    </div>
  );
}
