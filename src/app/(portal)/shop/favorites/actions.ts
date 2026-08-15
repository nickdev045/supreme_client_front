"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/api/client";
import { addStoreFavourite, deleteStoreFavourite } from "@/lib/api/favourites";
import { getAccessToken } from "@/lib/session";

export type FavouriteActionError = "session" | "forbidden" | "generic";

export type FavouriteActionResult =
  | { ok: true; favouriteId: number | null }
  | { ok: false; error: FavouriteActionError };

function revalidateFavourites() {
  revalidatePath("/shop");
  revalidatePath("/shop/favorites");
  revalidatePath("/shop/products", "layout");
}

function mapError(error: unknown): FavouriteActionError {
  if (error instanceof ApiError) {
    if (error.status === 401) return "session";
    if (error.status === 403) return "forbidden";
  }
  return "generic";
}

export async function addFavouriteAction(productId: string): Promise<FavouriteActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "session" };
  if (!productId.trim()) return { ok: false, error: "generic" };
  try {
    const favourite = await addStoreFavourite(token, productId);
    revalidateFavourites();
    return { ok: true, favouriteId: favourite.pk_user_favourite };
  } catch (error) {
    return { ok: false, error: mapError(error) };
  }
}

export async function removeFavouriteAction(favouriteId: number): Promise<FavouriteActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "session" };
  if (!Number.isInteger(favouriteId) || favouriteId < 1) {
    return { ok: false, error: "generic" };
  }
  try {
    await deleteStoreFavourite(token, favouriteId);
    revalidateFavourites();
    return { ok: true, favouriteId: null };
  } catch (error) {
    return { ok: false, error: mapError(error) };
  }
}
