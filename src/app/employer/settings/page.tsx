"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { SECTORS } from "@/lib/constants";
import type { Employer } from "@/lib/supabase/types";

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

    const result = await supabase
      .from("employers")
      .update({
        name,
        description,
        website,
        location,
        logo_url: logoUrl,
        cover_image_url: coverImageUrl,
        company_size: companySize || null,
        industry: industry || null,
      } as any)
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
    </div>
  );
}
