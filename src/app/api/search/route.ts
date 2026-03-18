import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth";
import { searchChannels } from "@/lib/arena";

export async function GET(request: NextRequest) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q") || "";
  if (!q) {
    return NextResponse.json({ channels: [] });
  }

  try {
    const channels = await searchChannels(q, token);
    return NextResponse.json({ channels });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed", details: String(err) }, { status: 500 });
  }
}
