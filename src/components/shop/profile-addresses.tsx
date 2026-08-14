"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormEvent, useState, useTransition } from "react";

import {
  createAddressAction,
  deleteAddressAction,
  updateAddressAction,
  type AddressActionErrorKey,
} from "@/app/(portal)/shop/profile/address-actions";
import { Alert } from "@/components/ui/alert";
import { btn, fieldClass, labelClass } from "@/components/ui/styles";
import { addressLabel, type StoreAddress } from "@/lib/api/addresses";

type ProfileAddressesProps = {
  addresses: StoreAddress[];
};

const emptyForm = {
  address: "",
  description: "",
  phone_number: "",
};

export function ProfileAddresses({ addresses }: ProfileAddressesProps) {
  const t = useTranslations("Profile");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [errorKey, setErrorKey] = useState<AddressActionErrorKey | null>(null);
  const [success, setSuccess] = useState(false);

  function reset() {
    setEditingId(null);
    setForm(emptyForm);
    setErrorKey(null);
  }

  function edit(address: StoreAddress) {
    setEditingId(address.pk_address);
    setForm({
      address: address.address ?? "",
      description: address.description ?? "",
      phone_number: address.phone_number ?? "",
    });
    setErrorKey(null);
    setSuccess(false);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorKey(null);
    setSuccess(false);
    startTransition(async () => {
      const payload = {
        address: form.address,
        description: form.description || null,
        phone_number: form.phone_number || null,
      };
      const result =
        editingId != null
          ? await updateAddressAction(editingId, payload)
          : await createAddressAction(payload);
      if (!result.ok) {
        setErrorKey(result.errorKey);
        return;
      }
      reset();
      setSuccess(true);
      router.refresh();
    });
  }

  function onDelete(addressId: number) {
    if (!window.confirm(t("addresses.confirmDelete"))) return;
    setErrorKey(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await deleteAddressAction(addressId);
      if (!result.ok) {
        setErrorKey(result.errorKey);
        return;
      }
      if (editingId === addressId) reset();
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <section className="space-y-3 rounded-[12px] border border-[var(--border)] bg-white p-4 sm:p-5">
      <div className="space-y-1">
        <h2 className="m-0 text-base font-semibold text-[var(--navy)]">{t("addresses.title")}</h2>
        <p className="m-0 text-sm text-[var(--text-muted)]">{t("addresses.subtitle")}</p>
      </div>

      {success ? <Alert tone="success">{t("addresses.success")}</Alert> : null}
      {errorKey ? <Alert tone="error">{t(`addresses.errors.${errorKey}`)}</Alert> : null}

      {addresses.length === 0 ? (
        <p className="m-0 text-sm text-[var(--text-muted)]">{t("addresses.empty")}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {addresses.map((address) => (
            <li
              key={address.pk_address}
              className="rounded-[10px] border border-[var(--border)] bg-[var(--shop-surface)] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="m-0 font-semibold text-[var(--navy)]">
                    {address.description?.trim() || t("addresses.untitled")}
                  </p>
                  <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">
                    {addressLabel(address)}
                  </p>
                  {address.phone_number ? (
                    <p className="mt-1 mb-0 text-xs text-[var(--text-muted)]">
                      {address.phone_number}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2 text-sm">
                  <button
                    type="button"
                    className="font-semibold text-[var(--navy)]"
                    disabled={pending}
                    onClick={() => edit(address)}
                  >
                    {t("addresses.edit")}
                  </button>
                  <button
                    type="button"
                    className="font-semibold text-[var(--tomato)]"
                    disabled={pending}
                    onClick={() => onDelete(address.pk_address)}
                  >
                    {t("addresses.delete")}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onSubmit} className="space-y-3 border-t border-[var(--border)] pt-3">
        <p className="m-0 text-sm font-semibold text-[var(--navy)]">
          {editingId != null ? t("addresses.editTitle") : t("addresses.addTitle")}
        </p>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="profile-address-line">
            {t("addresses.address")}
          </label>
          <input
            id="profile-address-line"
            required
            maxLength={45}
            value={form.address}
            onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
            className={fieldClass}
            autoComplete="street-address"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="profile-address-label">
              {t("addresses.label")}
            </label>
            <input
              id="profile-address-label"
              maxLength={45}
              value={form.description}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className={fieldClass}
              placeholder={t("addresses.labelPlaceholder")}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="profile-address-phone">
              {t("addresses.phone")}
            </label>
            <input
              id="profile-address-phone"
              maxLength={25}
              value={form.phone_number}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, phone_number: event.target.value }))
              }
              className={fieldClass}
              autoComplete="tel"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={btn.primary} disabled={pending}>
            {pending
              ? t("addresses.saving")
              : editingId != null
                ? t("addresses.save")
                : t("addresses.add")}
          </button>
          {editingId != null ? (
            <button type="button" className={btn.outline} disabled={pending} onClick={reset}>
              {t("addresses.cancel")}
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}
