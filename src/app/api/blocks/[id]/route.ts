import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth";
import { getBlockConnections } from "@/lib/arena";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const connections = await getBlockConnections(Number(id), token);
    return NextResponse.json({ connections });
  } catch {
    return NextResponse.json({ error: "Failed to fetch block connections" }, { status: 500 });
  }
}
