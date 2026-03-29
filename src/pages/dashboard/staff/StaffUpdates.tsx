import React from 'react';
import EmptyState from '../../../components/ui/EmptyState';

export default function StaffUpdates() {
  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Parent Updates</h1>
      <EmptyState icon="👨‍👩‍👧" message="No parent updates yet. Submit a daily report to notify parents." />
    </div>
  );
}
