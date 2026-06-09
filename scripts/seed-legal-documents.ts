import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import {
  LEGAL_DOCUMENTS,
  CURRENT_LEGAL_VERSIONS,
} from "@/lib/legal/constants";

type SupabaseAdminClient = ReturnType<typeof createClient<Database>>;

function getSupabaseClient(): SupabaseAdminClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(url, key);
}

async function seedLegalDocuments() {
  const supabase = getSupabaseClient();

  for (const doc of LEGAL_DOCUMENTS) {
    // Upsert document
    const { data: existingDoc } = await supabase
      .from("legal_documents")
      .select("id")
      .eq("slug", doc.slug)
      .maybeSingle();

    let documentId: string;

    if (existingDoc) {
      documentId = existingDoc.id;
      console.log(`[Legal] Document "${doc.slug}" already exists (id: ${documentId})`);
    } else {
      const { data: newDoc, error: docError } = await supabase
        .from("legal_documents")
        .insert({
          slug: doc.slug,
          title: doc.title,
          description: doc.description,
          audience: doc.audience,
          public_url: doc.publicUrl,
          is_active: true,
        })
        .select("id")
        .single();

      if (docError || !newDoc) {
        console.error(`[Legal] Failed to create document "${doc.slug}":`, docError?.message);
        continue;
      }

      documentId = newDoc.id;
      console.log(`[Legal] Created document "${doc.slug}" (id: ${documentId})`);
    }

    // Check if current version already exists
    const expectedVersion = CURRENT_LEGAL_VERSIONS[doc.slug];
    const { data: existingVersion } = await supabase
      .from("legal_document_versions")
      .select("id")
      .eq("document_id", documentId)
      .eq("version", expectedVersion)
      .maybeSingle();

    if (existingVersion) {
      console.log(`[Legal] Version "${expectedVersion}" for "${doc.slug}" already exists`);
      continue;
    }

    // Create version
    const { error: versionError } = await supabase
      .from("legal_document_versions")
      .insert({
        document_id: documentId,
        version: expectedVersion,
        content_hash: `seed-${doc.slug}-${expectedVersion}`,
        is_current: true,
      });

    if (versionError) {
      console.error(`[Legal] Failed to create version for "${doc.slug}":`, versionError.message);
    } else {
      console.log(`[Legal] Created version "${expectedVersion}" for "${doc.slug}"`);
    }
  }

  console.log("[Legal] Seed complete");
}

seedLegalDocuments().catch((err) => {
  console.error("[Legal] Seed failed:", err);
  process.exit(1);
});
