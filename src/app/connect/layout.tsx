import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";

export default function ConnectLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
