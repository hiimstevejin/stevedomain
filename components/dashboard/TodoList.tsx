"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { track } from "@/lib/analytics";

type Todo = { id: string; text: string; done: boolean; createdAt: number };

export function TodoList({ className = "" }: { className?: string }) {
  const [todos, setTodos] = useLocalStorage<Todo[]>("studynook:todos", []);
  const [text, setText] = useState("");

  const add = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setTodos((prev) => [
      { id: crypto.randomUUID(), text: trimmed, done: false, createdAt: Date.now() },
      ...prev,
    ]);
    setText("");
    track("todo_added");
  };

  const toggle = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (!t.done) track("todo_completed");
        return { ...t, done: !t.done };
      }),
    );
  };

  const remove = (id: string) =>
    setTodos((prev) => prev.filter((t) => t.id !== id));

  const clearDone = () => setTodos((prev) => prev.filter((t) => !t.done));

  const remaining = todos.filter((t) => !t.done).length;
  const hasDone = todos.some((t) => t.done);

  return (
    <Card
      title="To-do"
      icon="📝"
      accent="mint"
      className={className}
      action={
        hasDone ? (
          <Button variant="ghost" size="sm" onClick={clearDone}>
            Clear done
          </Button>
        ) : undefined
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
        className="flex gap-2"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What are you working on?"
          aria-label="New task"
        />
        <Button type="submit">Add</Button>
      </form>

      {todos.length === 0 ? (
        <div className="text-cocoa-soft flex flex-1 flex-col items-center justify-center py-8 text-center text-sm">
          <span className="text-3xl">🌱</span>
          <p className="mt-2">No tasks yet. Add one to get started.</p>
        </div>
      ) : (
        <>
          <ul className="cozy-scroll mt-4 flex max-h-72 flex-col gap-1 overflow-y-auto">
            {todos.map((t) => (
              <li key={t.id}>
                <div className="group hover:bg-overlay/70 flex items-center gap-3 rounded-xl p-2 transition">
                  <button
                    onClick={() => toggle(t.id)}
                    role="checkbox"
                    aria-checked={t.done}
                    aria-label={t.text}
                    className={`flex h-5 w-5 flex-none cursor-pointer items-center justify-center rounded-md text-xs transition ${
                      t.done
                        ? "bg-mint-deep text-white"
                        : "ring-cocoa-faint/60 ring-2"
                    }`}
                  >
                    {t.done ? "✓" : ""}
                  </button>
                  <span
                    onClick={() => toggle(t.id)}
                    className={`flex-1 cursor-pointer text-sm ${
                      t.done
                        ? "text-cocoa-faint line-through"
                        : "text-cocoa"
                    }`}
                  >
                    {t.text}
                  </span>
                  <button
                    onClick={() => remove(t.id)}
                    aria-label="Delete task"
                    className="text-cocoa-faint hover:text-blush-deep flex-none cursor-pointer px-1 opacity-0 transition group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-cocoa-soft mt-auto pt-4 text-sm">
            {remaining === 0
              ? "All done — lovely work! 🎉"
              : `${remaining} task${remaining === 1 ? "" : "s"} to go`}
          </p>
        </>
      )}
    </Card>
  );
}
