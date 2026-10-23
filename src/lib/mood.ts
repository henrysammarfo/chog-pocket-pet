import { formatChog } from "@/lib/format";
import { notableTrait, type TraitMap, type Voice } from "@/lib/personality";
import type { StreakStatus } from "@/lib/streak";

export type MoodId =
  | "hungry"
  | "sulking"
  | "waiting"
  | "nibbling"
  | "cozy"
  | "buzzing"
  | "glowing"
  | "legendary"
  | "unjarred";

export function moodFor(status: StreakStatus, visibleStreak: number): MoodId {
  if (status === "never") return "hungry";
  if (status === "broken") return "sulking";
  if (status === "alive") return "waiting";
  if (visibleStreak <= 1) return "nibbling";
  if (visibleStreak <= 3) return "cozy";
  if (visibleStreak <= 6) return "buzzing";
  if (visibleStreak <= 13) return "glowing";
  return "legendary";
}

export const MOOD_TITLES: Record<MoodId, Record<Voice, string>> = {
  hungry: {
    showy: "Slightly offended",
    soft: "Quietly empty",
    chaotic: "Hangry",
    sweet: "Peckish",
    steady: "Hungry",
  },
  sulking: {
    showy: "Dramatic pause",
    soft: "Curled up",
    chaotic: "Plotting",
    sweet: "A bit hurt",
    steady: "Sulking",
  },
  waiting: {
    showy: "Posing",
    soft: "Drowsy",
    chaotic: "Impatient",
    sweet: "Waiting up",
    steady: "Waiting",
  },
  nibbling: {
    showy: "First taste",
    soft: "Small bite",
    chaotic: "Zapped",
    sweet: "Nibbling",
    steady: "Nibbling",
  },
  cozy: {
    showy: "Pleased",
    soft: "Tucked in",
    chaotic: "Fizzing",
    sweet: "Cozy",
    steady: "Cozy",
  },
  buzzing: {
    showy: "Showing off",
    soft: "Warming up",
    chaotic: "Sparking",
    sweet: "Giggling",
    steady: "On a roll",
  },
  glowing: {
    showy: "Strutting",
    soft: "Glowing softly",
    chaotic: "Scheming",
    sweet: "Beaming",
    steady: "Glowing",
  },
  legendary: {
    showy: "Unbearable, in a good way",
    soft: "Peaceful legend",
    chaotic: "Chaos, funded",
    sweet: "Beloved",
    steady: "Legendary",
  },
  unjarred: {
    showy: "Ready to be admired",
    soft: "Here, quietly",
    chaotic: "Ready to cause trouble",
    sweet: "Happy to meet you",
    steady: "Meet your Chog",
  },
};

export const MOOD_GLOW: Record<MoodId, string> = {
  hungry: "#c9b4aa",
  sulking: "#9bb0c9",
  waiting: "#f0c36a",
  nibbling: "#f2a3c0",
  cozy: "#f7b731",
  buzzing: "#ff7a59",
  glowing: "#ffd15c",
  legendary: "#ffe38a",
  unjarred: "#e7c4ff",
};

export function bobClass(mood: MoodId): string {
  if (mood === "hungry" || mood === "sulking") return "pet-bob-slow";
  if (mood === "buzzing" || mood === "glowing" || mood === "legendary") {
    return "pet-bob-fast";
  }
  return "pet-bob";
}

function hungryLine(voice: Voice, trait: string, goal: string): string {
  switch (voice) {
    case "chaotic":
      return `${trait} does not do well on an empty jar. Set aside ${goal} $CHOG.`;
    case "soft":
      return `A quiet day. ${trait} is doing the small sad line. ${goal} $CHOG would help.`;
    case "showy":
      return `${trait} expects the jar to keep up. ${goal} $CHOG, if you please.`;
    case "sweet":
      return `Tummy's empty, and the mood is still sweet. ${goal} $CHOG goes in the jar, not out the door.`;
    default:
      return `Nothing set aside yet today. ${goal} $CHOG starts the habit.`;
  }
}

export function moodLine(input: {
  mood: MoodId;
  voice: Voice;
  traits: TraitMap;
  streak: number;
  goal: bigint;
  withdrewToday: boolean;
}): string {
  const goal = formatChog(input.goal);
  const trait = notableTrait(input.traits);
  const streak = input.streak;
  let line: string;
  switch (input.mood) {
    case "hungry":
      line = hungryLine(input.voice, trait, goal);
      break;
    case "sulking":
      line = `The streak fell asleep. A fresh ${goal} $CHOG starts it again at day one.`;
      break;
    case "waiting":
      line = `The ${streakLabelSoft(streak)} is still alive. Set aside ${goal} $CHOG before the day ends.`;
      break;
    case "nibbling":
      line = `Today's ${goal} $CHOG is in the jar. Come back tomorrow and this becomes day 2.`;
      break;
    case "cozy":
      line = `${streak} days in a row. ${trait} is settling in.`;
      break;
    case "buzzing":
      line = `${streak} mornings of savings. ${trait} is starting to show off.`;
      break;
    case "glowing":
      line = `${streak} days set aside. ${trait} is glowing about it.`;
      break;
    case "legendary":
      line = `${streak} days. ${trait} has decided this jar is a lifestyle.`;
      break;
    default:
      line = `${trait} is the pet. The daily set-aside opens when the jar is on Monad.`;
  }
  if (input.withdrewToday) {
    line += " You took some $CHOG back. It is still yours.";
  }
  return line;
}

function streakLabelSoft(streak: number): string {
  if (streak === 1) return "1-day streak";
  return `${streak}-day streak`;
}

export function unjarredLine(voice: Voice, traits: TraitMap): string {
  const trait = notableTrait(traits);
  if (voice === "chaotic") {
    return `${trait} is already the pet. The savings jar is not on Monad yet, so the daily feed waits.`;
  }
  if (voice === "soft") {
    return `${trait} is here. The mood stays quiet until the savings jar is opened on Monad.`;
  }
  if (voice === "showy") {
    return `${trait} would like the jar to notice them. It is not on Monad yet.`;
  }
  if (voice === "sweet") {
    return `${trait} is glad you came. Setting $CHOG aside starts once the jar is on Monad.`;
  }
  return `${trait} is the pet. The daily set-aside opens when the jar is on Monad.`;
}
