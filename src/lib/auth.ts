import { cookies } from "next/headers";

const TOKEN_COOKIE = "arena_token";

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value;
}

export function tokenCookieOptions() {
  return {
    name: TOKEN_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year (tokens don't expire on Are.na)
  };
}
