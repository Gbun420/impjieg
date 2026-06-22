import { NextResponse } from "next/server";
import { runImport } from "@/lib/aggregator/import-runner";

// Imports fetch external feeds + write to the DB — always run on Node, never cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization");
  const adminHeader = request.headers.get("x-internal-admin-token");
  const cronSecret = process.env.CRON_SECRET;
  const adminSecret = process.env.INTERNAL_ADMIN_TOKEN;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }
  if (adminSecret && adminHeader === adminSecret) {
    return true;
  }
  return false;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const dryRun = searchParams.get("dryRun") === "true";
  const sourceId = searchParams.get("sourceId") || undefined;
  const perSourceLimitParam = searchParams.get("limit");
  const perSourceLimit = perSourceLimitParam
    ? Math.min(parseInt(perSourceLimitParam, 10) || 0, 500)
    : undefined;

  try {
    const summary = await runImport({ dryRun, sourceId, perSourceLimit });
    return NextResponse.json({ success: true, ...summary });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Import failed" },
      { status: 500 }
    );
  }
}
