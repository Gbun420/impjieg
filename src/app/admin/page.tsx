import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/admin-session";

export default async function AdminIndexPage() {
  if (await hasValidAdminSession()) {
    redirect("/admin/dashboard");
  }

  redirect("/admin/login");
}
