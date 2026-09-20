"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon-sprite";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: "home" },
  { href: "/recetas", label: "Biblioteca", icon: "book" },
  { href: "/plan", label: "Planeador", icon: "calendar" },
  { href: "/listas", label: "Lista de súper", icon: "cart" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function AppNav({ pendingItems }: { pendingItems: number }) {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar — desktop */}
      <aside className="hidden w-60 shrink-0 flex-col gap-8 border-r border-border bg-surface px-5 py-8 sm:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-coral text-white">
            <Icon name="leaf" size={22} />
          </span>
          <span className="font-display text-xl font-bold">NutriPlus</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors ${
                  active ? "bg-coral-tint text-coral-dark" : "text-[#4A4844] hover:bg-app-bg"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon name={item.icon} />
                  {item.label}
                </span>
                {item.href === "/listas" && pendingItems > 0 && (
                  <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-bold text-white">
                    {pendingItems}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Bottom tab bar — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex h-[72px] items-center border-t border-border bg-surface pb-2 sm:hidden">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center gap-1 ${
                active ? "text-coral-dark" : "text-ink-faint"
              }`}
            >
              <Icon name={item.icon} />
              <span className={`text-[11px] ${active ? "font-bold" : "font-semibold"}`}>
                {item.label === "Lista de súper" ? "Súper" : item.label}
              </span>
              {item.href === "/listas" && pendingItems > 0 && (
                <span className="absolute right-6 top-0 h-2 w-2 rounded-full bg-lime" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
