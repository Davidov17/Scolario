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
    });
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
