"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

const LINKS = [
  { href: "/app", label: "Pocket" },
  { href: "/gallery", label: "Gallery" },
  { href: "/collection", label: "Collection" },
  { href: "/care", label: "Care" },
  { href: "/#story", label: "Story" },
  { href: "/#faq", label: "FAQ" },
  { href: "/connect", label: "Connect" },
] as const;

function active(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return pathname === href;
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[#010828] font-inter text-[#EFF4FF]">
      <header
        data-testid="motion-nav"
        className="sticky top-0 z-50 border-b border-white/10 bg-[#010828]/92 backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 sm:px-6">
          <Link
            href="/"
            className="font-anton text-[22px] tracking-wide uppercase"
            style={{ fontFamily: "var(--font-anton), sans-serif" }}
          >
            Chog<span className="text-[#6FFF00]">.</span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Main">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-anton rounded-full px-3 py-2 text-[13px] uppercase transition-colors duration-150 ${
                  active(pathname, link.href) ? "text-[#6FFF00]" : "text-[#EFF4FF]/75 hover:text-[#6FFF00]"
                }`}
                style={{ fontFamily: "var(--font-anton), sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/app"
            className="font-anton ml-auto hidden h-10 items-center rounded-full bg-[#6FFF00] px-5 text-[13px] uppercase text-[#010828] transition-transform duration-150 hover:scale-[1.04] lg:inline-flex"
            style={{ fontFamily: "var(--font-anton), sans-serif" }}
          >
            Open pocket
          </Link>
          <button
            type="button"
            className="ml-auto grid h-11 w-11 place-items-center rounded-full border border-white/20 text-[#EFF4FF] lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            data-testid="menu-button"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
        {open ? (
          <div id="mobile-menu" data-testid="mobile-menu" className="border-t border-white/10 bg-[#010828] px-4 py-2 lg:hidden">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-anton block border-b border-white/10 py-4 text-[28px] leading-none uppercase"
                style={{ fontFamily: "var(--font-anton), sans-serif" }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/app"
              onClick={() => setOpen(false)}
              className="font-anton mt-4 mb-3 flex h-12 items-center justify-center rounded-full bg-[#6FFF00] text-[16px] uppercase text-[#010828]"
              style={{ fontFamily: "var(--font-anton), sans-serif" }}
            >
              Open pocket
            </Link>
          </div>
        ) : null}
      </header>
      <main>{children}</main>
      <footer data-testid="site-footer" className="border-t border-white/10 bg-[#010828] px-4 py-16 sm:px-8">
        <div className="mx-auto grid max-w-[1180px] gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="font-anton flex flex-col gap-1 text-[2.25rem] uppercase leading-none sm:gap-2 sm:text-6xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              <span className="block">Chog</span>
              <span className="block">Pocket</span>
            </p>
            <p className="font-condiment mt-5 text-3xl leading-normal text-[#6FFF00] sm:text-4xl" style={{ fontFamily: "var(--font-condiment), cursive" }}>
              keep the streak
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#EFF4FF]/70">
              Your Chog is the pet. Feed it by setting $CHOG aside once a day. The coins stay yours.
            </p>
          </div>
          <div>
            <p className="font-anton text-xs tracking-[0.18em] text-[#6FFF00] uppercase">The pocket</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/app" className="hover:text-[#6FFF00]">Open the pocket</Link></li>
              <li><Link href="/gallery" className="hover:text-[#6FFF00]">Figurine gallery</Link></li>
              <li><Link href="/collection" className="hover:text-[#6FFF00]">Mood collection</Link></li>
              <li><Link href="/care" className="hover:text-[#6FFF00]">Care</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-anton text-xs tracking-[0.18em] text-[#6FFF00] uppercase">Read</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li><Link href="/#how" className="hover:text-[#6FFF00]">How it works</Link></li>
              <li><Link href="/#story" className="hover:text-[#6FFF00]">$CHOG on Monad</Link></li>
              <li><Link href="/#faq" className="hover:text-[#6FFF00]">Questions</Link></li>
              <li><Link href="/connect" className="hover:text-[#6FFF00]">Connect a wallet</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-anton text-xs tracking-[0.18em] text-[#6FFF00] uppercase">Outside</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li><a href="https://chog.xyz/" className="hover:text-[#6FFF00]">chog.xyz</a></li>
              <li><a href="https://www.monad.xyz/" className="hover:text-[#6FFF00]">Monad</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
