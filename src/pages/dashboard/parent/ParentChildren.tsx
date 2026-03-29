import React from 'react';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';

export default function ParentChildren() {
  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Children</h1>
      <Card variant="primary-tinted">
        <p className="font-jakarta font-bold text-on-surface">Link a child account</p>
        <p className="text-sm text-on-surface-variant mt-1">Ask your school administrator to link your account to your child's student profile.</p>
      </Card>
      <EmptyState icon="👶" message="No children linked yet. Contact your school administrator." />
    </div>
  );
}
