import { list, put } from "@vercel/blob";

import { connection } from "next/server";

const KEY = "arcade/scores.json";
type Entry = { player: string; label: string; game: string; score: number; at: number };

async function readAll(): Promise<Entry[]> {
  const { blobs } = await list({ prefix: KEY, limit: 1 });
  if (!blobs[0]) return [];
  const res = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) return [];
  return ((await res.json()) as { entries?: Entry[] }).entries ?? [];
}

export async function GET() {
  await connection();
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ live: false, entries: [] });
  try {
    const entries = await readAll();
    return Response.json({ live: true, entries: entries.sort((a, b) => b.score - a.score).slice(0, 100) });
  } catch {
    return Response.json({ live: false, entries: [] }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ ok: false }, { status: 503 });
  const body = (await req.json().catch(() => null)) as Partial<Entry> | null;
  const player = String(body?.player ?? "").slice(0, 64);
  const label = String(body?.label ?? "").slice(0, 32);
  const game = String(body?.game ?? "");
  const score = Math.floor(Number(body?.score));
  if (!player || !/^[a-z0-9-]{2,24}$/.test(game) || !Number.isFinite(score) || score <= 0 || score > 100000) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const entries = await readAll();
  const i = entries.findIndex((e) => e.player === player && e.game === game);
  if (i >= 0 && entries[i].score >= score) return Response.json({ ok: true, kept: entries[i].score });
  const next: Entry = { player, label: label || player.slice(0, 10), game, score, at: Date.now() };
  if (i >= 0) entries[i] = next;
  else entries.push(next);
  entries.sort((a, b) => b.score - a.score);
  await put(KEY, JSON.stringify({ entries: entries.slice(0, 500) }), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 60,
  });
  return Response.json({ ok: true });
}
