"use client";

import React, { useState } from "react";
import { apply1BasedPriorityToArray, createItemFromTemplate } from "../lib/updatePriorities";

function prettifyLabel(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function swap(arr: any[], i: number, j: number) {
  const copy = [...arr];
  const t = copy[i];
  copy[i] = copy[j];
  copy[j] = t;
  return copy;
}

export default function ArrayListEditor({
  value,
  onChange,
  itemRenderer,
  itemClassName,
  emptyMessage,
  template
}: {
  value: any[];
  onChange: (v: any[]) => void;
  itemRenderer?: (item: any, idx: number, onItemChange: (i: any) => void) => React.ReactNode;
  itemClassName?: string;
  emptyMessage?: React.ReactNode;
  // optional template to use when adding an item to an empty list
  template?: any;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [movedIndex, setMovedIndex] = useState<number | null>(null);
  const [moveDir, setMoveDir] = useState<"up" | "down" | null>(null);

  function triggerMoveAnimation(index: number, dir: "up" | "down") {
    setMovedIndex(index);
    setMoveDir(dir);
    setTimeout(() => {
      setMovedIndex(null);
      setMoveDir(null);
    }, 380);
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const next = swap(value, i, i - 1);
    onChange(apply1BasedPriorityToArray(next));
    triggerMoveAnimation(i, "up");
  }
  function moveDown(i: number) {
    if (i === value.length - 1) return;
    const next = swap(value, i, i + 1);
    onChange(apply1BasedPriorityToArray(next));
    triggerMoveAnimation(i, "down");
  }

  function addItem() {
    let newItem: any;
    if (template) {
      try {
        newItem = JSON.parse(JSON.stringify(template));
      } catch (e) {
        newItem = template;
      }
    } else if (value.length === 0) {
      newItem = {};
    } else if (typeof value[0] === "string") {
      newItem = "";
    } else {
      const templateFromExisting = value[0];
      const fromTemplate: any = {};
      for (const k of Object.keys(templateFromExisting)) {
        if (k === "id" || k === "priority") continue;
        fromTemplate[k] = "";
      }
      newItem = fromTemplate;
    }
    const next = apply1BasedPriorityToArray([...value, newItem]);
    onChange(next);
    console.log("[ArrayListEditor] Section after add:", next);
  }

  function removeItem(i: number) {
    if (!confirm("Are you sure you want to remove this item?")) return;
    const next = value.filter((_, idx) => idx !== i);
    onChange(apply1BasedPriorityToArray(next));
  }

  function onDragStart(e: React.DragEvent, i: number) {
    setDragIndex(i);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === i) return;
    const newArr = [...value];
    const [moved] = newArr.splice(dragIndex, 1);
    newArr.splice(i, 0, moved);
    setDragIndex(i);
    triggerMoveAnimation(i > dragIndex ? i : i, i > dragIndex ? "down" : "up");
    onChange(apply1BasedPriorityToArray(newArr));
  }

  return (
    <div className="space-y-4">

  {/* Empty state */}
  {value.length === 0 ? (
    <div
      className="
        rounded-xl border border-dashed
        border-zinc-300 dark:border-zinc-700
        bg-zinc-50 dark:bg-zinc-900
        p-4 text-sm
        text-zinc-600 dark:text-zinc-400
      "
    >
      {emptyMessage ?? (
        <span>
          No items yet. Click{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">
            Add item
          </strong>{" "}
          to create one.
        </span>
      )}
    </div>
  ) : (
    value.map((item, i) => {
      const animClass =
        movedIndex === i
          ? moveDir === "up"
            ? "animate-move-up"
            : "animate-move-down"
          : "";

      return (
        <div
          key={i}
          draggable
          onDragStart={(e) => onDragStart(e, i)}
          onDragOver={(e) => onDragOver(e, i)}
          className={`
            group rounded-xl border
            border-zinc-200 dark:border-zinc-800
            bg-white dark:bg-zinc-900
            p-4 cursor-grab
            transition-all duration-200
            hover:shadow-sm
            ${animClass}
            ${itemClassName ?? ""}
          `}
        >
          <div className="flex items-start gap-4">

            {/* Drag + controls */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="
                  rounded-full border
                  border-zinc-200 dark:border-zinc-700
                  bg-zinc-100 dark:bg-zinc-800
                  p-2 text-zinc-500 dark:text-zinc-400
                  cursor-grab active:cursor-grabbing
                "
              >
                ☰
              </div>

              <div className="flex flex-col gap-1">
                <button
                  onClick={() => moveUp(i)}
                  title="Move up"
                  className="
                    rounded-md border
                    border-zinc-200 dark:border-zinc-700
                    bg-white dark:bg-zinc-900
                    px-2 py-1 text-xs
                    text-zinc-600 dark:text-zinc-400
                    hover:bg-zinc-100 dark:hover:bg-zinc-800
                  "
                >
                  ▲
                </button>
                <button
                  onClick={() => moveDown(i)}
                  title="Move down"
                  className="
                    rounded-md border
                    border-zinc-200 dark:border-zinc-700
                    bg-white dark:bg-zinc-900
                    px-2 py-1 text-xs
                    text-zinc-600 dark:text-zinc-400
                    hover:bg-zinc-100 dark:hover:bg-zinc-800
                  "
                >
                  ▼
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-4">
              {itemRenderer ? (
                itemRenderer(item, i, (newItem: any) => {
                  const copy = [...value];
                  copy[i] = newItem;
                  onChange(copy);
                })
              ) : typeof item === "string" ? (
                <input
                  className="
                    w-full rounded-lg border
                    border-zinc-300 dark:border-zinc-700
                    bg-white dark:bg-zinc-950
                    px-3 py-2 text-sm
                    text-zinc-900 dark:text-zinc-100
                    outline-none
                    focus:border-primary focus:ring-1 focus:ring-primary/30
                  "
                  value={item}
                  onChange={(e) => {
                    const copy = [...value];
                    copy[i] = e.target.value;
                    onChange(copy);
                  }}
                />
              ) : (
                <div className="space-y-3">
                  {Object.keys(item)
                    .filter((k) => k !== "id" && k !== "priority")
                    .map((k) => (
                      <div key={k} className="flex gap-3 items-center">
                        <div className="w-32 text-sm text-zinc-600 dark:text-zinc-400">
                          {prettifyLabel(k)}
                        </div>
                        <input
                          className="
                            w-full rounded-lg border
                            border-zinc-300 dark:border-zinc-700
                            bg-white dark:bg-zinc-950
                            px-3 py-2 text-sm
                            text-zinc-900 dark:text-zinc-100
                            outline-none
                            focus:border-primary focus:ring-1 focus:ring-primary/30
                          "
                          value={item[k] ?? ""}
                          onChange={(e) => {
                            const copy = [...value];
                            copy[i] = { ...copy[i], [k]: e.target.value };
                            onChange(copy);
                          }}
                        />
                      </div>
                    ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => removeItem(i)}
                  className="
                    text-sm font-medium cursor-pointer
                    text-red-600 dark:text-red-500
                    hover:underline
                  "
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    })
  )}

  {/* Add button */}
  <div className="flex justify-end pt-4">
    <button
      onClick={addItem}
      className="
        rounded-lg
        bg-primary px-6 py-2
        text-sm font-medium text-white
        hover:bg-primary/90
        transition-colors
      "
    >
      Add item
    </button>
  </div>
</div>

  );
}

