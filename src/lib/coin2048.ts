export type Grid = number[][];

export function emptyGrid(): Grid {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
}

/** Two coins sit ready to merge right, so the first slide is predictable. */
export function openingGrid(): Grid {
  const grid = emptyGrid();
  grid[0][0] = 2;
  grid[0][1] = 2;
  return grid;
}

function slideLine(line: number[]): { line: number[]; score: number } {
  const compact = line.filter((cell) => cell > 0);
  const out: number[] = [];
  let score = 0;
  for (let i = 0; i < compact.length; i += 1) {
    if (compact[i] === compact[i + 1]) {
      const value = compact[i] * 2;
      out.push(value);
      score += value;
      i += 1;
    } else {
      out.push(compact[i]);
    }
  }
  while (out.length < 4) out.push(0);
  return { line: out, score };
}

function reversed(line: number[]): number[] {
  return [...line].reverse();
}

export type SlideDir = "left" | "right" | "up" | "down";

export function slideGrid(grid: Grid, dir: SlideDir): { grid: Grid; score: number; moved: boolean } {
  const next = emptyGrid();
  let score = 0;
  const horizontal = dir === "left" || dir === "right";
  for (let i = 0; i < 4; i += 1) {
    const line = horizontal
      ? [grid[i][0], grid[i][1], grid[i][2], grid[i][3]]
      : [grid[0][i], grid[1][i], grid[2][i], grid[3][i]];
    const towardStart = dir === "left" || dir === "up";
    const slid = slideLine(towardStart ? line : reversed(line));
    const placed = towardStart ? slid.line : reversed(slid.line);
    score += slid.score;
    for (let j = 0; j < 4; j += 1) {
      if (horizontal) next[i][j] = placed[j];
      else next[j][i] = placed[j];
    }
  }
  const moved = next.some((row, y) => row.some((cell, x) => cell !== grid[y][x]));
  return { grid: next, score, moved };
}

export function spawnCoin(grid: Grid, value: number, slot: number): Grid {
  const holes: Array<[number, number]> = [];
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 0) holes.push([y, x]);
    });
  });
  if (holes.length === 0) return grid;
  const [y, x] = holes[slot % holes.length];
  const next = grid.map((row) => [...row]);
  next[y][x] = value;
  return next;
}

export function gridStuck(grid: Grid): boolean {
  if (grid.some((row) => row.some((cell) => cell === 0))) return false;
  return (["left", "right", "up", "down"] as SlideDir[]).every((dir) => !slideGrid(grid, dir).moved);
}
