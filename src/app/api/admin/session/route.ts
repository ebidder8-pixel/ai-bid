import { NextResponse } from "next/server";
import { checkPassword, closeSession, openSession } from "@/lib/server/admin";


export async function POST(req: Request) {
  const { password, label } = (await req.json().catch(() => ({}))) as { password?: string; label?: string };
  if (!password || !checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }
  await openSession((label || "Accueil").trim().slice(0, 40));
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await closeSession();
  return NextResponse.json({ ok: true });
}
