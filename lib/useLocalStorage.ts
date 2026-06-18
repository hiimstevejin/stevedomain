"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

const LOCAL_EVENT = "studynook:local-storage";

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * SSR-safe, typed localStorage state, built on useSyncExternalStore.
 *
 * Returns `initialValue` during SSR and the first client paint, then the
 * stored value — no hydration mismatch and no setState-in-effect. Writes sync
 * across components in this tab (via a custom event) and across browser tabs
 * (via the native `storage` event).
 *
 * Each widget owns its own namespaced key (e.g. "studynook:todos"); swapping
 * this for an API-backed store later needs no changes to widget UI.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const initialRef = useRef(initialValue);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const handler = (e: Event) => {
        // Native cross-tab StorageEvents carry a key; ignore unrelated keys.
        if (e instanceof StorageEvent && e.key !== null && e.key !== key) {
          return;
        }
        onStoreChange();
      };
      window.addEventListener("storage", handler);
      window.addEventListener(LOCAL_EVENT, handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener(LOCAL_EVENT, handler);
      };
    },
    [key],
  );

  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null, // server snapshot
  );

  let value: T = initialValue;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = initialValue;
    }
  }

  const setValue = useCallback(
    (update: T | ((prev: T) => T)) => {
      try {
        const prevRaw = readRaw(key);
        let prev: T = initialRef.current;
        if (prevRaw !== null) {
          try {
            prev = JSON.parse(prevRaw) as T;
          } catch {
            prev = initialRef.current;
          }
        }
        const next =
          typeof update === "function"
            ? (update as (p: T) => T)(prev)
            : update;
        window.localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new Event(LOCAL_EVENT));
      } catch {
        // Ignore quota / serialization / unavailable storage.
      }
    },
    [key],
  );

  return [value, setValue] as const;
}
