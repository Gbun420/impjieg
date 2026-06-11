"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PermitFitResultCard } from "./permitfit-result-card";
import { 
  TCN_SUPPORT_LEVELS, 
  PERMIT_ROUTES_SUPPORTED, 
  CANDIDATE_WORK_STATUS_OPTIONS, 
  PRE_DEPARTURE_COURSE_OPTIONS 
} from "@/lib/permitfit/constants";
import { calculatePermitFit, PermitFitInput, PermitFitResult } from "@/lib/permitfit/scoring";
import { SECTORS } from "@/lib/constants";

export function PermitFitForm() {
  const [form, setForm] = useState<PermitFitInput>({
    roleTitle: "",
    sector: "",
    salaryMin: null,
    salaryMax: null,
    tcnSupportLevel: "none",
    permitRoutesSupported: [],
    requiresCandidateInMalta: false,
    supportsAccommodation: false,
    supportsRelocation: false,
    supportsPreDepartureCourse: false,
    candidateWorkStatus: "unknown",
    candidateCurrentCountry: "",
    candidateAlreadyInMalta: false,
    candidateHasMalteseResidenceCard: false,
    candidateNeedsChangeOfEmployer: false,
    candidatePermitExpiryDate: "",
    candidatePreDepartureCourseStatus: "not_required_or_unknown",
    candidateEarliestStartDate: "",
    candidateNeedsAccommodation: false,
    candidateNeedsRelocation: false,
  });

  const [result, setResult] = useState<PermitFitResult>(() => calculatePermitFit(form));

  const updateForm = (key: keyof PermitFitInput, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleRoute = (route: string) => {
    setForm((prev) => {
      const current = prev.permitRoutesSupported;
      if (current.includes(route)) {
        return { ...prev, permitRoutesSupported: current.filter((r) => r !== route) };
      } else {
        return { ...prev, permitRoutesSupported: [...current, route] };
      }
    });
  };

  const handleCalculate = () => {
    setResult(calculatePermitFit(form));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Role / employer support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Role title</label>
                <Input 
                  value={form.roleTitle || ""} 
                  onChange={(e) => updateForm("roleTitle", e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
              <Select
                label="Sector"
                options={[
                  { value: "", label: "Select sector" },
                  ...SECTORS.map((s) => ({ value: s, label: s }))
                ]}
                value={form.sector || ""}
                onChange={(e) => updateForm("sector", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium mb-1.5">Salary min (€)</label>
                <Input 
                  type="number"
                  value={form.salaryMin || ""} 
                  onChange={(e) => updateForm("salaryMin", e.target.value ? Number(e.target.value) : null)}
                  placeholder="e.g. 30000"
                />
              </div>
               <div>
                <label className="block text-sm font-medium mb-1.5">Salary max (€)</label>
                <Input 
                  type="number"
                  value={form.salaryMax || ""} 
                  onChange={(e) => updateForm("salaryMax", e.target.value ? Number(e.target.value) : null)}
                  placeholder="e.g. 50000"
                />
              </div>
            </div>

            <Select
              label="TCN support level"
              options={[...TCN_SUPPORT_LEVELS]}
              value={form.tcnSupportLevel}
              onChange={(e) => updateForm("tcnSupportLevel", e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Supported routes</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PERMIT_ROUTES_SUPPORTED.map((route) => (
                  <label key={route.value} className="flex items-center space-x-2 text-sm cursor-pointer">
                    <Checkbox 
                      checked={form.permitRoutesSupported.includes(route.value)}
                      onCheckedChange={() => toggleRoute(route.value)}
                    />
                    <span>{route.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/50">
               <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <Checkbox 
                  checked={form.requiresCandidateInMalta}
                  onCheckedChange={(c) => updateForm("requiresCandidateInMalta", !!c)}
                />
                <span>Candidate must already be in Malta</span>
              </label>
               <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <Checkbox 
                  checked={form.supportsAccommodation}
                  onCheckedChange={(c) => updateForm("supportsAccommodation", !!c)}
                />
                <span>Supports accommodation</span>
              </label>
               <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <Checkbox 
                  checked={form.supportsRelocation}
                  onCheckedChange={(c) => updateForm("supportsRelocation", !!c)}
                />
                <span>Supports relocation</span>
              </label>
               <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <Checkbox 
                  checked={form.supportsPreDepartureCourse}
                  onCheckedChange={(c) => updateForm("supportsPreDepartureCourse", !!c)}
                />
                <span>Supports pre-departure course</span>
              </label>
            </div>
            
            <div className="pt-2">
              <label className="block text-sm font-medium mb-1.5">Employer notes</label>
              <Textarea 
                 placeholder="Any additional permit-related support notes..."
                 onChange={(e) => {}} // Not actively used in scoring, but available for context
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Candidate work-status signal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Candidate work status"
              options={[...CANDIDATE_WORK_STATUS_OPTIONS]}
              value={form.candidateWorkStatus}
              onChange={(e) => updateForm("candidateWorkStatus", e.target.value)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Current country</label>
                <Input 
                  value={form.candidateCurrentCountry || ""} 
                  onChange={(e) => updateForm("candidateCurrentCountry", e.target.value)}
                  placeholder="e.g. Philippines"
                />
              </div>
               <div>
                <label className="block text-sm font-medium mb-1.5">Permit expiry date</label>
                <Input 
                  type="date"
                  value={form.candidatePermitExpiryDate || ""} 
                  onChange={(e) => updateForm("candidatePermitExpiryDate", e.target.value)}
                />
              </div>
            </div>

            <Select
              label="Pre-departure course status"
              options={[...PRE_DEPARTURE_COURSE_OPTIONS]}
              value={form.candidatePreDepartureCourseStatus}
              onChange={(e) => updateForm("candidatePreDepartureCourseStatus", e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium mb-1.5">Earliest realistic start date</label>
              <Input 
                type="date"
                value={form.candidateEarliestStartDate || ""} 
                onChange={(e) => updateForm("candidateEarliestStartDate", e.target.value)}
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-border/50">
               <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <Checkbox 
                  checked={form.candidateAlreadyInMalta}
                  onCheckedChange={(c) => updateForm("candidateAlreadyInMalta", !!c)}
                />
                <span>Already in Malta</span>
              </label>
               <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <Checkbox 
                  checked={form.candidateHasMalteseResidenceCard}
                  onCheckedChange={(c) => updateForm("candidateHasMalteseResidenceCard", !!c)}
                />
                <span>Has Maltese residence card</span>
              </label>
               <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <Checkbox 
                  checked={form.candidateNeedsChangeOfEmployer}
                  onCheckedChange={(c) => updateForm("candidateNeedsChangeOfEmployer", !!c)}
                />
                <span>Needs change of employer</span>
              </label>
               <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <Checkbox 
                  checked={form.candidateNeedsAccommodation}
                  onCheckedChange={(c) => updateForm("candidateNeedsAccommodation", !!c)}
                />
                <span>Needs accommodation</span>
              </label>
               <label className="flex items-center space-x-2 text-sm cursor-pointer">
                <Checkbox 
                  checked={form.candidateNeedsRelocation}
                  onCheckedChange={(c) => updateForm("candidateNeedsRelocation", !!c)}
                />
                <span>Needs relocation</span>
              </label>
            </div>
            
          </CardContent>
        </Card>

        <Button onClick={handleCalculate} size="lg" className="w-full font-medium text-base">
          Calculate PermitFit signal
        </Button>
      </div>

      <div className="lg:sticky lg:top-8 h-full min-h-[400px]">
        <PermitFitResultCard result={result} />
      </div>
    </div>
  );
}
