export interface EmailSender {
  name?: string;
  email: string;
  user?: string;
  app_password?: string;
}

export interface EmailRecipient {
  username: string;
  email: string;
}

export interface EmailData {
  companyName?: string;
  verificationCode?: string;
  resetPasswordCode?: string;
  cta?: {
    text: string;
    url: string;
  };
}

export interface FastStartEmailRequest {
  templateName:
    | "verify-email"
    | "reset-password-email"
    | "welcome-email"
    | "newsletter-email";
  recipients: EmailRecipient[];
  subject?: string;
  content?: string[];
  text?: string;
  sender?: EmailSender;
  data?: EmailData;
}
