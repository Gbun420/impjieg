"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type EmployerNotificationUpdate = Pick<
  Database["public"]["Tables"]["employers"]["Update"],
  "email_notifications" | "whatsapp_notifications" | "whatsapp_number"
>;
type EmployerNotificationsTable = {
  update(
    values: EmployerNotificationUpdate
  ): {
    eq(column: "user_id", value: string): Promise<{
      error: { message: string } | null;
    }>;
  };
};

export async function updateNotificationSettings(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const emailNotifications = formData.get("emailNotifications") === "on";
  const whatsappNotifications = formData.get("whatsappNotifications") === "on";
  const whatsappNumber = formData.get("whatsappNumber") as string;

  const employersTable = supabase.from(
    "employers"
  ) as unknown as EmployerNotificationsTable;

  const { error } = await employersTable
    .update({
      email_notifications: emailNotifications,
      whatsapp_notifications: whatsappNotifications,
      whatsapp_number: whatsappNumber || null,
    } as EmployerNotificationUpdate)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/employer/settings");
  return { success: true };
}

export async function sendWhatsAppNotification(phoneNumber: string, message: string) {
  // In production, integrate with Twilio WhatsApp API or WhatsApp Business API
  // For now, this is a placeholder that logs the notification
  console.log(`WhatsApp notification to ${phoneNumber}:`, message);

  // Example Twilio implementation:
  // const twilio = require('twilio');
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
  //   to: `whatsapp:+356${phoneNumber}`,
  //   body: message,
  // });

  return { success: true };
}
