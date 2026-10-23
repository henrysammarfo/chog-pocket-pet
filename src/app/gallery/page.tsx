import type { Metadata } from "next";
import { CollectibleHero } from "@/components/motion/collectible-hero";
import { SiteShell } from "@/components/motion/site-shell";

export const metadata: Metadata = {
  title: "Gallery · Chog Pocket Pet",
  description: "Four sample Chogs, spinning like collectible figurines.",
};

export default function GalleryPage() {
  return (
    <SiteShell>
      <CollectibleHero />
    </SiteShell>
  );
}
