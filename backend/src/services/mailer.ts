import nodemailer from "nodemailer";

// Configure via env variables:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
// Falls back to Ethereal test account when env vars are missing (emails captured at ethereal.email)
let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      family: 4, // force IPv4 — Railway doesn't route IPv6 outbound
    } as Parameters<typeof nodemailer.createTransport>[0]);
  } else {
    // Create a test account on Ethereal for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log("📧 Ethereal test account created:", testAccount.user);
  }

  return transporter;
}

/** Sends a 6-digit verification code email for signup or password reset. */
export async function sendVerificationCode(
  to: string,
  code: string,
  type: "signup" | "reset"
): Promise<void> {
  const t = await getTransporter();

  const isSignup = type === "signup";
  const subject = isSignup
    ? "Verify your Scholario account"
    : "Reset your Scholario password";
  const heading = isSignup ? "Verify your email" : "Reset your password";
  const body = isSignup
    ? "Use the code below to verify your email and activate your Scholario account."
    : "Use the code below to reset your password. It expires in 1 hour.";

  const info = await t.sendMail({
    from: process.env.SMTP_FROM || '"Scholario" <no-reply@scholario.app>',
    to,
    subject,
    html: `
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
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log("📧 Email preview:", previewUrl);
}

export async function sendDeadlineReminder(
  to: string,
  scholarships: { title: string; deadline: string; link: string }[]
): Promise<string | null> {
  const t = await getTransporter();

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

  const info = await t.sendMail({
    from: process.env.SMTP_FROM || '"Scholario" <no-reply@scholario.app>',
    to,
    subject: `Scholarship Deadline Reminder — ${scholarships.length} upcoming deadline${scholarships.length > 1 ? "s" : ""}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <h2 style="color:#4f46e5">Upcoming Scholarship Deadlines</h2>
        <p>Here are your bookmarked scholarships with upcoming deadlines:</p>
        <ul style="padding-left:20px">${itemsHtml}</ul>
        <p style="color:#94a3b8;font-size:12px;margin-top:32px">
          You're receiving this because you have bookmarked scholarships on Scholario.
        </p>
      </div>
    `,
  });

  // For Ethereal, return the preview URL so dev can see the email
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("📧 Email preview URL:", previewUrl);
    return previewUrl as string;
  }
  return null;
}
