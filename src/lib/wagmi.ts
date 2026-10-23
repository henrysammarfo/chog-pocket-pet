"use client";

import { createConfig, http } from "wagmi";
import { monad } from "wagmi/chains";
import { injected } from "wagmi/connectors/injected";
import { monadRpcUrl } from "@/lib/config";

export const wagmiConfig = createConfig({
  chains: [monad],
  connectors: [injected()],
  transports: {
    [monad.id]: http(monadRpcUrl()),
  },
  ssr: false,
});
