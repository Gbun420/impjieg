import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseServiceKey, getSupabaseUrl } from "@/lib/supabase/env";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import {
  EMPLOYER_ASSET_ALLOWED_MIME_TYPES,
  EMPLOYER_ASSET_MAX_BYTES,
  EMPLOYER_ASSETS_BUCKET,
  getEmployerAssetPath,
  type EmployerAssetKind,
} from "@/lib/employer-assets";

async function ensureBucketExists(supabase: {
  storage: {
    listBuckets(): Promise<{
      data: Array<{ name: string }> | null;
      error: { message: string } | null;
    }>;
    createBucket(
      id: string,
      options: {
        public: boolean;
        fileSizeLimit?: number;
        allowedMimeTypes?: string[];
      }
    ): Promise<{ error: { message: string } | null }>;
  };
}) {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    throw new Error(listError.message);
  }

  const bucketExists = buckets?.some((bucket) => bucket.name === EMPLOYER_ASSETS_BUCKET);
  if (bucketExists) {
    return;
  }

  const { error: createError } = await supabase.storage.createBucket(
    EMPLOYER_ASSETS_BUCKET,
    {
      public: true,
      fileSizeLimit: EMPLOYER_ASSET_MAX_BYTES,
      allowedMimeTypes: EMPLOYER_ASSET_ALLOWED_MIME_TYPES,
    }
  );

  if (createError) {
    throw new Error(createError.message);
  }
}

function asAssetKind(value: string | null): EmployerAssetKind | null {
  if (value === "logo" || value === "cover") {
    return value;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const sessionSupabase = await createSessionClient();
    const {
      data: { user },
    } = await sessionSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const kind = asAssetKind(String(formData.get("kind") ?? ""));
    const file = formData.get("file");

    if (!kind) {
      return NextResponse.json({ error: "Invalid asset type" }, { status: 400 });
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Please select an image file" }, { status: 400 });
    }

    if (file.size > EMPLOYER_ASSET_MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be 5 MB or smaller" },
        { status: 400 }
      );
    }

    if (file.type && !EMPLOYER_ASSET_ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use JPG, PNG, WebP, GIF, or AVIF." },
        { status: 400 }
      );
    }

    const supabase = createClient(getSupabaseUrl(), getSupabaseServiceKey());
    await ensureBucketExists(supabase);

    const path = getEmployerAssetPath(user.id, kind, file.name);
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from(EMPLOYER_ASSETS_BUCKET)
      .upload(path, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload image" },
        { status: 500 }
      );
    }

    const { data } = supabase.storage
      .from(EMPLOYER_ASSETS_BUCKET)
      .getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl, path });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
