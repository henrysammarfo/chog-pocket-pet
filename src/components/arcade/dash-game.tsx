"use client";

import { useEffect, useRef, useState } from "react";
import { GameShell } from "@/components/arcade/game-shell";
import { ART, burst, drawSprite, fitPlayfield, paintGround, paintPlayfield, stepBits, type Bit } from "@/components/arcade/sprites";
import { playSfx } from "@/lib/arcade-sfx";
import { DASH, dashObstacle, dashRestTop, type DashKind } from "@/lib/play-physics";

const W = 960;
const H = 600;
const GROUND = DASH.ground;

type Bar = { x: number; kind: DashKind; w: number; h: number; y: number };

function makeBar(kind: DashKind, x: number): Bar {
  const box = dashObstacle(kind);
  return { x, kind, w: box.w, h: box.h, y: GROUND - box.h };
}

export function DashGame({ figure, boost, onScore }: { figure: string; boost: boolean; onScore: (score: number) => void }) {
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
    const chog = { y: dashRestTop(), vy: 0, duck: false, hops: 0, dist: 0, dead: false };
    const first = makeBar("rug", 880);
    const bars: Bar[] = [first, makeBar("candle", first.x + first.w + DASH.gap)];
    const bits: Bit[] = [];
    const clouds = [
      { x: 180, y: 80 },
      { x: 520, y: 140 },
      { x: 860, y: 60 },
    ];
    let speed: number = DASH.startSpeed;
    let reported = 0;
    let blink = 0;
    let frame = 0;
    let last = performance.now();

    const publish = (next: number) => {
      if (next === reported) return;
      reported = next;
      setScore(next);
      onScoreRef.current(next);
      if (next % 10 === 0) blink = 1;
      burst(bits, 120, chog.y + 40, 8);
      playSfx("score");
    };

    const jump = () => {
      if (chog.dead || chog.y < dashRestTop() - 8) return;
      chog.vy = DASH.jumpVy;
      chog.hops += 1;
      setActed(true);
      playSfx("jump");
      publish(chog.hops + Math.floor(chog.dist / 90));
    };

    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const step = dt / 1000;
      if (!chog.dead) {
        speed = Math.min(DASH.maxSpeed, speed + dt * 0.035);
        chog.dist += speed * step;
        chog.vy += DASH.gravity * step;
        const standTop = chog.duck ? GROUND - 40 : dashRestTop();
        chog.y = Math.min(standTop, chog.y + chog.vy * step);
        if (chog.y >= standTop) chog.vy = 0;
        for (const bar of bars) bar.x -= speed * step;
        const lastBar = bars[bars.length - 1];
        if (lastBar.x + lastBar.w < 680) {
          const kind: DashKind = bars.length % 3 === 2 ? "candle" : "rug";
          bars.push(makeBar(kind, Math.max(1040, lastBar.x + lastBar.w + DASH.gap)));
        }
        const bodyTop = chog.y + (chog.duck ? 10 : 0);
        const bodyH = chog.duck ? 30 : DASH.playerH;
        for (const bar of bars) {
          const hitX = bar.x < DASH.playerX + DASH.playerW && bar.x + bar.w > DASH.playerX;
          const hitY = bodyTop < bar.y + bar.h && bodyTop + bodyH > bar.y;
          if (hitX && hitY) {
            chog.dead = true;
            playSfx("over");
            setOver(true);
            setRunning(false);
          }
        }
        const next = chog.hops + Math.floor(chog.dist / 90);
        if (next !== reported) publish(next);
      }
      blink = Math.max(0, blink - step * 3);
      paintPlayfield(ctx, stage, chog.dist);
      for (const cloud of clouds) {
        cloud.x -= speed * step * 0.2;
        if (cloud.x < -180) cloud.x = W + 40;
        drawSprite(ctx, ART.cloud, cloud.x, cloud.y, 150, 70);
      }
      paintGround(ctx, W, GROUND, chog.dist);
      for (const bar of bars) {
        if (bar.kind === "rug") drawSprite(ctx, ART.rug, bar.x, bar.y - 10, bar.w, bar.h + 16);
        else drawSprite(ctx, ART.candle, bar.x, bar.y, bar.w, bar.h);
      }
      const frameSrc = chog.duck ? ART.duck : chog.vy < -40 ? ART.jump : chog.hops % 2 === 0 ? ART.flapUp : ART.flapDown;
      const drawH = chog.duck ? 64 : 96;
      const drawY = chog.duck ? GROUND - 70 : chog.y;
      const stretch = chog.vy < -40 ? 8 : 0;
      if (!drawSprite(ctx, frameSrc, 64, drawY - stretch, 84, drawH + stretch)) {
        drawSprite(ctx, figureRef.current, 64, drawY, 84, drawH);
      }
      if (blink > 0) {
        ctx.fillStyle = `rgba(111,255,0,${blink * 0.25})`;
        ctx.fillRect(0, 0, W, H);
      }
      stepBits(ctx, bits, dt);
      frame = requestAnimationFrame(tick);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "Enter") {
        event.preventDefault();
        jump();
      }
      if (event.code === "ArrowDown") {
        event.preventDefault();
        chog.duck = true;
        setActed(true);
      }
    };
    const onUp = (event: KeyboardEvent) => {
      if (event.code === "ArrowDown") chog.duck = false;
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onUp);
    canvas.addEventListener("pointerdown", jump);
    setLive(true);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onUp);
      canvas.removeEventListener("pointerdown", jump);
    };
  }, [running]);

  return (
    <GameShell
      id="dash"
      title="Chog Dash"
      credit="BSD-3-Clause · wayou/t-rex-runner. Speed ramp, clouds, scrolling ground, score blink. Chog runner, rug and candle obstacles."
      score={score}
      acted={acted}
      live={live}
      over={over}
      boost={boost}
      hint="Space, up, enter, or a tap jumps the rug. Down ducks. The run gets faster."
      onStart={() => {
        setScore(0);
        setOver(false);
        setActed(false);
        setLive(false);
        setRunning(true);
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full touch-none" data-testid="game-dash-view" />
    </GameShell>
  );
}
