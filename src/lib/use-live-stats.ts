"use client";

import { useEffect, useState } from "react";

export type LiveStats = { live: boolean; genesisSupply?: number | null; jarBalance?: string; feeders?: number; feeds?: number };

export function useLiveStats() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  useEffect(() => {
    let on = true;
    fetch("/api/stats").then((r) => r.json()).then((s) => on && setStats(s)).catch(() => on && setStats({ live: false }));
    return () => { on = false; };
  }, []);
  return stats;
}
