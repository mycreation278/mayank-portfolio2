// ─────────────────────────────────────────────────────────────
//  server/services/mailer.js
// ─────────────────────────────────────────────────────────────
const nodemailer = require('nodemailer');

// ── Create transporter (Gmail SMTP) ──────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service : 'gmail',
    auth    : {
      user : process.env.GMAIL_USER,
      pass : process.env.GMAIL_PASS,   // Gmail App Password (not your login password)
    },
  });
}

// ── HTML email template ───────────────────────────────────────
function buildEmailHTML({ name, email, projectType, budget, message }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; background:#0a0a0a; margin:0; padding:0; }
      .wrapper { max-width:600px; margin:0 auto; background:#111116; border:1px solid #1c1c24; }
      .header { background:#c9a84c; padding:32px 40px; }
      .header h1 { color:#050507; font-size:22px; margin:0; letter-spacing:2px; font-weight:700; }
      .header p  { color:#050507; opacity:.7; font-size:12px; margin:6px 0 0; letter-spacing:1px; }
      .body   { padding:40px; }
      .field  { margin-bottom:24px; }
      .label  { font-size:10px; letter-spacing:2px; text-transform:uppercase;
                color:#c9a84c; margin-bottom:8px; }
      .value  { font-size:15px; color:#f0ede8; line-height:1.7; }
      .message-box { background:#0c0c10; border:1px solid #1c1c24; border-left:3px solid #c9a84c;
                     padding:20px; border-radius:2px; }
      .footer { padding:24px 40px; border-top:1px solid #1c1c24; text-align:center; }
      .footer p { font-size:11px; color:#6b6870; letter-spacing:1px; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>NEW PROJECT INQUIRY</h1>
        <p>MAYANK SHARMA — PORTFOLIO CONTACT FORM</p>
      </div>
      <div class="body">
        <div class="field">
          <div class="label">From</div>
          <div class="value">${escHtml(name)} &lt;${escHtml(email)}&gt;</div>
        </div>
        <div class="field">
          <div class="label">Project Type</div>
          <div class="value">${escHtml(projectType)}</div>
        </div>
        ${budget ? `
        <div class="field">
          <div class="label">Budget</div>
          <div class="value">${escHtml(budget)}</div>
        </div>` : ''}
        <div class="field">
          <div class="label">Message</div>
          <div class="message-box value">${escHtml(message).replace(/\n/g, '<br>')}</div>
        </div>
      </div>
      <div class="footer">
        <p>Sent via mayanksharma.in • ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      </div>
    </div>
  </body>
  </html>`;
}

// ── Auto-reply template ───────────────────────────────────────
function buildAutoReplyHTML({ name }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family:'Helvetica Neue',Arial,sans-serif; background:#0a0a0a; margin:0; padding:0; }
      .wrapper { max-width:600px; margin:0 auto; background:#111116; border:1px solid #1c1c24; }
      .header  { background:#c9a84c; padding:32px 40px; }
      .header h1 { color:#050507; font-size:22px; margin:0; letter-spacing:2px; font-weight:700; }
      .body    { padding:40px; color:#a09c98; font-size:15px; line-height:1.8; }
      .body h2 { color:#f0ede8; font-size:20px; margin-bottom:16px; }
      .gold    { color:#c9a84c; }
      .footer  { padding:24px 40px; border-top:1px solid #1c1c24; text-align:center; }
      .footer p{ font-size:11px; color:#6b6870; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>MAYANK SHARMA</h1>
      </div>
      <div class="body">
        <h2>Hey ${escHtml(name)},</h2>
        <p>Thanks for reaching out! I've received your message and I'll get back to you within <span class="gold">24 hours</span>.</p>
        <p>In the meantime, feel free to check out my work or connect with me on social media.</p>
        <p style="margin-top:32px;">— Mayank Sharma<br>
        <span class="gold">CGI Artist & Video Editor</span></p>
      </div>
      <div class="footer">
        <p>mayanksharma.in</p>
      </div>
    </div>
  </body>
  </html>`;
}

// Escape HTML to prevent injection in emails
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Main export ───────────────────────────────────────────────
async function sendContactEmail({ name, email, projectType, budget, message }) {
  const transporter = createTransporter();

  // Send notification to Mayank
  await transporter.sendMail({
    from    : `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
    to      : process.env.CONTACT_RECEIVER || process.env.GMAIL_USER,
    replyTo : email,
    subject : `[Portfolio] New Inquiry from ${name} — ${projectType}`,
    html    : buildEmailHTML({ name, email, projectType, budget, message }),
  });

  // Send auto-reply to visitor
  await transporter.sendMail({
    from    : `"Mayank Sharma" <${process.env.GMAIL_USER}>`,
    to      : email,
    subject : `Got your message, ${name}! I'll be in touch soon.`,
    html    : buildAutoReplyHTML({ name }),
  });
}

module.exports = { sendContactEmail };
