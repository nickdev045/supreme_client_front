"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createStoreAddress,
  deleteStoreAddress,
  updateStoreAddress,
  type StoreAddress,
  type StoreAddressInput,
} from "@/lib/api/addresses";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/session";

const addressSchema = z
  .object({
    address: z.string().trim().min(1).max(45),
    description: z.string().trim().max(45).optional().nullable(),
    phone_number: z.string().trim().max(25).optional().nullable(),
  })
  .strict();

export type AddressActionErrorKey =
  | "session"
  | "validation"
  | "forbidden"
  | "generic";

export type AddressActionResult =
  | { ok: true; address: StoreAddress }
  | { ok: false; errorKey: AddressActionErrorKey };

export type AddressDeleteResult =
  | { ok: true }
  | { ok: false; errorKey: AddressActionErrorKey };

function mapError(error: unknown): AddressActionErrorKey {
  if (error instanceof ApiError) {
    if (error.status === 401) return "session";
    if (error.status === 403) return "forbidden";
    if (error.status === 400 || error.status === 422) return "validation";
  }
  return "generic";
}

function toInput(parsed: z.infer<typeof addressSchema>): StoreAddressInput {
  return {
    address: parsed.address,
    description: parsed.description?.trim() || null,
    phone_number: parsed.phone_number?.trim() || null,
  };
}

function revalidateAddresses() {
  revalidatePath("/shop/profile");
  revalidatePath("/shop/cart");
}

export async function createAddressAction(input: {
  address: string;
  description?: string | null;
  phone_number?: string | null;
}): Promise<AddressActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, errorKey: "session" };

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errorKey: "validation" };

  try {
    const address = await createStoreAddress(token, toInput(parsed.data));
    revalidateAddresses();
    return { ok: true, address };
  } catch (error) {
    return { ok: false, errorKey: mapError(error) };
  }
}

export async function updateAddressAction(
  addressId: number,
  input: {
    address: string;
    description?: string | null;
    phone_number?: string | null;
  },
): Promise<AddressActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, errorKey: "session" };
  if (!Number.isInteger(addressId) || addressId <= 0) {
    return { ok: false, errorKey: "validation" };
  }

  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errorKey: "validation" };

  try {
    const address = await updateStoreAddress(token, addressId, toInput(parsed.data));
    revalidateAddresses();
    return { ok: true, address };
  } catch (error) {
    return { ok: false, errorKey: mapError(error) };
  }
}

export async function deleteAddressAction(addressId: number): Promise<AddressDeleteResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, errorKey: "session" };
  if (!Number.isInteger(addressId) || addressId <= 0) {
    return { ok: false, errorKey: "validation" };
  }

  try {
    await deleteStoreAddress(token, addressId);
    revalidateAddresses();
    return { ok: true };
  } catch (error) {
    return { ok: false, errorKey: mapError(error) };
  }
}
