"use client";

import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";

const PET_SIZE = 56;
const MARGIN = 24;

export function Pet() {
  const [pet] = useLocalStorage("studynook:pet", { emoji: "🐱" });

  // Static default keeps SSR and first client paint identical (no window access
  // in render). The wander loop repositions based on the real viewport.
  const [pos, setPos] = useState({ x: 60, y: 420 });
  const [facing, setFacing] = useState<1 | -1>(1);
  const [walking, setWalking] = useState(false);
  const [duration, setDuration] = useState(4);
  const [reacting, setReacting] = useState(false);

  const posRef = useRef(pos);
  useEffect(() => {
    posRef.current = pos;
  }, [pos]);

  // Wander loop. Effects only run on the client, and all state updates happen
  // inside async timer callbacks (never synchronously in the effect body).
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // honor reduced-motion: the pet stays put

    let active = true;
    let moveTimer: ReturnType<typeof setTimeout>;
    let idleTimer: ReturnType<typeof setTimeout>;

    const step = () => {
      if (!active) return;
      const maxX = Math.max(MARGIN + 1, window.innerWidth - PET_SIZE - MARGIN);
      const maxY = Math.max(MARGIN + 1, window.innerHeight - PET_SIZE - MARGIN);
      const targetX = MARGIN + Math.random() * (maxX - MARGIN);
      const targetY = MARGIN + Math.random() * (maxY - MARGIN);

      const cur = posRef.current;
      const dist = Math.hypot(targetX - cur.x, targetY - cur.y);
      const secs = Math.min(8, Math.max(2.5, dist / 80)); // ~80px per second

      setFacing(targetX >= cur.x ? 1 : -1);
      setDuration(secs);
      setWalking(true);
      setPos({ x: targetX, y: targetY });

      moveTimer = setTimeout(() => {
        setWalking(false);
        idleTimer = setTimeout(step, 1500 + Math.random() * 2500);
      }, secs * 1000);
    };

    idleTimer = setTimeout(step, 1200);

    return () => {
      active = false;
      clearTimeout(moveTimer);
      clearTimeout(idleTimer);
    };
  }, []);

  const react = () => {
    setReacting(true);
    setTimeout(() => setReacting(false), 1300);
  };

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 select-none"
    >
      <div
        className="absolute top-0 left-0"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: `transform ${duration}s ease-in-out`,
        }}
      >
        <button
          onClick={react}
          aria-label="Pet your study buddy"
          className="pointer-events-auto relative cursor-pointer text-4xl drop-shadow-[0_6px_8px_rgba(140,110,110,0.25)]"
          style={{ transform: `scaleX(${facing})` }}
        >
          <span className={walking ? "pet-walk inline-block" : "inline-block"}>
            {pet.emoji}
          </span>
          {reacting && (
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-lg">
              💕
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
