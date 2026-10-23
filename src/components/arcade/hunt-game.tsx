"use client";

import { useEffect, useRef, useState } from "react";
import { GameShell } from "@/components/arcade/game-shell";
import { ART, burst, drawSprite, fitPlayfield, paintGround, paintPlayfield, stepBits, type Bit } from "@/components/arcade/sprites";
import { playSfx } from "@/lib/arcade-sfx";

const W = 960;
const H = 600;
const SNACKS = [ART.chips, ART.donut, ART.coin] as const;

type Snack = { x: number; y: number; base: number; vx: number; phase: number; r: number; art: string; alive: boolean; hover: boolean };

export function HuntGame({ figure, boost, onScore }: { figure: string; boost: boolean; onScore: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [acted, setActed] = useState(false);
  const [over, setOver] = useState(false);
  const [live, setLive] = useState(false);
  const onScoreRef = useRef(onScore);
  const figureRef = useRef(figure);
  useEffect(() => {
    onScoreRef.current = onScore;
    figureRef.current = figure;
  }, [onScore, figure]);

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const stage = fitPlayfield(canvas, W, H);
    if (!stage) return;
    const { ctx } = stage;
    const snacks: Snack[] = [
      { x: 480, y: 250, base: 250, vx: 0, phase: 0, r: 42, art: ART.donut, alive: true, hover: true },
      { x: 140, y: 160, base: 170, vx: 150, phase: 1, r: 40, art: ART.chips, alive: true, hover: false },
      { x: 700, y: 200, base: 210, vx: -120, phase: 2.2, r: 38, art: ART.coin, alive: true, hover: false },
    ];
    const aim = { x: 480, y: 250 };
    const bits: Bit[] = [];
    const flashes: Array<{ x: number; y: number; life: number }> = [];
    let points = 0;
    let misses = 0;
    let dead = false;
    let reveal = 0;
    let frame = 0;
    let last = performance.now();
    let clock = 0;

    const end = () => {
      if (dead) return;
      dead = true;
      playSfx("over");
      setOver(true);
      setRunning(false);
    };

    const fire = (x: number, y: number) => {
      if (dead) return;
      setActed(true);
      aim.x = x;
      aim.y = y;
      flashes.push({ x, y, life: 1 });
      playSfx("shot");
      const hit = snacks.find((snack) => snack.alive && (snack.x - x) ** 2 + (snack.y - y) ** 2 < (snack.r + 34) ** 2);
      if (hit) {
        hit.alive = false;
        points += 1;
        setScore(points);
        onScoreRef.current(points);
        burst(bits, hit.x, hit.y, 16);
        playSfx("score");
      } else {
        misses += 1;
        if (misses >= 3) end();
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const step = dt / 1000;
      clock += dt;
      if (!dead) {
        for (const snack of snacks) {
          if (!snack.alive) continue;
          if (snack.hover && clock < 2500) continue;
          snack.hover = false;
          if (snack.vx === 0) snack.vx = 96;
          snack.x += snack.vx * step;
          snack.y = snack.base + Math.sin(snack.x * 0.012 + snack.phase) * 56;
          if (snack.x > W + 60) snack.x = -50;
          if (snack.x < -60) snack.x = W + 50;
        }
        if (snacks.filter((snack) => snack.alive).length < 3 && clock > 400) {
          const fromLeft = snacks.length % 2 === 0;
          snacks.push({
            x: fromLeft ? -70 : W + 70,
            y: 180,
            base: 150 + (snacks.length % 3) * 70,
            vx: (fromLeft ? 1 : -1) * (90 + (snacks.length % 3) * 18),
            phase: snacks.length,
            r: 44,
            art: SNACKS[snacks.length % 3],
            alive: true,
            hover: false,
          });
        }
      } else {
        reveal = Math.min(1, reveal + step * 1.4);
      }
      paintPlayfield(ctx, stage, clock * 0.04);
      paintGround(ctx, W, 500, clock * 0.05);
      for (const snack of snacks) {
        if (!snack.alive) continue;
        const bob = Math.sin(clock / 180 + snack.phase) * 4;
        drawSprite(ctx, snack.art, snack.x - snack.r, snack.y - snack.r + bob, snack.r * 2, snack.r * 2);
      }
      for (let i = flashes.length - 1; i >= 0; i -= 1) {
        const flash = flashes[i];
        flash.life -= step * 3;
        ctx.strokeStyle = `rgba(255,244,210,${Math.max(0, flash.life)})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, (1 - flash.life) * 46 + 8, 0, Math.PI * 2);
        ctx.stroke();
        if (flash.life <= 0) flashes.splice(i, 1);
      }
      ctx.strokeStyle = "#F4845F";
      ctx.lineWidth = 3;
      ctx.strokeRect(aim.x - 18, aim.y - 18, 36, 36);
      ctx.beginPath();
      ctx.moveTo(aim.x - 26, aim.y);
      ctx.lineTo(aim.x + 26, aim.y);
      ctx.moveTo(aim.x, aim.y - 26);
      ctx.lineTo(aim.x, aim.y + 26);
      ctx.stroke();
      ctx.fillStyle = "#EFF4FF";
      ctx.font = "600 22px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`Misses ${misses}/3`, 28, 42);
      const rise = dead ? 600 - 150 - reveal * 40 : 600 - 96;
      const drawn = drawSprite(ctx, ART.reveal, 40, rise, 120, 120);
      if (!drawn) drawSprite(ctx, figureRef.current, 40, rise, 110, 110);
      stepBits(ctx, bits, dt);
      frame = requestAnimationFrame(tick);
    };

    const onKey = (event: KeyboardEvent) => {
      const step = 36;
      if (event.code === "ArrowLeft") aim.x = Math.max(24, aim.x - step);
      if (event.code === "ArrowRight") aim.x = Math.min(W - 24, aim.x + step);
      if (event.code === "ArrowUp") aim.y = Math.max(24, aim.y - step);
      if (event.code === "ArrowDown") aim.y = Math.min(470, aim.y + step);
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space", "Enter"].includes(event.code)) {
        event.preventDefault();
        setActed(true);
      }
      if (event.code === "Enter" || event.code === "Space") fire(aim.x, aim.y);
    };
    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * W;
      const y = ((event.clientY - rect.top) / rect.height) * stage.viewH - stage.lift;
      fire(x, y);
    };
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", onPointer);
    setLive(true);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onPointer);
    };
  }, [running]);

  return (
    <GameShell
      id="snack"
      title="Chog Snack Hunt"
      credit="MIT · MattSurabian/DuckHunt-JS. Flying arcs, a shot flash, and a Chog reveal. Nintendo art rebuilt as snacks."
      score={score}
      acted={acted}
      live={live}
      over={over}
      boost={boost}
      hint="Snacks fly in arcs. Tap one, or aim with the arrows and press enter. Three misses end the hunt."
      onStart={() => {
        setScore(0);
        setOver(false);
        setActed(false);
        setLive(false);
        setRunning(true);
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full touch-none" data-testid="game-snack-view" />
    </GameShell>
  );
}
