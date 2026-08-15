"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ChangeEvent, FormEvent, useRef, useState, type ReactNode } from "react";

import {
  requestPasswordChangeAction,
  updateProfileAction,
  uploadProfilePhotoAction,
  type ProfileActionErrorKey,
} from "@/app/(portal)/shop/profile/actions";
import { UserAvatar } from "@/components/landing/user-avatar";
import { Alert } from "@/components/ui/alert";
import { btn, fieldClass, labelClass } from "@/components/ui/styles";
import type { ApiMeData } from "@/lib/api/types";

type ProfileFormProps = {
  profile: ApiMeData;
  addressesSlot?: ReactNode;
};

export function ProfileForm({ profile, addressesSlot }: ProfileFormProps) {
  const t = useTranslations("Profile");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const { update } = useSession();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<ProfileActionErrorKey | null>(null);
  const [successKey, setSuccessKey] = useState<"saved" | "passwordRequested" | null>(null);
  const [uploadErrorKey, setUploadErrorKey] = useState<ProfileActionErrorKey | null>(null);
  const [passwordErrorKey, setPasswordErrorKey] = useState<ProfileActionErrorKey | null>(null);

  const displayName = [firstName, lastName].filter(Boolean).join(" ").trim() || profile.email;

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadErrorKey(null);
    setSuccessKey(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadProfilePhotoAction(formData);
      if (!result.ok) {
        setUploadErrorKey(result.errorKey);
        return;
      }
      setPhotoUrl(result.photoUrl);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorKey(null);
    setSuccessKey(null);
    setBusy(true);
    try {
      const result = await updateProfileAction({
        firstName,
        lastName,
        photoUrl,
      });
      if (!result.ok) {
        setErrorKey(result.errorKey);
        return;
      }

      const name = [result.profile.firstName, result.profile.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      await update({
        name: name || result.profile.email,
        firstName: result.profile.firstName,
        lastName: result.profile.lastName,
        photoUrl: result.profile.photoUrl,
      });
      setSuccessKey("saved");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function onPasswordRequest() {
    setPasswordErrorKey(null);
    setSuccessKey(null);
    setPasswordBusy(true);
    try {
      const result = await requestPasswordChangeAction();
      if (!result.ok) {
        setPasswordErrorKey(result.errorKey);
        return;
      }
      setSuccessKey("passwordRequested");
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6">
      <header className="space-y-1">
        <h1 className="m-0 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--navy)]">
          {t("title")}
        </h1>
        <p className="m-0 text-sm text-[var(--text-muted)]">{t("subtitle")}</p>
      </header>

      {successKey === "saved" ? <Alert tone="success">{t("successSaved")}</Alert> : null}
      {successKey === "passwordRequested" ? (
        <Alert tone="success">{t("successPasswordRequested")}</Alert>
      ) : null}
      {errorKey ? <Alert tone="error">{t(`errors.${errorKey}`)}</Alert> : null}

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-[12px] border border-[var(--border)] bg-white p-4 sm:p-5"
      >
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="profile-email">
            {tCommon("email")}
          </label>
          <input
            id="profile-email"
            type="email"
            value={profile.email}
            disabled
            className={`${fieldClass} cursor-not-allowed bg-[var(--shop-surface)] opacity-80`}
          />
          <p className="m-0 text-xs text-[var(--text-muted)]">{t("emailReadOnlyHint")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="profile-first-name">
              {t("firstName")}
            </label>
            <input
              id="profile-first-name"
              type="text"
              required
              maxLength={145}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className={fieldClass}
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="profile-last-name">
              {t("lastName")}
            </label>
            <input
              id="profile-last-name"
              type="text"
              required
              maxLength={145}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className={fieldClass}
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="space-y-3">
          <span className={labelClass}>{t("photo")}</span>
          <div className="flex flex-wrap items-center gap-4">
            <UserAvatar name={displayName} photoUrl={photoUrl} size={72} />
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={onFileChange}
                disabled={uploading || busy}
              />
              <button
                type="button"
                className={btn.outline}
                disabled={uploading || busy}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? t("uploadingPhoto") : t("selectPhoto")}
              </button>
              {photoUrl ? (
                <button
                  type="button"
                  className="text-sm font-medium text-[var(--navy)] underline-offset-2 hover:underline"
                  disabled={uploading || busy}
                  onClick={() => setPhotoUrl(null)}
                >
                  {t("removePhoto")}
                </button>
              ) : null}
            </div>
          </div>
          <p className="m-0 text-xs text-[var(--text-muted)]">{t("photoHint")}</p>
          {uploadErrorKey ? (
            <Alert tone="error">{t(`errors.${uploadErrorKey}`)}</Alert>
          ) : null}
        </div>

        <div className="pt-1">
          <button type="submit" className={btn.primary} disabled={busy || uploading}>
            {busy ? t("saving") : t("save")}
          </button>
        </div>
      </form>

      <section className="space-y-3 rounded-[12px] border border-[var(--border)] bg-white p-4 sm:p-5">
        <div className="space-y-1">
          <h2 className="m-0 text-base font-semibold text-[var(--navy)]">
            {t("passwordRequestTitle")}
          </h2>
          <p className="m-0 text-sm text-[var(--text-muted)]">{t("passwordRequestBody")}</p>
        </div>
        {passwordErrorKey ? (
          <Alert tone="error">{t(`errors.${passwordErrorKey}`)}</Alert>
        ) : null}
        <button
          type="button"
          className={btn.outline}
          disabled={passwordBusy || busy}
          onClick={onPasswordRequest}
        >
          {passwordBusy ? t("passwordRequesting") : t("passwordRequestCta")}
        </button>
      </section>

      {addressesSlot}
    </div>
  );
}
