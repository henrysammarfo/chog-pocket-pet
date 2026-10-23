"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { pocketDay, shiftFeedDay, skipAhead, type DemoSpeed } from "@/lib/demo-clock";
import {
  getDemoClient,
  getDemoServer,
  resetDemo,
  subscribeDemo,
  updateDemo,
  type LiveDemo,
} from "@/lib/demo-store";
import { formatChog } from "@/lib/format";
import { getHeldClient, getHeldServer, setHeldPet, subscribeHeld } from "@/lib/held-pet";
import { clearHistory, getHistoryClient, getHistoryServer, pushHistory, subscribeHistory } from "@/lib/history-store";
import { blankMemory, memoryKey } from "@/lib/memory";
import { getMemoryClient, getMemoryServer, rememberPet, resetSampleMemory, subscribeMemory } from "@/lib/memory-store";
import { demoChog } from "@/lib/pets";
import { buildView } from "@/lib/present";
import { tryFeed, tryWithdraw, withGoal } from "@/lib/savings";
import { coverMiss } from "@/lib/shield";
import { holderTier } from "@/lib/tiers";
import { hasTraitShield } from "@/lib/trait-rules";

function nowOf(current: LiveDemo): number {
  return current.speed === "minute" ? Math.floor(Date.now() / 1000) : current.nowSec;
}

export function usePocket() {
  const demo = useSyncExternalStore(subscribeDemo, getDemoClient, getDemoServer);
  const history = useSyncExternalStore(subscribeHistory, getHistoryClient, getHistoryServer);
  const held = useSyncExternalStore(subscribeHeld, getHeldClient, getHeldServer);
  const memoryBook = useSyncExternalStore(subscribeMemory, getMemoryClient, getMemoryServer);
  const [minuteNow, setMinuteNow] = useState(0);

  useEffect(() => {
    if (demo.speed !== "minute") return;
    const tick = () => setMinuteNow(Math.floor(Date.now() / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [demo.speed]);

  const nowSec = demo.speed === "minute" && minuteNow > 0 ? minuteNow : demo.nowSec;
  const today = pocketDay(nowSec, demo.speed);
  const pet = held ?? demoChog(demo.petId);
  const tier = holderTier(demo.state.wallet);
  const traitShield = hasTraitShield(pet.traits);
  const view = buildView(pet, demo.state, today, true, { covered: traitShield });
  const takeBack = demo.state.saved < demo.state.goal ? demo.state.saved : demo.state.goal;
  const memory = memoryBook[memoryKey(pet.id, pet.tokenId)] ?? blankMemory(memoryKey(pet.id, pet.tokenId), pet.name, pet.tokenId);

  function feed() {
    const moved = { ok: false, title: "", amount: 0n, before: 0n, after: 0n, at: 0, today: 0, streak: 0 };
    updateDemo((current) => {
      const now = nowOf(current);
      const day = pocketDay(now, current.speed);
      const shield = hasTraitShield(pet.traits);
      const coveredNow = coverMiss(current.state, day, shield, 0, false);
      const result = tryFeed(coveredNow.state, day);
      if (!result.ok) return current;
      moved.ok = true;
      moved.title = `${formatChog(current.state.goal)} $CHOG set aside`;
      moved.amount = current.state.goal;
      moved.before = current.state.saved;
      moved.after = result.state.saved;
      moved.at = now;
      moved.today = day;
      moved.streak = result.state.streak;
      return {
        ...current,
        state: result.state,
        nowSec: now,
        bestStreak: Math.max(current.bestStreak, result.state.streak),
        freezeLeft: current.freezeLeft,
      };
    });
    if (!moved.ok) return false;
    const mood = buildView(pet, { ...demo.state, streak: moved.streak, lastFeedDay: moved.today, saved: moved.after }, moved.today, true);
    rememberPet(
      {
        ...memory,
        name: pet.tokenId != null ? `Chog #${pet.tokenId}` : pet.name,
        tokenId: pet.tokenId,
      },
      {
        streak: moved.streak,
        added: moved.amount,
        mood: mood.moodId,
        title: mood.moodTitle,
        day: moved.today,
        at: moved.at,
      },
    );
    pushHistory({
      kind: "aside",
      title: moved.title,
      detail: "Into the jar. The streak moved.",
      amount: moved.amount,
      balance: moved.after,
      before: moved.before,
      at: moved.at,
    });
    return true;
  }

  function withdraw() {
    const moved = { ok: false, title: "", amount: 0n, before: 0n, after: 0n, at: 0 };
    updateDemo((current) => {
      const now = nowOf(current);
      const day = pocketDay(now, current.speed);
      const amount = current.state.saved < current.state.goal ? current.state.saved : current.state.goal;
      const result = tryWithdraw(current.state, day, amount);
      if (!result.ok) return current;
      moved.ok = true;
      moved.title = `${formatChog(amount)} $CHOG returned`;
      moved.amount = amount;
      moved.before = current.state.saved;
      moved.after = result.state.saved;
      moved.at = now;
      return { ...current, state: result.state, nowSec: now };
    });
    if (!moved.ok) return false;
    pushHistory({
      kind: "back",
      title: moved.title,
      detail: "Back in hand. The streak stayed.",
      amount: moved.amount,
      balance: moved.after,
      before: moved.before,
      at: moved.at,
    });
    return true;
  }

  function reset() {
    resetDemo();
    clearHistory();
    resetSampleMemory();
    setHeldPet(null);
  }

  function setGoal(goal: bigint) {
    updateDemo((current) => ({ ...current, state: withGoal(current.state, goal) }));
  }

  function setPet(petId: string) {
    setHeldPet(null);
    updateDemo((current) => ({ ...current, petId }));
  }

  function skipDay() {
    updateDemo((current) => {
      const now = nowOf(current);
      const nowSec = skipAhead(now, current.speed);
      return { ...current, nowSec, clock: nowSec };
    });
  }

  function setSpeed(speed: DemoSpeed) {
    updateDemo((current) => {
      const now = Math.floor(Date.now() / 1000);
      return {
        ...current,
        speed,
        nowSec: now,
        clock: speed === "minute" ? now : null,
        state: {
          ...current.state,
          lastFeedDay: shiftFeedDay(current.state.lastFeedDay, current.speed, speed, now),
          withdrewOnDay: shiftFeedDay(current.state.withdrewOnDay, current.speed, speed, now),
        },
      };
    });
  }

  function spendCover() {
    updateDemo((current) => {
      const day = pocketDay(nowOf(current), current.speed);
      const coveredNow = coverMiss(
        current.state,
        day,
        false,
        current.freezeLeft,
        holderTier(current.state.wallet).freeze,
      );
      if (coveredNow.cover === "none") return current;
      return {
        ...current,
        state: coveredNow.state,
        freezeLeft: coveredNow.freezeLeft,
      };
    });
  }

  return {
    demo,
    history,
    held,
    memory,
    memoryBook,
    pet,
    view,
    today,
    nowSec,
    tier,
    traitShield,
    takeBack,
    feed,
    withdraw,
    reset,
    setGoal,
    setPet,
    skipDay,
    setSpeed,
    spendCover,
  };
}
