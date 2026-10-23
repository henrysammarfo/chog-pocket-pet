import type { ReactNode } from "react";

const GRAIN = `url("data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.08'/></svg>")}")`;

const LOOK: Record<string, { src: string; bg: string }> = {
  "Bubblegum Chog": { src: "/figures/bubblegum.png", bg: "#F4845F" },
  "Laser Wizard": { src: "/figures/laser.png", bg: "#6BBF7A" },
  "Little Crown": { src: "/figures/crown.png", bg: "#E882B4" },
  "Quiet One": { src: "/figures/quiet.png", bg: "#6EB5FF" },
};

export function PageFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-4 py-4 sm:py-6">{children}</div>;
}

export function PageHero({
  petName,
  imageUrl,
  word,
  kicker,
  title,
  lede,
  aside,
  children,
}: {
  petName: string;
  imageUrl?: string | null;
  word: string;
  kicker: string;
  title: string;
  lede: string;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  const look = LOOK[petName] ?? { src: imageUrl || "/figures/bubblegum.png", bg: "#F4845F" };
  const src = imageUrl || look.src;

  return (
    <section
      className="relative overflow-hidden rounded-[var(--radius-24)] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
      style={{ background: look.bg, minHeight: "min(52vh, 500px)" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{ backgroundImage: GRAIN, backgroundSize: "200px 200px" }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-36 bg-gradient-to-t from-black/45 to-transparent" />
      <div className="relative z-10 grid min-h-[380px] grid-cols-[1.15fr_0.85fr] sm:min-h-[460px]">
        <div className="self-end px-4 pt-8 pb-5 text-white sm:px-8 sm:pt-10 sm:pb-8">
          <p className="font-condiment text-3xl text-white sm:text-4xl" style={{ fontFamily: "var(--font-condiment), cursive" }}>
            {kicker}
          </p>
          <h1
            className="font-anton mt-1 text-[2.5rem] leading-[0.88] uppercase sm:text-7xl"
            style={{ fontFamily: "var(--font-anton), sans-serif" }}
          >
            {title}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90">{lede}</p>
          {children}
        </div>
        <div className="relative h-full min-h-[200px] overflow-hidden">
          {aside ? null : (
            <p
              aria-hidden="true"
              className="font-anton pointer-events-none absolute right-0 bottom-2 z-0 leading-none text-white/30 uppercase"
              style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: "clamp(72px, 12vw, 160px)" }}
            >
              {word}
            </p>
          )}
          {aside ?? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="absolute right-1 bottom-0 z-[1] h-[92%] w-auto max-w-full object-contain object-bottom sm:right-4" />
          )}
        </div>
      </div>
    </section>
  );
}
