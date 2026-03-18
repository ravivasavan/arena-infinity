import { NextRequest, NextResponse } from "next/server";
import { tokenCookieOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code parameter" }, { status: 400 });
  }

  const clientId = process.env.ARENA_CLIENT_ID;
  const clientSecret = process.env.ARENA_CLIENT_SECRET;
  const redirectUri = process.env.ARENA_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json({ error: "Missing OAuth config" }, { status: 500 });
  }

  const tokenRes = await fetch("https://api.are.na/v3/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    return NextResponse.json(
      { error: "Token exchange failed", details: err },
      { status: 500 }
    );
  }

  const { access_token } = await tokenRes.json();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const response = NextResponse.redirect(`${appUrl}/canvas`);

  const cookieOpts = tokenCookieOptions();
  response.cookies.set(cookieOpts.name, access_token, cookieOpts);

  return response;
}
