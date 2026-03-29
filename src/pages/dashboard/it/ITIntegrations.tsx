import React from 'react';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

const INTEGRATIONS = [
  { name: 'Canvas LMS', category: 'LMS', status: 'available', description: 'Sync courses, grades, and assignments.' },
  { name: 'Moodle', category: 'LMS', status: 'available', description: 'Open-source LMS integration.' },
  { name: 'Google Classroom', category: 'LMS', status: 'available', description: 'Google Workspace for Education.' },
  { name: 'Helcim', category: 'Payments', status: 'available', description: 'Canadian payment processing.' },
  { name: 'Stripe', category: 'Payments', status: 'coming_soon', description: 'Global payment processing.' },
  { name: 'Zoom', category: 'Conferencing', status: 'coming_soon', description: 'Virtual meeting integration.' },
  { name: 'Slack', category: 'Messaging', status: 'coming_soon', description: 'Team communication.' },
  { name: 'Microsoft Teams', category: 'Messaging', status: 'coming_soon', description: 'Microsoft 365 integration.' },
];

export default function ITIntegrations() {
  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Integrations</h1>
      <p className="font-jakarta text-on-surface-variant text-sm">Review and configure third-party integrations for your institution.</p>
      <div className="space-y-3">
        {INTEGRATIONS.map(integration => (
          <Card key={integration.name} className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-jakarta font-bold text-on-surface">{integration.name}</p>
                <Badge label={integration.category} variant="neutral" size="sm" />
              </div>
              <p className="text-sm text-on-surface-variant mt-0.5">{integration.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                label={integration.status === 'available' ? 'Available' : 'Coming Soon'}
                variant={integration.status === 'available' ? 'success' : 'warning'}
              />
              {integration.status === 'available' && (
                <button className="px-3 py-1.5 bg-primary text-white rounded-full font-jakarta text-xs font-bold hover:bg-primary-dim transition-colors">
                  Configure
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
