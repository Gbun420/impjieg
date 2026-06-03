"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { SECTORS } from "@/lib/constants";
import { cropAndResizeImage } from "@/lib/image-processing";
import { deriveEmployerProfileCompleteness } from "@/lib/employer-profile-completeness";
import { updateNotificationSettings } from "@/lib/actions/notifications";
import { ShieldCheck, ShieldX } from "lucide-react";
import type { Database, Employer } from "@/lib/supabase/types";

type EmployerUpdate = Database["public"]["Tables"]["employers"]["Update"];
type EmployerMutationTable = {
  update(
    values: EmployerUpdate
  ): {
    eq(column: "user_id", value: string): Promise<{ error: Error | null }>;
  };
};

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [industry, setIndustry] = useState("");
  const [cultureSummary, setCultureSummary] = useState("");
  const [hiringProcess, setHiringProcess] = useState("");
  const [workplaceHighlights, setWorkplaceHighlights] = useState("");
  const [responseTimeDays, setResponseTimeDays] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const logoFileRef = useRef<HTMLInputElement | null>(null);
  const coverFileRef = useRef<HTMLInputElement | null>(null);

  async function uploadAsset(kind: "logo" | "cover", file: File | null) {
    if (!file) {
      return;
    }

    setError(null);
    setSuccess(false);
    if (kind === "logo") {
      setIsUploadingLogo(true);
    } else {
      setIsUploadingCover(true);
    }

    try {
      const processedFile = await cropAndResizeImage(file, kind);
      const formData = new FormData();
      formData.append("kind", kind);
      formData.append("file", processedFile);

      const response = await fetch("/api/employer/assets/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      if (kind === "logo") {
        setLogoUrl(data.url);
      } else {
        setCoverImageUrl(data.url);
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Failed to upload image");
    } finally {
      if (kind === "logo") {
        setIsUploadingLogo(false);
      } else {
        setIsUploadingCover(false);
      }
    }
  }

  function setDragState(kind: "logo" | "cover", active: boolean) {
    if (kind === "logo") {
      setIsDraggingLogo(active);
    } else {
      setIsDraggingCover(active);
    }
  }

  function handleAssetDrag(
    kind: "logo" | "cover",
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();
    setDragState(kind, event.type === "dragenter" || event.type === "dragover");
  }

  function handleAssetDrop(
    kind: "logo" | "cover",
    event: React.DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    event.stopPropagation();
    setDragState(kind, false);
    void uploadAsset(kind, event.dataTransfer.files?.[0] ?? null);
  }

  useEffect(() => {
    async function loadEmployer() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: employer } = await supabase
        .from("employers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const emp = employer as Employer | null;

      if (emp) {
        setName(emp.name || "");
        setDescription(emp.description || "");
        setWebsite(emp.website || "");
        setLocation(emp.location || "");
        setLogoUrl(emp.logo_url || "");
        setCoverImageUrl(emp.cover_image_url || "");
        setCompanySize(emp.company_size || "");
        setIndustry(emp.industry || "");
        setCultureSummary(emp.culture_summary || "");
        setHiringProcess(emp.hiring_process || "");
        setWorkplaceHighlights((emp.workplace_highlights || []).join(", "));
        setResponseTimeDays(emp.response_time_days ? String(emp.response_time_days) : "");
        setEmailNotifications(emp.email_notifications ?? true);
        setWhatsappNotifications(emp.whatsapp_notifications ?? false);
        setWhatsappNumber(emp.whatsapp_number || "");
        setIsVerified(emp.is_verified ?? false);
      }
    }
    loadEmployer();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
      setSuccess(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const employersTable = supabase.from(
      "employers"
    ) as unknown as EmployerMutationTable;

    const result = await employersTable
      .update({
      name,
      description,
      website,
      location,
        logo_url: logoUrl,
        cover_image_url: coverImageUrl,
        company_size: companySize || null,
        industry: industry || null,
        culture_summary: cultureSummary || null,
        hiring_process: hiringProcess || null,
        workplace_highlights: workplaceHighlights
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        response_time_days: responseTimeDays ? parseInt(responseTimeDays, 10) : null,
      } as EmployerUpdate)
      .eq("user_id", user.id);

    setIsLoading(false);

    const updateError = (result as { error: Error | null }).error;

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
    }
  }

  const profileCompleteness = deriveEmployerProfileCompleteness({
    description,
    website,
    logo_url: logoUrl,
    cover_image_url: coverImageUrl,
    company_size: companySize,
    industry,
    culture_summary: cultureSummary,
    hiring_process: hiringProcess,
    workplace_highlights: workplaceHighlights
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    response_time_days: responseTimeDays ? parseInt(responseTimeDays, 10) : null,
  });

  const logoFallback = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="24" fill="#f3f4f6"/>
      <text x="64" y="76" font-family="Arial, sans-serif" font-size="52" font-weight="700" text-anchor="middle" fill="#6b7280">${
        name?.charAt(0)?.toUpperCase() || "L"
      }</text>
    </svg>`
  )}`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Company Profile</h1>

      {error && (
        <div className="rounded-xl bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl bg-success/10 p-4 text-sm text-success">
          Profile updated successfully
        </div>
      )}

      <Card className="overflow-hidden">
        {coverImageUrl && (
          <div className="h-32 w-full overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20">
            <img src={coverImageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Branding
          </h2>
          <div className="mt-4 space-y-5">
            <div className="space-y-3">
              <Input
                label="Cover Image URL"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => coverFileRef.current?.click()}
                  isLoading={isUploadingCover}
                >
                  Upload cover image
                </Button>
                <span className="text-xs text-muted-foreground">
                  Auto-cropped to 1600 x 900 before upload
                </span>
              </div>
              <div
                className={`rounded-2xl border border-dashed p-4 transition-colors ${
                  isDraggingCover
                    ? "border-primary bg-primary/5"
                    : "border-border/60 bg-muted/20"
                }`}
                onDragEnter={(event) => handleAssetDrag("cover", event)}
                onDragOver={(event) => handleAssetDrag("cover", event)}
                onDragLeave={() => setDragState("cover", false)}
                onDrop={(event) => handleAssetDrop("cover", event)}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Drag and drop a cover image
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Or choose a file from your device. The uploaded file will
                      replace the URL field.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => coverFileRef.current?.click()}
                    isLoading={isUploadingCover}
                  >
                    Choose file
                  </Button>
                </div>
              </div>
              <input
                ref={coverFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void uploadAsset("cover", e.target.files?.[0] ?? null);
                  e.currentTarget.value = "";
                }}
              />
            </div>

            <div className="space-y-3">
              <Input
                label="Logo URL"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => logoFileRef.current?.click()}
                  isLoading={isUploadingLogo}
                >
                  Upload logo
                </Button>
                <span className="text-xs text-muted-foreground">
                  Auto-cropped to 512 x 512 before upload
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 p-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-background">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = logoFallback;
                      }}
                    />
                  ) : (
                    <span className="text-lg font-semibold text-muted-foreground">
                      {name?.charAt(0)?.toUpperCase() || "L"}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Logo thumbnail preview
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This reflects the URL field and the uploaded file result.
                  </p>
                </div>
              </div>
              <div
                className={`rounded-2xl border border-dashed p-4 transition-colors ${
                  isDraggingLogo
                    ? "border-primary bg-primary/5"
                    : "border-border/60 bg-muted/20"
                }`}
                onDragEnter={(event) => handleAssetDrag("logo", event)}
                onDragOver={(event) => handleAssetDrag("logo", event)}
                onDragLeave={() => setDragState("logo", false)}
                onDrop={(event) => handleAssetDrop("logo", event)}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Drag and drop a logo
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Or choose a file from your device. The uploaded file will
                      replace the URL field.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoFileRef.current?.click()}
                    isLoading={isUploadingLogo}
                  >
                    Choose file
                  </Button>
                </div>
              </div>
              <input
                ref={logoFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void uploadAsset("logo", e.target.files?.[0] ?? null);
                  e.currentTarget.value = "";
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Company Information
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Input
            label="Company Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell candidates about your company culture, mission, and values..."
            className="min-h-[120px]"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Company Size"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              options={COMPANY_SIZES.map((s) => ({ value: s, label: s }))}
              placeholder="Select size"
            />
            <Select
              label="Industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              options={SECTORS.map((s) => ({ value: s, label: s }))}
              placeholder="Select industry"
            />
          </div>
          <Input
            label="Website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://company.com"
          />
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Sliema, Malta"
          />
          <Textarea
            label="Culture Summary"
            value={cultureSummary}
            onChange={(e) => setCultureSummary(e.target.value)}
            placeholder="Describe how your team works, communicates, and grows."
            className="min-h-[100px]"
          />
          <Textarea
            label="Hiring Process"
            value={hiringProcess}
            onChange={(e) => setHiringProcess(e.target.value)}
            placeholder="Explain your interview stages and timelines."
            className="min-h-[100px]"
          />
          <Input
            label="Workplace Highlights"
            value={workplaceHighlights}
            onChange={(e) => setWorkplaceHighlights(e.target.value)}
            placeholder="Remote-friendly, Health insurance, Learning budget"
          />
          <Input
            label="Expected Response Time (days)"
            type="number"
            min="1"
            value={responseTimeDays}
            onChange={(e) => setResponseTimeDays(e.target.value)}
            placeholder="5"
          />
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Profile Strength
        </h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Employer brand completeness</p>
            <span className="text-sm font-semibold text-foreground">
              {profileCompleteness.score}/100
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${profileCompleteness.score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {profileCompleteness.level === "high"
              ? "Your company profile is strong and candidate-friendly."
              : profileCompleteness.level === "medium"
                ? "Your profile is solid, but a few more trust signals would help conversion."
                : "Your profile needs more detail to build candidate trust."}
          </p>
          {profileCompleteness.missing.length > 0 && (
            <ul className="space-y-1 text-xs text-muted-foreground">
              {profileCompleteness.missing.slice(0, 4).map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Verification
        </h2>
        <div className="mt-4">
          {isVerified ? (
            <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
              <ShieldCheck className="h-6 w-6 text-success" />
              <div>
                <p className="font-medium text-success">Verified Employer</p>
                <p className="text-xs text-muted-foreground">
                  Your company has been verified. A badge appears on your profile and job listings.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border/50 p-4">
              <div className="flex items-center gap-3">
                <ShieldX className="h-6 w-6 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-foreground">Not Verified</p>
                  <p className="text-xs text-muted-foreground">
                    Verified employers get a trust badge, higher visibility, and 3x more applications.
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">To get verified:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Complete your company profile (description, website, logo)</li>
                  <li>• Post at least 1 job listing</li>
                  <li>• Contact us at <span className="text-primary">hello@impjieg.com</span></li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-foreground">
          Notifications
        </h2>
        <form action={async (formData) => {
          const result = await updateNotificationSettings(formData);
          if (result.success) {
            setSuccess(true);
          }
        }} className="mt-4 space-y-4">
          <label className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-4 py-3 cursor-pointer hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              name="emailNotifications"
              defaultChecked={emailNotifications}
              className="h-4 w-4 rounded border-border/60 text-primary focus:ring-primary/40"
            />
            <div>
              <p className="text-sm font-medium text-foreground">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Get notified when candidates apply</p>
            </div>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-4 py-3 cursor-pointer hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              name="whatsappNotifications"
              defaultChecked={whatsappNotifications}
              onChange={(e) => setWhatsappNotifications(e.target.checked)}
              className="h-4 w-4 rounded border-border/60 text-primary focus:ring-primary/40"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">WhatsApp Notifications</p>
              <p className="text-xs text-muted-foreground">Instant alerts via WhatsApp</p>
            </div>
          </label>

          {whatsappNotifications && (
            <Input
              label="WhatsApp Number"
              name="whatsappNumber"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+356 7900 0000"
            />
          )}

          <Button
            type="submit"
            variant="primary"
          >
            Save Notification Settings
          </Button>
        </form>
      </Card>
    </div>
  );
}
