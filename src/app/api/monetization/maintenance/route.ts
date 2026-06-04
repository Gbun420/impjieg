import { NextResponse } from "next/server";
import { expireOldCommercialGrants } from "@/lib/monetization/admin-grants/actions";

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

  try {
    const expiredCount = await expireOldCommercialGrants();
    return NextResponse.json({
      success: true,
      message: `Commercial grants maintenance completed. Expired ${expiredCount} grants.`,
      expiredCount,
    });
  } catch (error: any) {
    console.error("Monetization maintenance error:", error);
    return NextResponse.json(
      { error: error.message || "Maintenance failed" },
      { status: 500 }
    );
  }
}
