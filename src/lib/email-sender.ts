
export type EmailRecipient = string | { email: string; name?: string };

export type EmailSendOptions = {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string | string[];
  from?: string;
};

export type EmailSendResult = 
  | { success: true; messageId: string }
  | { success: false; error: string; category: "setup_failed" | "provider_failed" | "invalid_input" };

/**
 * Server-only utility to send emails via Resend.
 * Does not expose API keys to the client.
 */
export async function sendEmail(options: EmailSendOptions): Promise<EmailSendResult> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("email_sender_setup_failed: Missing RESEND_API_KEY");
      return { success: false, error: "Email provider not configured", category: "setup_failed" };
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const to = recipients.map(r => typeof r === "string" ? r : r.name ? `${r.name} <${r.email}>` : r.email);

    if (to.length === 0) {
      return { success: false, error: "No recipients provided", category: "invalid_input" };
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: options.from || "Impjieg <notifications@impjieg.com>",
        to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn("email_sender_provider_failed", {
        status: response.status,
        error: data?.message || "Unknown provider error",
      });
      return { 
        success: false, 
        error: data?.message || "Failed to send email", 
        category: "provider_failed" 
      };
    }

    return { success: true, messageId: data.id };
  } catch (caughtError) {
    console.warn("email_sender_unexpected_error", {
      message: caughtError instanceof Error ? caughtError.message : "Unknown",
    });
    return { 
      success: false, 
      error: "An unexpected error occurred while sending email", 
      category: "provider_failed" 
    };
  }
}
