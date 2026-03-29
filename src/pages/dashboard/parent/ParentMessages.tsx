import React from 'react';
import EmptyState from '../../../components/ui/EmptyState';

export default function ParentMessages() {
  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Messages</h1>
      <EmptyState icon="💬" message="No messages yet. Updates from your school will appear here." />
    </div>
  );
}
