"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { track } from "@/lib/analytics";

type Mode = "stopwatch" | "pomodoro";
type Phase = "work" | "break";

const TICK_MS = 250;

const todayKey = () => new Date().toISOString().slice(0, 10);

function formatClock(ms: number) {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function formatMinutes(ms: number) {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

/** A soft chime using the Web Audio API (no asset needed). */
function chime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 660;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
    osc.start();
    osc.stop(ctx.currentTime + 0.95);
    osc.onended = () => ctx.close();
  } catch {
    // Audio unavailable — silently skip.
  }
}

function notify(body: string) {
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Study Nook", { body });
    }
  } catch {
    // Notifications unavailable — skip.
  }
}

export function FocusTimer({ className = "" }: { className?: string }) {
  const [settings, setSettings] = useLocalStorage("studynook:timer", {
    mode: "stopwatch" as Mode,
    workMin: 25,
    breakMin: 5,
  });
  const [focus, setFocus] = useLocalStorage("studynook:focus", {
    date: "",
    ms: 0,
  });

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("work");
  const [round, setRound] = useState(0);
  const [display, setDisplay] = useState(0);

  // Segment bookkeeping (refs so ticking doesn't churn React state).
  const accumRef = useRef(0); // ms elapsed in current segment, while paused
  const startRef = useRef<number | null>(null); // timestamp of the active run
  const bankedRef = useRef(0); // stopwatch ms already added to "focused today"

  const mode = settings.mode;
  const phaseDuration =
    (phase === "work" ? settings.workMin : settings.breakMin) * 60_000;

  const elapsedNow = useCallback(
    () => accumRef.current + (startRef.current ? Date.now() - startRef.current : 0),
    [],
  );

  const addFocus = useCallback(
    (ms: number) => {
      if (ms <= 0) return;
      setFocus((f) => {
        const today = todayKey();
        const base = f.date === today ? f.ms : 0;
        return { date: today, ms: base + ms };
      });
    },
    [setFocus],
  );

  // Keep the display in sync while paused (and on mode/phase/settings changes).
  useEffect(() => {
    if (running) return;
    setDisplay(
      mode === "stopwatch"
        ? accumRef.current
        : Math.max(0, phaseDuration - accumRef.current),
    );
  }, [running, mode, phase, phaseDuration]);

  // Ticking engine.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const elapsed = elapsedNow();

      if (mode === "stopwatch") {
        setDisplay(elapsed);
        return;
      }

      const remaining = phaseDuration - elapsed;
      if (remaining > 0) {
        setDisplay(remaining);
        return;
      }

      // Phase complete → advance.
      if (phase === "work") {
        addFocus(phaseDuration);
        setRound((r) => r + 1);
        track("pomodoro_round_complete");
        chime();
        notify("Break time 🍵 — nice focus!");
        setPhase("break");
      } else {
        chime();
        notify("Back to it 🌸");
        setPhase("work");
      }
      accumRef.current = 0;
      startRef.current = Date.now();
      setDisplay(0);
    }, TICK_MS);

    return () => clearInterval(id);
  }, [running, mode, phase, phaseDuration, addFocus, elapsedNow]);

  const start = () => {
    if (running) return;
    startRef.current = Date.now();
    setRunning(true);
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    track("timer_start", { mode });
  };

  const pause = () => {
    if (!running) return;
    if (startRef.current) {
      accumRef.current += Date.now() - startRef.current;
      startRef.current = null;
    }
    if (mode === "stopwatch") {
      addFocus(accumRef.current - bankedRef.current);
      bankedRef.current = accumRef.current;
    }
    setRunning(false);
    track("timer_pause");
  };

  const reset = () => {
    if (mode === "stopwatch") {
      addFocus(elapsedNow() - bankedRef.current);
    }
    accumRef.current = 0;
    bankedRef.current = 0;
    startRef.current = null;
    setRunning(false);
    setPhase("work");
    setRound(0);
    setDisplay(mode === "stopwatch" ? 0 : settings.workMin * 60_000);
    track("timer_reset");
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    if (mode === "stopwatch") {
      addFocus(elapsedNow() - bankedRef.current);
    }
    accumRef.current = 0;
    bankedRef.current = 0;
    startRef.current = null;
    setRunning(false);
    setPhase("work");
    setRound(0);
    setSettings((s) => ({ ...s, mode: next }));
  };

  const adjust = (field: "workMin" | "breakMin", delta: number) => {
    setSettings((s) => ({
      ...s,
      [field]: Math.min(90, Math.max(1, s[field] + delta)),
    }));
  };

  const focusedTodayMs = focus.date === todayKey() ? focus.ms : 0;
  const isBreak = mode === "pomodoro" && phase === "break";

  return (
    <Card title="Focus" icon="⏱️" accent="peach" className={className}>
      {/* Mode toggle */}
      <div className="bg-overlay/70 mb-5 grid grid-cols-2 gap-1 rounded-2xl p-1">
        {(["stopwatch", "pomodoro"] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`cursor-pointer rounded-xl py-1.5 text-sm font-semibold capitalize transition ${
              mode === m
                ? "bg-card text-cocoa shadow-soft"
                : "text-cocoa-soft hover:text-cocoa"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Clock */}
      <div className="flex flex-col items-center">
        {mode === "pomodoro" && (
          <span
            className={`mb-1 rounded-full px-3 py-0.5 text-xs font-semibold ${
              isBreak ? "bg-mint text-cocoa" : "bg-peach text-cocoa"
            }`}
          >
            {isBreak ? "Break" : "Focus"} · Round {round + (isBreak ? 0 : 1)}
          </span>
        )}
        <div className="text-cocoa font-mono text-5xl font-bold tabular-nums">
          {formatClock(display)}
        </div>
      </div>

      {/* Pomodoro length steppers */}
      {mode === "pomodoro" && (
        <div className="text-cocoa-soft mt-4 flex justify-center gap-6 text-sm">
          {(["workMin", "breakMin"] as const).map((field) => (
            <div key={field} className="flex items-center gap-2">
              <span>{field === "workMin" ? "Focus" : "Break"}</span>
              <div className="bg-overlay/70 flex items-center gap-1 rounded-xl px-1">
                <button
                  onClick={() => adjust(field, -1)}
                  disabled={running}
                  className="text-cocoa-soft hover:text-cocoa h-6 w-6 cursor-pointer rounded-lg disabled:opacity-40"
                >
                  –
                </button>
                <span className="text-cocoa w-7 text-center font-semibold tabular-nums">
                  {settings[field]}
                </span>
                <button
                  onClick={() => adjust(field, 1)}
                  disabled={running}
                  className="text-cocoa-soft hover:text-cocoa h-6 w-6 cursor-pointer rounded-lg disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="mt-5 flex gap-2">
        <Button
          onClick={running ? pause : start}
          variant="primary"
          className="flex-1"
        >
          {running ? "Pause" : "Start"}
        </Button>
        <Button onClick={reset} variant="soft">
          Reset
        </Button>
      </div>

      <p className="text-cocoa-soft mt-auto pt-5 text-center text-sm">
        Focused today: <span className="font-semibold">{formatMinutes(focusedTodayMs)}</span>
      </p>
    </Card>
  );
}
