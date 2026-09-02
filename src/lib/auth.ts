import type { DefaultSession, NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";

import {
  canAccessStorePortal,
  fetchMe,
  fetchTenants,
  loginWithCompany,
  normalizePermissionCodes,
  toAuthErrorMessage,
} from "@/lib/api/auth";
import { brandFromTenants } from "@/lib/store-company-brand";
const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  companyId: z.string().uuid(),
});

declare module "next-auth" {
  interface Session {
    /** Client-safe session only — accessToken stays in the JWT cookie. */
    permissions: string[];
    user: {
      id: string;
      email: string;
      name: string;
      firstName: string;
      lastName: string;
      photoUrl: string | null;
      companyId: string;
      companyName: string;
      companyPhotoUrl: string | null;
      roleId: number;
    } & DefaultSession["user"];
    error?: "AccessTokenExpired" | "RefreshAccessTokenError";
  }

  interface User {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
    companyId: string;
    companyName: string;
    companyPhotoUrl: string | null;
    roleId: number;
    permissions: string[];
    accessToken: string;
    accessTokenExpires: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    permissions?: string[];
    firstName?: string;
    lastName?: string;
    photoUrl?: string | null;
    companyId?: string;
    companyName?: string;
    companyPhotoUrl?: string | null;
    roleId?: number;
    error?: "AccessTokenExpired" | "RefreshAccessTokenError";
  }
}

function isTokenExpired(token: JWT): boolean {
  if (!token.accessTokenExpires) return true;
  return Date.now() >= token.accessTokenExpires - 30_000;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        companyId: { label: "Company", type: "text" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) {
          throw new Error("Invalid credentials payload.");
        }

        try {
          const login = await loginWithCompany({
            email: parsed.data.email,
            password: parsed.data.password,
            companyId: parsed.data.companyId,
          });

          const loginPermissions = normalizePermissionCodes(login.permissions);
          if (!canAccessStorePortal(loginPermissions)) {
            throw new Error("This account cannot access the client portal.");
          }

          const me = await fetchMe(login.accessToken);
          const name = [me.firstName, me.lastName].filter(Boolean).join(" ").trim();
          let companyName = me.companyName?.trim() || "";
          let companyPhotoUrl = me.companyPhotoUrl?.trim() || null;
          if (!companyName || !companyPhotoUrl) {
            const tenants = await fetchTenants(parsed.data.email);
            const brand = brandFromTenants(tenants, me.companyId);
            companyName = companyName || brand?.name || "";
            companyPhotoUrl = companyPhotoUrl || brand?.photoUrl || null;
          }

          return {
            id: me.userId,
            email: me.email,
            name: name || me.email,
            firstName: me.firstName,
            lastName: me.lastName,
            photoUrl: me.photoUrl,
            companyId: me.companyId,
            companyName,
            companyPhotoUrl,
            roleId: me.roleId,
            permissions: [],
            accessToken: login.accessToken,
            accessTokenExpires: Date.now() + login.expiresIn * 1000,
          };
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === "This account cannot access the client portal."
          ) {
            throw error;
          }
          throw new Error(toAuthErrorMessage(error));
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = user.accessToken;
        token.accessTokenExpires = user.accessTokenExpires;
        token.permissions = [];
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.photoUrl = user.photoUrl;
        token.companyId = user.companyId;
        token.companyName = user.companyName;
        token.companyPhotoUrl = user.companyPhotoUrl;
        token.roleId = user.roleId;
        delete token.error;
        return token;
      }

      if (trigger === "update" && session) {
        const next = session as {
          name?: string;
          firstName?: string;
          lastName?: string;
          photoUrl?: string | null;
        };
        if (typeof next.name === "string") token.name = next.name;
        if (typeof next.firstName === "string") token.firstName = next.firstName;
        if (typeof next.lastName === "string") token.lastName = next.lastName;
        if ("photoUrl" in next) token.photoUrl = next.photoUrl ?? null;
      }

      if (token.accessToken && !isTokenExpired(token)) {
        return token;
      }

      return {
        ...token,
        accessToken: undefined,
        error: "AccessTokenExpired",
      };
    },
    async session({ session, token }) {
      if (token.error || !token.accessToken || !token.sub) {
        session.error = token.error ?? "AccessTokenExpired";
        session.permissions = [];
        session.user = {
          ...session.user,
          id: "",
          email: "",
          name: "",
          firstName: "",
          lastName: "",
          photoUrl: null,
          companyId: "",
          companyName: "",
          companyPhotoUrl: null,
          roleId: 0,
        };
        return session;
      }

      session.permissions = token.permissions ?? [];
      session.user = {
        ...session.user,
        id: token.sub,
        email: token.email ?? "",
        name: token.name ?? "",
        firstName: token.firstName ?? "",
        lastName: token.lastName ?? "",
        photoUrl: token.photoUrl ?? null,
        companyId: token.companyId ?? "",
        companyName: token.companyName ?? "",
        companyPhotoUrl: token.companyPhotoUrl ?? null,
        roleId: token.roleId ?? 0,
      };
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
