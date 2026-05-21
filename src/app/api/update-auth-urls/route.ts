import { NextResponse } from "next/server";
import { requireInternalAdminToken } from "../_lib/internal-route-guard";

export async function POST(request: Request) {
  const forbidden = requireInternalAdminToken(request);
  if (forbidden) {
    return forbidden;
  }

  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const productionUrl = "https://impjieg.vercel.app";

    // Update Supabase auth settings
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        site_url: productionUrl,
        uri_allow_list: [
          productionUrl,
          `${productionUrl}/auth/callback`,
        ],
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { status: "error", message: result.message || "Failed to update auth settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "Auth settings updated. New verification emails will use the production URL.",
      settings: {
        site_url: productionUrl,
        uri_allow_list: [
          productionUrl,
          `${productionUrl}/auth/callback`,
        ],
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { status: "error", message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const forbidden = requireInternalAdminToken(request);
  if (forbidden) {
    return forbidden;
  }

  return NextResponse.json({
    status: "ready",
    message: "POST to update Supabase auth redirect URLs to production",
  });
}
