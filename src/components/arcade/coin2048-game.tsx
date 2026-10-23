"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { GameShell } from "@/components/arcade/game-shell";
import { ART } from "@/components/arcade/sprites";
import { emptyGrid, gridStuck, openingGrid, type Grid, type SlideDir } from "@/lib/coin2048";
import { playSfx } from "@/lib/arcade-sfx";

const KEYS: Record<string, SlideDir> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
};

type Tile = { id: number; value: number; r: number; c: number; fresh: boolean; pop: boolean };

const TONE: Record<number, string> = {
  2: "#16331c",
  4: "#1f5c2a",
  8: "#6FFF00",
  16: "#b6ff63",
  32: "#F4845F",
  64: "#ff6a42",
  128: "#F5B942",
  256: "#ffd36e",
  512: "#ffe7a8",
  1024: "#fff1c4",
  2048: "#F5B942",
};

function tone(value: number) {
  return TONE[value] ?? "#fff6d8";
}

function fromGrid(grid: Grid, fresh = false): Tile[] {
  const tiles: Tile[] = [];
  let id = 1;
  grid.forEach((row, r) => {
    row.forEach((value, c) => {
      if (value > 0) tiles.push({ id: id++, value, r, c, fresh, pop: false });
    });
  });
  return tiles;
}

function asGrid(tiles: Tile[]): Grid {
  const grid = emptyGrid();
  for (const tile of tiles) grid[tile.r][tile.c] = tile.value;
  return grid;
}

function slideTiles(tiles: Tile[], dir: SlideDir): { tiles: Tile[]; score: number; moved: boolean } {
  const grid: (Tile | null)[][] = Array.from({ length: 4 }, () => Array<Tile | null>(4).fill(null));
  for (const tile of tiles) grid[tile.r][tile.c] = { ...tile, fresh: false, pop: false };
  const horizontal = dir === "left" || dir === "right";
  const towardStart = dir === "left" || dir === "up";
  const next: Tile[] = [];
  let score = 0;
  let moved = false;
  for (let i = 0; i < 4; i += 1) {
    const line = Array.from({ length: 4 }, (_, j) => (horizontal ? grid[i][j] : grid[j][i]));
    const ordered = towardStart ? line : [...line].reverse();
    const compact = ordered.filter((tile): tile is Tile => Boolean(tile));
    const packed: Tile[] = [];
    for (let k = 0; k < compact.length; k += 1) {
      const current = compact[k];
      const neighbor = compact[k + 1];
      if (neighbor && current.value === neighbor.value) {
        packed.push({ ...current, value: current.value * 2, pop: true });
        score += current.value * 2;
        k += 1;
      } else {
        packed.push(current);
      }
    }
    packed.forEach((tile, index) => {
      const slot = towardStart ? index : 3 - index;
      const r = horizontal ? i : slot;
      const c = horizontal ? slot : i;
      if (tile.r !== r || tile.c !== c || tile.pop) moved = true;
      next.push({ ...tile, r, c });
    });
  }
  return { tiles: next, score, moved };
}

const LOCK: Grid = [
  [0, 2, 4, 8],
  [16, 32, 64, 128],
  [256, 512, 1024, 2048],
  [4096, 8192, 4, 2],
];

