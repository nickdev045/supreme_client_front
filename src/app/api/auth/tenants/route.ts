import { NextResponse } from "next/server";

import { fetchTenants, toAuthErrorKey, type DiscoverTenantsResult } from "@/lib/api/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request): Promise<NextResponse<DiscoverTenantsResult>> {
  try {
    const body = (await request.json()) as { email?: unknown };
    const email = typeof body.email === "string" ? body.email : "";
    const tenants = await fetchTenants(email);
    return NextResponse.json({ ok: true, tenants });
  } catch (error) {
    console.error("POST /api/auth/tenants failed", error);
    return NextResponse.json({ ok: false, errorKey: toAuthErrorKey(error) });
  }
}
