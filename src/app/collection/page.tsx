import type { Metadata } from "next";
import { OrbisCollection } from "@/components/motion/orbis-collection";
import { SiteShell } from "@/components/motion/site-shell";

export const metadata: Metadata = {
  title: "Collection · Chog Pocket Pet",
  description: "A dark gallery of Chog moods, and the daily jar that keeps them.",
};

export default function CollectionPage() {
  return (
    <SiteShell>
      <OrbisCollection />
    </SiteShell>
  );
}
