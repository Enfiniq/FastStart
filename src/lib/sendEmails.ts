import { FastStartEmailRequest } from "@/types/email";
import * as nodemailer from "nodemailer";
import {
  generateNewsletterEmailTemplate,
  generateResetPasswordEmailTemplate,
  generateVerifyEmailTemplate,
  generateWelcomeEmailTemplate,
} from "./templates";

export async function sendEmails(
  emailRequest: FastStartEmailRequest
): Promise<{ success: boolean; message: string; details?: unknown }> {
  try {
    const user =
      emailRequest.sender?.user ||
      process.env.GMAIL_USER ||
      "faststart@gmail.com";
    const pass =
      emailRequest.sender?.app_password || process.env.GMAIL_APP_PASSWORD || "";

    if (!pass) {
      return {
        success: false,
        message: "Email service not configured - missing app password",
        details: {
          error:
            "Either provide app_password in sender object or set GMAIL_APP_PASSWORD/EMAIL_PASSWORD environment variable",
        },
      };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();

    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < emailRequest.recipients.length; i += chunkSize) {
      chunks.push(emailRequest.recipients.slice(i, i + chunkSize));
    }

    let totalSent = 0;
    const errors: unknown[] = [];

    for (const chunk of chunks) {
      const emailPromises = chunk.map(async (recipient) => {
        try {
          let emailHtml: string;
          let emailSubject: string;
          let emailText: string;

          switch (emailRequest.templateName) {
            case "verify-email":
              emailHtml = generateVerifyEmailTemplate(
                recipient.username,
                emailRequest.content,
                emailRequest.data
              );
              emailSubject =
                emailRequest.subject || "Verify Your Email - FastStart";
              emailText =
                emailRequest.text ||
                `Hello ${recipient.username}, please verify your email address.`;
              break;
            case "reset-password-email":
              emailHtml = generateResetPasswordEmailTemplate(
                recipient.username,
                emailRequest.content,
                emailRequest.data
              );
              emailSubject =
                emailRequest.subject || "Reset Your Password - FastStart";
              emailText =
                emailRequest.text ||
                `Hello ${recipient.username}, reset your password using the link provided.`;
              break;
            case "welcome-email":
              emailHtml = generateWelcomeEmailTemplate(
                recipient.username,
                emailRequest.content,
                emailRequest.data
              );
              emailSubject = emailRequest.subject || "Welcome to FastStart!";
              emailText =
                emailRequest.text ||
                `Welcome to FastStart, ${recipient.username}! We're excited to have you.`;
              break;
            case "newsletter-email":
              emailHtml = generateNewsletterEmailTemplate(
                recipient.username,
                emailRequest.content,
                emailRequest.data
              );
              emailSubject = emailRequest.subject || "FastStart Newsletter";
              emailText =
                emailRequest.text ||
                `Hello ${recipient.username}, check out our latest newsletter!`;
              break;
            default:
              throw new Error(`Unknown template: ${emailRequest.templateName}`);
          }

          await transporter.sendMail({
            from: emailRequest.sender
              ? `"${emailRequest.sender.name || "FastStart Team"}" <${
                  emailRequest.sender.email
                }>`
              : `"FastStart Team" <${user}>`,
            to: recipient.email,
            subject: emailSubject,
            text: emailText,
            html: emailHtml,
          });

          return { success: true, recipient: recipient.email };
        } catch (error) {
          return { success: false, recipient: recipient.email, error };
        }
      });

      const chunkResults = await Promise.allSettled(emailPromises);

      chunkResults.forEach((result) => {
        if (result.status === "fulfilled") {
          if (result.value.success) {
            totalSent++;
          } else {
            errors.push(result.value);
          }
        } else {
          errors.push({ error: result.reason });
        }
      });
    }

    return {
      success: true,
      message: `Successfully sent ${totalSent} emails${
        errors.length > 0 ? ` with ${errors.length} errors` : ""
      }`,
      details: {
        totalSent,
        totalRecipients: emailRequest.recipients.length,
        errors: errors.length > 0 ? errors : undefined,
      },
    };
  } catch (error) {
    console.error("Email service error:", error);
    return {
      success: false,
      message: "Failed to send emails",
      details: {
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
}
