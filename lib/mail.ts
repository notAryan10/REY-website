import nodemailer from "nodemailer";

export const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
  html?: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    // Always send the plain-text version too: it's the fallback for clients that
    // block HTML, and mail with no text part scores worse with spam filters.
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Shared shell for transactional mail. Table-free, inline styles only, and no
 * remote images — that's what survives Gmail, Outlook and dark mode intact.
 */
export function emailLayout(opts: {
  heading: string;
  body: string;
  cta?: { label: string; url: string };
  footer?: string;
}) {
  const cta = opts.cta
    ? `<a href="${escape(opts.cta.url)}" style="display:inline-block;background:#1e3a5f;color:#ffffff;
         text-decoration:none;padding:14px 28px;font-size:15px;font-weight:600;
         border-radius:4px;margin:8px 0 24px">${escape(opts.cta.label)}</a>`
    : "";

  const fallback = opts.cta
    ? `<p style="margin:0 0 24px;font-size:13px;color:#7a7a85;line-height:1.6">
         If the button doesn't work, paste this into your browser:<br>
         <span style="color:#8ab4d8;word-break:break-all">${escape(opts.cta.url)}</span>
       </p>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#0d0d0f">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px;
       font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e8e8ea">
    <div style="font-size:28px;font-weight:700;letter-spacing:6px;color:#ffffff;margin-bottom:32px">REY</div>
    <h1 style="font-size:20px;font-weight:600;color:#ffffff;margin:0 0 16px">${escape(opts.heading)}</h1>
    <div style="font-size:15px;line-height:1.7;color:#c8c8d0;margin:0 0 24px">${opts.body}</div>
    ${cta}
    ${fallback}
    <p style="margin:0;padding-top:24px;border-top:1px solid #2a2a30;font-size:12px;color:#7a7a85;line-height:1.6">
      ${escape(opts.footer ?? "If you weren't expecting this email, you can safely ignore it.")}
    </p>
  </div>
</body></html>`;
}
