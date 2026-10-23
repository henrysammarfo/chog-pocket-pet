import { CHOG_UNIT } from "@/lib/format";

export type HolderTier = {
  id: "visitor" | "peach" | "keeper";
  name: string;
  skin: "plain" | "peach";
  freeze: boolean;
  detail: string;
};

const PEACH = 500n * CHOG_UNIT;
const KEEPER = 2_000n * CHOG_UNIT;

export function holderTier(balance: bigint): HolderTier {
  if (balance >= KEEPER) {
    return {
      id: "keeper",
      name: "Keeper",
      skin: "peach",
      freeze: true,
      detail: "2,000 $CHOG in hand unlocks a peach jar skin and one streak freeze.",
    };
  }
  if (balance >= PEACH) {
    return {
      id: "peach",
      name: "Peach",
      skin: "peach",
      freeze: false,
      detail: "500 $CHOG in hand unlocks the peach jar skin.",
    };
  }
  return {
    id: "visitor",
    name: "Visitor",
    skin: "plain",
    freeze: false,
    detail: "Hold 500 $CHOG for a jar skin, or 2,000 $CHOG for a streak freeze.",
  };
}
