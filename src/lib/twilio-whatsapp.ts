import { SITE } from "@/lib/constants";

type EnvLike = Record<string, string | undefined>;

type SendWhatsAppInput = {
  body: string;
  to: string;
  env?: EnvLike;
  fetchImpl?: typeof fetch;
};

type SendWhatsAppResult =
  | {
      success: true;
      demo?: boolean;
      message: string;
      messageId?: string;
      status?: string;
    }
  | {
      success: false;
      error: string;
    };

function getRequiredConfig(env: EnvLike) {
  const accountSid = env.TWILIO_ACCOUNT_SID;
  const authToken = env.TWILIO_AUTH_TOKEN;
  const whatsappNumber = env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !whatsappNumber) {
    return null;
  }

  return { accountSid, authToken, whatsappNumber };
}

export function formatWhatsAppPhone(phoneNumber: string) {
  const trimmed = phoneNumber.trim();
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}

export function buildImpjiegWhatsAppApplicationMessage({
  applicationId,
  candidateName,
  jobTitle,
  dashboardUrl = `${SITE.url}/employer/applications`,
}: {
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  dashboardUrl?: string;
}) {
  return [
    `🔔 ${SITE.name}`,
    SITE.tagline,
    "",
    "New application received",
    `• Candidate: ${candidateName}`,
    `• Role: ${jobTitle}`,
    `• Application ID: ${applicationId}`,
    "",
    "Open your employer dashboard:",
    dashboardUrl,
    "",
    "Impjieg · Malta tech, digital, and iGaming hiring",
  ].join("\n");
}

export async function sendWhatsAppMessage({
  body,
  to,
  env = process.env,
  fetchImpl = fetch,
}: SendWhatsAppInput): Promise<SendWhatsAppResult> {
  const config = getRequiredConfig(env);

  if (!config) {
    console.log("[WhatsApp Demo] Notification:", {
      to,
      body,
    });

    return {
      success: true,
      demo: true,
      message: "WhatsApp notification logged (configure Twilio for production)",
    };
  }

  const response = await fetchImpl(
    `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        From: `whatsapp:${config.whatsappNumber}`,
        To: `whatsapp:${formatWhatsAppPhone(to)}`,
        Body: body,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Twilio API error:", data);
    return { success: false, error: "Failed to send WhatsApp notification" };
  }

  return {
    success: true,
    message: "WhatsApp notification sent",
    messageId: data.sid,
    status: data.status,
  };
}
