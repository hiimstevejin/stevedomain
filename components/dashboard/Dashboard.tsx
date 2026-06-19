"use client";

import { useEffect } from "react";
import { FocusTimer } from "./FocusTimer";
import { LofiPlaylist } from "./LofiPlaylist";
import { TodoList } from "./TodoList";
import { Bookmarks } from "./Bookmarks";
import { Pet } from "./Pet";
import { track } from "@/lib/analytics";

export function Dashboard() {
  // Conversion tracking (see lib/analytics.ts):
  //  · sign_up — the PRIMARY Google Ads conversion. A new user's first-ever
  //    authenticated load. No DB, so "new" is approximated by a persistent
  //    localStorage marker (fires once per browser, ever).
  //  · sign_in — a lighter per-session event (observation, not a conversion).
  useEffect(() => {
    try {
      if (!localStorage.getItem("studynook:signed_up")) {
        localStorage.setItem("studynook:signed_up", "1");
        track("sign_up");
      }
    } catch {
      // localStorage unavailable — skip the once-ever guard rather than
      // double-count the conversion.
    }

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
