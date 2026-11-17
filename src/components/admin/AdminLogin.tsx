"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, label }),
    });
    if (res.ok) router.refresh();
    else {
      setError((await res.json().catch(() => ({}))).error ?? "Connexion impossible");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-horizontal-dark.svg" alt="e-BIDDER" className="h-10 w-auto self-start" />
      <h1 className="mt-8 font-display text-3xl font-black">Contrôle des billets</h1>
      <p className="mt-2 text-navy-200">AI-BID 2027 · accès réservé à l&apos;équipe d&apos;accueil.</p>
      <label className="mt-8 block">
        <span className="text-sm text-navy-200">Nom du poste</span>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Ex. Entrée principale"
          className="mt-1.5 block w-full rounded-xl bg-white/10 px-4 py-3.5 text-white placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </label>
      <label className="mt-4 block">
        <span className="text-sm text-navy-200">Mot de passe</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1.5 block w-full rounded-xl bg-white/10 px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </label>
      {error && (
        <p role="alert" className="mt-4 text-sm font-medium text-[#FF8A80]">
          {error}
        </p>
      )}
      <button disabled={busy} className="mt-6 rounded-full bg-orange-500 py-4 font-display text-lg font-bold hover:bg-orange-600 disabled:opacity-60">
        {busy ? "Connexion…" : "Ouvrir le scanner"}
      </button>
    </form>
  );
}
