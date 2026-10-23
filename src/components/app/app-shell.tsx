"use client";

import {
  CalendarDays,
  Coins,
  Ellipsis,
  Gamepad2,
  History,
  Home,
  Images,
  Layers,
  PawPrint,
  Scale,
  Settings,
  Trophy,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { getPlayChrome, getPlayChromeServer, subscribePlayChrome } from "@/lib/play-chrome";

const TABS = [
  { href: "/app", label: "Today", icon: Home, exact: true },
  { href: "/app/jar", label: "Jar", icon: Coins, exact: false },
  { href: "/app/streak", label: "Streak", icon: CalendarDays, exact: false },
  { href: "/app/traits", label: "Traits", icon: Layers, exact: false },
  { href: "/app/history", label: "History", icon: History, exact: false },
  { href: "/app/pets", label: "Pets", icon: PawPrint, exact: false },
  { href: "/app/arcade", label: "Arcade", icon: Gamepad2, exact: false },
  { href: "/app/leaderboard", label: "Board", icon: Trophy, exact: false },
  { href: "/app/settings", label: "Settings", icon: Settings, exact: false },
] as const;

const BAR = [
  { href: "/app", label: "Today", icon: Home, exact: true },
  { href: "/app/jar", label: "Jar", icon: Coins, exact: false },
  { href: "/app/arcade", label: "Arcade", icon: Gamepad2, exact: false },
  { href: "/app/leaderboard", label: "Board", icon: Trophy, exact: false },
] as const;

const MORE: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: "/app/streak", label: "Streak", icon: CalendarDays },
  { href: "/app/traits", label: "Traits", icon: Layers },
  { href: "/app/history", label: "History", icon: History },
  { href: "/app/pets", label: "Pets", icon: PawPrint },
  { href: "/app/settings", label: "Settings", icon: Settings },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/judges", label: "For judges", icon: Scale },
  { href: "/connect", label: "Connect wallet", icon: Wallet },
];

