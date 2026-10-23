"use client";

import { useLiveStats } from "@/lib/use-live-stats";
import { ArrowRight, ArrowUpRight, Play, Plus, Star } from "lucide-react";
import Link from "next/link";

/**
 * Motion Sites prompt: CozyPaws (id cozypaws).
 * Palette, type, breakpoints, and the word-pop timing stay as written.
 * The shop copy and pictures are the Chog pocket.
 */

const INK = "#1a3d1a";
const ORANGE = "#E86A10";

export function CozyCare() {
  const stats = useLiveStats();
  const supplyText = stats?.genesisSupply != null ? stats.genesisSupply.toLocaleString("en-US") : "…";
  const jarText = stats?.live ? `${Math.floor(Number(stats.jarBalance ?? 0)).toLocaleString("en-US")} $CHOG saved` : "Live jar";
  const feedersText = stats?.live ? `${stats.feeders ?? 0} feeders` : "…";
  return (
    <div
      data-testid="cozy-care"
      className="flex flex-col overflow-hidden font-inter lg:min-h-[calc(100dvh-4rem)]"
      style={{ background: "#EFFDF0", color: INK, fontFamily: "var(--font-inter), sans-serif" }}
    >
      <section className="relative flex flex-1 flex-col overflow-hidden lg:min-h-[calc(100dvh-4rem)]">
        <div className="hidden flex-1 lg:block">
          <div className="px-12 pt-16 text-center" style={{ position: "relative", zIndex: 20 }}>
            <h1
              className="font-serif-display tracking-tight"
              style={{
                fontFamily: "var(--font-serif-display), serif",
                color: INK,
                fontSize: "clamp(60px, 7.5vw, 110px)",
                lineHeight: 0.95,
              }}
            >
              <span className="animate-word-pop delay-200 inline-block">Everything</span>
              <br />
              <span className="animate-word-pop delay-300 inline-block">Your</span>{" "}
              <span className="animate-word-pop delay-400 inline-block">Chog</span>{" "}
              <span className="animate-word-pop delay-500 inline-block">Loves</span>
            </h1>
          </div>
          <Link
            href="/app"
            className="animate-slide-in-left delay-600 absolute top-[50px] left-12"
            style={{ width: "clamp(160px, 14vw, 260px)" }}
          >
            <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "260 / 257" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/care/care-jar.jpg" alt="A glass jar of coins" className="h-full w-full object-cover" />
              <span className="absolute right-3 bottom-3 grid h-10 w-10 place-items-center rounded-full text-white" style={{ background: INK }}>
                <ArrowUpRight size={18} />
              </span>
            </div>
            <p className="mt-2 text-gray-700" style={{ fontSize: "clamp(14px, 1.1vw, 18px)" }}>Coin jar</p>
            <p className="font-bold" style={{ color: INK }}>{jarText}</p>
          </Link>
          <div
            className="animate-slide-in-right delay-700 absolute top-[50px] right-12"
            style={{ width: "clamp(120px, 10vw, 177px)" }}
          >
            <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "177 / 287" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/care/care-portrait.jpg" alt="A pink Chog close up" className="h-full w-full object-cover" />
              <Link href="/gallery" aria-label="Play the gallery" className="absolute bottom-8 left-1/2 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-full text-white" style={{ background: INK }}>
                <Play size={16} fill="white" />
              </Link>
            </div>
            <p className="mt-2 text-center text-xs text-gray-700">Watch a streak grow on this phone</p>
          </div>
        </div>

        <div className="hidden flex-1 md:block lg:hidden">
          <h1 className="font-serif-display px-4 pt-6 text-center text-7xl leading-none" style={{ color: INK }}>
            Everything
            <br />
            Your Chog Loves
          </h1>
          <Link href="/app" className="absolute top-[80px] left-4 w-40">
            <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "1" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/care/care-jar.jpg" alt="" className="h-full w-full object-cover" />
            </div>
            <p className="mt-1 text-sm">Coin jar</p>
            <p className="text-sm font-bold">{jarText}</p>
          </Link>
          <div className="absolute top-[80px] right-4 w-[120px]">
            <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "3 / 4" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/care/care-portrait.jpg" alt="" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 pt-2 md:hidden">
          <h1
            className="font-serif-display text-center"
            style={{ color: INK, fontSize: 36, lineHeight: 0.95 }}
          >
            <span className="animate-word-pop delay-200 inline-block">Everything</span>
            <br />
            <span className="animate-word-pop delay-400 inline-block">Your Chog Loves</span>
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">A daily jar. A streak. A mood that knows its traits.</p>
          <Link
            href="/app"
            className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
            style={{ background: ORANGE }}
          >
            Open the pocket <ArrowRight size={16} />
          </Link>
          <div className="mt-4 flex gap-3">
            <div className="flex-1">
              <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "1" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/care/care-jar.jpg" alt="Coin jar" className="h-full w-full object-cover" />
              </div>
              <p className="mt-1 text-sm text-gray-700">Coin jar</p>
              <p className="text-sm font-bold">{jarText}</p>
            </div>
            <div className="flex-1">
              <div className="overflow-hidden rounded-2xl" style={{ aspectRatio: "3 / 4" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/care/care-portrait.jpg" alt="Chog portrait" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm font-semibold">
            <span className="inline-flex items-center gap-2">
              {supplyText}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/care/care-avatar.jpg" alt="" className="h-6 w-6 rounded-full object-cover" />
              <Link href="/collection" aria-label="See the collection" className="grid h-6 w-6 place-items-center rounded-full text-white" style={{ background: INK }}>
                <Plus size={12} />
              </Link>
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden items-end md:flex">
          <div className="animate-photo-reveal delay-700 relative min-w-0 flex-1" style={{ maxHeight: "min(42vh, 34vw)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/care/care-left.jpg" alt="Four Chogs together" className="block h-auto w-full" />
            <div className="pointer-events-auto absolute left-6 flex items-center gap-2 text-white" style={{ bottom: "clamp(20px, 4vh, 50px)" }}>
              <p className="text-3xl font-semibold">{supplyText}</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/care/care-avatar.jpg" alt="" className="h-8 w-8 rounded-full object-cover" />
              <Link href="/collection" aria-label="See the collection" className="grid h-8 w-8 place-items-center rounded-full" style={{ background: INK }}>
                <Plus size={14} />
              </Link>
            </div>
          </div>
          <div className="animate-photo-reveal delay-600 relative min-w-0 flex-[1.265]" style={{ maxHeight: "min(52vh, 42vw)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/care/care-center.jpg" alt="A Chog beside a jar of coins" className="block h-auto w-full" />
            <div className="pointer-events-auto absolute inset-x-0 flex flex-col items-center text-white" style={{ bottom: "clamp(20px, 4vh, 50px)" }}>
              <p className="text-center text-2xl font-semibold">Best kept in the jar</p>
              <Link href="/app" className="mt-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: ORANGE }}>
                Open the pocket <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="animate-photo-reveal delay-900 relative min-w-0 flex-1" style={{ maxHeight: "min(42vh, 34vw)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/care/care-right.jpg" alt="A Chog celebrating a coin" className="block h-auto w-full" />
            <p className="absolute right-6 inline-flex items-center gap-1 text-3xl font-semibold text-white" style={{ bottom: "clamp(20px, 4vh, 50px)" }}>
              {feedersText} <Star size={22} fill={ORANGE} color={ORANGE} />
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
