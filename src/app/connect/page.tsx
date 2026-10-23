"use client";

import { ConnectFlow } from "@/components/app/connect-flow";
import { AppProviders } from "@/components/app/providers";

export default function ConnectPage() {
  return (
    <AppProviders>
      <ConnectFlow />
    </AppProviders>
  );
}
