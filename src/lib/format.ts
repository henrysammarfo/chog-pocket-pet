export const CHOG_UNIT = 10n ** 18n;

export function formatChog(wei: bigint): string {
  const neg = wei < 0n;
  const value = neg ? -wei : wei;
  const whole = value / CHOG_UNIT;
  const frac = value % CHOG_UNIT;
  const cents = (frac * 100n) / CHOG_UNIT;
  const digits =
    cents === 0n
      ? whole.toString()
      : `${whole}.${cents.toString().padStart(2, "0").replace(/0+$/, "")}`;
  return neg ? `-${digits}` : digits;
}

export function wholeChog(amount: bigint): string {
  return `${formatChog(amount)} $CHOG`;
}

export function streakLabel(days: number): string {
  if (days === 1) return "1 day streak";
  return `${days} day streak`;
}
