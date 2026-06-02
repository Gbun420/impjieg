"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminToken, setAdminSession, clearAdminSession } from "@/lib/admin-session";

export async function adminLogin(formData: FormData) {
  const password = formData.get("password") as string;
  const expected = getAdminToken();

  if (!password) {
    return { error: "Admin password is required" };
  }

  if (password !== expected) {
    return { error: "Invalid admin password" };
  }

  await setAdminSession(await cookies());
  return { success: true };
}

export async function adminLogout() {
  await clearAdminSession(await cookies());
  redirect("/admin/login");
}
