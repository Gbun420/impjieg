import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { TALENT_DIRECTORY_ENABLED } from "@/lib/talent-directory/constants";
import { notFound } from "next/navigation";
import { DirectorySettingsForm } from "@/components/talent-directory/candidate/directory-settings-form";
import { DirectoryPreview } from "@/components/talent-directory/candidate/directory-preview";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Pause } from "lucide-react";

export const metadata: Metadata = {
  title: "Talent Directory — Candidate",
  description: "Control your visibility in the Impjieg Talent Directory.",
};

export const dynamic = "force-dynamic";

export default async function CandidateTalentDirectoryPage() {
  if (!TALENT_DIRECTORY_ENABLED) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/candidate/talent-directory");
  }

  // Get existing directory profile (table not yet migrated — cast to avoid type errors)
  const { data: directoryProfile } = await supabase
    .from("candidate_directory_profiles" as any)
    .select("*")
    .eq("candidate_user_id", user.id)
    .maybeSingle();

  // Get candidate profile for preview
  const { data: candidateProfile } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const status = directoryProfile?.visibility_status ?? "private";
  const statusConfig = {
    private: { label: "Private", color: "bg-gray-500", icon: EyeOff },
    searchable: { label: "Searchable", color: "bg-green-500", icon: Eye },
    paused: { label: "Paused", color: "bg-amber-500", icon: Pause },
  };
  const current = statusConfig[status as keyof typeof statusConfig] ?? statusConfig.private;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Talent Directory
        </h1>
        <p className="text-sm text-muted-foreground">
          Control your visibility in the Impjieg Talent Directory
        </p>
      </div>

      {/* Status Card */}
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${current.color}/10`}>
            <current.icon className={`h-5 w-5 ${current.color.replace("bg-", "text-")}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Directory Status</p>
            <p className="font-semibold text-foreground">{current.label}</p>
          </div>
          <Badge variant={status === "searchable" ? "success" : status === "paused" ? "warning" : "secondary"} className="ml-auto">
            {current.label}
          </Badge>
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Settings Form */}
        <DirectorySettingsForm
          directoryProfile={directoryProfile}
          candidateProfile={candidateProfile}
        />

        {/* Preview */}
        <DirectoryPreview
          directoryProfile={directoryProfile}
          candidateProfile={candidateProfile}
        />
      </div>
    </div>
  );
}
