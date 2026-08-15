import { apiData, apiRequest } from "@/lib/api/client";

export type StoreAddress = {
  pk_address: number;
  address: string | null;
  description: string | null;
  phone_number: string | null;
  fk_postal_code: number | null;
  fk_phone_area_code: number | null;
  fk_company: string;
  fk_multi_tenant: string;
};

export type StoreAddressInput = {
  address?: string | null;
  description?: string | null;
  phone_number?: string | null;
  fk_postal_code?: number | null;
  fk_phone_area_code?: number | null;
};

export function listStoreAddresses(token: string) {
  return apiData<StoreAddress[]>("/api/v1/customer/addresses", {
    method: "GET",
    token,
  });
}

export function createStoreAddress(token: string, input: StoreAddressInput) {
  return apiData<StoreAddress>("/api/v1/customer/addresses", {
    method: "POST",
    token,
    body: input,
  });
}

export function updateStoreAddress(token: string, addressId: number, input: StoreAddressInput) {
  return apiData<StoreAddress>(`/api/v1/customer/addresses/${addressId}`, {
    method: "PATCH",
    token,
    body: input,
  });
}

export function deleteStoreAddress(token: string, addressId: number) {
  return apiRequest<null>(`/api/v1/customer/addresses/${addressId}`, {
    method: "DELETE",
    token,
  });
}

export function addressLabel(address: StoreAddress): string {
  const line = address.address?.trim();
  if (line) return line;
  const description = address.description?.trim();
  if (description) return description;
  return `#${address.pk_address}`;
}
