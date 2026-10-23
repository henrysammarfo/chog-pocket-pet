import { wholeChog, streakLabel } from "@/lib/format";
import {
  bobClass,
  moodFor,
  moodLine,
  MOOD_GLOW,
  MOOD_TITLES,
  unjarredLine,
  type MoodId,
} from "@/lib/mood";
import type { ChogPet } from "@/lib/pets";
import {
  faceStyle,
  orderedTraits,
  profileOf,
  type FaceStyle,
  type Voice,
} from "@/lib/personality";
import { jarFill, MIN_FEED, type PocketState } from "@/lib/savings";
import { shieldedLastFeed } from "@/lib/shield";
import { streakStatus, visibleStreak } from "@/lib/streak";
import { picturedFill, sweetenedLine } from "@/lib/trait-rules";

export type PocketView = {
  petName: string;
  sample: boolean;
  tokenId: number | null;
  imageUrl: string | null;
  moodId: MoodId;
  moodTitle: string;
  moodLine: string;
  personality: string;
  voice: Voice;
  streak: number;
  streakText: string;
  savedLabel: string;
  walletLabel: string;
  jarPercent: number;
  jarLabel: string;
  feedLabel: string;
  feedDisabled: boolean;
  feedHint: string | null;
  traits: { name: string; value: string }[];
  face: FaceStyle;
  glow: string;
  bob: string;
};

export function buildView(
  pet: ChogPet,
  state: PocketState,
  today: number,
  savingsOpen: boolean,
  options?: { covered?: boolean },
): PocketView {
  const profile = profileOf(pet.traits);
  const lastFeedDay = shieldedLastFeed(state.lastFeedDay, today, Boolean(options?.covered));
  const status = streakStatus(lastFeedDay, today);
  const streak = savingsOpen ? visibleStreak(lastFeedDay, state.streak, today) : 0;
  const moodId = savingsOpen ? moodFor(status, streak) : "unjarred";
  const withdrewToday =
    savingsOpen && state.withdrewOnDay !== 0 && state.withdrewOnDay === today;
  const feed = savingsOpen
    ? feedCopy(state, today)
    : {
        label: "Jar not opened yet",
        disabled: true,
        hint: "The savings jar is not on Monad in this build. Sample Chogs can still practice on this phone.",
      };
  const line =
    moodId === "unjarred"
      ? unjarredLine(profile.voice, pet.traits)
      : sweetenedLine(
          moodLine({
            mood: moodId,
            voice: profile.voice,
            traits: pet.traits,
            streak,
            goal: state.goal,
            withdrewToday,
          }),
          pet.traits,
        );

  return {
    petName: pet.name,
    sample: pet.sample,
    tokenId: pet.tokenId,
    imageUrl: pet.imageUrl,
    moodId,
    moodTitle: MOOD_TITLES[moodId][profile.voice],
    moodLine: line,
    personality: profile.summary,
    voice: profile.voice,
    streak,
    streakText: streakLabel(streak),
    savedLabel: savingsOpen
      ? `${wholeChog(state.saved)} in the jar`
      : "Jar not on Monad yet",
    walletLabel: `${wholeChog(state.wallet)} in hand`,
    jarPercent: savingsOpen ? picturedFill(jarFill(state.saved, state.goal), pet.traits) : 0,
    jarLabel: savingsOpen ? "Savings jar" : "Jar closed",
    feedLabel: feed.label,
    feedDisabled: feed.disabled,
    feedHint: feed.hint,
    traits: orderedTraits(pet.traits),
    face: faceStyle(pet.traits),
    glow: MOOD_GLOW[moodId],
    bob: bobClass(moodId),
  };
}

function feedCopy(
  state: PocketState,
  today: number,
): { label: string; disabled: boolean; hint: string | null } {
  const goal = wholeChog(state.goal).replace(" $CHOG", "");
  if (state.goal < MIN_FEED) {
    return {
      label: "Pick at least 50",
      disabled: true,
      hint: "The smallest daily set-aside is 50 $CHOG.",
    };
  }
  if (streakStatus(state.lastFeedDay, today) === "fed") {
    return {
      label: "Fed today",
      disabled: true,
      hint: "Come back the next day. The streak stays warm until then.",
    };
  }
  if (state.wallet < state.goal) {
    return {
      label: "Not enough $CHOG",
      disabled: true,
      hint: `The daily set-aside is ${goal} $CHOG. This pocket only has ${wholeChog(state.wallet)}.`,
    };
  }
  return {
    label: `Set aside ${goal} $CHOG`,
    disabled: false,
    hint: "This stays yours. You can take it back.",
  };
}
