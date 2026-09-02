import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function present(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

/** Runtime env check for Vercel. Does not expose secret values. */
export async function GET() {
  const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim() ?? "";
  return NextResponse.json({
    apiUrl: present("API_URL"),
    nextAuthUrl: present("NEXTAUTH_URL"),
    nextAuthSecret: nextAuthSecret.length >= 32,
  });
}
