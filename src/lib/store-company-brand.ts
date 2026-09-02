import { fetchMe, fetchTenants } from "@/lib/api/auth";
import type { ApiTenant } from "@/lib/api/types";

export type StoreCompanyBrand = {
  name: string;
  photoUrl: string | null;
};

export function brandFromFields(
  name?: string | null,
  photoUrl?: string | null,
): StoreCompanyBrand | null {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  return { name: trimmed, photoUrl: photoUrl?.trim() || null };
}

export function brandFromTenants(
  tenants: ApiTenant[],
  companyId: string,
): StoreCompanyBrand | null {
  const tenant = tenants.find((item) => item.companyId === companyId);
  return brandFromFields(tenant?.name, tenant?.photoUrl);
}

/** Resolves shop chrome branding without depending on /me exposing company fields. */
export async function resolveStoreCompanyBrand(input: {
  accessToken?: string | null;
  email?: string | null;
  companyId?: string | null;
  companyName?: string | null;
  companyPhotoUrl?: string | null;
}): Promise<StoreCompanyBrand | null> {
  const fromSession = brandFromFields(input.companyName, input.companyPhotoUrl);
  if (fromSession?.name && fromSession.photoUrl) return fromSession;

  if (input.accessToken) {
    try {
      const me = await fetchMe(input.accessToken);
      const fromMe = brandFromFields(me.companyName, me.companyPhotoUrl);
      if (fromMe) {
        return {
          name: fromMe.name,
          photoUrl: fromMe.photoUrl ?? fromSession?.photoUrl ?? null,
        };
      }
    } catch {
      // Store /me may omit branding on older API versions.
    }
  }

  if (input.email && input.companyId) {
    try {
      const tenants = await fetchTenants(input.email);
      const fromTenant = brandFromTenants(tenants, input.companyId);
      if (fromTenant) {
        return {
          name: fromTenant.name,
          photoUrl: fromTenant.photoUrl ?? fromSession?.photoUrl ?? null,
        };
      }
    } catch {
      // Keep whatever we already resolved.
    }
  }

  return fromSession;
}
