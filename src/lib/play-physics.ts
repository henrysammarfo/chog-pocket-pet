/** Shared arcade numbers so the canvas games and the unit tests cannot drift. */

export const DASH = {
  ground: 470,
  gravity: 2300,
  jumpVy: -860,
  maxSpeed: 430,
  startSpeed: 250,
  playerX: 80,
  playerW: 44,
  playerH: 56,
  foot: 8,
  gap: 420,
} as const;

export type DashKind = "rug" | "candle";

export function dashObstacle(kind: DashKind): { w: number; h: number } {
  if (kind === "rug") return { w: 84, h: 34 };
  return { w: 46, h: 88 };
}

export function dashRestTop(): number {
  return DASH.ground - DASH.foot - DASH.playerH;
}

/** A jump that starts when the obstacle's left edge is `lead` px past the player's right side. */
export function dashJumpClears(kind: DashKind, speed: number, lead: number): boolean {
  const obs = dashObstacle(kind);
  let obsX = DASH.playerX + DASH.playerW + lead;
  let y = dashRestTop();
  let vy = DASH.jumpVy;
  const dt = 16;
  for (let t = 0; t < 5000; t += dt) {
    const step = dt / 1000;
    vy += DASH.gravity * step;
    y += vy * step;
    const rest = dashRestTop();
    if (y >= rest) {
      y = rest;
      vy = 0;
    }
    obsX -= speed * step;
    const xOverlap = obsX < DASH.playerX + DASH.playerW && obsX + obs.w > DASH.playerX;
    const yOverlap = y + DASH.playerH > DASH.ground - obs.h && y < DASH.ground;
    if (xOverlap && yOverlap) return false;
    if (y >= rest - 0.5 && obsX + obs.w < DASH.playerX) return true;
  }
  return false;
}

export function stackAmplitude(width: number): number {
  return Math.max(120, width * 1.45);
}

export function stackOffset(elapsedMs: number, width: number): number {
  return Math.sin((elapsedMs / 3800) * Math.PI * 2) * stackAmplitude(width);
}

export function stackWouldMiss(offset: number, width: number): boolean {
  return Math.abs(offset) >= width;
}

export function stackLand(
  top: { x: number; w: number },
  droppedX: number,
  droppedW: number,
): { ok: false } | { ok: true; perfect: boolean; x: number; w: number } {
  const left = Math.max(top.x, droppedX);
  const right = Math.min(top.x + top.w, droppedX + droppedW);
  const overlap = right - left;
  if (overlap <= 0) return { ok: false };
  const centerDelta = Math.abs(droppedX + droppedW / 2 - (top.x + top.w / 2));
  const perfect = centerDelta <= 14;
  return { ok: true, perfect, x: perfect ? top.x : left, w: perfect ? top.w : overlap };
}

export const FLOPPY = {
  H: 600,
  gravity: 1080,
  flapVy: -400,
  speed: 165,
  gapH: 228,
  pipeW: 72,
  spacing: 400,
  birdX: 172,
  birdW: 46,
  birdH: 50,
  floor: 528,
} as const;

export type FloppyBird = { y: number; vy: number; points: number; dead: boolean };
export type FloppyPipe = { x: number; gapY: number; scored: boolean };

export function floppyGap(index: number): number {
  return 128 + (index % 4) * 58;
}

export function createFloppy(): { bird: FloppyBird; pipes: FloppyPipe[] } {
  return {
    bird: { y: 240, vy: 0, points: 0, dead: false },
    pipes: [
      { x: 820, gapY: floppyGap(0), scored: false },
      { x: 820 + FLOPPY.spacing, gapY: floppyGap(1), scored: false },
    ],
  };
}

export function flapBird(bird: FloppyBird) {
  if (!bird.dead) bird.vy = FLOPPY.flapVy;
}

export function stepFloppy(state: { bird: FloppyBird; pipes: FloppyPipe[] }, dtMs: number) {
  if (state.bird.dead) return;
  const step = Math.min(32, dtMs) / 1000;
  const bird = state.bird;
  bird.vy += FLOPPY.gravity * step;
  bird.y += bird.vy * step;
  for (const pipe of state.pipes) {
    pipe.x -= FLOPPY.speed * step;
    if (!pipe.scored && pipe.x + FLOPPY.pipeW < FLOPPY.birdX) {
      pipe.scored = true;
      bird.points += 1;
    }
  }
  const tail = state.pipes[state.pipes.length - 1];
  if (tail && tail.x < 640) {
    state.pipes.push({
      x: tail.x + FLOPPY.spacing,
      gapY: floppyGap(state.pipes.length),
      scored: false,
    });
  }
  const hitPipe = state.pipes.some((pipe) => {
    const xOverlap = pipe.x < FLOPPY.birdX + FLOPPY.birdW && pipe.x + FLOPPY.pipeW > FLOPPY.birdX;
    const inGap = bird.y > pipe.gapY && bird.y + FLOPPY.birdH < pipe.gapY + FLOPPY.gapH;
    return xOverlap && !inGap;
  });
  if (bird.y < 2 || bird.y + FLOPPY.birdH > FLOPPY.floor || hitPipe) bird.dead = true;
}

export const TOWER = {
  height: 0.45,
  start: 2.75,
  speed: 0.00155,
} as const;

/** Positive overlap keeps the slab. Zero or negative is a miss. */
export function towerOverlap(diff: number, prevSize: number): number {
  return prevSize - Math.abs(diff);
}
