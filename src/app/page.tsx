import type { Metadata } from "next";
import { Landing } from "@/components/motion/landing";
import { SiteShell } from "@/components/motion/site-shell";

export const metadata: Metadata = {
  title: "Chog Pocket Pet",
  description:
    "Your Chog is the pet. Traits set the mood. Feed it by setting $CHOG aside each day on Monad.",
};

export default function Page() {
  return (
    <SiteShell>
      <Landing />
    </SiteShell>
  );
}
