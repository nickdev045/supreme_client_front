import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ProfileAddresses } from "@/components/shop/profile-addresses";
import { ProfileForm } from "@/components/shop/profile-form";
import { listStoreAddresses } from "@/lib/api/addresses";
import { fetchMe, fetchPendingCredentialRequest } from "@/lib/api/auth";
import { handleUnauthorized } from "@/lib/handle-unauthorized";
import { getAccessToken } from "@/lib/session";

export async function generateMetadata() {
  const t = await getTranslations("Meta");
  return {
    title: t("profileTitle"),
    description: t("profileDescription"),
  };
}

export default async function ShopProfilePage() {
  const token = await getAccessToken();
  if (!token) {
    redirect("/login?error=SessionExpired");
  }

  let profile;
  let pendingRequest: Awaited<ReturnType<typeof fetchPendingCredentialRequest>> | null = null;
  try {
    [profile, pendingRequest] = await Promise.all([
      fetchMe(token),
      fetchPendingCredentialRequest(token).catch(() => null),
    ]);
  } catch (error) {
    handleUnauthorized(error);
  }

  let addresses: Awaited<ReturnType<typeof listStoreAddresses>> = [];
  try {
    addresses = await listStoreAddresses(token);
  } catch {
    addresses = [];
  }

  return (
    <div className="py-2 md:py-4">
      <ProfileForm
        profile={profile}
        pendingRequest={pendingRequest}
        addressesSlot={<ProfileAddresses addresses={addresses} />}
      />
    </div>
  );
}
