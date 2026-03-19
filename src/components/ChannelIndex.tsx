"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MiniMap, useReactFlow } from "@xyflow/react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { ArenaChannel } from "@/types";
import { getBlockCount, getChannelOwnerName, getChannelStatus } from "@/types";
import { useGraphStore } from "@/hooks/useGraphStore";

const statusColor: Record<string, string> = {
  public: "bg-green-500",
  closed: "bg-neutral-500",
  private: "bg-red-500",
};

export function ChannelIndex() {
  const [channels, setChannels] = useState<ArenaChannel[]>([]);
  const [filtered, setFiltered] = useState<ArenaChannel[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<ArenaChannel[]>([]);
  const [searching, setSearching] = useState(false);
  const [channelFilter, setChannelFilter] = useState<"all" | "mine">("all");
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

  const externalResults = channelFilter === "mine"
    ? []
    : searchResults.filter((sr) => !channels.find((ch) => ch.id === sr.id));

  return (
    <div className="absolute top-4 left-4 bottom-4 z-50 w-64 rounded-lg border border-neutral-700 bg-neutral-900/95 backdrop-blur-sm shadow-xl flex flex-col overflow-hidden">
      {/* Search */}
      <div className="flex flex-col px-3 pt-2 pb-2 gap-1.5 border-b border-neutral-800 flex-shrink-0">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-neutral-500"
        />
        <select
          value={channelFilter}
          onChange={(e) => setChannelFilter(e.target.value as "all" | "mine")}
          className="w-full bg-neutral-800 border border-neutral-700 text-neutral-400 text-xs rounded pl-3 pr-8 py-2 outline-none cursor-pointer hover:border-neutral-500 transition-colors appearance-auto"
        >
          <option value="all">All channels</option>
          <option value="mine">My channels</option>
        </select>
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
                className="flex items-center w-full px-3 py-1.5 text-left hover:bg-neutral-800 transition-colors group"
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColor[getChannelStatus(ch)] || "bg-neutral-500"}`} />
                <span className="text-xs text-neutral-200 group-hover:text-white truncate ml-2">{ch.title}</span>
                <span className="ml-2 text-[10px] text-neutral-600 flex-shrink-0">{getBlockCount(ch)}</span>
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
                className="flex items-center w-full px-3 py-1.5 text-left hover:bg-neutral-800 transition-colors group"
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusColor[getChannelStatus(ch)] || "bg-neutral-500"}`} />
                <span className="text-xs text-neutral-200 group-hover:text-white truncate ml-2">{ch.title}</span>
                <span className="ml-2 text-[10px] text-neutral-600 flex-shrink-0">{getBlockCount(ch)} · {getChannelOwnerName(ch)}</span>
              </button>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && externalResults.length === 0 && !searching && (
          <div className="px-3 py-4 text-xs text-neutral-500">
            {query.trim() ? (
              <>
                <span className="block">No channels found</span>
                <span className="block mt-1 text-neutral-600">Are.na search requires a Premium or Supporter plan</span>
              </>
            ) : "No channels yet"}
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

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-neutral-800 px-3 py-2.5 flex items-center justify-between">
        <span className="text-[10px] text-neutral-600">by Ravi Vasavan</span>
        <a
          href="/changelog"
          target="_blank"
          className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          Changelog
        </a>
      </div>
    </div>
  );
}
