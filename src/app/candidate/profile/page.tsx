"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Briefcase,
  MapPin,
  Phone,
  Globe,
  Link2,
  FileText,
  Plus,
  X,
  Save,
  Loader2,
  CheckCircle2,
  Sparkles,
  Upload,
  AlertCircle,
} from "lucide-react";

type CandidateProfileForm = {
  full_name: string;
  headline: string;
  bio: string;
  phone: string;
  location: string;
  website: string;
  linkedin_url: string;
  skills: string[];
  experience_years: number;
  desired_salary_min: number;
  desired_salary_max: number;
  job_types: string[];
  sectors: string[];
  remote_preference: string;
  is_open_to_work: boolean;
};

const SECTORS = [
  "iGaming", "Technology", "Finance & Banking", "Healthcare",
  "Tourism & Hospitality", "Construction & Engineering", "Education",
  "Retail & E-commerce", "Legal & Compliance", "Marketing & Media",
  "Logistics & Transport", "Real Estate",
];

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"];

const REMOTE_OPTIONS = ["On-site", "Remote", "Hybrid", "No preference"];

export default function CandidateProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<CandidateProfileForm | null>(null);
  const [formData, setFormData] = useState<CandidateProfileForm>({
    full_name: "",
    headline: "",
    bio: "",
    phone: "",
    location: "",
    website: "",
    linkedin_url: "",
    skills: [] as string[],
    experience_years: 0,
    desired_salary_min: 0,
    desired_salary_max: 0,
    job_types: [] as string[],
    sectors: [] as string[],
    remote_preference: "",
    is_open_to_work: true,
  });
  const [skillInput, setSkillInput] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseSuccess, setParseSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const res = await fetch("/api/candidate/profile");
        const data = await res.json();
        if (!cancelled && data.profile) {
          setProfile(data.profile);
          setFormData({
            full_name: data.profile.full_name || "",
            headline: data.profile.headline || "",
            bio: data.profile.bio || "",
            phone: data.profile.phone || "",
            location: data.profile.location || "",
            website: data.profile.website || "",
            linkedin_url: data.profile.linkedin_url || "",
            skills: data.profile.skills || [],
            experience_years: data.profile.experience_years || 0,
            desired_salary_min: data.profile.desired_salary_min || 0,
            desired_salary_max: data.profile.desired_salary_max || 0,
            job_types: data.profile.job_types || [],
            sectors: data.profile.sectors || [],
            remote_preference: data.profile.remote_preference || "",
            is_open_to_work: data.profile.is_open_to_work ?? true,
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function parseResume() {
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      setParseError("Please paste at least 50 characters of resume text");
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setParseSuccess(false);

    try {
      const res = await fetch("/api/ai/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setParseError(data.error || "Failed to parse resume");
        return;
      }

      const parsed = data.parsed;

      // Auto-fill profile fields from parsed resume
      setFormData((prev) => ({
        ...prev,
        full_name: parsed.fullName || prev.full_name,
        headline: parsed.headline || prev.headline,
        bio: parsed.bio || prev.bio,
        phone: parsed.phone || prev.phone,
        location: parsed.location || prev.location,
        skills: parsed.skills?.length > 0 ? [...new Set([...prev.skills, ...parsed.skills])] : prev.skills,
        experience_years: parsed.experienceYears || prev.experience_years,
        sectors: parsed.sectors?.length > 0 ? [...new Set([...prev.sectors, ...parsed.sectors])] : prev.sectors,
        job_types: parsed.jobTypes?.length > 0 ? [...new Set([...prev.job_types, ...parsed.jobTypes])] : prev.job_types,
      }));

      setParseSuccess(true);
      setResumeText("");
      setTimeout(() => setParseSuccess(false), 5000);
    } catch {
      setParseError("Something went wrong. Please try again.");
    } finally {
      setIsParsing(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/candidate/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  }

  function addSkill() {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput("");
    }
  }

  function removeSkill(skill: string) {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skill) });
  }

  function toggleArrayItem(field: "job_types" | "sectors", value: string) {
    const current = formData[field];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
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
      <div className="flex items-center gap-4">
        <Link href="/candidate/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Profile
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete your profile to get better job matches
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              Personal Information
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Headline</label>
                <Input
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="Senior Software Engineer"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell employers about yourself..."
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+356 9999 9999"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Sliema, Malta"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Website
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yoursite.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5" /> LinkedIn
                </label>
                <Input
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Skills
            </h2>
            <div className="mt-4">
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill (e.g., React, Project Management)"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {formData.skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              Job Preferences
            </h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Experience (years)</label>
                <Input
                  type="number"
                  value={formData.experience_years || ""}
                  onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                  placeholder="5"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Remote Preference</label>
                <select
                  value={formData.remote_preference}
                  onChange={(e) => setFormData({ ...formData, remote_preference: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select preference</option>
                  {REMOTE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Desired Salary Min (€)</label>
                <Input
                  type="number"
                  value={formData.desired_salary_min || ""}
                  onChange={(e) => setFormData({ ...formData, desired_salary_min: parseInt(e.target.value) || 0 })}
                  placeholder="30000"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Desired Salary Max (€)</label>
                <Input
                  type="number"
                  value={formData.desired_salary_max || ""}
                  onChange={(e) => setFormData({ ...formData, desired_salary_max: parseInt(e.target.value) || 0 })}
                  placeholder="50000"
                  min="0"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-foreground">Job Types</label>
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

            <div className="mt-6">
              <label className="text-sm font-medium text-foreground">Preferred Sectors</label>
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

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, is_open_to_work: !formData.is_open_to_work })}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                  formData.is_open_to_work ? "bg-green-500" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform ${
                    formData.is_open_to_work ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-foreground">
                {formData.is_open_to_work ? "Open to work" : "Not actively looking"}
              </span>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Resume Parser */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Resume Parser
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Paste your resume text to auto-fill your profile
            </p>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume/CV text here..."
              className="mt-3 w-full min-h-[120px] rounded-lg border border-border bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            />
            <Button
              variant="primary"
              size="sm"
              className="mt-2 w-full"
              onClick={parseResume}
              isLoading={isParsing}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Parse &amp; Fill Profile
            </Button>
            {parseError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-error">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {parseError}
              </div>
            )}
            {parseSuccess && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-success">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                Profile updated! Review and save.
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-foreground">Profile Tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                Add a professional headline
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                List at least 5 relevant skills
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                Select your preferred sectors
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                Set salary expectations
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
