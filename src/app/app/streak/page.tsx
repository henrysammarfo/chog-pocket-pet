"use client";

import Link from "next/link";
import { PageFrame, PageHero } from "@/components/app/page-hero";
import { usePocket } from "@/components/app/use-pocket";
import { missedOneDay } from "@/lib/shield";
import { demoDateLabel, streakStatus } from "@/lib/streak";

const REWARDS = [
  { day: 1, name: "Nibbling", line: "The first set-aside. The pet notices." },
  { day: 2, name: "Cozy", line: "Two mornings. The voice settles in." },
  { day: 4, name: "Buzzing", line: "The streak starts to show off." },
  { day: 7, name: "Glowing", line: "A full week of coins you still own." },
  { day: 14, name: "Legendary", line: "The jar has become the habit." },
];

export default function StreakPage() {
  const { demo, pet, view, skipDay, spendCover, tier, today, nowSec } = usePocket();
  const status = streakStatus(demo.state.lastFeedDay, today);
  const alive = status === "fed" || status === "alive";

  if (!demo.ready) {
    return <p className="p-6 font-anton text-2xl uppercase">Opening the pocket…</p>;
  }

  const days = Array.from({ length: 14 }, (_, index) => {
    const day = today - 13 + index;
    const fed =
      alive &&
      demo.state.lastFeedDay !== 0 &&
      day <= demo.state.lastFeedDay &&
      day > demo.state.lastFeedDay - demo.state.streak;
    const label =
      demo.speed === "minute"
        ? day === today
          ? "Now"
          : String(day - today)
        : String(new Date(day * 86_400 * 1000).getUTCDate());
    return { day, fed, label, today: day === today };
  });

  return (
    <PageFrame>
      <PageHero
        petName={pet.name}
        imageUrl={pet.imageUrl}
        word="DAYS"
        kicker="day after day"
        title="The streak"
        lede="Same day, the streak stays put. The next morning, it grows. Skip one morning and it is still alive. Skip another and it rests at zero."
      >
        <p className="font-anton mt-4 text-4xl uppercase leading-none sm:text-5xl" data-testid="streak-count" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
          {view.streakText}
        </p>
        {demo.clock !== null ? (
          <p className="mt-2 text-sm text-white" data-testid="demo-date">
            {demo.speed === "minute" ? "Demo clock" : "Demo date"}: {demoDateLabel(nowSec)}
          </p>
        ) : null}
      </PageHero>
      <section className="grid items-start gap-4 lg:grid-cols-3">
        <article className="liquid-glass rounded-[var(--radius-24)] p-6 lg:col-span-2 lg:p-6">
          <h2 className="font-anton text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
            Last 14 mornings
          </h2>
          <ol className="mt-4 grid grid-cols-7 gap-2">
            {days.map((day) => (
              <li
                key={day.day}
                className={`flex aspect-square items-center justify-center rounded-[var(--radius-12)] border text-sm ${
                  day.fed ? "border-[#6FFF00] bg-[#6FFF00] text-[#010828]" : "border-white/15 text-[#EFF4FF]/70"
                } ${day.today ? "ring-2 ring-white/70" : ""}`}
              >
                <span className={`font-anton ${String(day.label).length > 2 ? "text-xs" : "text-lg sm:text-2xl"}`} style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                  {day.label}
                </span>
              </li>
            ))}
          </ol>
          {view.streak === 0 ? (
            <p className="mt-4 text-sm text-[#EFF4FF]/65">No mornings marked yet. The first set-aside starts the row.</p>
          ) : (
            <p className="mt-4 text-sm text-[#EFF4FF]/65">Marked mornings are the current run. A gap rests the row at zero.</p>
          )}
        </article>
        <article className="liquid-glass flex flex-col justify-between rounded-[var(--radius-24)] p-6 lg:p-6">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">Current run</p>
            <p className="mt-3 text-sm leading-relaxed text-[#EFF4FF]/75">
              {demo.clock !== null
                ? "The demo clock is ahead of this morning. Come back to Today and set aside again."
                : "This is today. Skip a morning only if you are trying the demo clock."}
            </p>
          </div>
          <button
            type="button"
            data-testid="tomorrow-button"
            className="font-anton mt-6 h-12 rounded-full border border-white/25 px-6 text-sm uppercase"
            onClick={skipDay}
          >
            Demo: skip to tomorrow
          </button>
          {missedOneDay(demo.state.lastFeedDay, today) && demo.freezeLeft > 0 && tier.freeze ? (
            <button
              type="button"
              data-testid="spend-cover"
              className="font-anton mt-3 h-[var(--control)] rounded-full bg-[#6FFF00] px-6 text-sm uppercase text-[#010828]"
              onClick={spendCover}
            >
              Use streak freeze
            </button>
          ) : (
            <p className="mt-3 text-sm text-[#EFF4FF]/65">
              {tier.freeze ? `${demo.freezeLeft} freeze left.` : "Freeze stays locked."}
            </p>
          )}
        </article>
      </section>
      <section className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REWARDS.map((reward) => {
          const open = view.streak >= reward.day;
          return (
            <article key={reward.name} className="liquid-glass rounded-[var(--radius-24)] p-6">
              <p className="text-[11px] tracking-[0.16em] text-[#6FFF00] uppercase">{open ? "Unlocked" : `Day ${reward.day}`}</p>
              <h3 className="font-anton mt-2 text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
                {reward.name}
              </h3>
              <p className="mt-2 text-sm text-[#EFF4FF]/70">{reward.line}</p>
            </article>
          );
        })}
        <article className="liquid-glass flex flex-col justify-between gap-4 rounded-[var(--radius-24)] p-6">
          <div>
            <p className="text-[11px] tracking-[0.16em] text-[#EFF4FF]/55 uppercase">Best so far</p>
            <p className="font-anton mt-2 text-2xl uppercase" style={{ fontFamily: "var(--font-anton), sans-serif" }}>
              {demo.bestStreak} {demo.bestStreak === 1 ? "day" : "days"}
            </p>
          </div>
          <Link href="/app" className="mt-4 text-sm text-[#6FFF00]">
            Back to today
          </Link>
        </article>
      </section>
    </PageFrame>
  );
}
