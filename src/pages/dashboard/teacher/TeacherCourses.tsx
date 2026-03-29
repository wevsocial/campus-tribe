import React from 'react';
import Card from '../../../components/ui/Card';
import EmptyState from '../../../components/ui/EmptyState';

export default function TeacherCourses() {
  return (
    <div className="space-y-6">
      <h1 className="font-lexend text-2xl font-extrabold text-on-surface">Courses</h1>
      <Card variant="primary-tinted">
        <p className="font-jakarta font-bold text-on-surface">LMS Integration Required</p>
        <p className="text-sm text-on-surface-variant mt-1">Course data is synced from your institution's LMS (Canvas, Moodle, Google Classroom). Configure your LMS in Admin → Settings.</p>
      </Card>
      <EmptyState message="No courses synced yet. Configure LMS in Admin Settings." />
    </div>
  );
}