export function Coin2048Game({ figure, boost, onScore }: { figure: string; boost: boolean; onScore: (score: number) => void }) {
  const [running, setRunning] = useState(false);
  const [tiles, setTiles] = useState<Tile[]>(() => fromGrid(openingGrid()));
  const [score, setScore] = useState(0);
  const [acted, setActed] = useState(false);
  const [over, setOver] = useState(false);
  const onScoreRef = useRef(onScore);
  const slot = useRef(1);
  const idRef = useRef(10);
  const tilesRef = useRef(tiles);
  const scoreRef = useRef(score);
  const runningRef = useRef(running);
  const overRef = useRef(over);
  useEffect(() => {
    onScoreRef.current = onScore;
  }, [onScore]);

  function move(dir: SlideDir) {
    if (!runningRef.current || overRef.current) return;
    const slid = slideTiles(tilesRef.current, dir);
    if (!slid.moved) return;
    const grid = asGrid(slid.tiles);
    const holes: Array<[number, number]> = [];
    grid.forEach((row, r) => row.forEach((cell, c) => cell === 0 && holes.push([r, c])));
    let nextTiles = slid.tiles;
    if (holes.length > 0) {
      const [r, c] = holes[slot.current % holes.length];
      const value = slot.current % 5 === 0 ? 4 : 2;
      slot.current += 1;
      idRef.current += 1;
      nextTiles = [...slid.tiles, { id: idRef.current, value, r, c, fresh: true, pop: false }];
    }
    const nextScore = scoreRef.current + slid.score;
    tilesRef.current = nextTiles;
    scoreRef.current = nextScore;
    setTiles(nextTiles);
    setScore(nextScore);
    setActed(true);
    if (slid.score > 0) {
      onScoreRef.current(nextScore);
      playSfx("score");
    }
    window.setTimeout(() => {
      setTiles((current) => current.map((tile) => ({ ...tile, fresh: false, pop: false })));
    }, 170);
    if (gridStuck(asGrid(nextTiles))) {
      overRef.current = true;
      playSfx("over");
      setOver(true);
      setRunning(false);
    }
  }

  const moveRef = useRef<(dir: SlideDir) => void>(() => {});
  useLayoutEffect(() => {
    tilesRef.current = tiles;
    scoreRef.current = score;
    runningRef.current = running;
    overRef.current = over;
    moveRef.current = move;
  });

  useLayoutEffect(() => {
    if (!running) return;
    const onKey = (event: KeyboardEvent) => {
      const dir = KEYS[event.code];
      if (!dir) return;
      event.preventDefault();
      moveRef.current(dir);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running]);

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const startX = Number(event.currentTarget.dataset.x ?? 0);
    const startY = Number(event.currentTarget.dataset.y ?? 0);
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
    else move(dy > 0 ? "down" : "up");
  }

  return (
    <GameShell
      id="coin2048"
      title="Chog 2048"
      credit="MIT · gabrielecirulli/2048. Sliding merge, colour ramp, coin tiles, golden Chog at 2048."
      score={score}
      acted={acted}
      live={running}
      over={over}
      boost={boost}
      square
      hint="Arrows or a swipe slide the coins. Matching coins merge. 2048 is a golden Chog."
      onStart={() => {
        const locked = window.sessionStorage.getItem("chog-e2e-2048-lock") === "1";
        const opening = fromGrid(locked ? LOCK : openingGrid());
        idRef.current = 40;
        slot.current = 1;
        tilesRef.current = opening;
        scoreRef.current = 0;
        overRef.current = false;
        runningRef.current = true;
        setTiles(opening);
        setScore(0);
        setOver(false);
        setActed(false);
        setRunning(true);
      }}
    >
      <div
        data-testid="game-coin2048-view"
        className="relative mx-auto aspect-square w-full touch-none bg-[#071033] p-2 outline-none sm:p-3 lg:max-w-[560px]"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.dataset.x = String(event.clientX);
          event.currentTarget.dataset.y = String(event.clientY);
        }}
        onPointerUp={onPointerUp}
      >
        <div className="grid h-full grid-cols-4 gap-2">
          {Array.from({ length: 16 }, (_, index) => (
            <div key={index} className="rounded-[var(--radius-12)] bg-white/5" />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-2 sm:inset-3">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className="absolute"
              style={{
                width: "calc((100% - 1.5rem) / 4)",
                height: "calc((100% - 1.5rem) / 4)",
                left: 0,
                top: 0,
                transform: `translate(calc(${tile.c} * (100% + 0.5rem)), calc(${tile.r} * (100% + 0.5rem)))`,
                transition: "transform 140ms ease-in-out",
              }}
            >
              <div
                className={`flex h-full w-full items-center justify-center rounded-[var(--radius-12)] bg-center bg-no-repeat ${tile.fresh ? "tile-pop" : ""}`}
                style={{
                  backgroundColor: tone(tile.value),
                  backgroundImage: tile.value >= 2048 ? undefined : `url(${ART.coin})`,
                  backgroundSize: "92%",
                  transform: tile.pop ? "scale(1.08)" : undefined,
                  color: tile.value <= 4 ? "#EFF4FF" : "#010828",
                }}
              >
                {tile.value >= 2048 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tile.value === 2048 ? ART.reveal : figure} alt="" className="h-3/4 w-auto" />
                ) : (
                  <span
                    className="flex h-[58%] w-[78%] items-center justify-center rounded-full bg-[#010828] font-anton text-sm sm:text-lg"
                    style={{ fontFamily: "var(--font-anton), sans-serif", color: tile.value <= 4 ? "#EFF4FF" : "#F5B942" }}
                  >
                    {tile.value}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
