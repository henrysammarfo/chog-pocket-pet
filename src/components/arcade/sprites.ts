export const ART = {
  flapUp: "/arcade/chog-flap-up.png",
  flapDown: "/arcade/chog-flap-down.png",
  jump: "/arcade/chog-jump.png",
  duck: "/arcade/chog-duck.png",
  reveal: "/arcade/chog-reveal.png",
  pipe: "/arcade/pipe-neon.png",
  rug: "/arcade/rug.png",
  candle: "/arcade/candle.png",
  chips: "/arcade/chips.png",
  donut: "/arcade/donut.png",
  coin: "/arcade/mon-coin.png",
  cloud: "/arcade/cloud.png",
  skyline: "/arcade/skyline.png",
} as const;

const cache = new Map<string, HTMLImageElement>();

export function sprite(src: string) {
  let image = cache.get(src);
  if (!image) {
    image = new Image();
    image.src = src;
    cache.set(src, image);
  }
  return image;
}

export function ready(src: string) {
  const image = sprite(src);
  return image.complete && image.naturalWidth > 0;
}

export function drawSprite(
  ctx: CanvasRenderingContext2D,
  src: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (!ready(src)) return false;
  ctx.drawImage(sprite(src), x, y, w, h);
  return true;
}

export type Bit = { x: number; y: number; vx: number; vy: number; life: number; color: string; r: number };

export function burst(bits: Bit[], x: number, y: number, count = 14) {
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    bits.push({
      x,
      y,
      vx: Math.cos(angle) * (70 + (i % 4) * 18),
      vy: Math.sin(angle) * (70 + (i % 4) * 18) - 40,
      life: 1,
      color: i % 2 === 0 ? "#6FFF00" : "#F4845F",
      r: 2 + (i % 3),
    });
  }
}

export function stepBits(ctx: CanvasRenderingContext2D, bits: Bit[], dt: number) {
  for (let i = bits.length - 1; i >= 0; i -= 1) {
    const bit = bits[i];
    bit.life -= dt / 520;
    bit.x += (bit.vx * dt) / 1000;
    bit.y += (bit.vy * dt) / 1000;
    bit.vy += dt * 0.35;
    if (bit.life <= 0) bits.splice(i, 1);
  }
  for (const bit of bits) {
    ctx.globalAlpha = Math.max(0, bit.life);
    ctx.fillStyle = bit.color;
    ctx.beginPath();
    ctx.arc(bit.x, bit.y, bit.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function paintSky(ctx: CanvasRenderingContext2D, width: number, height: number, scroll: number) {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#07103a");
  sky.addColorStop(0.45, "#101848");
  sky.addColorStop(1, "#1b1038");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 48; i += 1) {
    const depth = 0.12 + (i % 5) * 0.08;
    const x = ((i * 113 - scroll * depth) % (width + 16) + width) % width;
    const y = (i * 47) % (height * 0.62);
    ctx.globalAlpha = 0.35 + (i % 4) * 0.12;
    ctx.fillStyle = i % 5 === 0 ? "#F4845F" : "#EFF4FF";
    ctx.fillRect(x, y, i % 7 === 0 ? 2.5 : 1.5, i % 7 === 0 ? 2.5 : 1.5);
  }
  ctx.globalAlpha = 1;
  if (ready(ART.skyline)) {
    const image = sprite(ART.skyline);
    const sw = width * 1.15;
    const sh = sw * (image.naturalHeight / image.naturalWidth);
    const x = -((scroll * 0.22) % sw);
    const y = height - sh * 0.72;
    ctx.drawImage(image, x, y, sw, sh);
    ctx.drawImage(image, x + sw - 1, y, sw, sh);
  }
}

export function paintGround(ctx: CanvasRenderingContext2D, width: number, y: number, scroll: number) {
  const dirt = ctx.createLinearGradient(0, y, 0, y + 80);
  dirt.addColorStop(0, "#6FFF00");
  dirt.addColorStop(0.08, "#16301a");
  dirt.addColorStop(1, "#071018");
  ctx.fillStyle = dirt;
  ctx.fillRect(0, y, width, 120);
  ctx.fillStyle = "#F4845F";
  const step = 28;
  const offset = scroll % step;
  for (let x = -step; x < width + step; x += step) {
    ctx.fillRect(x - offset, y + 16, 12, 3);
    ctx.fillRect(x - offset + 8, y + 26, 4, 4);
  }
}

export function fitCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return ctx;
}

/** Logical width stays 960. Extra CSS height becomes sky above the 600-tall world, so sprites are not stretched. */
export function fitPlayfield(canvas: HTMLCanvasElement, worldW = 960, worldH = 600) {
  const cssW = canvas.clientWidth || worldW;
  const cssH = canvas.clientHeight || Math.round((worldH / worldW) * cssW);
  const viewH = Math.max(worldH, Math.round((cssH / Math.max(1, cssW)) * worldW));
  const lift = viewH - worldH;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.floor(worldW * ratio);
  canvas.height = Math.floor(viewH * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { ctx, viewH, lift, ratio, worldW, worldH };
}

export function paintPlayfield(ctx: CanvasRenderingContext2D, stage: { viewH: number; lift: number; ratio: number }, scroll: number, worldW = 960) {
  ctx.setTransform(stage.ratio, 0, 0, stage.ratio, 0, 0);
  paintSky(ctx, worldW, stage.viewH, scroll);
  ctx.setTransform(stage.ratio, 0, 0, stage.ratio, 0, stage.lift * stage.ratio);
}
