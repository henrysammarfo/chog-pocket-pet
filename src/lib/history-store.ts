export type HistoryItem = {
  id: number;
  title: string;
  detail: string;
  kind?: "aside" | "back";
  amount?: string;
  balance?: string;
  at?: number;
};

export type Receipt = {
  kind: "aside" | "back";
  title: string;
  detail: string;
  amount?: string;
  before?: string;
  after?: string;
  at?: number;
};

export type HistoryEntry = {
  kind: Receipt["kind"];
  title: string;
  detail: string;
  amount: bigint;
  balance: bigint;
  before: bigint;
  at: number;
};

export type HistorySnap = {
  items: HistoryItem[];
  receipt: Receipt | null;
};

const HISTORY_KEY = "chog-pocket-history-v1";
const RECEIPT_KEY = "chog-pocket-receipt-v1";
const EMPTY_ITEMS: HistoryItem[] = [];
const EMPTY: HistorySnap = { items: EMPTY_ITEMS, receipt: null };

let snap: HistorySnap = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  let items = EMPTY_ITEMS;
  let receipt: Receipt | null = null;
  try {
    const raw = window.sessionStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HistoryItem[];
      if (Array.isArray(parsed)) items = parsed;
    }
  } catch {
    items = EMPTY_ITEMS;
  }
  try {
    const raw = window.sessionStorage.getItem(RECEIPT_KEY);
    if (raw) receipt = JSON.parse(raw) as Receipt;
  } catch {
    receipt = null;
  }
  snap = items.length === 0 && !receipt ? EMPTY : { items, receipt };
}

function emit(next: HistorySnap) {
  snap = next;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(HISTORY_KEY, JSON.stringify(next.items));
    if (next.receipt) window.sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(next.receipt));
    else window.sessionStorage.removeItem(RECEIPT_KEY);
  }
  for (const listener of listeners) listener();
}

export function subscribeHistory(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getHistoryServer(): HistorySnap {
  return EMPTY;
}

export function getHistoryClient(): HistorySnap {
  hydrate();
  return snap;
}

export function pushHistory(entry: HistoryEntry) {
  hydrate();
  const item: HistoryItem = {
    id: Date.now(),
    title: entry.title,
    detail: entry.detail,
    kind: entry.kind,
    amount: entry.amount.toString(),
    balance: entry.balance.toString(),
    at: entry.at,
  };
  emit({
    items: [item, ...snap.items],
    receipt: {
      kind: entry.kind,
      title: entry.title,
      detail: entry.detail,
      amount: entry.amount.toString(),
      before: entry.before.toString(),
      after: entry.balance.toString(),
      at: entry.at,
    },
  });
}

export function clearHistory() {
  hydrated = true;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(HISTORY_KEY);
    window.sessionStorage.removeItem(RECEIPT_KEY);
  }
  emit(EMPTY);
}
