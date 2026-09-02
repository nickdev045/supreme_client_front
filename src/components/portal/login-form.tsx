"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { btn, fieldClass, labelClass } from "@/components/ui/styles";
import type { AuthErrorKey, DiscoverTenantsResult } from "@/lib/api/auth";
import type { ApiTenant } from "@/lib/api/types";

const AUTH_ERROR_CODES = [
  "CredentialsSignin",
  "SessionExpired",
  "AccessDenied",
  "Configuration",
] as const;

type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number];

function isAuthErrorCode(code: string): code is AuthErrorCode {
  return (AUTH_ERROR_CODES as readonly string[]).includes(code);
}

export function LoginForm() {
  const t = useTranslations("Auth");
  const tCommon = useTranslations("Common");
  const tBrand = useTranslations("Brand");
  const searchParams = useSearchParams();
  const callbackUrl = "/shop";
  const urlErrorCode = searchParams.get("error");
  const passwordResetOk = searchParams.get("passwordReset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenants, setTenants] = useState<ApiTenant[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [needsCompany, setNeedsCompany] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(
    urlErrorCode && isAuthErrorCode(urlErrorCode) ? urlErrorCode : urlErrorCode ? "Default" : null,
  );
  const [busy, setBusy] = useState(false);

  function resolveError(key: string | null): string | null {
    if (!key) return null;
    if (key === "selectCompany") return t("selectCompany");
    if (isAuthErrorCode(key)) return t(`errors.${key}`);
    const apiKeys: AuthErrorKey[] = [
      "invalidCredentials",
      "tooManyAttempts",
      "checkEmail",
      "invalidEmail",
      "apiUnreachable",
      "accessDenied",
      "generic",
      "Configuration",
    ];
    if (apiKeys.includes(key as AuthErrorKey)) {
      return t(`errors.${key as AuthErrorKey}`);
    }
    return t("errors.Default");
  }

  async function signInWithCompany(selectedCompanyId: string) {
    const result = await signIn("credentials", {
      email,
      password,
      companyId: selectedCompanyId,
      redirect: false,
      callbackUrl,
    });
    if (!result) {
      setErrorKey("Default");
      return;
    }
    if (result.error || result.ok === false) {
      setErrorKey(isAuthErrorCode(result.error ?? "") ? result.error! : "CredentialsSignin");
      return;
    }
    window.location.assign(result.url || callbackUrl);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorKey(null);
    setBusy(true);

    try {
      if (needsCompany) {
        if (!companyId) {
          setErrorKey("selectCompany");
          return;
        }
        await signInWithCompany(companyId);
        return;
      }

      const discoveryResponse = await fetch("/api/auth/tenants", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const discovery = (await discoveryResponse.json().catch(() => null)) as DiscoverTenantsResult | null;
      if (!discovery || !discovery.ok) {
        setErrorKey(discovery && "errorKey" in discovery ? discovery.errorKey : "generic");
        return;
      }
      if (discovery.tenants.length === 0) {
        setErrorKey("invalidCredentials");
        return;
      }

      if (discovery.tenants.length === 1) {
        setTenants(discovery.tenants);
        setCompanyId(discovery.tenants[0].companyId);
        await signInWithCompany(discovery.tenants[0].companyId);
        return;
      }

      setTenants(discovery.tenants);
      setCompanyId(discovery.tenants[0].companyId);
      setNeedsCompany(true);
    } catch {
      setErrorKey("Default");
    } finally {
      setBusy(false);
    }
  }

  const errorMessage = resolveError(errorKey);

  return (
    <div className="w-full max-w-[420px] rounded-[14px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow)]">
      <div className="mb-6 text-center">
        <Image
          src="/logo.png"
          alt={tBrand("name")}
          width={72}
          height={72}
          className="mx-auto mb-3 h-[72px] w-[72px] rounded-full object-cover"
          priority
        />
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--navy)]">
          {t("loginTitle")}
        </h1>
        <p className="mt-1 text-[0.9rem] text-[var(--text-muted)]">{t("loginSubtitle")}</p>
      </div>

      {passwordResetOk && !errorMessage ? (
        <Alert tone="success" className="mb-4">
          {t("passwordResetSuccess")}
        </Alert>
      ) : null}
      {errorMessage ? (
        <Alert tone="error" className="mb-4">
          {errorMessage}
        </Alert>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className={labelClass}>
            {tCommon("email")}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (needsCompany) {
                setNeedsCompany(false);
                setTenants([]);
                setCompanyId("");
              }
            }}
            placeholder="client@restaurant.com"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            {tCommon("password")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={fieldClass}
          />
        </div>

        {needsCompany ? (
          <div>
            <label htmlFor="company" className={labelClass}>
              {tCommon("company")}
            </label>
            <select
              id="company"
              name="company"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className={fieldClass}
            >
              {tenants.map((tenant) => (
                <option key={tenant.companyId} value={tenant.companyId}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy || !email.trim() || !password}
          className={`${btn.primary} w-full`}
        >
          {busy
            ? t("signingIn")
            : needsCompany
              ? tCommon("continue")
              : t("signInSubmit")}
        </button>
      </form>

      <p className="mt-4 mb-0 text-center text-[0.88rem] text-[var(--text-muted)]">
        {t("noAccount")}{" "}
        <Link
          href="/request"
          className="font-semibold text-[var(--navy)] transition-colors duration-200 hover:text-[var(--tomato)]"
        >
          {t("becomeMember")}
        </Link>
      </p>
    </div>
  );
}
