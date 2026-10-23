import { Mail } from "lucide-react";
import Link from "next/link";
import { GithubIcon, TwitterIcon } from "@/components/motion/brand-icons";

/**
 * Motion Sites prompt: Orbis NFT (id orbis-nft-landing).
 * Dark field, Anton, Condiment, neon, liquid glass, and the four-part page stay.
 * The words are the Chog pocket. The clips in that prompt are not CC0, so the
 * cards use original Chog stills with a slow zoom instead of those files.
 */

const CARDS = [
  { src: "/figures/bubblegum.png", score: "8.7/10", name: "Sweet" },
  { src: "/figures/laser.png", score: "9/10", name: "Wild" },
  { src: "/figures/crown.png", score: "8.2/10", name: "Proud" },
];

function Social({ stacked }: { stacked?: boolean }) {
  const links = [
    { href: "https://chog.xyz/", label: "Chog site", icon: <Mail size={20} /> },
    { href: "https://www.monad.xyz/", label: "Monad", icon: <TwitterIcon className="h-5 w-5" /> },
    { href: "/gallery", label: "Gallery", icon: <GithubIcon className="h-5 w-5" /> },
  ];
  return (
    <div className={stacked ? "flex flex-col gap-3" : "flex justify-center gap-3"}>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          aria-label={link.label}
          className="liquid-glass grid h-14 w-14 place-items-center rounded-[1rem] text-[#EFF4FF] transition hover:bg-white/10"
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}

export function OrbisCollection() {
  return (
    <div className="relative overflow-x-hidden bg-[#010828] font-mono text-[#EFF4FF]" data-testid="orbis-collection">
      <div
        aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30"
        style={{
          backgroundImage: "url(/texture.png)",
          backgroundSize: "cover",
          mixBlendMode: "lighten",
          opacity: 0.6,
        }}
      />

      <section className="relative min-h-screen overflow-hidden rounded-b-[32px]" data-testid="orbis-hero">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/care/care-center.jpg" alt="" className="animate-kenburns h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-[#010828]/55" />
        </div>
        <div className="relative mx-auto max-w-[1831px] px-4 sm:px-8">
          <div className="relative max-w-[780px] pt-16 pb-28 lg:ml-32 lg:pt-28">
            <h1
              className="font-anton text-[40px] leading-[1.05] uppercase sm:text-[60px] sm:leading-none md:text-[75px] lg:text-[90px]"
              style={{ fontFamily: "var(--font-anton), sans-serif" }}
            >
              Your Chog
              <br />
              and ( its ) own mood
            </h1>
            <p
              className="font-condiment absolute top-6 -right-2 -rotate-1 text-[24px] text-[#6FFF00] opacity-90 mix-blend-exclusion sm:text-[36px] lg:text-[48px]"
              style={{ fontFamily: "var(--font-condiment), cursive" }}
            >
              pocket pet
            </p>
            <div className="mt-8 lg:hidden">
              <Social />
            </div>
          </div>
        </div>
      </section>

      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/care/care-right.jpg" alt="" className="animate-kenburns h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-[#010828]/50" />
        </div>
        <div className="relative mx-auto flex max-w-[1831px] flex-col gap-16 px-4 py-16 sm:px-8 sm:py-24">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="relative">
              <h2
                className="font-anton text-[32px] uppercase sm:text-[48px] lg:text-[60px]"
                style={{ fontFamily: "var(--font-anton), sans-serif" }}
              >
                Hello!
                <br />
                I&apos;m Chog
              </h2>
              <p
                className="font-condiment absolute right-0 -bottom-4 -rotate-2 text-[36px] text-[#6FFF00] mix-blend-exclusion sm:text-[52px] lg:text-[68px]"
                style={{ fontFamily: "var(--font-condiment), cursive" }}
              >
                Chog
              </p>
            </div>
            <p className="max-w-[266px] text-sm uppercase sm:text-base">
              A picture with a personality. Feed it by setting $CHOG aside. The coins stay yours. The streak is the habit.
            </p>
          </div>
          <div className="flex justify-between gap-8">
            <p className="max-w-[266px] text-sm uppercase opacity-10">
              A picture with a personality. Feed it by setting $CHOG aside. The coins stay yours. The streak is the habit.
            </p>
            <p className="hidden max-w-[266px] text-sm uppercase opacity-10 lg:block">
              A picture with a personality. Feed it by setting $CHOG aside. The coins stay yours. The streak is the habit.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#010828]">
        <div className="mx-auto max-w-[1831px] px-4 py-16 sm:px-8">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <h2
              className="font-anton text-[32px] uppercase sm:text-[48px] lg:text-[60px]"
              style={{ fontFamily: "var(--font-anton), sans-serif" }}
            >
              Collection of
              <br />
              <span className="ml-12 inline-block sm:ml-24 lg:ml-32">
                <span className="font-condiment text-[#6FFF00] normal-case" style={{ fontFamily: "var(--font-condiment), cursive" }}>
                  Chog
                </span>{" "}
                moods
              </span>
            </h2>
            <Link href="/gallery" className="block">
              <span className="flex items-end gap-3">
                <span className="font-anton text-[32px] uppercase sm:text-[48px] lg:text-[60px]" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                  SEE
                </span>
                <span className="font-anton pb-1 text-[20px] uppercase leading-none sm:text-[28px] lg:text-[36px]" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                  ALL
                  <br />
                  CHOGS
                </span>
              </span>
              <span className="mt-2 block h-[6px] w-full bg-[#6FFF00] sm:h-[10px]" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((card) => (
              <article key={card.name} className="liquid-glass rounded-[32px] p-[18px] transition hover:bg-white/10">
                <div className="relative overflow-hidden rounded-[24px] pb-[100%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.src} alt={card.name} className="animate-kenburns absolute inset-0 h-full w-full object-contain p-6" />
                </div>
                <div className="liquid-glass mt-4 flex items-center justify-between rounded-[20px] px-5 py-4">
                  <div>
                    <p className="text-[11px] text-[#EFF4FF]/70">MOOD SCORE:</p>
                    <p className="text-[16px]">{card.score}</p>
                  </div>
                  <Link
                    href="/app"
                    aria-label={`Open the pocket for ${card.name}`}
                    className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#b724ff] to-[#7c3aed] shadow-lg shadow-purple-500/50 transition hover:scale-110"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/care/care-left.jpg" alt="" className="block h-auto w-full" />
          <div className="absolute inset-0 bg-[#010828]/45" />
        </div>
        <div className="relative bg-[#010828] px-4 py-10 sm:absolute sm:inset-0 sm:flex sm:items-center sm:justify-end sm:bg-transparent sm:px-8 lg:pr-[20%] lg:pl-[15%]">
          <div className="relative max-w-xl sm:text-right">
            <p
              className="font-condiment text-4xl text-[#6FFF00] sm:absolute sm:-top-8 sm:left-0 sm:text-[36px] sm:mix-blend-exclusion lg:text-[68px]"
              style={{ fontFamily: "var(--font-condiment), cursive" }}
            >
              Stay soft
            </p>
            <h2
              className="font-anton text-4xl leading-[0.95] uppercase sm:text-[32px] lg:text-[60px]"
              style={{ fontFamily: "var(--font-anton), sans-serif" }}
            >
              <span className="mb-4 block sm:mb-8 lg:mb-12">KEEP IT.</span>
              SET A COIN ASIDE.
              <br />
              COME BACK TOMORROW.
              <br />
              FOLLOW THE STREAK.
            </h2>
          </div>
        </div>
        <div className="absolute bottom-[12%] left-[8%] hidden sm:block">
          <div className="liquid-glass overflow-hidden rounded-[0.5rem] sm:rounded-[1.25rem]">
            {[
              { href: "https://chog.xyz/", label: "Chog site", icon: <Mail className="h-6 w-6" /> },
              { href: "https://www.monad.xyz/", label: "Monad", icon: <TwitterIcon className="h-6 w-6" /> },
              { href: "/gallery", label: "Gallery", icon: <GithubIcon className="h-6 w-6" /> },
            ].map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                aria-label={link.label}
                className={`grid place-items-center text-[#EFF4FF] ${index < 2 ? "border-b border-white/10" : ""} w-[14vw] sm:h-16 sm:w-[14.375rem] md:w-[10.78125rem] lg:h-20 lg:w-[16.77rem]`}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
