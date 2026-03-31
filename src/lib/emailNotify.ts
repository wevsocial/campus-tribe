const EDGE_FN_URL = 'https://ncftkuuxfllyohixiusb.supabase.co/functions/v1/send-notification-email';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jZnRrdXV4ZmxseW9oaXhpdXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MDA4NzgsImV4cCI6MjA1NjE3Njg3OH0.qMXAzX_5R7Tsu32PLgZqz5C4oSQ9tMLmsbFp8k87ao17_S-M6ik';

export async function sendEmailNotification(to: string, subject: string, html: string): Promise<void> {
  try {
    await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
      body: JSON.stringify({ to, subject, html }),
    });
  } catch {
    // Fire-and-forget -- don't block main flow
  }
}

export function gradeNotificationHtml(studentName: string, assignmentTitle: string, grade: number, maxPoints: number, feedback: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0047AB; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Campus Tribe</h1>
      </div>
      <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #0047AB;">Grade Published</h2>
        <p>Hi ${studentName},</p>
        <p>Your assignment <strong>${assignmentTitle}</strong> has been graded.</p>
        <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #FF7F50; margin: 16px 0;">
          <p style="font-size: 24px; font-weight: bold; color: #FF7F50; margin: 0;">${grade}/${maxPoints}</p>
          <p style="color: #666; margin: 4px 0 0;">${Math.round((grade / maxPoints) * 100)}%</p>
        </div>
        ${feedback ? `<p><strong>Teacher feedback:</strong> ${feedback}</p>` : ''}
        <a href="https://campus-tribe.onrender.com/dashboard/student" style="display: inline-block; background: #0047AB; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">View in Campus Tribe</a>
      </div>
    </div>
  `;
}

export function assignmentNotificationHtml(studentName: string, assignmentTitle: string, courseName: string, dueDate: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0047AB; padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px;">Campus Tribe</h1>
      </div>
      <div style="background: #f8f9fa; padding: 24px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #0047AB;">New Assignment Posted</h2>
        <p>Hi ${studentName},</p>
        <p>A new assignment has been posted in <strong>${courseName}</strong>.</p>
        <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #00A86B; margin: 16px 0;">
          <p style="font-weight: bold; color: #333; margin: 0;">${assignmentTitle}</p>
          <p style="color: #666; margin: 4px 0 0;">Due: ${dueDate}</p>
        </div>
        <a href="https://campus-tribe.onrender.com/dashboard/student" style="display: inline-block; background: #0047AB; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px;">View Assignment</a>
      </div>
    </div>
  `;
}
