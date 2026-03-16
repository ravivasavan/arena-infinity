import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth";
import { getMe, getUserChannels } from "@/lib/arena";

export async function GET(request: NextRequest) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const page = Number(request.nextUrl.searchParams.get("page") || "1");
  const per = Number(request.nextUrl.searchParams.get("per") || "50");

  try {
    const user = await getMe(token);
    const data = await getUserChannels(user.id, token, page, per);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 });
  }
}
