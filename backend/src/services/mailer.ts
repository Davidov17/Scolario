import { Resend } from "resend";
import nodemailer from "nodemailer";

let resend: Resend | null = null;
let etherealTransporter: nodemailer.Transporter | null = null;

async function getEtherealTransporter(): Promise<nodemailer.Transporter> {
  if (etherealTransporter) return etherealTransporter;
  const testAccount = await nodemailer.createTestAccount();
  etherealTransporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log("📧 Ethereal test account created:", testAccount.user);
  return etherealTransporter;
}

/** Sends a 6-digit verification code email for signup or password reset. */
export async function sendVerificationCode(
  to: string,
  code: string,
  type: "signup" | "reset"
): Promise<void> {
  const isSignup = type === "signup";
  const subject = isSignup
    ? "Verify your Scholario account"
    : "Reset your Scholario password";
  const heading = isSignup ? "Verify your email" : "Reset your password";
  const body = isSignup
    ? "Use the code below to verify your email and activate your Scholario account."
    : "Use the code below to reset your password. It expires in 1 hour.";

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1e293b">
      <div style="background:#4f46e5;padding:32px 32px 24px;border-radius:16px 16px 0 0;text-align:center">
        <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">Scholario</span>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;padding:32px;border-radius:0 0 16px 16px">
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:700">${heading}</h2>
        <p style="color:#64748b;font-size:14px;margin:0 0 28px">${body}</p>
        <div style="background:#f8fafc;border:2px dashed #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#4f46e5">${code}</span>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin:0">
          This code expires in <strong>1 hour</strong>. If you did not request this, ignore this email.
        </p>
      </div>
    </div>
  `;

  if (process.env.RESEND_API_KEY) {
    if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
    // RESEND_FROM must be a verified domain; free tier default is onboarding@resend.dev
    const from = process.env.RESEND_FROM || "Scholario <onboarding@resend.dev>";
    const result = await resend.emails.send({ from, to, subject, html });
    console.log("📧 Resend result:", JSON.stringify(result));
    return;
  }

  // Fallback to Ethereal for local dev
  const t = await getEtherealTransporter();
  const info = await t.sendMail({
    from: '"Scholario" <no-reply@scholario.app>',
    to,
    subject,
    html,
  });
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log("📧 Email preview:", previewUrl);
}

export async function sendDeadlineReminder(
  to: string,
  scholarships: { title: string; deadline: string; link: string }[]
): Promise<string | null> {
  const itemsHtml = scholarships
    .map(
      (s) =>
        `<li style="margin-bottom:12px">
          <strong>${s.title}</strong><br/>
          Deadline: <strong>${s.deadline}</strong><br/>
          ${s.link ? `<a href="${s.link}" style="color:#4f46e5">Apply Now →</a>` : ""}
        </li>`
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
      <h2 style="color:#4f46e5">Upcoming Scholarship Deadlines</h2>
      <p>Here are your bookmarked scholarships with upcoming deadlines:</p>
      <ul style="padding-left:20px">${itemsHtml}</ul>
      <p style="color:#94a3b8;font-size:12px;margin-top:32px">
        You're receiving this because you have bookmarked scholarships on Scholario.
      </p>
    </div>
  `;

  if (process.env.RESEND_API_KEY) {
    if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.SMTP_FROM || "Scholario <no-reply@scholario.app>",
      to,
      subject: `Scholarship Deadline Reminder — ${scholarships.length} upcoming deadline${scholarships.length > 1 ? "s" : ""}`,
      html,
    });
    return null;
  }

  const t = await getEtherealTransporter();
  const info = await t.sendMail({
    from: '"Scholario" <no-reply@scholario.app>',
    to,
    subject: `Scholarship Deadline Reminder — ${scholarships.length} upcoming deadline${scholarships.length > 1 ? "s" : ""}`,
    html,
  });
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("📧 Email preview URL:", previewUrl);
    return previewUrl as string;
  }
  return null;
}
