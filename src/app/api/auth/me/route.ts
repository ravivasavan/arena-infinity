import { NextResponse } from "next/server";
import { getToken } from "@/lib/auth";
import { getMe } from "@/lib/arena";

export async function GET() {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const user = await getMe(token);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
