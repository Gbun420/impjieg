import { NextResponse } from "next/server";
import { z } from "zod";
import { SITE } from "@/lib/constants";
import { sendEmail } from "@/lib/email-sender";

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

  const result = await sendEmail({
    from: "Impjieg Contact <onboarding@resend.dev>",
    to: SITE.email,
    replyTo: parsed.data.email,
    subject: `[Contact] ${parsed.data.subject}`,
    text: [
      `Name: ${parsed.data.name}`,
      `Email: ${parsed.data.email}`,
      `Subject: ${parsed.data.subject}`,
      "",
      parsed.data.message,
    ].join("\n"),
    html: `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${parsed.data.name}</p>
      <p><strong>Email:</strong> ${parsed.data.email}</p>
      <p><strong>Subject:</strong> ${parsed.data.subject}</p>
      <h3>Message</h3>
      <p>${parsed.data.message.replace(/\n/g, "<br>")}</p>
    `,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error || "Failed to send contact message" },
      { status: result.category === "setup_failed" ? 503 : 502 }
    );
  }

  return NextResponse.json({ success: true });
}
