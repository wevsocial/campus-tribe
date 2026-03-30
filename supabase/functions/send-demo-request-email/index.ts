import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { full_name, email, institution_name, institution_type, student_count, message } = body;

    const emailContent = [
      'New Demo Request from Campus Tribe',
      '',
      `Name: ${full_name}`,
      `Email: ${email}`,
      `Institution: ${institution_name}`,
      `Type: ${institution_type}`,
      `Students: ${student_count}`,
      `Message: ${message || 'N/A'}`,
    ].join('\n');

    const client = new SMTPClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port: 465,
        tls: true,
        auth: {
          username: 'wevsocial.s@gmail.com',
          password: 'xekmspucuztqnkkv',
        },
      },
    });

    await client.send({
      from: 'Campus Tribe <wevsocial.s@gmail.com>',
      to: 'wevsocial.s@gmail.com',
      subject: `New Demo Request: ${institution_name} (${institution_type})`,
      content: emailContent,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f6f6f9;border-radius:16px;">
          <div style="background:#0047AB;padding:24px;border-radius:12px;margin-bottom:24px;">
            <h1 style="color:white;margin:0;font-size:20px;font-weight:800;">Campus Tribe — New Demo Request</h1>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:#5a5c5e;font-size:14px;width:40%;">Name</td><td style="padding:8px 0;font-weight:700;color:#2d2f31;">${full_name}</td></tr>
            <tr><td style="padding:8px 0;color:#5a5c5e;font-size:14px;">Email</td><td style="padding:8px 0;font-weight:700;color:#0047AB;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#5a5c5e;font-size:14px;">Institution</td><td style="padding:8px 0;font-weight:700;color:#2d2f31;">${institution_name}</td></tr>
            <tr><td style="padding:8px 0;color:#5a5c5e;font-size:14px;">Type</td><td style="padding:8px 0;font-weight:700;color:#2d2f31;">${institution_type}</td></tr>
            <tr><td style="padding:8px 0;color:#5a5c5e;font-size:14px;">Students</td><td style="padding:8px 0;font-weight:700;color:#2d2f31;">${student_count}</td></tr>
            ${message ? `<tr><td style="padding:8px 0;color:#5a5c5e;font-size:14px;">Message</td><td style="padding:8px 0;color:#2d2f31;">${message}</td></tr>` : ''}
          </table>
        </div>
      `,
    });

    await client.close();
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Email send failed:', err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
