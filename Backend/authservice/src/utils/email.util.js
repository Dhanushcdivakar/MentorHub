import nodemailer from "nodemailer";
import { env } from "../config/env.config.js";

// Helper function to send emails via nodemailer SMTP transport
const sendSMTPMail = async ({ toEmail, toName, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });

  const mailOptions = {
    from: `"MentorHub" <${env.smtpFromEmail}>`,
    to: toName ? `"${toName}" <${toEmail}>` : toEmail,
    subject,
    text,
    html
  };

  return await transporter.sendMail(mailOptions);
};

/**
 * Reusable premium email template generator with inline styles.
 * Standardizes styling across all outgoing notifications.
 */
const buildHtmlTemplate = ({ title, bodyHtml, actionUrl, actionText, footerText }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
        <div style="background-color: #f4f6f8; padding: 40px 15px;">
          <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
            
            <!-- Header with Premium Gradient -->
            <div style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 35px 25px; text-align: center;">
              <h1 style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                Mentor<span style="color: #38bdf8;">Hub</span>
              </h1>
            </div>

            <!-- Content Area -->
            <div style="padding: 40px 30px; line-height: 1.6; color: #334155; font-size: 15px;">
              ${bodyHtml}
              
              <!-- Action Button -->
              ${actionUrl ? `
                <div style="text-align: center; margin: 35px 0;">
                  <a href="${actionUrl}" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: bold; display: inline-block; box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3); font-size: 15px; letter-spacing: 0.3px;">
                    ${actionText}
                  </a>
                </div>
              ` : ''}
            </div>

            <!-- Footer Area -->
            <div style="background-color: #f8fafc; padding: 25px 30px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 12px; color: #64748b;">
              <p style="margin: 0; line-height: 1.5;">${footerText || 'This is an automated email from MentorHub.'}</p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #94a3b8;">&copy; ${new Date().getFullYear()} MentorHub. All rights reserved.</p>
            </div>

          </div>
        </div>
      </body>
    </html>
  `;
};

export const sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${env.frontendUrl}/reset-password?token=${token}`;

  if (!env.smtpUser || !env.smtpPass) {
    console.log("\n========================================================");
    console.log("             PASSWORD RESET EMAIL (DEVELOPMENT MOCK)    ");
    console.log("========================================================");
    console.log(`To: ${email}`);
    console.log(`Reset Password Link: ${resetUrl}`);
    console.log("========================================================\n");
    return;
  }

  try {
    const bodyHtml = `
      <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">Reset Your Password</h2>
      <p style="margin: 0 0 15px 0;">Hello,</p>
      <p style="margin: 0 0 15px 0;">We received a request to reset the password for your MentorHub account. Don't worry, it happens to the best of us!</p>
      <p style="margin: 0 0 15px 0;">Click the button below to safely choose a new secure password:</p>
      <p style="font-size: 13px; color: #64748b; background-color: #f8fafc; padding: 12px; border-radius: 6px; margin: 20px 0; word-break: break-all; border: 1px dashed #cbd5e1;">
        <strong>If the button does not work, copy and paste this URL:</strong><br/>
        <a href="${resetUrl}" style="color: #6366f1; text-decoration: underline;">${resetUrl}</a>
      </p>
    `;

    const htmlContent = buildHtmlTemplate({
      title: "Reset Your Password - MentorHub",
      bodyHtml,
      actionUrl: resetUrl,
      actionText: "Reset Password",
      footerText: "If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged."
    });

    await sendSMTPMail({
      toEmail: email,
      subject: "Reset Your Password - MentorHub",
      text: `You requested a password reset. Please click on the link to reset your password: ${resetUrl}`,
      html: htmlContent
    });

    console.log(`Password reset email successfully sent to ${email} using SMTP.`);
  } catch (error) {
    console.error("Error sending email via SMTP:", error);
    console.log(`[Fallback Log] Reset Password Link for ${email}: ${resetUrl}`);
  }
};

