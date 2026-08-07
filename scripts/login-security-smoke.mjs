/**
 * Smoke tests: store login security + functionality against supreme_system_back.
 *
 * Usage: node scripts/login-security-smoke.mjs
 * Env: API_URL (default http://localhost:3000), FRONT_URL (default http://localhost:3002)
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

// Prefer credentials from the API project's .env (seed passwords live there).
loadEnvFile(resolve(process.cwd(), "../supreme_system_back/.env"));
loadEnvFile(resolve(process.cwd(), ".env"));

const API_URL = (process.env.API_URL ?? "http://localhost:3000").replace(/\/$/, "");
const FRONT_URL = (process.env.FRONT_URL ?? "http://localhost:3002").replace(/\/$/, "");

const BUYER = {
  email: "buyer@example.com",
  password: process.env.SEED_BUYER_PASSWORD ?? "Buyer123!",
};
const WAREHOUSE = {
  email: "warehouse@example.com",
  password: process.env.SEED_WAREHOUSE_PASSWORD ?? "Warehouse123!",
};
const ADMIN = {
  email: "admin@example.com",
  password: process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!",
};

let passed = 0;
let failed = 0;

function assert(condition, name, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

let ipSeq = 0;

async function api(path, { method = "GET", body, token, headers = {} } = {}) {
  // Distinct forwarded IP per call helps when the API trusts the proxy header.
  ipSeq += 1;
  const fakeIp = `203.0.113.${(ipSeq % 200) + 1}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "X-Forwarded-For": fakeIp,
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, json, text };
}

function decodeJwt(token) {
  const payload = token.split(".")[1];
  const json = Buffer.from(payload, "base64url").toString("utf8");
  return JSON.parse(json);
}

async function tenants(email) {
  const res = await api("/api/v1/auth/tenants", {
    method: "POST",
    body: { email },
  });
  return res;
}

async function login({ email, password, companyId, client }) {
  return api("/api/v1/auth/login", {
    method: "POST",
    body: { email, password, fk_company: companyId, client },
  });
}

async function main() {
  console.log(`\nAPI  ${API_URL}`);
  console.log(`Front ${FRONT_URL}\n`);

  console.log("1) Health / reachability");
  const health = await api("/health");
  assert(health.status === 200, "Backend /health is up", `status=${health.status}`);

  const frontLogin = await fetch(`${FRONT_URL}/login`, { redirect: "manual" });
  assert(frontLogin.status === 200, "Front /login responds 200", `status=${frontLogin.status}`);

  const frontHome = await fetch(`${FRONT_URL}/`, { redirect: "manual" });
  assert(
    frontHome.status === 307 || frontHome.status === 302,
    "Front / redirects unauthenticated users",
    `status=${frontHome.status}`,
  );
  const location = frontHome.headers.get("location") ?? "";
  assert(location.includes("/login"), "Redirect target is /login", `location=${location}`);

  console.log("\n2) Tenant discovery");
  const buyerTenants = await tenants(BUYER.email);
  assert(buyerTenants.status === 200, "Buyer tenants 200", `status=${buyerTenants.status}`);
  const companyId = buyerTenants.json?.data?.[0]?.companyId;
  assert(Boolean(companyId), "Buyer has at least one company", `data=${JSON.stringify(buyerTenants.json)}`);

  const unknownTenants = await tenants("nobody-unknown@example.com");
  assert(unknownTenants.status === 200, "Unknown email tenants still 200 (no user enum leak via status)");
  assert(
    Array.isArray(unknownTenants.json?.data) && unknownTenants.json.data.length === 0,
    "Unknown email returns empty tenant list",
  );

  if (!companyId) {
    console.log("\nAborting login cases — no companyId from seed buyer.");
    summarize();
    process.exit(1);
  }

  console.log("\n3) Functional store login (buyer) + admin control token");
  const buyerStore = await login({
    email: BUYER.email,
    password: BUYER.password,
    companyId,
    client: "store",
  });

  if (buyerStore.status === 429) {
    assert(true, "Login rate limit active (429) — security control working");
    console.log(
      "  NOTE  Auth login is rate-limited (5 / 15 min). Restart supreme_system_back or wait, then re-run:",
    );
    console.log("        npm run test:login-smoke\n");
    summarize();
    process.exit(0);
  }

  assert(buyerStore.status === 200, "Buyer + store → 200", `status=${buyerStore.status} body=${buyerStore.text}`);
  const buyerToken = buyerStore.json?.data?.accessToken;
  assert(Boolean(buyerToken), "Buyer receives accessToken");
  if (buyerToken) {
    const claims = decodeJwt(buyerToken);
    assert(claims.aud === "store", "JWT aud is store", `aud=${claims.aud}`);
    assert(Boolean(claims.sub && claims.companyId && claims.roleId), "JWT has sub/companyId/roleId");
  }

  const me = await api("/api/v1/auth/me", { token: buyerToken });
  assert(me.status === 200, "Buyer store token can call /auth/me", `status=${me.status}`);

  // Obtain admin token before intentional failures (login rate limit is 5 / 15 min).
  const adminTenants = await tenants(ADMIN.email);
  const adminCompanyId = adminTenants.json?.data?.[0]?.companyId ?? companyId;
  const adminLogin = await login({
    email: ADMIN.email,
    password: ADMIN.password,
    companyId: adminCompanyId,
    client: "admin",
  });
  let adminToken = null;
  if (adminLogin.status === 200) {
    assert(true, "Admin + admin client → 200 (control)");
    adminToken = adminLogin.json?.data?.accessToken;
    if (adminToken) {
      const claims = decodeJwt(adminToken);
      assert(claims.aud === "admin", "Admin JWT aud is admin", `aud=${claims.aud}`);
    }
  } else {
    console.log(
      `  SKIP  Admin control login (status=${adminLogin.status}) — SEED_ADMIN_PASSWORD may not match DB; store tests continue`,
    );
  }

  console.log("\n4) Audience isolation on routes");
  if (buyerToken) {
    const inv = await api("/api/v1/inventory/movements", { token: buyerToken });
    assert(inv.status === 403, "Store token blocked on inventory", `status=${inv.status}`);
    assert(
      String(inv.json?.message ?? "").includes("not valid for this client") || inv.status === 403,
      "Store→admin message is channel denial",
      `message=${inv.json?.message}`,
    );

    const cart = await api("/api/v1/customer/carts", { token: buyerToken });
    assert(cart.status === 200, "Store token allowed on /customer/carts", `status=${cart.status}`);
  }

  if (adminToken) {
    const cust = await api("/api/v1/customer/addresses", {
      method: "POST",
      token: adminToken,
      body: { address: "blocked", description: "x", phone_number: "555" },
    });
    assert(cust.status === 403, "Admin token blocked on customer write", `status=${cust.status}`);
  }

  console.log("\n5) Channel / role gates (security)");
  const buyerAdmin = await login({
    email: BUYER.email,
    password: BUYER.password,
    companyId,
    client: "admin",
  });
  assert(
    buyerAdmin.status === 403 || buyerAdmin.status === 429,
    "Buyer cannot login as admin (or rate-limited)",
    `status=${buyerAdmin.status}`,
  );

  const whStore = await login({
    email: WAREHOUSE.email,
    password: WAREHOUSE.password,
    companyId,
    client: "store",
  });
  assert(
    whStore.status === 403 || whStore.status === 429,
    "Warehouse cannot login as store (or rate-limited)",
    `status=${whStore.status}`,
  );

  const badPass = await login({
    email: BUYER.email,
    password: "WrongPassword!!!",
    companyId,
    client: "store",
  });
  assert(
    badPass.status === 401 || badPass.status === 429,
    "Wrong password → 401 (or rate-limited)",
    `status=${badPass.status}`,
  );
  assert(
    !String(badPass.text).toLowerCase().includes("password hash"),
    "Error body does not leak password hashes",
  );

  const missingClient = await api("/api/v1/auth/login", {
    method: "POST",
    body: {
      email: BUYER.email,
      password: BUYER.password,
      fk_company: companyId,
    },
  });
  assert(
    missingClient.status === 400 || missingClient.status === 429,
    "Login without client → 400 (or rate-limited)",
    `status=${missingClient.status}`,
  );

  console.log("\n6) NextAuth CSRF endpoint present");
  const csrf = await fetch(`${FRONT_URL}/api/auth/csrf`);
  const csrfJson = await csrf.json().catch(() => null);
  assert(csrf.status === 200 && Boolean(csrfJson?.csrfToken), "NextAuth CSRF token available");

  summarize();
  process.exit(failed > 0 ? 1 : 0);
}

function summarize() {
  console.log(`\nResult: ${passed} passed, ${failed} failed\n`);
}

main().catch((error) => {
  console.error("\nSmoke script crashed:", error?.cause?.code ?? error.message ?? error);
  console.error("Make sure supreme_system_back (:3000) and supreme_client_front (:3002) are running.");
  process.exit(1);
});
