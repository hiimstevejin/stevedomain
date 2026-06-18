"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLocalStorage } from "@/lib/useLocalStorage";
import {
  parseYouTubeId,
  youTubeEmbedSrc,
  youTubeThumb,
} from "@/lib/youtube";
import { track } from "@/lib/analytics";

type Track = { id: string; videoId: string; title: string };

async function resolveTitle(videoId: string): Promise<string> {
  try {
    const res = await fetch(`/api/yt-title?id=${videoId}`);
    if (res.ok) {
      const data = (await res.json()) as { title: string | null };
      if (data.title) return data.title;
    }
  } catch {
    // fall through to generic label
  }
  return "YouTube track";
}

export function LofiPlaylist({ className = "" }: { className?: string }) {
  const [tracks, setTracks] = useLocalStorage<Track[]>(
    "studynook:playlist",
    [],
  );
  const [current, setCurrent] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const activeId = current ?? tracks[0]?.id ?? null;
  const active = tracks.find((t) => t.id === activeId) ?? null;

  const addTrack = async () => {
    const videoId = parseYouTubeId(url);
    if (!videoId) {
      setError("Hmm, that doesn't look like a YouTube link.");
      return;
    }
    if (tracks.some((t) => t.videoId === videoId)) {
      setError("That track is already in your playlist.");
      setUrl("");
      return;
    }

    const id = crypto.randomUUID();
    setTracks((prev) => [...prev, { id, videoId, title: "Loading…" }]);
    setCurrent(id);
    setUrl("");
    setError("");
    track("track_added");

    const title = await resolveTitle(videoId);
    setTracks((prev) => prev.map((t) => (t.id === id ? { ...t, title } : t)));
  };

  const remove = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    if (activeId === id) setCurrent(null);
  };

  return (
    <Card title="Lo-fi Playlist" icon="🎧" accent="lavender" className={className}>
      <div className="bg-overlay aspect-video w-full overflow-hidden rounded-2xl">
        {active ? (
          <iframe
            key={active.videoId}
            src={youTubeEmbedSrc(active.videoId, true)}
            title={active.title}
            className="h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="text-cocoa-soft flex h-full flex-col items-center justify-center px-6 text-center text-sm">
            <span className="text-3xl">🎵</span>
            <p className="mt-2">
              Paste a YouTube link below to start your study soundtrack.
            </p>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void addTrack();
        }}
        className="mt-4 flex gap-2"
      >
        <Input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          placeholder="Paste a YouTube URL…"
          aria-label="YouTube URL"
        />
        <Button type="submit">Add</Button>
      </form>
      {error && <p className="text-blush-deep mt-2 text-xs">{error}</p>}

      {tracks.length > 0 && (
        <ul className="cozy-scroll mt-4 flex max-h-44 flex-col gap-1 overflow-y-auto">
          {tracks.map((t) => (
            <li key={t.id}>
              <div
                className={`group flex items-center gap-3 rounded-xl p-1.5 pr-2 transition ${
                  t.id === activeId ? "bg-lavender/60" : "hover:bg-overlay/70"
                }`}
              >
                <button
                  onClick={() => setCurrent(t.id)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                >
                  {/* External YouTube thumbnail — plain <img> avoids remote image config. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={youTubeThumb(t.videoId)}
                    alt=""
                    className="h-9 w-14 flex-none rounded-lg object-cover"
                  />
                  <span className="text-cocoa truncate text-sm">{t.title}</span>
                </button>
                <button
                  onClick={() => remove(t.id)}
                  aria-label="Remove track"
                  className="text-cocoa-faint hover:text-blush-deep flex-none cursor-pointer px-1"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
