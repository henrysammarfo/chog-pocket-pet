"use client";

import { useEffect, useRef, useState } from "react";
import { GameShell } from "@/components/arcade/game-shell";
import { ART, burst, drawSprite, fitPlayfield, paintGround, paintPlayfield, ready, sprite, stepBits, type Bit } from "@/components/arcade/sprites";
import { playSfx } from "@/lib/arcade-sfx";
import { FLOPPY, createFloppy, flapBird, stepFloppy, type FloppyPipe } from "@/lib/play-physics";

const W = 960;
const H = 600;

type Pop = { x: number; y: number; life: number };

export function FloppyGame({ figure, boost, onScore }: { figure: string; boost: boolean; onScore: (score: number) => void }) {
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
    const run = createFloppy();
    const bird = run.bird;
    const pipes: FloppyPipe[] = run.pipes;
    const bits: Bit[] = [];
    const pops: Pop[] = [];
    let scroll = 0;
    let frame = 0;
    let last = performance.now();
    let ended = false;

    const flap = () => {
      if (bird.dead) return;
      flapBird(bird);
      setActed(true);
      playSfx("flap");
    };

    const die = () => {
      if (ended) return;
      ended = true;
      bird.dead = true;
      playSfx("over");
      setOver(true);
      setRunning(false);
    };

    const drawPipe = (x: number, y: number, h: number, flip: boolean) => {
      ctx.save();
      if (flip) {
        ctx.translate(x, y + h);
        ctx.scale(1, -1);
      } else {
        ctx.translate(x, y);
      }
      const image = sprite(ART.pipe);
      const capH = Math.min(48, Math.max(20, h * 0.2));
      if (ready(ART.pipe) && h > 8) {
        const sw = image.naturalWidth;
        const sh = image.naturalHeight;
        ctx.shadowColor = "#6FFF00";
        ctx.shadowBlur = 14;
        ctx.drawImage(image, 0, sh * 0.24, sw, sh * 0.62, 6, capH - 2, 72, Math.max(1, h - capH + 2));
        ctx.drawImage(image, 0, 0, sw, sh * 0.3, -4, 0, 88, capH);
      } else {
        const gradient = ctx.createLinearGradient(0, 0, 72, 0);
        gradient.addColorStop(0, "#1f8a12");
        gradient.addColorStop(0.45, "#d8ff9a");
        gradient.addColorStop(1, "#39c400");
        ctx.fillStyle = gradient;
        ctx.shadowColor = "#6FFF00";
        ctx.shadowBlur = 16;
        ctx.fillRect(6, 0, 72, h);
        ctx.fillStyle = "#6FFF00";
        ctx.fillRect(-4, 0, 88, 16);
      }
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      const step = dt / 1000;
      if (!bird.dead) {
        const before = bird.points;
        stepFloppy(run, dt);
        scroll += FLOPPY.speed * step;
        if (bird.points > before) {
          setScore(bird.points);
          onScoreRef.current(bird.points);
          pops.push({ x: 200, y: bird.y, life: 1 });
          burst(bits, 200, bird.y, 10);
          playSfx("score");
        }
        if (bird.dead) die();
      }
      paintPlayfield(ctx, stage, scroll);
      for (const pipe of pipes) {
        drawPipe(pipe.x, 0, pipe.gapY, true);
        drawPipe(pipe.x, pipe.gapY + FLOPPY.gapH, H - (pipe.gapY + FLOPPY.gapH), false);
      }
      paintGround(ctx, W, FLOPPY.floor, scroll);
      const angle = Math.max(-0.5, Math.min(1.2, bird.vy / 480));
      ctx.save();
      ctx.translate(FLOPPY.birdX + FLOPPY.birdW / 2, bird.y + FLOPPY.birdH / 2);
      ctx.rotate(angle);
      const src = bird.vy < 0 ? ART.flapUp : ART.flapDown;
      const drawn = drawSprite(ctx, src, -42, -42, 84, 84);
      if (!drawn) drawSprite(ctx, figureRef.current, -42, -42, 84, 84);
      ctx.restore();
      for (let i = pops.length - 1; i >= 0; i -= 1) {
        const pop = pops[i];
        pop.life -= step;
        pop.y -= 40 * step;
        ctx.globalAlpha = Math.max(0, pop.life);
        ctx.fillStyle = "#6FFF00";
        ctx.font = "700 36px Anton, sans-serif";
        ctx.fillText("+1", pop.x, pop.y);
        ctx.globalAlpha = 1;
        if (pop.life <= 0) pops.splice(i, 1);
      }
      stepBits(ctx, bits, dt);
      frame = requestAnimationFrame(tick);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp" || event.code === "Enter") {
        event.preventDefault();
        flap();
      }
    };
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", flap);
    setLive(true);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", flap);
    };
  }, [running]);

  return (
    <GameShell
      id="floppy"
      title="Floppy Chog"
      credit="Apache-2.0 · nebez/floppybird. Gravity, pipe pairs, and a score pop. All original art is replaced."
      score={score}
      acted={acted}
      live={live}
      over={over}
      boost={boost}
      hint="Space, up, enter, or a tap flaps. Fall through the neon pipes."
      onStart={() => {
        setScore(0);
        setOver(false);
        setActed(false);
        setLive(false);
        setRunning(true);
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full touch-none" data-testid="game-floppy-view" />
    </GameShell>
  );
}
