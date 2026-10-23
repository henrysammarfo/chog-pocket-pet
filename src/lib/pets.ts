import type { TraitMap } from "@/lib/personality";

export type ChogPet = {
  id: string;
  name: string;
  tokenId: number | null;
  imageUrl: string | null;
  traits: TraitMap;
  sample: boolean;
};

/** Made-up Chogs. Trait names are ones that really appear on Chog Genesis. */
export const DEMO_CHOGS: ChogPet[] = [
  {
    id: "bubblegum",
    name: "Bubblegum Chog",
    tokenId: null,
    imageUrl: null,
    sample: true,
    traits: {
      Background: "Lemon Yellow",
      Skin: "Pink",
      Side: "Right",
      Body: "Peach Hoodie",
      Mouth: "Bubblegum",
      Eyes: "Heart",
      Head: "Peace hat",
      Form: "Chog",
      Tier: "Common",
      Naked: "No",
    },
  },
  {
    id: "laser",
    name: "Laser Wizard",
    tokenId: null,
    imageUrl: null,
    sample: true,
    traits: {
      Background: "Deep Blue",
      Aura: "Fiery Aura",
      Skin: "Black",
      Side: "Left",
      Body: "Wizard",
      Mouth: "Grit",
      Eyes: "fire laser",
      Head: "Wizard Hat",
      Form: "Chog",
      Tier: "Uncommon",
      Naked: "No",
    },
  },
  {
    id: "crown",
    name: "Little Crown",
    tokenId: null,
    imageUrl: null,
    sample: true,
    traits: {
      Background: "Sunlight",
      Skin: "Red",
      Side: "Right",
      Body: "Fire Shirt",
      Mouth: "normal smile",
      Eyes: "Gradient visor",
      Head: "Crown",
      Form: "Chog",
      Tier: "Common",
      Naked: "No",
    },
  },
  {
    id: "quiet",
    name: "Quiet One",
    tokenId: null,
    imageUrl: null,
    sample: true,
    traits: {
      Background: "Deep Blue",
      Skin: "Origin",
      Side: "Right",
      Mouth: "Sad",
      Eyes: "Closed Eye Crying",
      Form: "Chog",
      Tier: "Common",
      Naked: "Yes",
    },
  },
];

export function demoChog(id: string): ChogPet {
  return DEMO_CHOGS.find((pet) => pet.id === id) ?? DEMO_CHOGS[0];
}
