"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { CONSENT_TEXT } from "@/lib/legal/constants";

type LegalAcknowledgementCheckboxesProps = {
  audience: "candidate" | "employer" | "applicant" | "all";
  requireTerms?: boolean;
  requirePrivacyNotice?: boolean;
  allowMarketingConsent?: boolean;
  requireTalentDirectoryConsent?: boolean;
  requireApplicationProcessing?: boolean;
  onTermsChange?: (checked: boolean) => void;
  onPrivacyChange?: (checked: boolean) => void;
  onMarketingChange?: (checked: boolean) => void;
  onApplicationProcessingChange?: (checked: boolean) => void;
};

export function LegalAcknowledgementCheckboxes({
  audience,
  requireTerms = true,
  requirePrivacyNotice = true,
  allowMarketingConsent = false,
  requireTalentDirectoryConsent = false,
  requireApplicationProcessing = false,
  onTermsChange,
  onPrivacyChange,
  onMarketingChange,
  onApplicationProcessingChange,
}: LegalAcknowledgementCheckboxesProps) {
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [applicationProcessing, setApplicationProcessing] = useState(false);

  const handleTermsChange = (checked: boolean) => {
    setTerms(checked);
    onTermsChange?.(checked);
  };

  const handlePrivacyChange = (checked: boolean) => {
    setPrivacy(checked);
    onPrivacyChange?.(checked);
  };

  const handleMarketingChange = (checked: boolean) => {
    setMarketing(checked);
    onMarketingChange?.(checked);
  };

  const handleApplicationProcessingChange = (checked: boolean) => {
    setApplicationProcessing(checked);
    onApplicationProcessingChange?.(checked);
  };

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-muted/30 p-4">
      <p className="text-sm font-medium text-foreground">
        Legal acknowledgements
      </p>

      {requireTerms && (
        <div className="flex items-start gap-3">
          <Checkbox
            id="legal-terms"
            checked={terms}
            onCheckedChange={(checked) => handleTermsChange(checked as boolean)}
          />
          <label
            htmlFor="legal-terms"
            className="text-sm leading-snug text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {CONSENT_TEXT.terms}{" "}
            <Link
              href="/terms"
              target="_blank"
              className="text-primary hover:underline"
            >
              Read Terms of Service
            </Link>
          </label>
        </div>
      )}

      {requirePrivacyNotice && (
        <div className="flex items-start gap-3">
          <Checkbox
            id="legal-privacy"
            checked={privacy}
            onCheckedChange={(checked) => handlePrivacyChange(checked as boolean)}
          />
          <label
            htmlFor="legal-privacy"
            className="text-sm leading-snug text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {CONSENT_TEXT.privacy}{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="text-primary hover:underline"
            >
              Read Privacy Notice
            </Link>
          </label>
        </div>
      )}

      {requireApplicationProcessing && (
        <div className="flex items-start gap-3">
          <Checkbox
            id="legal-application-processing"
            checked={applicationProcessing}
            onCheckedChange={(checked) =>
              handleApplicationProcessingChange(checked as boolean)
            }
          />
          <label
            htmlFor="legal-application-processing"
            className="text-sm leading-snug text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {CONSENT_TEXT.applicationProcessing}
          </label>
        </div>
      )}

      {allowMarketingConsent && (
        <div className="flex items-start gap-3">
          <Checkbox
            id="legal-marketing"
            checked={marketing}
            onCheckedChange={(checked) =>
              handleMarketingChange(checked as boolean)
            }
          />
          <label
            htmlFor="legal-marketing"
            className="text-sm leading-snug text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {CONSENT_TEXT.marketing}
          </label>
        </div>
      )}

      {requireTalentDirectoryConsent && (
        <div className="flex items-start gap-3">
          <Checkbox
            id="legal-talent-directory"
            checked={false}
            onCheckedChange={() => {}}
          />
          <label
            htmlFor="legal-talent-directory"
            className="text-sm leading-snug text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {CONSENT_TEXT.talentDirectory}
          </label>
        </div>
      )}
    </div>
  );
}
