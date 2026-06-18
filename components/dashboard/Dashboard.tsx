"use client";

import { useEffect } from "react";
import { FocusTimer } from "./FocusTimer";
import { LofiPlaylist } from "./LofiPlaylist";
import { TodoList } from "./TodoList";
import { Bookmarks } from "./Bookmarks";
import { Pet } from "./Pet";
import { track } from "@/lib/analytics";

export function Dashboard() {
  // Fire a single sign-in/session event per browser session (placeholder for
  // future Google Ads conversion tracking — see lib/analytics.ts).
  useEffect(() => {
    try {
      if (sessionStorage.getItem("studynook:greeted")) return;
      sessionStorage.setItem("studynook:greeted", "1");
    } catch {
      // sessionStorage unavailable — fall through and still fire once per load.
    }
    track("sign_in");
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 [grid-auto-flow:dense] md:grid-cols-2 lg:grid-cols-6">
        <FocusTimer className="md:col-span-1 lg:col-span-2" />
        <LofiPlaylist className="md:col-span-2 lg:col-span-4" />
        <TodoList className="md:col-span-1 lg:col-span-3" />
        <Bookmarks className="md:col-span-1 lg:col-span-3" />
      </div>
      <Pet />
    </>
  );
}
