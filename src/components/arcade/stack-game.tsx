"use client";

import { useEffect, useRef, useState } from "react";
import { GameShell } from "@/components/arcade/game-shell";
import { ART, burst, drawSprite, fitPlayfield, paintGround, paintPlayfield, stepBits, type Bit } from "@/components/arcade/sprites";
import { playSfx } from "@/lib/arcade-sfx";
import { stackLand, stackOffset, stackWouldMiss } from "@/lib/play-physics";

const W = 960;
const H = 600;
const BLOCK_H = 42;

type Block = { x: number; y: number; w: number; h: number; perfect: boolean };

export function StackGame({ figure, boost, onScore }: { figure: string; boost: boolean; onScore: (score: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [acted, setActed] = useState(false);
  const [over, setOver] = useState(false);
  const [live, setLive] = useState(false);
  const [swing, setSwing] = useState<"center" | "wide">("center");
  const onScoreRef = useRef(onScore);
  const figureRef = useRef(figure);
  const swingRef = useRef(swing);
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
    const blocks: Block[] = [{ x: (W - 168) / 2, y: 500, w: 168, h: BLOCK_H, perfect: false }];
    const dropped = { active: false, x: 0, y: 0, vy: 0, w: 168, rot: 0, tipping: false };
    const bits: Bit[] = [];
    let width = 168;
    let dead = false;
    let flash = 0;
    let squash = 0;
    let perfectText = 0;
    let camera = 0;
    let cameraTarget = 0;
    let started = performance.now();
    let last = started;
    let frame = 0;

    const note = (next: "center" | "wide") => {
      if (swingRef.current === next) return;
      swingRef.current = next;
      setSwing(next);
    };

    const hook = () => {
      const offset = stackOffset(performance.now() - started, width);
      note(stackWouldMiss(offset, width) ? "wide" : "center");
      return { x: W / 2 + offset - width / 2, y: 78 };
    };

    const finish = () => {
      if (dead) return;
      dead = true;
      playSfx("over");
      setOver(true);
      setRunning(false);
    };

    const release = () => {
      if (dead || dropped.active) return;
      setActed(true);
      const place = hook();
      dropped.active = true;
      dropped.x = place.x;
      dropped.y = place.y + camera;
      dropped.vy = 0;
      dropped.w = width;
      dropped.rot = 0;
      dropped.tipping = false;
      playSfx("drop");
    };

    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      if (!dead && dropped.active) {
        if (dropped.tipping) {
          dropped.rot += dt * 0.008;
          dropped.vy += dt * 0.0022;
          dropped.y += dropped.vy * dt;
          dropped.x += dt * 0.18 * (dropped.rot > 0 ? 1 : -1);
          if (dropped.y - camera > H + 80) finish();
        } else {
          dropped.vy += dt * 0.0018;
          dropped.y += dropped.vy * dt;
          const top = blocks[blocks.length - 1];
          const landY = top.y - BLOCK_H;
          if (dropped.y >= landY) {
            const landed = stackLand(top, dropped.x, dropped.w);
            if (!landed.ok) {
              dropped.tipping = true;
              dropped.y = landY;
              playSfx("hit");
            } else {
              const next: Block = {
                x: landed.x,
                y: landY,
                w: landed.w,
                h: BLOCK_H,
                perfect: landed.perfect,
              };
              blocks.push(next);
              width = next.w;
              dropped.active = false;
              squash = 1;
              flash = landed.perfect ? 1 : 0.35;
              perfectText = landed.perfect ? 1 : 0;
              burst(bits, next.x + next.w / 2, next.y);
              cameraTarget = Math.max(0, 500 - next.y - 80);
              const nextScore = blocks.length - 1;
              setScore(nextScore);
              onScoreRef.current(nextScore);
              playSfx(landed.perfect ? "perfect" : "score");
              started = performance.now();
            }
          }
        }
      }
      camera += (cameraTarget - camera) * Math.min(1, dt / 180);
      squash = Math.max(0, squash - dt / 180);
      flash = Math.max(0, flash - dt / 220);
      perfectText = Math.max(0, perfectText - dt / 700);
      paintPlayfield(ctx, stage, camera * 0.6 + now * 0.01);
      ctx.save();
      ctx.translate(0, -camera);
      paintGround(ctx, W, 542, now * 0.04);
      const paintBlock = (x: number, y: number, w: number, h: number, light: string, dark: string) => {
        ctx.fillStyle = dark;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = light;
        ctx.fillRect(x, y, w, Math.max(8, h * 0.42));
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.fillRect(x, y, w, 3);
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.fillRect(x, y + h - 5, w, 5);
      };
      blocks.forEach((block, index) => {
        const neon = block.perfect || index % 2 === 0;
        paintBlock(block.x, block.y, block.w, block.h, neon ? "#d9ff8a" : "#ffd0c2", neon ? "#2f8f18" : "#c45432");
      });
      if (dropped.active) {
        ctx.save();
        ctx.translate(dropped.x + dropped.w / 2, dropped.y + BLOCK_H / 2);
        ctx.rotate(dropped.rot);
        paintBlock(-dropped.w / 2, -BLOCK_H / 2, dropped.w, BLOCK_H, "#eaffb0", "#3dbe12");
        ctx.restore();
      }
      ctx.restore();
      if (!dead && !dropped.active) {
        const place = hook();
        ctx.strokeStyle = "#EFF4FF";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(W / 2, 24);
        ctx.lineTo(place.x + width / 2, place.y);
        ctx.stroke();
        ctx.fillStyle = "#3dbe12";
        ctx.fillRect(place.x, place.y, width, BLOCK_H);
        ctx.fillStyle = "#eaffb0";
        ctx.fillRect(place.x, place.y, width, 16);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.fillRect(place.x, place.y, width, 3);
        const chog = squash > 0.2 ? ART.duck : ART.flapUp;
        const chogH = 80 - squash * 18;
        const drawn = drawSprite(ctx, chog, place.x + width / 2 - 36, place.y - chogH + 8, 72, chogH);
        if (!drawn) drawSprite(ctx, figureRef.current, place.x + width / 2 - 36, place.y - 72, 72, 72);
      }
      if (flash > 0) {
        ctx.fillStyle = `rgba(255,255,255,${flash * 0.45})`;
        ctx.fillRect(0, 0, W, H);
      }
      if (perfectText > 0) {
        ctx.globalAlpha = perfectText;
        ctx.fillStyle = "#6FFF00";
        ctx.font = "700 42px Anton, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PERFECT", W / 2, 210);
        ctx.globalAlpha = 1;
      }
      stepBits(ctx, bits, dt);
      frame = requestAnimationFrame(tick);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        release();
      }
    };
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", release);
    setLive(true);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", release);
    };
  }, [running]);

  return (
    <GameShell
      id="stack"
      title="Chog Stack"
      credit="MIT · iamkun/tower_game · BMQB, Inc. Crane, perfect flash, and a rising camera. Original blocks, Chog on the hook."
      score={score}
      acted={acted}
      live={live}
      over={over}
      boost={boost}
      swing={swing}
      hint="The crane swings the block. Space, enter, or a tap drops it. A centered drop flashes perfect."
      onStart={() => {
        swingRef.current = "center";
        setSwing("center");
        setScore(0);
        setOver(false);
        setActed(false);
        setLive(false);
        setRunning(true);
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full touch-none" data-testid="game-stack-view" />
    </GameShell>
  );
}
