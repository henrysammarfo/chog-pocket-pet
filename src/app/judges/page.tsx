import Link from "next/link";
import { SiteShell } from "@/components/motion/site-shell";

const STEPS = [
  {
    n: "1",
    title: "Set something aside",
    body: "Open Today. No wallet. Tap Set aside 100 $CHOG. The mood changes because the pet was fed. The coins stay in the jar.",
    href: "/app",
    label: "Open Today",
  },
  {
    n: "2",
    title: "See why the Chog matters",
    body: "Open Pets. Read why there is no pet without a Chog, and the memory stored on the token. Then open Traits and read the rule that picture changes.",
    href: "/app/pets",
    label: "Open Pets",
  },
  {
    n: "3",
    title: "Speed up a day",
    body: "In Settings, turn on 1 day = 1 minute. Wait a minute, or skip ahead, and set aside again. Share the card, then open the leaderboard.",
    href: "/app/settings",
    label: "Open Settings",
  },
];

export default function JudgesPage() {
  return (
    <SiteShell>
      <main className="mx-auto flex w-full max-w-[980px] flex-col gap-6 px-4 py-8 sm:py-12">
        <p className="font-condiment text-4xl text-[#6FFF00]" style={{ fontFamily: "var(--font-condiment), cursive" }}>
          three steps
        </p>
        <h1 className="font-anton text-5xl uppercase leading-[0.9] sm:text-7xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          For judges
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-[#EFF4FF]/80">
          No wallet. The pet is the Chog. Demo mode is the full loop and moves no coins. The jar is deployed on Monad for a wallet that holds a Chog Genesis.
        </p>
        <ol className="grid gap-4 lg:grid-cols-3" data-testid="judge-steps">
          {STEPS.map((step) => (
            <li key={step.n} className="liquid-glass flex flex-col rounded-[var(--radius-24)] p-6">
              <p className="font-anton text-5xl text-[#6FFF00]" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                {step.n}
              </p>
              <h2 className="font-anton mt-3 text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                {step.title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#EFF4FF]/75">{step.body}</p>
              <Link href={step.href} className="font-anton mt-5 inline-flex h-[var(--control)] items-center justify-center rounded-full bg-[#6FFF00] px-4 uppercase text-[#010828]">
                {step.label}
              </Link>
            </li>
          ))}
        </ol>
        <p className="text-sm text-[#EFF4FF]/70">
          Also try <Link href="/app/arcade" className="text-[#6FFF00]">the arcade</Link>,{" "}
          <Link href="/app/leaderboard" className="text-[#6FFF00]">the leaderboard</Link>, and{" "}
          <Link href="/app/traits" className="text-[#6FFF00]">the trait rules</Link>.
        </p>
      </main>
    </SiteShell>
  );
}
