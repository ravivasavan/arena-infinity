"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MiniMap, useReactFlow } from "@xyflow/react";
import { X, MagnifyingGlass } from "@phosphor-icons/react";
import type { ArenaChannel } from "@/types";
import { useGraphStore } from "@/hooks/useGraphStore";

export function ChannelIndex() {
  const [channels, setChannels] = useState<ArenaChannel[]>([]);
  const [filtered, setFiltered] = useState<ArenaChannel[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<ArenaChannel[]>([]);
  const [searching, setSearching] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addSearchChannel = useGraphStore((s) => s.addSearchChannel);
  const storeNodes = useGraphStore((s) => s.nodes);
  const { getViewport } = useReactFlow();

  const hasNodes = storeNodes.length > 0;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/users/channels");
        if (res.ok) {
          const data = await res.json();
          const ch: ArenaChannel[] = data.channels || [];
          setChannels(ch);
          setFiltered(ch);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setFiltered(channels);
      setSearchResults([]);
      return;
    }
    setFiltered(channels.filter((ch) => ch.title.toLowerCase().includes(q)));

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.channels || []);
        }
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, channels]);

  const handleSelect = useCallback(
    (channel: ArenaChannel) => {
      const vp = getViewport();
      const centerX = (-vp.x + window.innerWidth / 2) / vp.zoom;
      const centerY = (-vp.y + window.innerHeight / 2) / vp.zoom;
      addSearchChannel(channel, { x: centerX, y: centerY });
    },
    [getViewport, addSearchChannel]
  );

  const externalResults = searchResults.filter(
    (sr) => !channels.find((ch) => ch.id === sr.id)
  );

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="absolute top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-lg border border-neutral-700 bg-neutral-900/95 backdrop-blur-sm text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors"
      >
        <MagnifyingGlass size={16} />
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 bottom-4 z-50 w-64 rounded-lg border border-neutral-700 bg-neutral-900/95 backdrop-blur-sm shadow-xl flex flex-col overflow-hidden">
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-800 flex-shrink-0">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter or search…"
          className="flex-1 rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none focus:border-neutral-500"
        />
        <button
          onClick={() => setCollapsed(true)}
          className="text-neutral-500 hover:text-white flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>

      {/* Channel list */}
      <div className="overflow-y-auto flex-1 min-h-0">
        {loading && (
          <div className="px-3 py-4 text-xs text-neutral-500">Loading channels…</div>
        )}

        {!loading && filtered.length > 0 && (
          <div>
            <div className="px-3 py-1.5 text-[10px] text-neutral-600 uppercase tracking-wider">Your channels</div>
            {filtered.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleSelect(ch)}
                className="block w-full px-3 py-1.5 text-left hover:bg-neutral-800 transition-colors group"
              >
                <span className="text-xs text-neutral-200 group-hover:text-white">{ch.title}</span>
                <span className="ml-2 text-[10px] text-neutral-600">{ch.length}</span>
              </button>
            ))}
          </div>
        )}

        {query.trim() && externalResults.length > 0 && (
          <div className="border-t border-neutral-800">
            <div className="px-3 py-1.5 text-[10px] text-neutral-600 uppercase tracking-wider">
              Are.na {searching && "…"}
            </div>
            {externalResults.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleSelect(ch)}
                className="block w-full px-3 py-1.5 text-left hover:bg-neutral-800 transition-colors group"
              >
                <span className="text-xs text-neutral-200 group-hover:text-white">{ch.title}</span>
                <span className="ml-2 text-[10px] text-neutral-600">{ch.length} · {ch.user?.username}</span>
              </button>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && externalResults.length === 0 && !searching && (
          <div className="px-3 py-4 text-xs text-neutral-500">
            {query.trim() ? "No channels found" : "No channels yet"}
          </div>
        )}
      </div>

      {/* MiniMap */}
      {hasNodes && (
        <div className="flex-shrink-0 border-t border-neutral-800 relative overflow-hidden minimap-container" style={{ height: 180 }}>
          <MiniMap
            position="top-left"
            nodeColor={(n) => {
              const color = (n.data as { color?: string }).color;
              return color || (n.type === "channelNode" ? "#22c55e" : "#3b82f6");
            }}
            maskColor="rgba(0,0,0,0.8)"
            className="!bg-neutral-900 !border-0 !absolute !inset-0 !m-0 !rounded-none !rounded-b-lg [&]:!w-full [&]:!h-full [&>svg]:!w-full [&>svg]:!h-full"
            pannable
            zoomable
          />
        </div>
      )}
    </div>
  );
}
