"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { DURATION_MS, EASE, roleFor, stepIndex, type Direction, type Role } from "@/lib/carousel";

/**
 * Motion Sites prompt: 3D Collectible Hero (id 3d-collectible-hero).
 * Layout, colors, grain, roles, and the 650ms ease stay as written.
 * The brand, the ghost word, the paragraph, and the figurines are Chog.
 */

const FIGURES = [
  { src: "/figures/bubblegum.png", name: "Bubblegum Chog", bg: "#F4845F", panel: "#F79B7F" },
  { src: "/figures/laser.png", name: "Laser Wizard", bg: "#6BBF7A", panel: "#85CC92" },
  { src: "/figures/crown.png", name: "Little Crown", bg: "#E882B4", panel: "#ED9DC4" },
  { src: "/figures/quiet.png", name: "Quiet One", bg: "#6EB5FF", panel: "#8DC4FF" },
] as const;

const GRAIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(#n)' opacity='0.08'/></svg>`;
const GRAIN_URL = `url("data:image/svg+xml,${encodeURIComponent(GRAIN_SVG)}")`;

function roleStyle(role: Role, isMobile: boolean): CSSProperties {
  const shared: React.CSSProperties = {
    position: "absolute",
    aspectRatio: "0.6 / 1",
    transformOrigin: "bottom center",
    willChange: "transform, filter, opacity",
    transition: `transform ${DURATION_MS}ms ${EASE}, filter ${DURATION_MS}ms ${EASE}, opacity ${DURATION_MS}ms ${EASE}, left ${DURATION_MS}ms ${EASE}`,
  };
  if (role === "center") {
    return {
      ...shared,
      transform: `translateX(-50%) scale(${isMobile ? 1.2 : 1.28})`,
      filter: "none",
      opacity: 1,
      zIndex: 20,
      left: "50%",
      height: isMobile ? "58%" : "74%",
      bottom: isMobile ? "20%" : 0,
    };
  }
  if (role === "back") {
    return {
      ...shared,
      transform: "translateX(-50%) scale(1)",
      filter: "blur(4px)",
      opacity: 1,
      zIndex: 5,
      left: "50%",
      height: isMobile ? "13%" : "22%",
      bottom: isMobile ? "32%" : "12%",
    };
  }
  return {
    ...shared,
    transform: "translateX(-50%) scale(1)",
    filter: "blur(2px)",
    opacity: 0.85,
    zIndex: 10,
    left: role === "left" ? (isMobile ? "20%" : "30%") : isMobile ? "80%" : "70%",
    height: isMobile ? "16%" : "28%",
    bottom: isMobile ? "32%" : "12%",
  };
}

export function CollectibleHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const lockTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    for (const figure of FIGURES) {
      const img = new Image();
      img.src = figure.src;
    }
  }, []);

  useEffect(() => {
    const sync = () => setIsMobile(window.innerWidth < 640);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    return () => {
      if (lockTimeoutRef.current !== null) window.clearTimeout(lockTimeoutRef.current);
    };
  }, []);

  const navigate = useCallback(
    (direction: Direction) => {
      if (isAnimating) return;
      setIsAnimating(true);
      setActiveIndex((prev) => stepIndex(prev, direction));
      lockTimeoutRef.current = window.setTimeout(() => setIsAnimating(false), DURATION_MS);
    },
    [isAnimating],
  );

  const active = FIGURES[activeIndex] ?? FIGURES[0];

  return (
    <div
      data-testid="collectible-hero"
      className="relative w-full overflow-hidden font-inter"
      style={{
        backgroundColor: active.bg,
        transition: `background-color ${DURATION_MS}ms ${EASE}`,
        fontFamily: "var(--font-inter), sans-serif",
      }}
    >
      <div className="relative w-full" style={{ height: "calc(100dvh - 4rem)", overflow: "hidden" }}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            zIndex: 50,
            opacity: 0.4,
            backgroundImage: GRAIN_URL,
            backgroundSize: "200px 200px",
            backgroundRepeat: "repeat",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 flex items-center justify-center select-none"
          style={{ zIndex: 2, top: "18%" }}
        >
          <p
            data-testid="ghost-word"
            className="font-anton uppercase"
            style={{
              fontFamily: "var(--font-anton), sans-serif",
              fontSize: "clamp(90px, 28vw, 380px)",
              fontWeight: 900,
              color: "white",
              opacity: 1,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            CHOG
          </p>
        </div>
        <p
          className="absolute top-6 left-4 text-xs font-semibold uppercase sm:left-8"
          style={{ zIndex: 60, color: "white", opacity: 0.9, letterSpacing: "0.18em" }}
        >
          CHOG
        </p>
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          {FIGURES.map((figure, index) => {
            const role = roleFor(index, activeIndex);
            return (
              <div key={figure.name} data-role={role} style={roleStyle(role, isMobile)}>
                {/* Prompt asks for an img with object-fit contain. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={figure.src}
                  alt={figure.name}
                  draggable={false}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "bottom center",
                  }}
                />
              </div>
            );
          })}
        </div>
        <div
          className="absolute bottom-6 left-4 sm:bottom-20 sm:left-24"
          style={{ zIndex: 60, maxWidth: 320 }}
        >
          <p
            className="mb-2 text-base font-bold tracking-widest uppercase sm:mb-3 sm:text-[22px]"
            style={{ color: "white", opacity: 0.95, letterSpacing: "0.02em" }}
          >
            CHOG POCKET
          </p>
          <p
            className="mb-4 hidden text-xs sm:mb-5 sm:block sm:text-sm"
            style={{ color: "white", opacity: 0.85, lineHeight: 1.6 }}
          >
            Your Chog is the pet. The traits pick the voice. Set $CHOG aside once a day
            and the streak keeps the mood bright. The coins stay yours.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              aria-label="Previous figurine"
              data-testid="figurine-prev"
              onClick={() => navigate("prev")}
              className="grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-transparent text-white transition-[transform,background-color] duration-150 hover:scale-[1.08] hover:bg-white/12 sm:h-16 sm:w-16"
            >
              <ArrowLeft size={26} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              aria-label="Next figurine"
              data-testid="figurine-next"
              onClick={() => navigate("next")}
              className="grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-transparent text-white transition-[transform,background-color] duration-150 hover:scale-[1.08] hover:bg-white/12 sm:h-16 sm:w-16"
            >
              <ArrowRight size={26} strokeWidth={2.25} />
            </button>
          </div>
        </div>
        <Link
          href="/app"
          data-testid="open-pocket"
          className="absolute right-4 bottom-6 flex items-center no-underline sm:right-10 sm:bottom-20"
          style={{
            zIndex: 60,
            fontFamily: "var(--font-anton), sans-serif",
            fontSize: "clamp(20px, 4vw, 56px)",
            fontWeight: 400,
            color: "white",
            opacity: 0.95,
            letterSpacing: "-0.02em",
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          OPEN POCKET
          <ArrowRight className="ml-2 h-5 w-5 sm:h-8 sm:w-8" strokeWidth={2.25} />
        </Link>
      </div>
    </div>
  );
}
