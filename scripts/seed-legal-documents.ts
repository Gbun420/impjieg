/**
 * Legal Documents Seed Script
 *
 * Run: npm run legal:seed-docs
 * Creates the 7 base legal documents and their current versions.
 * Idempotent — safe to run multiple times.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import {
  LEGAL_DOCUMENTS,
  CURRENT_LEGAL_VERSIONS,
} from "@/lib/legal/constants";

type ServiceClient = ReturnType<typeof createClient<Database>>;

function getServiceClient(): ServiceClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(url, key);
}

function isMissingTableError(msg: string): boolean {
  const lower = msg.toLowerCase();
  return lower.includes("does not exist") || lower.includes("relation");
}

async function seedLegalDocuments() {
  const supabase = getServiceClient();

  // Check tables exist first
  const { error: docTableErr } = await supabase
    .from("legal_documents")
    .select("id")
    .limit(1);

  if (docTableErr && isMissingTableError(docTableErr.message)) {
    console.error("[Legal Seed] legal_documents table does not exist — run the migration first");
    console.error("[Legal Seed] Migration: supabase/migrations/XXX_legal_receipt_workflow.sql");
    process.exit(1);
  }

  let created = 0;
  let existing = 0;
  let versionsCreated = 0;
  let versionsExisting = 0;

  for (const doc of LEGAL_DOCUMENTS) {
    // Upsert document
    const { data: existingDoc } = await supabase
      .from("legal_documents")
      .select("id, slug")
      .eq("slug", doc.slug)
      .maybeSingle();

    let documentId: string;

    if (existingDoc) {
      documentId = existingDoc.id;
      existing++;
    } else {
      const { data: newDoc, error: docError } = await supabase
        .from("legal_documents")
        .insert({
          slug: doc.slug,
          title: doc.title,
          description: doc.description,
          audience: doc.audience,
          is_active: true,
        })
        .select("id")
        .single();

      if (docError || !newDoc) {
        console.error(`[Legal Seed] Failed to create document "${doc.slug}": ${docError?.message}`);
        continue;
      }

      documentId = newDoc.id;
      created++;
    }

    // Create version
    const expectedVersion = CURRENT_LEGAL_VERSIONS[doc.slug];
    const { data: existingVersion } = await supabase
      .from("legal_document_versions")
      .select("id")
      .eq("document_id", documentId)
      .eq("version", expectedVersion)
      .maybeSingle();

    if (existingVersion) {
      versionsExisting++;
      continue;
    }

    const { error: versionError } = await supabase
      .from("legal_document_versions")
      .insert({
        document_id: documentId,
        version: expectedVersion,
        effective_at: new Date().toISOString(),
        content_hash: `seed-${doc.slug}-${expectedVersion}`,
        public_url: doc.publicUrl,
        summary: doc.description,
        is_current: true,
      });

    if (versionError) {
      console.error(`[Legal Seed] Failed to create version for "${doc.slug}": ${versionError.message}`);
    } else {
      versionsCreated++;
    }
  }

  console.log(`[Legal Seed] Done: ${created} docs created, ${existing} already existed`);
  console.log(`[Legal Seed] Done: ${versionsCreated} versions created, ${versionsExisting} already existed`);
}

seedLegalDocuments().catch((err) => {
  console.error("[Legal Seed] Fatal:", err);
  process.exit(1);
});
