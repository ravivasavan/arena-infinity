import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth";
import { getChannelContents } from "@/lib/arena";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { slug } = await params;
  const page = Number(request.nextUrl.searchParams.get("page") || "1");
  const per = Number(request.nextUrl.searchParams.get("per") || "50");

  try {
    const data = await getChannelContents(slug, token, page, per);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch channel contents" }, { status: 500 });
  }
}
