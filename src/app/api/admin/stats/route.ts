import { NextResponse } from "next/server";
import { adminLabel } from "@/lib/server/admin";
import { db } from "@/lib/server/supabase";


export async function GET() {
  if (!(await adminLabel())) return NextResponse.json({ error: "Session expirée" }, { status: 401 });
  const { data, error } = await db().from("ticket_stats").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ stats: data });
}
