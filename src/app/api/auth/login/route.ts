import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.ARENA_CLIENT_ID;
  const redirectUri = process.env.ARENA_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing ARENA_CLIENT_ID or ARENA_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const url = new URL("https://dev.are.na/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "read");

  return NextResponse.redirect(url.toString());
}
