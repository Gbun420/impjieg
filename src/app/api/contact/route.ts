import { NextResponse } from "next/server";
import { z } from "zod";
import { SITE } from "@/lib/constants";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().email("Please enter a valid email"),
  subject: z.string().trim().min(3, "Please enter a subject"),
  message: z.string().trim().min(10, "Please enter a longer message"),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Please check the form and try again",
      },
      { status: 400 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json(
      { error: "Contact email is not configured yet" },
      { status: 503 }
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Impjieg Contact <notifications@impjieg.com>",
      to: [SITE.email],
      reply_to: parsed.data.email,
      subject: `[Contact] ${parsed.data.subject}`,
      text: [
        `Name: ${parsed.data.name}`,
        `Email: ${parsed.data.email}`,
        `Subject: ${parsed.data.subject}`,
        "",
        parsed.data.message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "Failed to send contact message");
    return NextResponse.json(
      { error: error || "Failed to send contact message" },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
