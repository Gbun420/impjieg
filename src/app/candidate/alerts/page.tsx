"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Loader2,
  MapPin,
  Briefcase,
  Banknote,
} from "lucide-react";
import type { CandidateAlert } from "@/lib/supabase/types";

type CandidateAlertForm = {
  name: string;
  sectors: string[];
  job_types: string[];
  locations: string[];
  salary_min: number;
  remote_type: string;
  frequency: string;
  is_active: boolean;
};

const SECTORS = [
  "iGaming", "Technology", "Finance & Banking", "Healthcare",
  "Tourism & Hospitality", "Construction & Engineering", "Education",
  "Retail & E-commerce", "Legal & Compliance", "Marketing & Media",
  "Logistics & Transport", "Real Estate",
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];
const REMOTE_OPTIONS = ["On-site", "Remote", "Hybrid", "No preference"];
const FREQUENCIES = [
  { value: "instant", label: "Instant" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

export default function CandidateAlertsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<CandidateAlert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CandidateAlertForm>({
    name: "",
    sectors: [] as string[],
    job_types: [] as string[],
    locations: [] as string[],
    salary_min: 0,
    remote_type: "",
    frequency: "daily" as string,
    is_active: true,
  });
  const [locationInput, setLocationInput] = useState("");
  const nameId = "candidate-alert-name";
  const salaryMinId = "candidate-alert-salary-min";
  const remoteTypeId = "candidate-alert-remote-type";
  const frequencyId = "candidate-alert-frequency";
  const locationInputId = "candidate-alert-location";

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/candidate/alerts");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch alerts");
      }
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      setError("Unable to load your alerts right now. You can retry below.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const url = editingId
        ? `/api/candidate/alerts?id=${editingId}`
        : "/api/candidate/alerts";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setError(payload?.error || "Failed to save alert. Please try again.");
        return;
      }
      if (res.ok) {
        await fetchAlerts();
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save alert:", error);
      setError("Unable to save your alert right now. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/candidate/alerts?id=${id}`, { method: "DELETE" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setError(payload?.error || "Failed to delete alert. Please try again.");
        return;
      }
      await fetchAlerts();
    } catch (error) {
      console.error("Failed to delete alert:", error);
      setError("Unable to delete your alert right now. Please try again.");
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    setError(null);
    try {
      const res = await fetch(`/api/candidate/alerts?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setError(payload?.error || "Failed to update alert. Please try again.");
        return;
      }
      await fetchAlerts();
    } catch (error) {
      console.error("Failed to toggle alert:", error);
      setError("Unable to update your alert right now. Please try again.");
    }
  }

  function resetForm() {
    setFormData({
      name: "",
      sectors: [],
      job_types: [],
      locations: [],
      salary_min: 0,
      remote_type: "",
      frequency: "daily",
      is_active: true,
    });
    setShowForm(false);
    setEditingId(null);
    setLocationInput("");
  }

  function startEdit(alert: CandidateAlert) {
    setFormData({
      name: alert.name || "",
      sectors: alert.sectors || [],
      job_types: alert.job_types || [],
      locations: alert.locations || [],
      salary_min: alert.salary_min || 0,
      remote_type: alert.remote_type || "",
      frequency: alert.frequency || "daily",
      is_active: alert.is_active ?? true,
    });
    setEditingId(alert.id);
    setShowForm(true);
  }

  function toggleArrayItem(field: string, value: string) {
    const current = formData[field as keyof typeof formData] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  }

  function addLocation() {
    if (locationInput.trim() && !formData.locations.includes(locationInput.trim())) {
      setFormData({ ...formData, locations: [...formData.locations, locationInput.trim()] });
      setLocationInput("");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Job Alerts
          </h1>
          <p className="text-sm text-muted-foreground">
            Get notified about new jobs matching your criteria
          </p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)} className="self-start sm:self-auto">
            <Plus className="mr-1.5 h-4 w-4" />
            New Alert
          </Button>
        )}
      </div>

      {error && (
        <Card className="border-warning/30 bg-warning/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void fetchAlerts()}>
              Retry load
            </Button>
          </div>
        </Card>
      )}

      {/* Alert Form */}
      {showForm && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {editingId ? "Edit Alert" : "Create Job Alert"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label htmlFor={nameId} className="text-sm font-medium text-foreground">
                Alert Name
              </label>
              <Input
                id={nameId}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Senior Developer Roles"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={salaryMinId} className="text-sm font-medium text-foreground">
                Salary Min (€)
              </label>
              <Input
                id={salaryMinId}
                type="number"
                value={formData.salary_min || ""}
                onChange={(e) => setFormData({ ...formData, salary_min: parseInt(e.target.value) || 0 })}
                placeholder="30000"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={remoteTypeId} className="text-sm font-medium text-foreground">
                Remote Type
              </label>
              <select
                id={remoteTypeId}
                value={formData.remote_type}
                onChange={(e) => setFormData({ ...formData, remote_type: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Any</option>
                {REMOTE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor={frequencyId} className="text-sm font-medium text-foreground">
                Frequency
              </label>
              <select
                id={frequencyId}
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">Sectors</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SECTORS.map((sector) => (
                <button
                  key={sector}
                  type="button"
                  onClick={() => toggleArrayItem("sectors", sector)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    formData.sectors.includes(sector)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sector}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-foreground">Job Types</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {JOB_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleArrayItem("job_types", type)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    formData.job_types.includes(type)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label htmlFor={locationInputId} className="text-sm font-medium text-foreground">
              Locations
            </label>
            <div className="mt-2 flex gap-2">
              <Input
                id={locationInputId}
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLocation())}
                placeholder="Add location (e.g., Sliema)"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addLocation}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.locations.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.locations.map((loc) => (
                  <Badge key={loc} variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {loc}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, locations: formData.locations.filter((l) => l !== loc) })}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {editingId ? "Update Alert" : "Create Alert"}
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Alerts List */}
      {alerts.length === 0 && !showForm ? (
        <Card className="p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            No job alerts yet
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Create alerts to get notified about new jobs matching your criteria
          </p>
          <Button variant="primary" className="mt-6" onClick={() => setShowForm(true)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Create Your First Alert
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`p-5 transition-all ${!alert.is_active ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{alert.name}</h3>
                    <Badge variant={alert.is_active ? "success" : "secondary"} className="text-xs">
                      {alert.is_active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {alert.sectors?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {alert.sectors.join(", ")}
                      </span>
                    )}
                    {alert.locations?.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {alert.locations.join(", ")}
                      </span>
                    )}
                    {(alert.salary_min ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <Banknote className="h-3.5 w-3.5" />
                        €{(alert.salary_min ?? 0).toLocaleString()}+
                      </span>
                    )}
                    {alert.remote_type && (
                      <Badge variant="secondary" className="text-xs">{alert.remote_type}</Badge>
                    )}
                    <span className="text-xs">
                      {alert.frequency === "instant" ? "Instant" : alert.frequency === "daily" ? "Daily" : "Weekly"} digest
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => handleToggle(alert.id, alert.is_active ?? false)}>
                        {alert.is_active ? "Pause" : "Resume"}
                      </Button>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(alert)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(alert.id)}>
                    <Trash2 className="h-4 w-4 text-error" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
