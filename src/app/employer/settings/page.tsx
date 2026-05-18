"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import type { Employer } from "@/lib/supabase/types";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

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
      .update({ name, description, website, location, logo_url: logoUrl } as any)
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
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {error && (
        <div className="rounded-lg bg-error/10 p-4 text-sm text-error">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-success/10 p-4 text-sm text-success">
          Settings updated successfully
        </div>
      )}

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
            placeholder="Tell candidates about your company..."
          />
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
          <Input
            label="Logo URL"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
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
