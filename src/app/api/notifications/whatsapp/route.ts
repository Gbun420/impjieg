import { NextResponse } from "next/server";
import { requireInternalAdminToken } from "../../_lib/internal-route-guard";
import { sendWhatsAppMessage } from "@/lib/twilio-whatsapp";

import { z } from "zod";

const whatsappSchema = z.object({
  applicationId: z.string().min(1),
  candidateName: z.string().min(1),
  jobTitle: z.string().min(1),
  employerPhone: z.string().min(1),
});

export async function POST(request: Request) {
  const forbidden = requireInternalAdminToken(request);
  if (forbidden) {
    return forbidden;
  }

  const json = await request.json().catch(() => null);
  if (!json) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = whatsappSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request parameters", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { applicationId, candidateName, jobTitle, employerPhone } = parsed.data;

  const message = `🔔 New Application on Impjieg\n\nApplication ID: ${applicationId}\n${candidateName} has applied for: ${jobTitle}\n\nLog in to your dashboard to review: https://impjieg.vercel.app/employer/applications`;

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
