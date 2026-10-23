"use client";

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PocketStage, type HistoryItem } from "@/components/pocket-stage";
import {
  getDemoClient,
  getDemoServer,
  resetDemo,
  subscribeDemo,
  updateDemo,
} from "@/lib/demo-store";
import { formatChog } from "@/lib/format";
import { jarAddress } from "@/lib/config";
import { DEMO_CHOGS, demoChog } from "@/lib/pets";
import { buildView } from "@/lib/present";
import {
  GOAL_PRESETS,
  tryFeed,
  tryWithdraw,
  withGoal,
} from "@/lib/savings";
import { demoDateLabel, skipToNextMorning, utcDay } from "@/lib/streak";

const pillOn =
  "font-anton h-11 rounded-full bg-[#6FFF00] px-4 text-[13px] uppercase tracking-wide text-[#010828] hover:bg-[#8dff33]";
const pillOff =
  "font-anton h-11 rounded-full border border-white/25 bg-transparent px-4 text-[13px] uppercase tracking-wide text-[#EFF4FF] hover:bg-white/10";
const action =
  "font-anton h-12 rounded-full border border-white/20 bg-transparent text-[13px] uppercase tracking-wide text-[#EFF4FF] hover:bg-white/10";

export function PocketApp() {
  const router = useRouter();
  const [celebrate, setCelebrate] = useState(0);
  return (
    <DemoPocket
      celebrate={celebrate}
      onFed={() => setCelebrate((count) => count + 1)}
      onUseWallet={() => router.push("/connect")}
    />
  );
}

