import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { hasValidAdminSession } from "@/lib/admin-session";

export default async function AdminSectionPage({
  params,
}: {
  params: Promise<{ section?: string[] }>;
}) {
  if (!(await hasValidAdminSession())) {
    redirect("/admin/login");
  }

  const resolved = await params;
  const sectionKey = resolved.section?.join("/") ?? "";

  if (sectionKey !== "") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Card className="border-border/60 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.12),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(247,244,255,0.88))] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default">
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                Internal admin
              </Badge>
              <Badge variant="secondary">Protected route</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Admin section unavailable
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              This admin console is not live yet. The route is protected, but the visible section structure has been hidden until the real data model is connected.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="md">
                <ArrowRight className="mr-2 h-4 w-4" />
                Back to overview
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
