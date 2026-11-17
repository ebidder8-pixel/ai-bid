import { Suspense } from "react";
import type { Metadata } from "next";
import { adminLabel } from "@/lib/server/admin";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { Scanner } from "@/components/admin/Scanner";

export const metadata: Metadata = { title: "Contrôle des billets", robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main className="min-h-dvh bg-navy-950 text-white">
      <Suspense fallback={null}>
        <Gate />
      </Suspense>
    </main>
  );
}

async function Gate() {
  const label = await adminLabel();
  return label ? <Scanner label={label} /> : <AdminLogin />;
}