function DemoPocket({
  onUseWallet,
  onFed,
  celebrate,
}: {
  onUseWallet: () => void;
  onFed: () => void;
  celebrate: number;
}) {
  const demo = useSyncExternalStore(subscribeDemo, getDemoClient, getDemoServer);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  if (!demo.ready) {
    return (
      <p className="p-6 font-anton text-2xl uppercase" data-testid="pocket-loading">
        Opening the pocket…
      </p>
    );
  }

  const today = utcDay(demo.nowSec);
  const pet = demoChog(demo.petId);
  const view = buildView(pet, demo.state, today, true);
  const takeBack = demo.state.saved < demo.state.goal ? demo.state.saved : demo.state.goal;

  function feed() {
    let fed = false;
    let title = "";
    updateDemo((current) => {
      const result = tryFeed(current.state, utcDay(current.nowSec));
      if (!result.ok) return current;
      fed = true;
      title = `${formatChog(current.state.goal)} $CHOG set aside`;
      return { ...current, state: result.state };
    });
    if (fed) {
      onFed();
      setHistory((items) => [
        { id: items.length + 1, title, detail: "Into the jar. The streak moved." },
        ...items,
      ]);
    }
  }

  function withdraw() {
    let title = "";
    updateDemo((current) => {
      const amount = current.state.saved < current.state.goal ? current.state.saved : current.state.goal;
      const result = tryWithdraw(current.state, utcDay(current.nowSec), amount);
      if (!result.ok) return current;
      title = `${formatChog(amount)} $CHOG returned`;
      return { ...current, state: result.state };
    });
    if (title) {
      setHistory((items) => [
        { id: items.length + 1, title, detail: "Back in hand. The streak stayed." },
        ...items,
      ]);
    }
  }

  function reset() {
    resetDemo();
    setHistory([]);
  }

  return (
    <PocketStage
      view={view}
      celebrate={celebrate}
      history={history}
      banner={
        <div className="flex flex-col items-end gap-2 text-right">
          <span
            data-testid="demo-badge"
            className="rounded-full bg-[#6FFF00] px-3 py-1 font-anton text-[11px] tracking-[0.16em] text-[#010828] uppercase"
          >
            Demo
          </span>
          {demo.clock !== null ? (
            <p className="rounded-full bg-black/30 px-3 py-1 text-xs font-semibold text-white" data-testid="demo-date">
              Demo date: {demoDateLabel(demo.nowSec)}
            </p>
          ) : null}
        </div>
      }
    >
      <div className="flex flex-wrap gap-2" data-testid="pet-switcher">
        {DEMO_CHOGS.map((choice) => (
          <Button
            key={choice.id}
            type="button"
            variant="outline"
            aria-pressed={choice.id === demo.petId}
            className={choice.id === demo.petId ? pillOn : pillOff}
            onClick={() => updateDemo((current) => ({ ...current, petId: choice.id }))}
          >
            {choice.name}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {GOAL_PRESETS.map((goal) => {
          const label = formatChog(goal);
          const selected = demo.state.goal === goal;
          return (
            <Button
              key={label}
              type="button"
              variant="outline"
              aria-pressed={selected}
              data-testid={`goal-${label}`}
              className={`${selected ? pillOn : pillOff} w-full`}
              onClick={() =>
                updateDemo((current) => ({ ...current, state: withGoal(current.state, goal) }))
              }
            >
              {label}
            </Button>
          );
        })}
      </div>
      <Button
        type="button"
        size="xl"
        data-testid="feed-button"
        disabled={view.feedDisabled}
        className="font-anton h-14 w-full rounded-full bg-[#6FFF00] text-base uppercase tracking-wide text-[#010828] hover:bg-[#8dff33]"
        onClick={feed}
      >
        {view.feedLabel}
      </Button>
      {view.feedHint ? (
        <p className="text-center text-sm text-[#EFF4FF]/70" data-testid="feed-hint">
          {view.feedHint}
        </p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          data-testid="tomorrow-button"
          className={action}
          onClick={() =>
            updateDemo((current) => {
              const nowSec = skipToNextMorning(current.nowSec);
              return { ...current, nowSec, clock: nowSec };
            })
          }
        >
          Demo: skip to tomorrow
        </Button>
        <Dialog>
          <DialogTrigger
            data-testid="withdraw-button"
            disabled={demo.state.saved === 0n}
            render={<Button type="button" variant="outline" className={`${action} w-full`} />}
          >
            Take some back
          </DialogTrigger>
          <DialogContent className="rounded-[28px] bg-[#071033] text-[#EFF4FF] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-anton text-2xl uppercase">Take $CHOG back?</DialogTitle>
              <DialogDescription>
                {formatChog(takeBack)} $CHOG goes back in hand. The streak stays.
                The pet just notices.
              </DialogDescription>
            </DialogHeader>
            <Button type="button" data-testid="confirm-withdraw" className="font-anton h-12 rounded-full uppercase" onClick={withdraw}>
              Return {formatChog(takeBack)} $CHOG
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <HowItWorks jarOpen={jarAddress() !== null} />
        <Button type="button" variant="ghost" data-testid="use-wallet" className="font-anton uppercase text-[#6FFF00]" onClick={onUseWallet}>
          Use my Chog
        </Button>
        <Button type="button" variant="ghost" data-testid="reset-button" className="font-anton uppercase text-[#EFF4FF]/80" onClick={reset}>
          Start over
        </Button>
      </div>
    </PocketStage>
  );
}

function HowItWorks({ jarOpen }: { jarOpen: boolean }) {
  return (
    <Dialog>
      <DialogTrigger
        data-testid="how-button"
        render={<Button type="button" variant="ghost" className="font-anton uppercase text-[#EFF4FF]" />}
      >
        How this works
      </DialogTrigger>
      <DialogContent className="max-h-[80dvh] overflow-y-auto rounded-[28px] bg-[#071033] text-[#EFF4FF] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-anton text-2xl uppercase">How the pocket works</DialogTitle>
          <DialogDescription>
            The pet is the Chog. The food is money you keep.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm leading-relaxed text-[#EFF4FF]/80">
          <p>
            Your Chog is the pet. Take the Chog away and the pocket is empty.
            There is no stand-in creature.
          </p>
          <p>
            The traits on that Chog — eyes, mouth, clothes, and the rest — choose
            its personality. A laser-eyed Chog gets loud when the jar is empty.
            A sad-mouthed Chog goes quiet. The same streak sounds different on
            each one.
          </p>
          <p>
            You feed it by setting $CHOG aside, once a day. The coins stay yours.
            You can take them back. The streak is how many days in a row you did
            it. Miss a day and the streak rests. The mood follows the streak, in
            the voice the traits picked.
          </p>
          <p>
            Demo mode uses made-up Chogs with real trait names from the collection,
            so you can try this with no wallet. On Monad, the pet is the Chog you
            actually hold.
          </p>
          <p>
            {jarOpen
              ? "The savings jar is open on Monad. Setting $CHOG aside moves the real coin, and you can take it back."
              : "The savings jar is not open on Monad in this build yet. Demo set-asides stay on this phone. A real jar keeps the same rules: your coins, your streak, your Chog."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