function isOn(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function labelClass() {
  return "font-anton text-[11px] uppercase leading-none";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const play = useSyncExternalStore(subscribePlayChrome, getPlayChrome, getPlayChromeServer);
  const [morePath, setMorePath] = useState<string | null>(null);
  const moreOpen = morePath === pathname;
  const moreOn = MORE.some((item) => isOn(pathname, item.href, false));

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMorePath(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  return (
    <div data-testid="motion-nav" className="pocket-app min-h-dvh bg-[#010828] text-[#EFF4FF] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-white/10 bg-[#071033] lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:px-4 lg:py-6" data-testid="app-sidebar">
        <Link href="/" className="font-anton px-3 text-[28px] uppercase leading-none" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          Chog<span className="text-[#6FFF00]">.</span>
        </Link>
        <p className="font-condiment mt-2 px-3 text-2xl text-[#6FFF00]" style={{ fontFamily: "var(--font-condiment), cursive" }}>
          pocket
        </p>
        <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Pocket">
          {TABS.map((tab) => {
            const on = isOn(pathname, tab.href, tab.exact);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex min-h-[var(--control)] items-center gap-3 rounded-[var(--radius-18)] px-3 py-3 text-sm ${on ? "bg-[#6FFF00] text-[#010828]" : "text-[#EFF4FF]/80 hover:bg-white/5"}`}
                aria-current={on ? "page" : undefined}
              >
                <Icon size={18} />
                <span className="font-anton uppercase tracking-wide" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 space-y-2 border-t border-white/10 px-3 pt-4 text-sm">
          <Link href="/connect" className="block text-[#6FFF00] hover:underline">
            Connect a wallet
          </Link>
          <Link href="/gallery" className="block text-[#EFF4FF]/70 hover:text-[#6FFF00]">
            Gallery
          </Link>
          <Link href="/judges" className="block text-[#EFF4FF]/70 hover:text-[#6FFF00]">
            For judges
          </Link>
          <Link href="/" className="block text-[#EFF4FF]/70 hover:text-[#6FFF00]">
            Back to the story
          </Link>
        </div>
      </aside>
      <div className="flex min-h-dvh flex-col">
        <header className="flex h-14 items-center justify-between gap-3 px-4 lg:hidden">
          {play.playing ? (
            <div className="flex min-h-11 w-full items-center justify-between gap-3" data-testid="play-chrome">
              <Link href="/app/arcade" className="font-anton inline-flex min-h-11 items-center text-sm uppercase text-[#6FFF00]" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                ← Arcade
              </Link>
              <p className="min-w-0 truncate text-xs tracking-[0.14em] text-[#EFF4FF]/70 uppercase">{play.title}</p>
              <p className="font-anton text-2xl leading-none text-[#6FFF00]" data-testid="play-score" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                {play.score}
              </p>
            </div>
          ) : (
            <>
              <Link href="/" className="font-anton inline-flex min-h-11 items-center text-xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                Chog<span className="text-[#6FFF00]">.</span>
              </Link>
              <Link href="/connect" className="font-anton inline-flex min-h-11 items-center text-xs uppercase tracking-wide text-[#6FFF00]" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                Wallet
              </Link>
            </>
          )}
        </header>
        <main className="flex-1">{children}</main>
        {play.playing ? null : (
          <nav
            data-testid="app-tabs"
            className="sticky bottom-0 z-40 border-t border-white/10 bg-[#010828]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
            aria-label="Pocket"
          >
            <ul className="grid grid-cols-5">
              {BAR.map((tab) => {
                const on = isOn(pathname, tab.href, tab.exact);
                const Icon = tab.icon;
                const centre = tab.href === "/app/arcade";
                return (
                  <li key={tab.href}>
                    <Link
                      href={tab.href}
                      className={`mx-auto flex min-h-14 w-full max-w-[76px] flex-col items-center justify-center gap-1 rounded-full px-1 ${on ? "bg-[#6FFF00] text-[#010828]" : centre ? "text-[#6FFF00]" : "text-[#EFF4FF]/70"}`}
                      aria-current={on ? "page" : undefined}
                    >
                      <Icon size={centre ? 22 : 18} strokeWidth={centre ? 2.4 : 2} />
                      <span className={labelClass()} style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                        {tab.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  data-testid="more-button"
                  className={`mx-auto flex min-h-14 w-full max-w-[76px] flex-col items-center justify-center gap-1 rounded-full px-1 ${moreOn || moreOpen ? "bg-[#6FFF00] text-[#010828]" : "text-[#EFF4FF]/70"}`}
                  aria-expanded={moreOpen}
                  aria-controls="more-sheet"
                  onClick={() => setMorePath(pathname)}
                >
                  <Ellipsis size={18} />
                  <span className={labelClass()} style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                    More
                  </span>
                </button>
              </li>
            </ul>
          </nav>
        )}
        {moreOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" aria-label="Close" className="absolute inset-0 bg-[#010828]/72 backdrop-blur-md" onClick={() => setMorePath(null)} />
            <div
              id="more-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="More"
              data-testid="more-sheet"
              className="sheet-up absolute inset-x-0 bottom-0 rounded-t-[var(--radius-24)] border-t border-white/10 bg-[#071033]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            >
              <div
                className="flex justify-center pt-3 pb-2"
                onPointerDown={(event) => {
                  const sheet = event.currentTarget.parentElement;
                  if (!sheet) return;
                  const startY = event.clientY;
                  const move = (ev: PointerEvent) => {
                    const dy = Math.max(0, ev.clientY - startY);
                    sheet.style.transform = `translateY(${dy}px)`;
                  };
                  const up = (ev: PointerEvent) => {
                    window.removeEventListener("pointermove", move);
                    window.removeEventListener("pointerup", up);
                    if (ev.clientY - startY > 72) setMorePath(null);
                    else sheet.style.transform = "";
                  };
                  window.addEventListener("pointermove", move);
                  window.addEventListener("pointerup", up);
                }}
              >
                <div className="h-1.5 w-10 rounded-full bg-white/35" aria-hidden />
              </div>
              <ul className="px-3 pb-4">
                {MORE.map((item) => {
                  const on = isOn(pathname, item.href, false);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex min-h-11 items-center gap-3 rounded-[var(--radius-18)] px-3 ${on ? "bg-[#6FFF00] text-[#010828]" : "text-[#EFF4FF]"}`}
                        aria-current={on ? "page" : undefined}
                        onClick={() => setMorePath(null)}
                      >
                        <Icon size={18} />
                        <span className="font-anton text-sm uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PageHeading({ kicker, title, lede }: { kicker: string; title: string; lede: string }) {
  return (
    <header className="max-w-xl">
      <p className="font-condiment text-3xl text-[#6FFF00]" style={{ fontFamily: "var(--font-condiment), cursive" }}>
        {kicker}
      </p>
      <h1 className="font-anton mt-1 text-5xl uppercase leading-[0.9]" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#EFF4FF]/75">{lede}</p>
    </header>
  );
}
