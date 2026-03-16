import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth";
import { CanvasClient } from "./client";

export default async function CanvasPage() {
  const token = await getToken();
  if (!token) {
    redirect("/");
  }

  return <CanvasClient />;
}
