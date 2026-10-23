"use client";

import { useEffect, useRef, useState } from "react";
import { GameShell } from "@/components/arcade/game-shell";
import { ART } from "@/components/arcade/sprites";
import { playSfx } from "@/lib/arcade-sfx";
import { TOWER, towerOverlap } from "@/lib/play-physics";

const HEIGHT = TOWER.height;
const START = TOWER.start;

type Slab = { x: number; z: number; w: number; d: number };
type Cut = Slab & { y: number; vy: number; life: number };

export function TowerGame({ figure, boost, onScore }: { figure: string; boost: boolean; onScore: (score: number) => void }) {
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
    let stop = false;
    let frame = 0;
    const placed: Slab[] = [{ x: 0, z: 0, w: 2.4, d: 2.4 }];
    const mover = { x: 0, z: 0, w: 2.4, d: 2.4, dir: -1, axis: "x" as "x" | "z" };
    const cuts: Cut[] = [];
    let dead = false;
    let perfect = 0;

    const note = (next: "center" | "wide") => {
      if (swingRef.current === next) return;
      swingRef.current = next;
      setSwing(next);
    };

    const finish = () => {
      if (dead) return;
      dead = true;
      playSfx("over");
      setOver(true);
      setRunning(false);
    };

    const drop = () => {
      if (dead) return;
      setActed(true);
      const previous = placed[placed.length - 1];
      const axis = mover.axis;
      const diff = axis === "x" ? mover.x - previous.x : mover.z - previous.z;
      const abs = Math.abs(diff);
      const prevSize = axis === "x" ? previous.w : previous.d;
      let size = towerOverlap(diff, prevSize);
      if (size <= 0) {
        playSfx("hit");
        finish();
        return;
      }
      const aligned = abs <= prevSize * 0.08;
      if (aligned) size = prevSize;
      const shift = aligned ? 0 : diff / 2;
      const next: Slab = {
        x: axis === "x" ? previous.x + shift : previous.x,
        z: axis === "z" ? previous.z + shift : previous.z,
        w: axis === "x" ? size : previous.w,
        d: axis === "z" ? size : previous.d,
      };
      if (!aligned) {
        const sign = diff < 0 ? -1 : 1;
        cuts.push({
          x: axis === "x" ? mover.x + (sign * size) / 2 : previous.x,
          z: axis === "z" ? mover.z + (sign * size) / 2 : previous.z,
          w: axis === "x" ? prevSize - size : previous.w,
          d: axis === "z" ? prevSize - size : previous.d,
          y: placed.length * HEIGHT,
          vy: 0,
          life: 1,
        });
      } else {
        perfect = 1;
      }
      placed.push(next);
      mover.axis = axis === "x" ? "z" : "x";
      mover.w = next.w;
      mover.d = next.d;
      mover.x = mover.axis === "x" ? -START : next.x;
      mover.z = mover.axis === "z" ? -START : next.z;
      mover.dir = 1;
      const nextScore = placed.length - 1;
      setScore(nextScore);
      onScoreRef.current(nextScore);
      playSfx(aligned ? "perfect" : "drop");
    };

    const step = (dt: number) => {
      if (!dead) {
        const cursor = mover.axis === "x" ? "x" : "z";
        mover[cursor] += mover.dir * dt * TOWER.speed;
        if (Math.abs(mover[cursor]) > START) {
          mover.dir *= -1;
          mover[cursor] = Math.sign(mover[cursor]) * START;
        }
        const previous = placed[placed.length - 1];
        const origin = cursor === "x" ? previous.x : previous.z;
        const size = cursor === "x" ? previous.w : previous.d;
        note(Math.abs(mover[cursor] - origin) >= size ? "wide" : "center");
      }
      perfect = Math.max(0, perfect - dt / 420);
      for (const cut of cuts) {
        cut.vy += dt * 0.012;
        cut.y -= cut.vy * dt * 0.004;
        cut.life -= dt / 700;
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        drop();
      }
    };
    window.addEventListener("keydown", onKey);
    canvas.addEventListener("pointerdown", drop);
    setLive(true);

    const boot = async () => {
      try {
        const THREE = await import("three");
        if (stop) return () => {};
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        renderer.setClearColor("#071033");
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 960 / 600, 0.1, 80);
        const frameCamera = () => {
          const cssW = Math.max(1, canvas.clientWidth);
          const cssH = Math.max(1, canvas.clientHeight);
          const aspect = cssW / cssH;
          renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
          renderer.setSize(cssW, cssH, false);
          const baseFov = (42 * Math.PI) / 180;
          const horizontal = 2 * Math.atan(Math.tan(baseFov / 2) * (960 / 600));
          camera.fov = (2 * Math.atan(Math.tan(horizontal / 2) / aspect) * 180) / Math.PI;
          camera.aspect = aspect;
          camera.updateProjectionMatrix();
        };
        frameCamera();
        camera.position.set(-4.8, 4.4, 4.8);
        const ambient = new THREE.AmbientLight("#dbe7ff", 0.38);
        scene.add(ambient);
        const sun = new THREE.DirectionalLight("#fff4d2", 1.7);
        sun.position.set(-8, 14, 6);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.camera.near = 1;
        sun.shadow.camera.far = 40;
        sun.shadow.camera.left = -10;
        sun.shadow.camera.right = 10;
        sun.shadow.camera.top = 10;
        sun.shadow.camera.bottom = -10;
        sun.shadow.bias = -0.001;
        scene.add(sun);
        const fill = new THREE.DirectionalLight("#6FFF00", 0.35);
        fill.position.set(6, 4, -4);
        scene.add(fill);
        const ground = new THREE.Mesh(
          new THREE.CircleGeometry(9, 40),
          new THREE.MeshPhongMaterial({ color: "#2a3d72" }),
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.24;
        ground.receiveShadow = true;
        scene.add(ground);
        const blocks: Array<import("three").Mesh> = [];
        const addSlab = (slab: Slab, y: number, index: number) => {
          const material = new THREE.MeshPhongMaterial();
          material.color.setHSL((0.28 + index * 0.07) % 1, 0.74, 0.52);
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(Math.max(slab.w, 0.05), HEIGHT, Math.max(slab.d, 0.05)), material);
          mesh.position.set(slab.x, y, slab.z);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          scene.add(mesh);
          blocks.push(mesh);
          return mesh;
        };
        const pedestal = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 1.4, 2.5),
          new THREE.MeshPhongMaterial({ color: "#14224a" }),
        );
        pedestal.position.y = -0.9;
        pedestal.castShadow = true;
        pedestal.receiveShadow = true;
        scene.add(pedestal);
        addSlab(placed[0], 0, 0);
        const movingMat = new THREE.MeshPhongMaterial();
        movingMat.color.setHSL(0.3, 0.8, 0.55);
        let movingGeo = new THREE.BoxGeometry(mover.w, HEIGHT, mover.d);
        const moving = new THREE.Mesh(movingGeo, movingMat);
        moving.castShadow = true;
        scene.add(moving);
        let movingSize = `${mover.w}:${mover.d}`;
        const badge = new THREE.Mesh(
          new THREE.PlaneGeometry(1.7, 1.7),
          new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(ART.jump), transparent: true, depthWrite: false }),
        );
        scene.add(badge);
        const flash = new THREE.Mesh(
          new THREE.PlaneGeometry(3.2, 3.2),
          new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, side: THREE.DoubleSide }),
        );
        flash.rotation.x = -Math.PI / 2;
        scene.add(flash);
        const cutMeshes: Array<import("three").Mesh> = [];
        let last = performance.now();
        const tick = (now: number) => {
          if (stop) return;
          const dt = Math.min(32, now - last);
          last = now;
          step(dt);
          while (blocks.length < placed.length) {
            const index = blocks.length;
            addSlab(placed[index], index * HEIGHT, index);
          }
          const sizeKey = `${mover.w}:${mover.d}`;
          if (sizeKey !== movingSize) {
            movingSize = sizeKey;
            movingGeo.dispose();
            movingGeo = new THREE.BoxGeometry(Math.max(mover.w, 0.05), HEIGHT, Math.max(mover.d, 0.05));
            moving.geometry = movingGeo;
          }
          movingMat.color.setHSL((0.28 + placed.length * 0.07) % 1, 0.8, 0.55);
          moving.position.set(mover.x, placed.length * HEIGHT, mover.z);
          badge.position.set(mover.x, placed.length * HEIGHT + 1.15, mover.z);
          badge.lookAt(camera.position);
          while (cutMeshes.length < cuts.length) {
            const cut = cuts[cutMeshes.length];
            const mesh = new THREE.Mesh(
              new THREE.BoxGeometry(Math.max(cut.w, 0.05), HEIGHT, Math.max(cut.d, 0.05)),
              new THREE.MeshPhongMaterial({ color: "#F4845F", transparent: true }),
            );
            mesh.castShadow = true;
            scene.add(mesh);
            cutMeshes.push(mesh);
          }
          cutMeshes.forEach((mesh, index) => {
            const cut = cuts[index];
            if (!cut) return;
            mesh.position.set(cut.x, cut.y, cut.z);
            const material = mesh.material as import("three").MeshPhongMaterial;
            material.opacity = Math.max(0, cut.life);
          });
          const top = placed[placed.length - 1];
          flash.position.set(top.x, placed.length * HEIGHT + 0.05, top.z);
          (flash.material as import("three").MeshBasicMaterial).opacity = perfect * 0.85;
          frameCamera();
          const watch = placed.length * HEIGHT;
          const destination = new THREE.Vector3(top.x - 4.2, 3.4 + watch, top.z + 4.2);
          camera.position.lerp(destination, 0.08);
          camera.lookAt(top.x, watch * 0.55, top.z);
          renderer.render(scene, camera);
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => {
          renderer.dispose();
        };
      } catch {
        const ctx = canvas.getContext("2d");
        if (!ctx) return () => {};
        let last = performance.now();
        const tick = (now: number) => {
          if (stop) return;
          const dt = Math.min(32, now - last);
          last = now;
          step(dt);
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.fillStyle = "#071033";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          placed.forEach((slab, index) => {
            ctx.fillStyle = `hsl(${100 + index * 18}, 75%, 52%)`;
            ctx.fillRect(280 + slab.x * 70, 420 - index * 28, slab.w * 70, 22);
          });
          ctx.fillStyle = "#6FFF00";
          ctx.fillRect(280 + mover.x * 70, 420 - placed.length * 28, mover.w * 70, 22);
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => {};
      }
    };

    let cleanup: (() => void) | undefined;
    void boot().then((done) => {
      if (stop) done();
      else cleanup = done;
    });
    return () => {
      stop = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", drop);
      cleanup?.();
    };
  }, [running]);

  return (
    <GameShell
      id="tower"
      title="Chog Tower 3D"
      credit="MIT · KonradLinkowski/Stack. Lit slabs, colour shift, falling offcuts, rising camera."
      score={score}
      acted={acted}
      live={live}
      over={over}
      boost={boost}
      swing={swing}
      hint="Space, enter, or a tap drops the slab. A close land keeps the width. The cut piece falls."
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
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full touch-none" data-testid="game-tower-view" />
    </GameShell>
  );
}
