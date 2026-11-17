import "server-only";
import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { env } from "./env";
import { safeEqual } from "./codes";

const COOKIE = "aibid_admin";

function sessionValue(label: string): string {
  const sig = createHmac("sha256", env("ADMIN_PASSWORD")).update(`admin-v1:${label}`).digest("base64url");
  return `${Buffer.from(label).toString("base64url")}.${sig}`;
}

export function checkPassword(pw: string): boolean {
  return safeEqual(pw, env("ADMIN_PASSWORD"));
}

export async function openSession(label: string) {
  (await cookies()).set(COOKIE, sessionValue(label), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 5,
  });
}

export async function closeSession() {
  (await cookies()).delete(COOKIE);
}

/** Retourne le nom du poste de contrôle si la session est valide. */
export async function adminLabel(): Promise<string | null> {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return null;
  const label = Buffer.from(v.split(".")[0] ?? "", "base64url").toString();
  return label && safeEqual(v, sessionValue(label)) ? label : null;
}
