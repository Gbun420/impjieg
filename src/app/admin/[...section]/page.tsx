import { redirect } from "next/navigation";
import { AdminSectionShell } from "@/components/admin/admin-section-shell";
import { AdminConsoleSectionView } from "@/components/admin/admin-console-section-view";
import { AdminDataErrorState } from "@/components/admin/admin-data-error-state";
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

  const meta = getAdminConsoleSectionMeta(section);

  let data;
  try {
    data = await getAdminConsoleData();
  } catch (error) {
    console.error(
      `Admin section data load failed for ${section}:`,
      error instanceof Error ? error.message : String(error)
    );
    return (
      <AdminSectionShell
        title={meta.title}
        description={meta.description}
        activePath={`/admin/${section}`}
        eyebrow={meta.eyebrow}
      >
        <AdminDataErrorState
          title={`${meta.title} data is temporarily unavailable`}
          description="The admin shell loaded, but one of the live queries needed for this section failed. Refresh the page or return to the dashboard."
          routeLabel={meta.eyebrow}
          retryHref={`/admin/${section}`}
        />
      </AdminSectionShell>
    );
  }
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
