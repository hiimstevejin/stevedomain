"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { track } from "@/lib/analytics";

type Bookmark = {
  id: string;
  href: string;
  host: string;
  label: string;
  addedAt: number;
};

function normalize(input: string) {
  const raw = input.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    if (!u.hostname.includes(".")) return null;
    return { href: u.href, host: u.hostname.replace(/^www\./, "") };
  } catch {
    return null;
  }
}

const favicon = (host: string) =>
  `https://www.google.com/s2/favicons?domain=${host}&sz=64`;

export function Bookmarks({ className = "" }: { className?: string }) {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>(
    "studynook:bookmarks",
    [],
  );
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  const add = () => {
    const n = normalize(url);
    if (!n) {
      setError("Please enter a valid link.");
      return;
    }
    setBookmarks((prev) => [
      {
        id: crypto.randomUUID(),
        href: n.href,
        host: n.host,
        label: label.trim() || n.host,
        addedAt: Date.now(),
      },
      ...prev,
    ]);
    setUrl("");
    setLabel("");
    setError("");
    track("bookmark_added");
  };

  const remove = (id: string) =>
    setBookmarks((prev) => prev.filter((b) => b.id !== id));

  return (
    <Card title="Bookmarks" icon="🔖" accent="sky" className={className}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="flex flex-col gap-2"
      >
        <Input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          placeholder="Paste a link…"
          aria-label="Bookmark URL"
        />
        <div className="flex gap-2">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (optional)"
            aria-label="Bookmark label"
          />
          <Button type="submit">Add</Button>
        </div>
      </form>
      {error && <p className="text-blush-deep mt-2 text-xs">{error}</p>}

      {bookmarks.length === 0 ? (
        <div className="text-cocoa-soft flex flex-1 flex-col items-center justify-center py-8 text-center text-sm">
          <span className="text-3xl">📚</span>
          <p className="mt-2">
            Save links you need for this session — docs, references, tabs.
          </p>
        </div>
      ) : (
        <ul className="cozy-scroll mt-4 flex max-h-72 flex-col gap-1 overflow-y-auto">
          {bookmarks.map((b) => (
            <li key={b.id}>
              <div className="group hover:bg-overlay/70 flex items-center gap-3 rounded-xl p-2 transition">
                <a
                  href={b.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-3"
                >
                  {/* External favicon — plain <img> avoids remote image config. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={favicon(b.host)}
                    alt=""
                    className="h-5 w-5 flex-none rounded"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="text-cocoa block truncate text-sm font-medium">
                      {b.label}
                    </span>
                    <span className="text-cocoa-faint block truncate text-xs">
                      {b.host}
                    </span>
                  </span>
                </a>
                <button
                  onClick={() => remove(b.id)}
                  aria-label="Remove bookmark"
                  className="text-cocoa-faint hover:text-blush-deep flex-none cursor-pointer px-1 opacity-0 transition group-hover:opacity-100"
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
