"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.08'/></svg>`;
const GRAIN_URL = `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`;
const EASE = "cubic-bezier(0.4, 0, 0.2, 1)";

const STEPS = [
  {
    n: "01",
    title: "The pet is the Chog",
    body: "Eyes, mouth, hat, and clothes pick the voice. A different picture is a different pet. No stand-in.",
  },
  {
    n: "02",
    title: "Set $CHOG aside",
    body: "Once a day, a chosen amount goes into the jar. The coins stay yours. You can take them back.",
  },
  {
    n: "03",
    title: "Come back tomorrow",
    body: "The streak is the days in a row. The mood follows that streak, in the voice the traits chose.",
  },
];

const TRAITS = [
  { src: "/figures/bubblegum.png", name: "Bubblegum", score: "8.7/10", line: "Heart eyes, peach hoodie. The voice leans sweet.", bg: "#F4845F" },
  { src: "/figures/laser.png", name: "Laser", score: "9/10", line: "Fire laser and a wizard hat. Hunger gets loud.", bg: "#6BBF7A" },
  { src: "/figures/crown.png", name: "Crown", score: "8.2/10", line: "A small crown and a fire shirt. Proud, even when peckish.", bg: "#E882B4" },
  { src: "/figures/quiet.png", name: "Quiet", score: "7.9/10", line: "Soft traits, a smaller voice. The same streak, said quietly.", bg: "#6EB5FF" },
];

const FAQ = [
  {
    q: "Is the pet a separate character?",
    a: "No. The pet is the Chog. Take the picture away and the pocket is empty. Traits on that picture choose how the mood sounds.",
  },
  {
    q: "Do I spend the $CHOG?",
    a: "No. You set it aside. It stays yours, and you can take it back. The streak is the part that counts. Taking coins back does not wipe the streak.",
  },
  {
    q: "What if I miss a day?",
    a: "The streak rests. The next set-aside starts again at day one. Coins already in the jar stay there until you take them.",
  },
  {
    q: "Do I need a wallet to try it?",
    a: "No. Demo mode uses four sample Chogs with real trait names from the collection. Connect is there when you want the Chog you hold on Monad.",
  },
  {
    q: "Where does this live?",
    a: "On Monad. The coin is $CHOG. Demo set-asides stay on this phone. A wallet that holds a Chog Genesis can use the deployed jar. The rules are the same ones.",
  },
];

