"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { SECTORS } from "@/lib/constants";
import { updateNotificationSettings } from "@/lib/actions/notifications";
import { Shield, ShieldCheck, ShieldX } from "lucide-react";
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
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isVerified, setIsVerified] = useState(false);

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
          <div className="mt-4 space-y-4">
            <Input
              label="Cover Image URL"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://example.com/cover.jpg"
            />
            <Input
              label="Logo URL"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
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
