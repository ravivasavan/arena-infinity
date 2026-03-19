"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, MagnifyingGlass } from "@phosphor-icons/react";
import { toast } from "sonner";
import type { ArenaChannel } from "@/types";
import { getBlockCount, getChannelOwnerName } from "@/types";

interface ConnectModalProps {
  sourceId: number;
  sourceType: "Block" | "Channel";
  sourceTitle: string;
  onClose: () => void;
}

export function ConnectModal({ sourceId, sourceType, sourceTitle, onClose }: ConnectModalProps) {
  const [query, setQuery] = useState("");
  const [userChannels, setUserChannels] = useState<ArenaChannel[]>([]);
  const [searchResults, setSearchResults] = useState<ArenaChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [connecting, setConnecting] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/users/channels");
        if (res.ok) {
          const data = await res.json();
          setUserChannels(data.channels || []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

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
  }, [query]);

  const handleConnect = useCallback(async (channel: ArenaChannel) => {
    setConnecting(channel.id);
    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelSlug: channel.slug,
          sourceId,
          sourceType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 403) {
          throw new Error("You don't have permission to add to this channel");
        }
        if (res.status === 429) {
          throw new Error("Rate limited — try again in a minute");
        }
        throw new Error(data.error || "Failed to connect");
      }

      toast.success(`Connected to ${channel.title}`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setConnecting(null);
    }
  }, [sourceId, sourceType, onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const filteredUserChannels = q
    ? userChannels.filter((ch) => ch.title.toLowerCase().includes(q))
    : userChannels;
  const externalResults = searchResults.filter(
    (sr) => !userChannels.find((ch) => ch.id === sr.id)
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-[400px] max-h-[520px] rounded-lg border border-neutral-700 bg-neutral-900 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
          <span className="flex-1 text-sm text-white truncate">{sourceTitle}</span>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 rounded border border-neutral-600 bg-neutral-800 px-3 py-2 focus-within:border-blue-500 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search…"
              className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 outline-none"
            />
            <MagnifyingGlass size={14} className="text-neutral-500 flex-shrink-0" />
          </div>
        </div>

        {/* Channel list */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {loading && (
            <div className="px-4 py-6 text-xs text-neutral-500 text-center">Loading channels…</div>
          )}

          {!loading && filteredUserChannels.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs text-neutral-500 font-medium text-center border-b border-neutral-800">
                Recent channels
              </div>
              {filteredUserChannels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleConnect(ch)}
                  disabled={connecting === ch.id}
                  className="flex items-center w-full px-4 py-2.5 text-left hover:bg-neutral-800 transition-colors group disabled:opacity-50"
                >
                  <span className="flex-1 text-sm text-neutral-200 group-hover:text-white truncate">
                    {ch.title}
                  </span>
                  <span className="ml-2 text-xs text-neutral-600 flex-shrink-0">
                    {getBlockCount(ch)}
                  </span>
                  <span className="ml-3 text-xs text-neutral-600 flex-shrink-0">
                    {getChannelOwnerName(ch)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {q && searching && (
            <div className="px-4 py-4 text-xs text-neutral-500 text-center">Searching…</div>
          )}

          {q && externalResults.length > 0 && (
            <div className="border-t border-neutral-800">
              <div className="px-4 py-2 text-xs text-neutral-500 font-medium text-center border-b border-neutral-800">
                Are.na results
              </div>
              {externalResults.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => handleConnect(ch)}
                  disabled={connecting === ch.id}
                  className="flex items-center w-full px-4 py-2.5 text-left hover:bg-neutral-800 transition-colors group disabled:opacity-50"
                >
                  <span className="flex-1 text-sm text-neutral-200 group-hover:text-white truncate">
                    {ch.title}
                  </span>
                  <span className="ml-2 text-xs text-neutral-600 flex-shrink-0">
                    {getBlockCount(ch)}
                  </span>
                  <span className="ml-3 text-xs text-neutral-600 flex-shrink-0">
                    {getChannelOwnerName(ch)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!loading && filteredUserChannels.length === 0 && externalResults.length === 0 && !searching && (
            <div className="px-4 py-6 text-xs text-neutral-500 text-center">
              {q ? "No channels found" : "No channels yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
