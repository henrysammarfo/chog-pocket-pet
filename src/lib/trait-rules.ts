import type { TraitMap } from "@/lib/personality";

export type SavingRule = {
  id: "shield" | "sweet" | "crown" | "quiet";
  trait: string;
  title: string;
  detail: string;
};

export function savingRules(traits: TraitMap): SavingRule[] {
  const rules: SavingRule[] = [];
  const eyes = (traits.Eyes ?? "").toLowerCase();
  const mouth = (traits.Mouth ?? "").toLowerCase();
  const head = (traits.Head ?? "").toLowerCase();
  const skin = (traits.Skin ?? "").toLowerCase();

  if (/laser|fire/.test(eyes)) {
    rules.push({
      id: "shield",
      trait: traits.Eyes || "Laser eyes",
      title: "Streak shield",
      detail: "One missed morning does not wipe the streak. The next set-aside continues the run.",
    });
  }
  if (/bubble/.test(mouth)) {
    rules.push({
      id: "sweet",
      trait: traits.Mouth || "Bubblegum",
      title: "Bonus mood",
      detail: "Bubblegum sweetens the mood on top of whatever the streak already says.",
    });
  }
  if (/crown/.test(head)) {
    rules.push({
      id: "crown",
      trait: traits.Head || "Crown",
      title: "Fuller jar picture",
      detail: "The crown fills the picture of the jar faster. The amount set aside stays the same.",
    });
  }
  if (/origin/.test(skin) || /cry|sad|closed/.test(eyes)) {
    rules.push({
      id: "quiet",
      trait: traits.Skin || traits.Eyes || "Quiet",
      title: "Quiet day",
      detail: "A quiet Chog still needs the daily set-aside. The mood stays soft instead of loud.",
    });
  }
  return rules;
}

export function hasTraitShield(traits: TraitMap): boolean {
  return savingRules(traits).some((rule) => rule.id === "shield");
}

export function sweetenedLine(line: string, traits: TraitMap): string {
  if (!/bubble/.test((traits.Mouth ?? "").toLowerCase())) return line;
  if (line.includes("Bubblegum sweetens")) return line;
  return `${line} Bubblegum sweetens this mood.`;
}

export function picturedFill(percent: number, traits: TraitMap): number {
  if (!/crown/.test((traits.Head ?? "").toLowerCase())) return percent;
  return Math.min(100, Math.round(percent * 1.5));
}
