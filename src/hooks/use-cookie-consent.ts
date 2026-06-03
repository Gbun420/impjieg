"use client";

import { useState, useCallback } from "react";

export type CookieCategory = "necessary" | "analytics" | "marketing" | "preferences";

export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const CONSENT_KEY = "impjieg_cookie_consent";
const CONSENT_VERSION = 1;

const defaultConsent: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

function getStoredConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed.consent as CookieConsent;
  } catch {
    return null;
  }
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent>(
    () => getStoredConsent() ?? defaultConsent
  );
  const [hasConsented, setHasConsented] = useState(
    () => getStoredConsent() !== null
  );
  const mounted = typeof window !== "undefined";

  const saveConsent = useCallback((newConsent: CookieConsent) => {
    setConsent(newConsent);
    setHasConsented(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({ version: CONSENT_VERSION, consent: newConsent })
      );
      window.dispatchEvent(new CustomEvent("cookieConsentChanged", { detail: newConsent }));
    }
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  }, [saveConsent]);

  const rejectAll = useCallback(() => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  }, [saveConsent]);

  const resetConsent = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(CONSENT_KEY);
      setConsent(defaultConsent);
      setHasConsented(false);
    }
  }, []);

  return {
    consent,
    hasConsented,
    mounted,
    saveConsent,
    acceptAll,
    rejectAll,
    resetConsent,
  };
}
