"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import type { ArenaChannel } from "@/types";
import { useGraphStore } from "@/hooks/useGraphStore";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArenaChannel[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addSearchChannel = useGraphStore((s) => s.addSearchChannel);
  const { getViewport } = useReactFlow();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.channels || []);
      }
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    timerRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, search]);

  const handleSelect = (channel: ArenaChannel) => {
    const vp = getViewport();
    // Place at approximate center of viewport
    const centerX = (-vp.x + window.innerWidth / 2) / vp.zoom;
    const centerY = (-vp.y + window.innerHeight / 2) / vp.zoom;
    addSearchChannel(channel, { x: centerX, y: centerY });
    setQuery("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="absolute top-4 left-1/2 z-50 -translate-x-1/2">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search channels…"
          className="w-72 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-neutral-500"
        />
        {searching && (
          <span className="absolute right-3 top-2.5 text-xs text-neutral-500">…</span>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="mt-1 max-h-64 overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl">
          {results.map((ch) => (
            <button
              key={ch.id}
              onClick={() => handleSelect(ch)}
              className="block w-full px-4 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-800"
            >
              <span className="font-medium">{ch.title}</span>
              <span className="ml-2 text-xs text-neutral-500">
                {ch.length} blocks · {ch.user?.username}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
