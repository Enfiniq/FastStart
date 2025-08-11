import { EmailData } from "@/types/email";

export function generateStyledCode(code: string): string {
  const digits = code.split("");
  const digitSpans = digits
    .map(
      (digit) =>
        `<span style="display: inline-block; width: 40px; height: 45px; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; text-align: center; line-height: 45px; margin: 0 3px; border-radius: 8px; font-size: 20px; font-weight: bold; letter-spacing: 1px;">${digit}</span>`
    )
    .join("");

  return `<div style="text-align: center; margin: 20px 0;">
    ${digitSpans}
  </div>`;
}

export function generateCTAButton(cta: { text: string; url: string }): string {
  return `<div style="text-align: center; margin: 25px 0;">
    <a href="${cta.url}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">${cta.text}</a>
  </div>`;
}

export function generateVerifyEmailTemplate(
  username: string,
  content?: string[],
  data?: EmailData
): string {
  const companyName = data?.companyName || "FastStart";
  const verificationCode = data?.verificationCode;
  const cta = data?.cta;

  const contentHtml = content?.length
    ? content.join("\n")
    : `
    <div style="background-color: #EFF6FF; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #1E40AF; margin: 0 0 15px 0;">Verify Your Email</h3>
      <p style="margin: 0; line-height: 1.6;">Please verify your email address to complete your registration.</p>
      ${
        verificationCode
          ? `
        <div style="margin: 20px 0;">
          <p style="text-align: center; margin: 0 0 15px 0; color: #1E40AF; font-weight: 600;">Your Verification Code:</p>
          ${generateStyledCode(verificationCode)}
        </div>
      `
          : ""
      }
      ${cta ? generateCTAButton(cta) : ""}
      <p style="margin: 15px 0 0 0; color: #1E40AF; font-size: 14px;"><strong>Note:</strong> If you didn't request this code, please ignore this email.</p>
    </div>
  `;

  return `
    <body style="font-family: sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; color: #333;">
      <div style="max-width: 600px; margin: 50px auto; padding: 20px; background: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
        <div style="border-bottom: 1px solid #eee; padding-bottom: 20px;">
          <h1 style="color: #3B82F6; margin: 0; font-size: 1.8em;">${companyName}</h1>
        </div>
        <div style="padding: 20px 0;">
          <h2 style="color: #1F2937;">Hello, ${username}!</h2>
          ${contentHtml}
          <div style="margin-top: 30px; font-size: 0.9em; color: #6B7280;">
            <p>Best regards,<br/>The ${companyName} Team</p>
          </div>
        </div>
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #9CA3AF; font-size: 0.8em;">
          <p>&copy; 2025 ${companyName}. All rights reserved.</p>
        </div>
      </div>
    </body>
  `;
}

export function generateResetPasswordEmailTemplate(
  username: string,
  content?: string[],
  data?: EmailData
): string {
  const companyName = data?.companyName || "FastStart";
  const resetPasswordCode = data?.resetPasswordCode;
  const cta = data?.cta;

  const contentHtml = content?.length
    ? content.join("\n")
    : `
    <div style="background-color: #EFF6FF; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #1E40AF; margin: 0 0 15px 0;">Password Reset Request</h3>
      <p style="margin: 0; line-height: 1.6;">We received a request to reset your password. Use the code below to proceed.</p>
      ${
        resetPasswordCode
          ? `
        <div style="margin: 20px 0;">
          <p style="text-align: center; margin: 0 0 15px 0; color: #1E40AF; font-weight: 600;">Your Reset Code:</p>
          ${generateStyledCode(resetPasswordCode)}
        </div>
      `
          : ""
      }
      ${cta ? generateCTAButton(cta) : ""}
      <p style="margin: 15px 0 0 0; color: #1E40AF; font-size: 14px;"><strong>Note:</strong> If you didn't request this reset, please ignore this email.</p>
    </div>
  `;

  return `
    <body style="font-family: sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; color: #333;">
      <div style="max-width: 600px; margin: 50px auto; padding: 20px; background: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
        <div style="border-bottom: 1px solid #eee; padding-bottom: 20px;">
          <h1 style="color: #3B82F6; margin: 0; font-size: 1.8em;">${companyName}</h1>
        </div>
        <div style="padding: 20px 0;">
          <h2 style="color: #1F2937;">Hello, ${username}!</h2>
          ${contentHtml}
          <div style="margin-top: 30px; font-size: 0.9em; color: #6B7280;">
            <p>Best regards,<br/>The ${companyName} Team</p>
          </div>
        </div>
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #9CA3AF; font-size: 0.8em;">
          <p>&copy; 2025 ${companyName}. All rights reserved.</p>
        </div>
      </div>
    </body>
  `;
}

export function generateWelcomeEmailTemplate(
  username: string,
  content?: string[],
  data?: EmailData
): string {
  const companyName = data?.companyName || "FastStart";
  const cta = data?.cta;

  const contentHtml = content?.length
    ? content.join("\n")
    : `
    <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); border-radius: 8px; padding: 20px; margin: 20px 0; color: white;">
      <h3 style="margin: 0 0 15px 0;">Welcome to ${companyName}!</h3>
      <p style="margin: 0; line-height: 1.6;">Your journey into the bright future of your life has begun!</p>
      ${
        cta
          ? `<div style="margin-top: 20px;">${generateCTAButton(cta)}</div>`
          : ""
      }
    </div>
  `;

  return `
    <body style="font-family: sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; color: #333;">
      <div style="max-width: 600px; margin: 50px auto; padding: 20px; background: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
        <div style="border-bottom: 1px solid #eee; padding-bottom: 20px;">
          <h1 style="color: #3B82F6; margin: 0; font-size: 1.8em;">${companyName}</h1>
        </div>
        <div style="padding: 20px 0;">
          <h2 style="color: #1F2937;">Hello, ${username}!</h2>
          ${contentHtml}
          <div style="margin-top: 30px; font-size: 0.9em; color: #6B7280;">
            <p>Best regards,<br/>The ${companyName} Team</p>
          </div>
        </div>
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #9CA3AF; font-size: 0.8em;">
          <p>&copy; 2025 ${companyName}. All rights reserved.</p>
        </div>
      </div>
    </body>
  `;
}

export function generateNewsletterEmailTemplate(
  username: string,
  content?: string[],
  data?: EmailData
): string {
  const companyName = data?.companyName || "FastStart";
  const cta = data?.cta;

  const contentHtml = content?.length
    ? content.join("\n")
    : `
    <div style="margin: 20px 0;">
      <h3 style="color: #059669;">Latest News</h3>
      <p>Stay updated with the latest news and features from ${companyName}!</p>
      ${cta ? generateCTAButton(cta) : ""}
    </div>
  `;

  return `
    <body style="font-family: sans-serif; background-color: #f7f7f7; margin: 0; padding: 0; color: #333;">
      <div style="max-width: 600px; margin: 50px auto; padding: 20px; background: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">
        <div style="border-bottom: 1px solid #eee; padding-bottom: 20px;">
          <h1 style="color: #3B82F6; margin: 0; font-size: 1.8em;">${companyName} Newsletter</h1>
        </div>
        <div style="padding: 20px 0;">
          <h2 style="color: #1F2937;">Hello, ${username}!</h2>
          ${contentHtml}
          <div style="margin-top: 30px; font-size: 0.9em; color: #6B7280;">
            <p>Best regards,<br/>The ${companyName} Team</p>
          </div>
        </div>
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #9CA3AF; font-size: 0.8em;">
          <p>&copy; 2025 ${companyName}. All rights reserved.</p>
        </div>
      </div>
    </body>
  `;
}
