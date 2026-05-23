import { NextResponse } from "next/server";
import { requireInternalAdminToken } from "../../_lib/internal-route-guard";
import { sendWhatsAppMessage } from "@/lib/twilio-whatsapp";

export async function POST(request: Request) {
  const forbidden = requireInternalAdminToken(request);
  if (forbidden) {
    return forbidden;
  }

  const { applicationId, candidateName, jobTitle, employerPhone } = await request.json();

  if (!applicationId || !candidateName || !jobTitle || !employerPhone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const message = `🔔 New Application on Impjieg\n\n${candidateName} has applied for: ${jobTitle}\n\nLog in to your dashboard to review: https://impjieg.vercel.app/employer/applications`;

  try {
    const result = await sendWhatsAppMessage({
      to: employerPhone,
      body: message,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("WhatsApp notification error:", error);
    return NextResponse.json({ error: "Failed to send WhatsApp notification" }, { status: 500 });
  }
}
