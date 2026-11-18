"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { canSeeAdmin, canSeeAudit, canSeeOps, useAuth } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/labels";
import { Spinner } from "./ui";

export function Brand() {
  return (
    <Link href="/projects" className="inline-flex items-center gap-2.5 text-lg font-extrabold tracking-[0.12em]" aria-label="HAN home">
      <span aria-hidden className="grid h-8 w-8 place-items-center rounded-[10px_10px_10px_3px] bg-brand tracking-normal text-white">H</span>
      HAN
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const path = usePathname();
  const links = [
    { href: "/projects", label: "Projects", show: true },
    { href: "/admin", label: "Administration", show: canSeeAdmin(user) },
    { href: "/admin/ops", label: "Operations", show: canSeeOps(user) },
    { href: "/admin/audit", label: "Audit", show: canSeeAudit(user) },
  ].filter((l) => l.show);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-7">
          <div className="flex items-center gap-6">
            <Brand />
            <nav aria-label="Main" className="flex gap-1">
              {links.map((l) => {
                const active = l.href === "/projects" ? path.startsWith("/projects") : path === l.href;
                return (
                  <Link key={l.href} href={l.href} aria-current={active ? "page" : undefined}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold ${active ? "bg-brand-light text-brand-dark" : "text-ink-soft hover:bg-wash"}`}>
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <span className="hidden text-right leading-tight sm:block">
                <span className="block font-semibold">{user.display_name}</span>
                <span className="block text-xs text-ink-muted">{ROLE_LABEL[user.role] ?? user.role}</span>
              </span>
            ) : null}
            <button type="button" className="btn btn-secondary min-h-[34px] px-3" onClick={() => void signOut()}>Sign out</button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-7 sm:px-7">
        {loading ? <Spinner label="Loading your workspace" /> : user ? children : null}
      </main>
      <footer className="border-t border-line bg-white px-4 py-4 text-center text-xs text-ink-muted">
        AI translates. Humans understand. TNI decides.
      </footer>
    </div>
  );
}
