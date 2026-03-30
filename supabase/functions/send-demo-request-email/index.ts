import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailBody {
  full_name: string;
  email: string;
  institution_name: string;
  institution_type: string;
  student_count: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const body: EmailBody = await req.json();
    const { full_name, email, institution_name, institution_type, student_count, message } = body;

    // Use Gmail SMTP via TLS on port 465
    const username = 'wevsocial.s@gmail.com';
    const password = 'xekmspucuztqnkkv';

    const conn = await Deno.connectTls({
      hostname: 'smtp.gmail.com',
      port: 465,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readResponse = async (): Promise<string> => {
      const buf = new Uint8Array(4096);
      let result = '';
      while (true) {
        const n = await conn.read(buf);
        if (!n) break;
        const chunk = decoder.decode(buf.subarray(0, n));
        result += chunk;
        // Check if we've received a complete response (ends with \r\n after a response code)
        if (/^\d{3} .+\r\n/m.test(result)) break;
      }
      return result;
    };

    const sendCmd = async (cmd: string): Promise<string> => {
      await conn.write(encoder.encode(cmd + '\r\n'));
      return readResponse();
    };

    await readResponse(); // 220 greeting
    await sendCmd('EHLO localhost');
    await sendCmd(`AUTH LOGIN`);
    await sendCmd(btoa(username));
    await sendCmd(btoa(password));
    await sendCmd(`MAIL FROM:<${username}>`);
    await sendCmd(`RCPT TO:<${username}>`);
    await sendCmd('DATA');

    const htmlBody = `
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
    `;

    const textBody = `New Demo Request\n\nName: ${full_name}\nEmail: ${email}\nInstitution: ${institution_name}\nType: ${institution_type}\nStudents: ${student_count}\nMessage: ${message || 'N/A'}`;

    const boundary = 'boundary_' + Date.now();
    const emailData = [
      `From: Campus Tribe <${username}>`,
      `To: ${username}`,
      `Subject: New Demo Request: ${institution_name} (${institution_type})`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      textBody,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlBody,
      '',
      `--${boundary}--`,
      '.',
    ].join('\r\n');

    await sendCmd(emailData);
    await sendCmd('QUIT');
    conn.close();

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
