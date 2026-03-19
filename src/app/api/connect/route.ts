import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth";
import { connectToChannel } from "@/lib/arena";

export async function POST(request: NextRequest) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const { channelSlug, sourceId, sourceType } = await request.json();

    if (!channelSlug || !sourceId || !sourceType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToChannel(channelSlug, sourceId, sourceType, token);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to connect";
    const status = message.includes("403") ? 403 : message.includes("429") ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
