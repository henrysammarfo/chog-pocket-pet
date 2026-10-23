export type BoardRow = {
  tokenId: number;
  name: string;
  streak: number;
  jar: bigint;
  lastFeedDay: number;
  arcade?: number;
};

export function seedBoard(today: number): BoardRow[] {
  return [
    { tokenId: 88, name: "Chog #88", streak: 21, jar: 4_200n * 10n ** 18n, lastFeedDay: today, arcade: 90 },
    { tokenId: 123, name: "Chog #123", streak: 14, jar: 2_000n * 10n ** 18n, lastFeedDay: today - 1, arcade: 55 },
    { tokenId: 56, name: "Chog #56", streak: 9, jar: 6_500n * 10n ** 18n, lastFeedDay: today, arcade: 70 },
    { tokenId: 14, name: "Chog #14", streak: 6, jar: 800n * 10n ** 18n, lastFeedDay: today - 1, arcade: 20 },
    { tokenId: 7, name: "Chog #7", streak: 3, jar: 300n * 10n ** 18n, lastFeedDay: today - 1, arcade: 8 },
  ];
}

export function buildBoard(today: number, extra: BoardRow[]) {
  const byToken = new Map<number, BoardRow>();
  for (const row of [...seedBoard(today), ...extra]) {
    const current = byToken.get(row.tokenId);
    if (!current) {
      byToken.set(row.tokenId, row);
      continue;
    }
    const arcade = Math.max(current.arcade ?? 0, row.arcade ?? 0);
    if (row.streak > current.streak || row.jar > current.jar) byToken.set(row.tokenId, { ...row, arcade });
    else byToken.set(row.tokenId, { ...current, arcade });
  }
  const rows = [...byToken.values()];
  const alive = rows.filter((row) => row.streak > 0 && (row.lastFeedDay === today || row.lastFeedDay === today - 1));
  return {
    longest: [...alive].sort((a, b) => b.streak - a.streak || Number(b.jar - a.jar)).slice(0, 5),
    biggest: [...rows].sort((a, b) => (a.jar === b.jar ? b.streak - a.streak : a.jar > b.jar ? -1 : 1)).slice(0, 5),
    atRisk: rows
      .filter((row) => row.streak > 0 && row.lastFeedDay === today - 1)
      .sort((a, b) => b.streak - a.streak),
    arcade: [...rows].sort((a, b) => (b.arcade ?? 0) - (a.arcade ?? 0) || b.streak - a.streak).slice(0, 5),
  };
}
