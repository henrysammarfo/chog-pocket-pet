export function plainTxError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/user rejected|user denied|rejected the request/i.test(message)) {
    return "The wallet closed the request. Nothing moved.";
  }
  if (/insufficient funds|insufficient balance/i.test(message)) {
    return "There is not enough $CHOG for that, or not enough MON for the network fee.";
  }
  return "Monad did not accept that move. Nothing was set aside.";
}
