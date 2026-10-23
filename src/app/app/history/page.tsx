"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PageFrame, PageHero } from "@/components/app/page-hero";
import { usePocket } from "@/components/app/use-pocket";
import { CHOG_UNIT, streakLabel, wholeChog } from "@/lib/format";
import type { HistoryItem } from "@/lib/history-store";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function kindOf(item: HistoryItem) {
  if (item.kind) return item.kind;
  return /return/i.test(item.title) ? "back" : "aside";
}

function amountOf(item: HistoryItem): bigint | null {
  if (item.amount) {
    try {
      return BigInt(item.amount);
    } catch {
      return null;
    }
  }
  const match = item.title.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const [whole, frac = ""] = match[1].split(".");
  const cents = (frac + "00").slice(0, 2);
  return BigInt(whole) * CHOG_UNIT + (BigInt(cents) * CHOG_UNIT) / 100n;
}

function whenLabel(unix: number) {
  const date = new Date(unix * 1000);
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} · ${hh}:${mm} UTC`;
}

export default function HistoryPage() {
  const { demo, pet, history } = usePocket();

  if (!demo.ready) {
    return <p className="p-6 font-anton text-2xl uppercase">Opening the pocket…</p>;
  }

  let aside = 0n;
  let returned = 0n;
  for (const item of history.items) {
    const amount = amountOf(item);
    if (amount === null) continue;
    if (kindOf(item) === "back") returned += amount;
    else aside += amount;
  }

  return (
    <PageFrame>
      <PageHero
        petName={pet.name}
        imageUrl={pet.imageUrl}
        word="LOG"
        kicker="the jar remembers"
        title="History"
        lede="Each set-aside and each return. Green goes in. Amber comes back. The coins stay yours either way."
      />
      <div data-testid="history" className="flex flex-col gap-4">
        <section className="grid gap-3 sm:grid-cols-3">
          <article className="liquid-glass rounded-[var(--radius-24)] p-6">
            <p className="text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">Total set aside</p>
            <p className="font-anton mt-2 text-3xl uppercase leading-none" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              {wholeChog(aside)}
            </p>
          </article>
          <article className="liquid-glass rounded-[var(--radius-24)] p-6">
            <p className="text-[11px] tracking-[0.16em] text-[#F5B942] uppercase">Total returned</p>
            <p className="font-anton mt-2 text-3xl uppercase leading-none" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              {wholeChog(returned)}
            </p>
          </article>
          <article className="liquid-glass rounded-[var(--radius-24)] p-6">
            <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">Best streak</p>
            <p className="font-anton mt-2 text-3xl uppercase leading-none" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              {streakLabel(demo.bestStreak)}
            </p>
          </article>
        </section>
        {history.items.length === 0 ? (
          <section className="grid items-start gap-4 lg:grid-cols-2">
            <article className="liquid-glass flex flex-col justify-between rounded-[var(--radius-24)] p-6">
              <div>
                <p className="font-anton text-3xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                  Nothing yet
                </p>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[#EFF4FF]/75">
                  Nothing set aside yet. The first day is the one that starts the streak.
                </p>
              </div>
              <Link href="/app/jar" className="font-anton mt-6 inline-flex h-14 items-center justify-center rounded-full bg-[#6FFF00] px-6 uppercase text-[#010828]">
                Set some aside
              </Link>
            </article>
            <article className="liquid-glass rounded-[var(--radius-24)] p-6">
              <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">A row will show</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#EFF4FF]/80">
                <li>The date and time of that morning.</li>
                <li>Green when coins go into the jar, amber when they come back.</li>
                <li>The jar balance after that move.</li>
              </ul>
            </article>
          </section>
        ) : (
          <ol className="grid gap-3">
            {history.items.map((item) => {
              const inbound = kindOf(item) !== "back";
              const amount = amountOf(item);
              const balance = item.balance ? BigInt(item.balance) : null;
              const Icon = inbound ? ArrowDownLeft : ArrowUpRight;
              return (
                <li key={item.id} className="liquid-glass grid grid-cols-[auto_1fr] items-center gap-4 rounded-[var(--radius-24)] px-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:px-6">
                  <span className={`grid h-12 w-12 place-items-center rounded-full ${inbound ? "bg-[#6FFF00] text-[#010828]" : "bg-[#F5B942] text-[#010828]"}`}>
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-anton text-lg uppercase sm:text-xl" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-[#EFF4FF]/65">{typeof item.at === "number" ? whenLabel(item.at) : "Earlier"}</p>
                  </div>
                  <div className="col-start-2 sm:col-start-auto sm:text-right">
                    {amount !== null ? (
                      <p className={`font-anton text-xl uppercase ${inbound ? "text-[#6FFF00]" : "text-[#F5B942]"}`} style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                        {inbound ? "+" : "−"}
                        {wholeChog(amount)}
                      </p>
                    ) : null}
                    {balance !== null ? <p className="mt-1 text-xs tracking-wide text-[#EFF4FF]/55 uppercase">Jar {wholeChog(balance)}</p> : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </PageFrame>
  );
}
