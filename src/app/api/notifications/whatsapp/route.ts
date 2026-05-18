import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { applicationId, candidateName, jobTitle, employerPhone } = await request.json();

  if (!applicationId || !candidateName || !jobTitle || !employerPhone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const message = `🔔 New Application on Impjieg\n\n${candidateName} has applied for: ${jobTitle}\n\nLog in to your dashboard to review: https://impjieg.com/employer/applications`;

  // Twilio WhatsApp API integration
  // Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!twilioSid || !twilioToken || !twilioWhatsAppNumber) {
    // Log for development, return success in demo mode
    console.log("[WhatsApp Demo] Notification:", {
      to: employerPhone,
      message,
    });

    return NextResponse.json({
      success: true,
      demo: true,
      message: "WhatsApp notification logged (configure Twilio for production)",
    });
  }

  try {
    // Format phone number for WhatsApp (must start with +)
    const formattedPhone = employerPhone.startsWith("+") ? employerPhone : `+${employerPhone}`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          From: `whatsapp:${twilioWhatsAppNumber}`,
          To: `whatsapp:${formattedPhone}`,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Twilio API error:", error);
      return NextResponse.json({ error: "Failed to send WhatsApp notification" }, { status: 500 });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      messageId: data.sid,
      status: data.status,
    });
  } catch (error) {
    console.error("WhatsApp notification error:", error);
    return NextResponse.json({ error: "Failed to send WhatsApp notification" }, { status: 500 });
  }
}
