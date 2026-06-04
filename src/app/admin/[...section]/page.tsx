import { redirect } from "next/navigation";
import { hasValidAdminSession } from "@/lib/admin-session";

export default async function AdminSectionPage() {
  if (!(await hasValidAdminSession())) {
    redirect("/admin/login");
  }

  redirect("/admin/dashboard");
}
