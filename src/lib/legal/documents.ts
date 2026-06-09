import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseServiceKey } from "@/lib/supabase/env";
import type { LegalDocument, LegalDocumentVersion } from "./types";
import { CURRENT_LEGAL_VERSIONS, type LegalDocumentSlug } from "./constants";

// ============================================================================
// Document Queries
// ============================================================================

export async function getLegalDocumentBySlug(
  slug: string
): Promise<LegalDocument | null> {
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  const { data } = await serviceSupabase
    .from("legal_documents")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return data as LegalDocument | null;
}

export async function getLegalDocumentVersion(
  documentId: string,
  version: string
): Promise<LegalDocumentVersion | null> {
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  const { data } = await serviceSupabase
    .from("legal_document_versions")
    .select("*")
    .eq("document_id", documentId)
    .eq("version", version)
    .maybeSingle();

  return data as LegalDocumentVersion | null;
}

export async function getCurrentLegalDocumentVersion(
  documentId: string
): Promise<LegalDocumentVersion | null> {
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  const { data } = await serviceSupabase
    .from("legal_document_versions")
    .select("*")
    .eq("document_id", documentId)
    .eq("is_current", true)
    .maybeSingle();

  return data as LegalDocumentVersion | null;
}

export async function getCurrentLegalDocumentVersions(
  audience: string,
  eventTypes?: string[]
): Promise<
  Array<{ document: LegalDocument; version: LegalDocumentVersion }>
> {
  const serviceSupabase = createServiceClient(
    getSupabaseUrl(),
    getSupabaseServiceKey()
  );

  // Get documents matching audience
  const { data: documents } = await serviceSupabase
    .from("legal_documents")
    .select("*")
    .eq("is_active", true)
    .or(`audience.eq.all,audience.eq.${audience}`);

  if (!documents || documents.length === 0) return [];

  const results: Array<{
    document: LegalDocument;
    version: LegalDocumentVersion;
  }> = [];

  for (const doc of documents) {
    const { data: version } = await serviceSupabase
      .from("legal_document_versions")
      .select("*")
      .eq("document_id", doc.id)
      .eq("is_current", true)
      .maybeSingle();

    if (version) {
      results.push({
        document: doc as LegalDocument,
        version: version as LegalDocumentVersion,
      });
    }
  }

  return results;
}

// ============================================================================
// Version Helpers
// ============================================================================

export function getExpectedVersion(slug: LegalDocumentSlug): string {
  return CURRENT_LEGAL_VERSIONS[slug] || "unknown";
}

export function buildConsentTextSnapshot(
  accepted: Record<string, boolean>
): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(accepted)) {
    parts.push(`${key}: ${value ? "accepted" : "not accepted"}`);
  }
  return parts.join("; ");
}
