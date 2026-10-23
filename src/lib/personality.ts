export type TraitMap = Record<string, string>;

export type Voice = "showy" | "soft" | "chaotic" | "sweet" | "steady";

export type Scores = {
  spark: number;
  gloom: number;
  pride: number;
  mischief: number;
};

export type EyeStyle = "laser" | "heart" | "sad" | "normal";
export type MouthStyle = "bubble" | "grit" | "sad" | "smile";

export type FaceStyle = {
  skin: string;
  belly: string;
  stage: string;
  blush: string;
  eye: EyeStyle;
  mouth: MouthStyle;
  crown: boolean;
  flip: boolean;
  dressed: boolean;
};

export type Profile = {
  scores: Scores;
  voice: Voice;
  summary: string;
  face: FaceStyle;
};

const TRAIT_ORDER = [
  "Tier",
  "Skin",
  "Eyes",
  "Mouth",
  "Head",
  "Body",
  "Aura",
  "Accessory",
  "Background",
  "Naked",
  "Side",
  "Form",
];

export function orderedTraits(
  traits: TraitMap,
): { name: string; value: string }[] {
  const seen = new Set<string>();
  const rows: { name: string; value: string }[] = [];
  for (const name of TRAIT_ORDER) {
    const value = traits[name];
    if (!value || name === "Base") continue;
    seen.add(name);
    rows.push({ name, value });
  }
  for (const [name, value] of Object.entries(traits)) {
    if (seen.has(name) || !value || name === "Base") continue;
    rows.push({ name, value });
  }
  return rows;
}

export function scoreTraits(traits: TraitMap): Scores {
  const eyes = (traits.Eyes ?? "").toLowerCase();
  const mouth = (traits.Mouth ?? "").toLowerCase();
  const head = (traits.Head ?? "").toLowerCase();
  const body = (traits.Body ?? "").toLowerCase();
  const aura = (traits.Aura ?? "").toLowerCase();
  const tier = (traits.Tier ?? "").toLowerCase();
  const naked = (traits.Naked ?? "").toLowerCase();
  const accessory = traits.Accessory ?? "";

  let spark = 0;
  let gloom = 0;
  let pride = 0;
  let mischief = 0;

  if (/laser|fire|viper|thug/.test(eyes)) spark += 2;
  else if (/visor|anime|heart/.test(eyes)) spark += 1;
  if (/dead|cry|closed/.test(eyes)) gloom += 2;
  if (/heart/.test(eyes)) mischief += 1;

  if (/sad|worried|flat/.test(mouth)) gloom += 2;
  if (/grit|bite/.test(mouth)) {
    mischief += 1;
    spark += 1;
  }
  if (/bubble|smile/.test(mouth)) mischief += 1;

  if (/crown/.test(head)) pride += 2;
  else if (/helmet|wizard/.test(head)) pride += 1;
  if (/tuxedo|suit|wizard/.test(body)) pride += 1;
  if (/fiery|wind|fire/.test(aura)) spark += 1;

  if (tier === "uncommon") pride += 1;
  else if (/rare|legendary|epic|mythic/.test(tier)) pride += 2;

  if (naked === "yes") mischief += 1;
  if (accessory.trim()) mischief += 1;

  return { spark, gloom, pride, mischief };
}

export function voiceOf(scores: Scores): Voice {
  if (scores.spark >= 2) return "chaotic";
  if (scores.pride >= 2 && scores.gloom < 2) return "showy";
  if (scores.gloom >= 2 && scores.spark === 0) return "soft";
  if (scores.mischief >= 1 && scores.gloom === 0) return "sweet";
  return "steady";
}

const VOICE_LINE: Record<Voice, string> = {
  showy: "The traits lean proud. A long streak turns into a strut.",
  soft: "The traits lean quiet. Miss a day and this one curls up.",
  chaotic: "The traits lean wild. Hunger gets loud. A streak gets sparky.",
  sweet: "The traits lean sweet. The jar is how this one feels loved.",
  steady: "The traits are steady. The mood follows the streak more than the drama.",
};

export function personalitySummary(traits: TraitMap, voice: Voice): string {
  if (Object.keys(traits).length === 0) {
    return "No traits were published for this Chog, so its personality stays blank.";
  }
  const bits = [traits.Tier, traits.Body, traits.Eyes, traits.Mouth, traits.Head]
    .filter((bit): bit is string => Boolean(bit));
  const list = bits.length > 0 ? bits.join(", ") : "Traits on file";
  return `${list}. ${VOICE_LINE[voice]}`;
}

function stageColor(background: string | undefined): string {
  const value = (background ?? "").toLowerCase();
  if (/green|mint/.test(value)) return "#d9f5df";
  if (/blue|aqua/.test(value)) return "#d9e8ff";
  if (/purple|magenta/.test(value)) return "#f0d9ff";
  if (/yellow|lemon|sun|gold/.test(value)) return "#fff3c4";
  if (/pink|peach|coral|rosie/.test(value)) return "#ffd9e6";
  return "#ffe7d4";
}

function skinColors(skin: string | undefined): {
  skin: string;
  belly: string;
  blush: string;
} {
  const value = (skin ?? "").toLowerCase();
  if (/black/.test(value)) return { skin: "#3a3148", belly: "#d7c6e8", blush: "#c48ad4" };
  if (/red/.test(value)) return { skin: "#ef5464", belly: "#ffd0d4", blush: "#ff8fa0" };
  if (/yellow/.test(value)) return { skin: "#f2c14e", belly: "#fff1c9", blush: "#f0a07a" };
  if (/origin/.test(value)) return { skin: "#b794f6", belly: "#f3e8ff", blush: "#e7b4ea" };
  if (/pink/.test(value)) return { skin: "#ff8fb8", belly: "#ffe4ef", blush: "#ff6fa3" };
  return { skin: "#f08ab0", belly: "#ffe4ef", blush: "#ff6fa3" };
}

export function faceStyle(traits: TraitMap): FaceStyle {
  const eyes = (traits.Eyes ?? "").toLowerCase();
  const mouth = (traits.Mouth ?? "").toLowerCase();
  const head = (traits.Head ?? "").toLowerCase();
  const colors = skinColors(traits.Skin);
  let eye: EyeStyle = "normal";
  if (/laser|fire|viper/.test(eyes)) eye = "laser";
  else if (/heart/.test(eyes)) eye = "heart";
  else if (/sad|cry|dead|closed/.test(eyes)) eye = "sad";

  let mouthStyle: MouthStyle = "smile";
  if (/bubble/.test(mouth)) mouthStyle = "bubble";
  else if (/grit|bite/.test(mouth)) mouthStyle = "grit";
  else if (/sad|worried|flat/.test(mouth)) mouthStyle = "sad";

  return {
    ...colors,
    stage: stageColor(traits.Background),
    eye,
    mouth: mouthStyle,
    crown: /crown|helmet|wizard/.test(head),
    flip: (traits.Side ?? "").toLowerCase() === "left",
    dressed: Boolean(traits.Body?.trim()),
  };
}

export function profileOf(traits: TraitMap): Profile {
  const scores = scoreTraits(traits);
  const voice = voiceOf(scores);
  return {
    scores,
    voice,
    summary: personalitySummary(traits, voice),
    face: faceStyle(traits),
  };
}

export function notableTrait(traits: TraitMap): string {
  return traits.Head || traits.Body || traits.Eyes || traits.Mouth || "this Chog";
}
