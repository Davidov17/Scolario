import https from "https";
import nodemailer from "nodemailer";

const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL || "scholario.admin@gmail.com";
const BREVO_FROM_NAME = "Scholario";

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

async function sendViaBrevo(to: string, subject: string, html: string): Promise<void> {
  const payload = JSON.stringify({
    sender: { name: BREVO_FROM_NAME, email: BREVO_FROM_EMAIL },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.brevo.com",
        path: "/v3/smtp/email",
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY!,
          "content-type": "application/json",
          "content-length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          console.log(`📧 Brevo response ${res.statusCode}: ${data}`);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
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

  if (process.env.BREVO_API_KEY) {
    await sendViaBrevo(to, subject, html);
    return;
  }

  const t = await getEtherealTransporter();
  const info = await t.sendMail({
    from: `"${BREVO_FROM_NAME}" <no-reply@scholario.app>`,
    to,
    subject,
    html,
  });
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log("📧 Email preview:", previewUrl);
}

export async function sendPasswordChangeConfirmation(
  to: string,
  firstName: string
): Promise<void> {
  const subject = "Your Scholario password was changed";
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1e293b">
      <div style="background:#4f46e5;padding:32px 32px 24px;border-radius:16px 16px 0 0;text-align:center">
        <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">Scholario</span>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-top:none;padding:32px;border-radius:0 0 16px 16px">
        <h2 style="margin:0 0 8px;font-size:20px;font-weight:700">Password changed</h2>
        <p style="color:#64748b;font-size:14px;margin:0 0 16px">Hi ${firstName}, your Scholario account password was just changed successfully.</p>
        <p style="color:#64748b;font-size:14px;margin:0 0 24px">If you made this change, no action is needed. If you did <strong>not</strong> change your password, please reset it immediately via the Forgot Password link.</p>
        <p style="color:#94a3b8;font-size:12px;margin:0">If you did not request this change, please secure your account immediately.</p>
      </div>
    </div>
  `;

  if (process.env.BREVO_API_KEY) {
    await sendViaBrevo(to, subject, html);
    return;
  }

  const t = await getEtherealTransporter();
  const info = await t.sendMail({
    from: `"${BREVO_FROM_NAME}" <no-reply@scholario.app>`,
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

  const subject = `Scholarship Deadline Reminder — ${scholarships.length} upcoming deadline${scholarships.length > 1 ? "s" : ""}`;
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

  if (process.env.BREVO_API_KEY) {
    await sendViaBrevo(to, subject, html);
    return null;
  }

  const t = await getEtherealTransporter();
  const info = await t.sendMail({
    from: `"${BREVO_FROM_NAME}" <no-reply@scholario.app>`,
    to,
    subject,
    html,
  });
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("📧 Email preview URL:", previewUrl);
    return previewUrl as string;
  }
  return null;
}