export const sendWelcomeEmail = async (email, name, role) => {
  if (!env.smtpUser || !env.smtpPass) {
    console.log("\n========================================================");
    console.log("             WELCOME EMAIL (DEVELOPMENT MOCK)           ");
    console.log("========================================================");
    console.log(`To: ${email} (${name})`);
    console.log(`Message: Welcome to MentorHub! Your destination is close.`);
    console.log(`Role: ${role}`);
    console.log("========================================================\n");
    return;
  }

  try {
    const bodyHtml = `
      <h2 style="color: #1e293b; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 15px; text-align: center;">Welcome to the Platform!</h2>
      <p style="font-size: 16px; margin: 0 0 15px 0; color: #475569; text-align: center; font-weight: 500;">
        Hello <span style="color: #4f46e5; font-weight: 600;">${name}</span>, welcome to MentorHub! 🚀
      </p>
      <p style="margin: 0 0 15px 0; text-align: center; color: #334155;">
        We are thrilled to have you join our mentorship family as a <strong>${role}</strong>. Whether your goal is to learn, accelerate your career, or share your valuable experience, MentorHub provides all the tools you need to succeed.
      </p>
      <div style="background-color: #f8fafc; border-radius: 10px; padding: 20px; margin: 25px 0; border: 1px solid #e2e8f0; text-align: center;">
        <span style="font-size: 16px; color: #4f46e5; font-weight: 700; display: block; margin-bottom: 5px;">Your Destination is Close</span>
        <span style="font-size: 14px; color: #64748b;">Unlock targeted mentorship sessions, study resources, and career growth pathways today.</span>
      </div>
    `;

    const htmlContent = buildHtmlTemplate({
      title: "Welcome to MentorHub!",
      bodyHtml,
      actionUrl: `${env.frontendUrl || "http://localhost:5173"}/login`,
      actionText: "Go to Dashboard",
      footerText: "We are excited to see you grow. Welcome on board!"
    });

    await sendSMTPMail({
      toEmail: email,
      toName: name,
      subject: "Welcome to MentorHub!",
      text: `Hello ${name},\n\nWelcome to MentorHub! Your destination is close. We are thrilled to have you join us as a ${role}. Let's get started on your mentorship journey!`,
      html: htmlContent
    });

    console.log(`Welcome email successfully sent to ${email} using SMTP.`);
  } catch (error) {
    console.error("Error sending welcome email via SMTP:", error);
    console.log(`[Fallback Log] Welcome email for ${email} (${name}) fell back.`);
  }
};

export const sendLoginNotificationEmail = async (email, name) => {
  const timestamp = new Date().toLocaleString();

  if (!env.smtpUser || !env.smtpPass) {
    console.log("\n========================================================");
    console.log("             LOGIN NOTIFICATION (DEVELOPMENT MOCK)      ");
    console.log("========================================================");
    console.log(`To: ${email} (${name})`);
    console.log(`Message: You successfully logged into MentorHub at ${timestamp}.`);
    console.log("========================================================\n");
    return;
  }

  try {
    const bodyHtml = `
      <h2 style="color: #1e293b; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">New Login Alert</h2>
      <p style="margin: 0 0 15px 0;">Hello <strong>${name}</strong>,</p>
      <p style="margin: 0 0 15px 0;">This is a quick security confirmation that you successfully logged into your MentorHub account.</p>
      <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #6366f1; font-size: 14px;">
        <strong>Time:</strong> ${timestamp}<br/>
        <strong>Status:</strong> Success
      </div>
      <p style="margin: 0 0 15px 0; color: #64748b; font-size: 14px;">
        If this login was initiated by you, no action is needed! If you did not log in recently, please secure your account immediately by resetting your password.
      </p>
    `;

    const htmlContent = buildHtmlTemplate({
      title: "Login Alert - MentorHub",
      bodyHtml,
      actionUrl: `${env.frontendUrl || "http://localhost:5173"}/forgot-password`,
      actionText: "Secure Account",
      footerText: "This is a security notification from MentorHub. Keep your credentials private."
    });

    await sendSMTPMail({
      toEmail: email,
      toName: name,
      subject: "Login Alert - MentorHub",
      text: `Hello ${name},\n\nYou have successfully logged into your MentorHub account at ${timestamp}. If this was not you, please secure your account.`,
      html: htmlContent
    });

    console.log(`Login notification email successfully sent to ${email} using SMTP.`);
  } catch (error) {
    console.error("Error sending login alert email via SMTP:", error);
    console.log(`[Fallback Log] Login notification for ${email} (${name}) fell back.`);
  }
};
