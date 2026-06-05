import { redirect } from "next/navigation";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { AdminConsoleSectionView } from "@/components/admin/admin-console-section-view";
import {
  getAdminConsoleData,
  getAdminConsoleSectionMeta,
  resolveAdminConsoleSection,
} from "@/lib/admin-consoles";
import { hasValidAdminSession } from "@/lib/admin-session";
import {
  listAllCommercialGrants,
  listCommercialGrantEmployers,
} from "@/lib/monetization/admin-grants/actions";
import type {
  AdminCommercialGrantEmployerOption,
  AdminCommercialGrantRow,
} from "@/lib/monetization/admin-grants/types";

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section: string[] }>;
}) {
  if (!(await hasValidAdminSession())) {
    redirect("/admin/login");
  }

  const { section: sectionParams } = await params;
  const section = resolveAdminConsoleSection(sectionParams);

  if (!section || section === "dashboard") {
    redirect("/admin/dashboard");
  }

  const data = await getAdminConsoleData();
  let grants: AdminCommercialGrantRow[] = [];
  let grantsLoadError: string | null = null;
  let employers: AdminCommercialGrantEmployerOption[] = [];

  if (section === "commercial-grants") {
    try {
      [grants, employers] = await Promise.all([
        listAllCommercialGrants(),
        listCommercialGrantEmployers(80),
      ]);
    } catch (error) {
      grants = [];
      grantsLoadError = error instanceof Error ? error.message : "Failed to load commercial grants";
    }
  }
  const meta = getAdminConsoleSectionMeta(section);

  return (
    <AdminSectionShell
      title={meta.title}
      description={meta.description}
      activePath={`/admin/${section}`}
      eyebrow={meta.eyebrow}
    >
      <AdminConsoleSectionView
        section={section}
        data={data}
        extra={{ grants, grantsLoadError, employers }}
      />
    </AdminSectionShell>
  );
}
