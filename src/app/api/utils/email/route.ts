import { NextResponse } from "next/server";
import { sendEmails } from "@/lib/sendEmails";
import { FastStartEmailRequest } from "@/types/email";
import {
  generateVerifyEmailTemplate,
  generateResetPasswordEmailTemplate,
  generateWelcomeEmailTemplate,
  generateNewsletterEmailTemplate,
} from "@/lib/templates";

export async function POST(request: Request) {
  try {
    const emailRequest: FastStartEmailRequest = await request.json();

    if (
      !emailRequest.recipients ||
      !Array.isArray(emailRequest.recipients) ||
      emailRequest.recipients.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid request format. Required: recipients array with at least one recipient.",
        },
        { status: 400 }
      );
    }

    for (const recipient of emailRequest.recipients) {
      if (!recipient.email || !recipient.username) {
        return NextResponse.json(
          {
            success: false,
            message: "Each recipient must have username and email.",
          },
          { status: 400 }
        );
      }
    }

    if (
      emailRequest.templateName &&
      ![
        "verify-email",
        "reset-password-email",
        "welcome-email",
        "newsletter-email",
      ].includes(emailRequest.templateName)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid email templateName. Supported types: verify-email, reset-password-email, welcome-email, newsletter-email",
        },
        { status: 400 }
      );
    }

    const result = await sendEmails(emailRequest);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error processing email request:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while processing email request.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get("template");

  if (!template) {
    return NextResponse.json(
      {
        success: false,
        message: "Missing required 'template' query parameter",
        supportedTemplates: [
          "verify-email",
          "reset-password-email",
          "welcome-email",
          "newsletter-email",
        ],
      },
      { status: 400 }
    );
  }

  const supportedTemplates = [
    "verify-email",
    "reset-password-email",
    "welcome-email",
    "newsletter-email",
  ];

  if (!supportedTemplates.includes(template)) {
    return NextResponse.json(
      {
        success: false,
        message: `Invalid template. Supported templates: ${supportedTemplates.join(
          ", "
        )}`,
        supportedTemplates,
      },
      { status: 400 }
    );
  }

  const sampleData = {
    companyName: "FastStart",
    verificationCode: "123456",
    resetPasswordCode: "ABC123",
    cta: {
      text: "Get Started",
      url: "https://faststart.neploom.com",
    },
  };

  const sampleUsername = "John Doe";
  const sampleContent = [
    `This is a sample preview of the ${template} template.`,
  ];

  try {
    let templateHtml: string;

    switch (template) {
      case "verify-email":
        templateHtml = generateVerifyEmailTemplate(
          sampleUsername,
          [],
          sampleData
        );
        break;
      case "reset-password-email":
        templateHtml = generateResetPasswordEmailTemplate(
          sampleUsername,
          [],
          sampleData
        );
        break;
      case "welcome-email":
        templateHtml = generateWelcomeEmailTemplate(
          sampleUsername,
          sampleContent,
          sampleData
        );
        break;
      case "newsletter-email":
        templateHtml = generateNewsletterEmailTemplate(
          sampleUsername,
          sampleContent,
          sampleData
        );
        break;
      default:
        throw new Error(`Unsupported template: ${template}`);
    }

    return new Response(templateHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate email template",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
