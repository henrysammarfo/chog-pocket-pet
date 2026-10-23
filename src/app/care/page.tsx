import type { Metadata } from "next";
import { CozyCare } from "@/components/motion/cozy-care";
import { SiteShell } from "@/components/motion/site-shell";

export const metadata: Metadata = {
  title: "Care · Chog Pocket Pet",
  description: "Everything your Chog loves: a jar, a streak, and a mood.",
};

export default function CarePage() {
  return (
    <SiteShell>
      <CozyCare />
    </SiteShell>
  );
}
