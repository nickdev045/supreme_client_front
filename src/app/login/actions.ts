"use server";

import { fetchTenants, toAuthErrorKey, type AuthErrorKey } from "@/lib/api/auth";
import type { ApiTenant } from "@/lib/api/types";

export type DiscoverTenantsResult =
  | { ok: true; tenants: ApiTenant[] }
  | { ok: false; errorKey: AuthErrorKey };

export async function discoverTenantsAction(
  email: string,
): Promise<DiscoverTenantsResult> {
  try {
    const tenants = await fetchTenants(email);
    return { ok: true, tenants };
  } catch (error) {
    return { ok: false, errorKey: toAuthErrorKey(error) };
  }
}
