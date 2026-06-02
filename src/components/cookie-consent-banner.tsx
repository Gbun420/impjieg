"use client";

import { useState } from "react";
import Link from "next/link";
import { useCookieConsent, type CookieCategory } from "@/hooks/use-cookie-consent";
import { useHydrated } from "@/hooks/use-hydrated";

const categories: {
  key: CookieCategory;
  label: string;
  description: string;
  required?: boolean;
}[] = [
  {
    key: "necessary",
    label: "Necessary",
    description: "Required for the site to function. Cannot be disabled.",
    required: true,
  },
  {
    key: "preferences",
    label: "Preferences",
    description: "Remember your settings like theme and language.",
  },
  {
    key: "analytics",
    label: "Analytics",
    description: "Help us understand how visitors use the site.",
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Used to deliver relevant ads and measure campaign performance.",
  },
];

export default function CookieConsentBanner() {
  const { consent, hasConsented, saveConsent, acceptAll, rejectAll } =
    useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [localConsent, setLocalConsent] = useState(consent);
  const hydrated = useHydrated();
  if (!hydrated || hasConsented) return null;

  const handleToggle = (key: CookieCategory) => {
    if (key === "necessary") return;
    setLocalConsent((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveCustom = () => {
    saveConsent(localConsent);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {!showDetails ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <p className="text-sm text-foreground">
                We use cookies to enhance your experience. Some are essential;
                others help us improve the site and deliver relevant content.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Read our{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/cookies"
                  className="underline hover:text-foreground transition-colors"
                >
                  Cookie Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                type="button"
                onClick={rejectAll}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Reject All
              </button>
              <button
                type="button"
                onClick={() => setShowDetails(true)}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Customize
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Cookie Preferences
              </h3>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
              >
                Back
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {categories.map(({ key, label, description, required }) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border/50 p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {label}
                      </span>
                      {required && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={required}
                    onClick={() => handleToggle(key)}
                    className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                      localConsent[key]
                        ? "bg-indigo-600"
                        : "bg-muted"
                    } ${required ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    aria-label={`Toggle ${label} cookies`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform ${
                        localConsent[key]
                          ? "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleSaveCustom}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