function Grain({ className = "absolute inset-0" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none ${className}`}
      style={{
        opacity: 0.4,
        backgroundImage: GRAIN_URL,
        backgroundSize: "200px 200px",
        backgroundRepeat: "repeat",
      }}
    />
  );
}

export function Landing() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div data-testid="landing">
      <section className="relative overflow-hidden bg-[#F4845F]" style={{ minHeight: "calc(100dvh - 4rem)" }}>
        <Grain />
        <p
          aria-hidden="true"
          className="font-anton pointer-events-none absolute inset-x-0 top-[14%] text-center text-white uppercase select-none"
          style={{
            fontFamily: "var(--font-anton), sans-serif",
            fontSize: "clamp(96px, 28vw, 380px)",
            lineHeight: 0.8,
            letterSpacing: "-0.02em",
          }}
        >
          CHOG
        </p>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-64 bg-gradient-to-t from-black/40 to-transparent" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/figures/bubblegum.png"
          alt="Bubblegum Chog figurine"
          className="pointer-events-none absolute bottom-[26%] left-1/2 z-[2] h-[58%] w-auto max-w-none -translate-x-1/2 object-contain object-bottom sm:bottom-0 sm:h-[78%]"
        />
        <div className="absolute bottom-8 left-4 z-10 max-w-[340px] sm:bottom-16 sm:left-12">
          <p className="text-xs font-semibold tracking-[0.22em] text-white/90 uppercase">Chog Pocket</p>
          <h1
            className="font-anton mt-2 text-[42px] leading-[0.9] text-white uppercase sm:text-[68px]"
            style={{ fontFamily: "var(--font-anton), sans-serif" }}
          >
            The pet
            <br />
            is the Chog
          </h1>
          <p className="mt-3 hidden text-sm leading-relaxed text-white/85 sm:block">
            Traits pick the voice. A daily set-aside of $CHOG keeps the streak. The coins stay in the jar, and the jar is still yours.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Link
              href="/app"
              className="font-anton inline-flex h-12 items-center rounded-full bg-[#010828] px-5 text-sm text-white uppercase"
              style={{ fontFamily: "var(--font-anton), sans-serif" }}
            >
              Open pocket
            </Link>
            <button
              type="button"
              className="grid h-12 w-12 place-items-center rounded-full border-2 border-white text-white transition-transform duration-150 hover:scale-105"
              onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "auto", block: "start" })}
            >
              <ArrowRight size={20} />
              <span className="sr-only">How it works</span>
            </button>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-[1180px] px-4 py-20 sm:px-8 sm:py-28">
        <p className="font-condiment text-4xl text-[#6FFF00]" style={{ fontFamily: "var(--font-condiment), cursive" }}>
          three moves
        </p>
        <h2 className="font-anton mt-2 text-5xl uppercase sm:text-7xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          How it works
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step) => (
            <article key={step.n} className="liquid-glass rounded-[32px] p-7">
              <p className="font-anton text-sm text-[#6FFF00]">{step.n}</p>
              <h3 className="font-anton mt-4 text-3xl leading-none uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[#EFF4FF]/75">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#6BBF7A]">
        <Grain />
        <div className="relative mx-auto grid max-w-[1180px] items-center gap-10 px-4 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1fr_0.8fr]">
          <div className="text-white">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase">The jar</p>
            <h2 className="font-anton mt-3 text-5xl leading-[0.9] uppercase sm:text-7xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              Set a coin
              <br />
              aside
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
              50, 100, 250, or 1000 $CHOG. Once a day. The jar fills. The wallet still owns it. Withdraw does not break the streak. A second set-aside on the same day does not count.
            </p>
            <Link
              href="/app"
              className="font-anton mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#010828] px-6 text-sm uppercase text-white"
              style={{ fontFamily: "var(--font-anton), sans-serif" }}
            >
              Try a set-aside <ArrowRight size={18} />
            </Link>
          </div>
          <div className="flex items-end justify-center gap-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/figures/laser.png" alt="Laser Wizard figurine" className="h-72 w-auto object-contain sm:h-96" />
            <div className="relative mb-6 h-64 w-28 overflow-hidden rounded-t-3xl rounded-b-[2.2rem] border-2 border-white/70 bg-white/25 shadow-[inset_0_0_0_8px_rgba(255,255,255,0.15)]" aria-hidden="true">
              <div className="absolute inset-x-0 bottom-0 h-[62%] bg-[#6FFF00]" />
              <div className="absolute inset-x-3 top-2 h-2 rounded-full bg-white/70" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 py-20 sm:px-8 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-condiment text-4xl text-[#6FFF00]" style={{ fontFamily: "var(--font-condiment), cursive" }}>
              rarity, said out loud
            </p>
            <h2 className="font-anton mt-2 text-5xl uppercase sm:text-7xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              Traits pick
              <br />
              the voice
            </h2>
          </div>
          <Link href="/gallery" className="font-anton text-sm uppercase text-[#6FFF00]" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            See all four
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {TRAITS.map((trait) => (
            <article key={trait.name} className="liquid-glass rounded-[32px] p-4">
              <div className="relative h-64 overflow-hidden rounded-[24px]" style={{ background: trait.bg, transition: `background-color 650ms ${EASE}` }}>
                <Grain />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={trait.src} alt="" className="relative z-[1] mx-auto h-full object-contain object-bottom" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 px-2 pb-2">
                <div>
                  <p className="text-[11px] tracking-[0.14em] text-[#EFF4FF]/60 uppercase">Mood score</p>
                  <p className="font-anton text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                    {trait.name} · {trait.score}
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-[#EFF4FF]/70">{trait.line}</p>
                </div>
                <Link
                  href="/app"
                  aria-label={`Open the pocket for ${trait.name}`}
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#b724ff] to-[#7c3aed] shadow-lg shadow-purple-500/40 transition-transform duration-150 hover:scale-110"
                >
                  <ArrowRight size={18} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10">
        <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-20 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="font-condiment text-4xl text-[#6FFF00]" style={{ fontFamily: "var(--font-condiment), cursive" }}>
              day after day
            </p>
            <h2 className="font-anton mt-2 text-5xl uppercase sm:text-7xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              The streak
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-[#EFF4FF]/75">
              Same day, the streak stays put. The next morning, it grows. Skip a morning and it is still alive. Skip another and it rests at zero. The mood shifts with it: peckish, nibbling, cozy, then loud if the traits are wild.
            </p>
          </div>
          <ol className="grid grid-cols-4 gap-3 sm:grid-cols-7">
            {["1", "2", "3", "4", "5", "6", "7"].map((day, index) => (
              <li key={day} className="liquid-glass flex aspect-square items-center justify-center rounded-[24px]">
                <span className={`font-anton text-3xl ${index < 4 ? "text-[#6FFF00]" : "text-[#EFF4FF]/35"}`} style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                  {day}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="story" className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/care/care-center.jpg" alt="" className="h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-[#010828]/72" />
        </div>
        <div className="relative mx-auto max-w-[900px] px-4 py-24 sm:px-8 sm:py-32">
          <p className="font-condiment text-4xl text-[#6FFF00]" style={{ fontFamily: "var(--font-condiment), cursive" }}>
            on Monad
          </p>
          <h2 className="font-anton mt-2 text-5xl leading-[0.92] uppercase sm:text-7xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            $CHOG stays
            <br />
            a coin you keep
          </h2>
          <div className="mt-6 max-w-xl space-y-4 text-sm leading-relaxed text-[#EFF4FF]/85 sm:text-base">
            <p>
              Chog is the picture collection and the coin. This pocket uses both. The picture is the pet. The coin is the daily habit: set some aside, leave it, come back.
            </p>
            <p>
              It runs on Monad. There is no other chain in this app. The official coin address is the one printed on chog.xyz. The jar is deployed for a wallet that holds a Chog Genesis. Demo mode is the full loop with no wallet.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="https://chog.xyz/" className="font-anton inline-flex h-12 items-center rounded-full bg-[#6FFF00] px-5 text-sm text-[#010828] uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              chog.xyz
            </a>
            <a href="https://www.monad.xyz/" className="font-anton inline-flex h-12 items-center rounded-full border border-white/30 px-5 text-sm uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              Monad
            </a>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[900px] px-4 py-20 sm:px-8 sm:py-28">
        <h2 className="font-anton text-5xl uppercase sm:text-7xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          Questions
        </h2>
        <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {FAQ.map((item, index) => {
            const open = openFaq === index;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenFaq(open ? -1 : index)}
                >
                  <span className="font-anton text-xl uppercase sm:text-2xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                    {item.q}
                  </span>
                  <span className="font-anton text-2xl text-[#6FFF00]">{open ? "–" : "+"}</span>
                </button>
                {open ? <p className="max-w-2xl pb-5 text-sm leading-relaxed text-[#EFF4FF]/75">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#E882B4]">
        <Grain />
        <div className="relative mx-auto flex max-w-[1180px] flex-col items-start gap-8 px-4 py-20 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="text-white">
            <p className="font-condiment text-5xl" style={{ fontFamily: "var(--font-condiment), cursive" }}>
              Stay soft
            </p>
            <h2 className="font-anton text-5xl leading-[0.9] uppercase sm:text-7xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              Keep it.
              <br />
              Set a coin aside.
              <br />
              Come back tomorrow.
            </h2>
          </div>
          <Link
            href="/app"
            className="font-anton inline-flex items-center gap-3 text-4xl text-white uppercase sm:text-6xl"
            style={{ fontFamily: "var(--font-anton), sans-serif" }}
          >
            Open pocket <ArrowRight className="h-8 w-8 sm:h-12 sm:w-12" />
          </Link>
        </div>
      </section>
    </div>
  );
}
