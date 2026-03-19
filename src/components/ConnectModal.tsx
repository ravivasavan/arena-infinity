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

  const userChannelIds = new Set(userChannels.map((ch) => ch.id));
  const externalResults = searchResults.filter((sr) => !userChannelIds.has(sr.id));

  // When searching, always show matching own channels first, then external
  const showOwnSection = !q || filteredUserChannels.length > 0;
  const showExternalSection = q && (externalResults.length > 0 || searching);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-[460px] max-h-[560px] rounded-xl border border-neutral-700 bg-neutral-900 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4">
          <span className="flex-1 text-base text-white font-medium truncate">{sourceTitle}</span>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors p-1"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2.5 focus-within:border-blue-500 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search…"
              className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 outline-none"
            />
            <MagnifyingGlass size={16} className="text-neutral-500 flex-shrink-0" />
          </div>
        </div>

        {/* Channel list */}
        <div className="overflow-y-auto flex-1 min-h-0 pb-2">
          {loading && (
            <div className="px-5 py-8 text-sm text-neutral-500 text-center">Loading channels…</div>
          )}

          {!loading && showOwnSection && (
            <div>
              <div className="px-5 py-2.5 text-xs text-neutral-500 font-medium text-center border-y border-neutral-800">
                {q ? "Your channels" : "Recent channels"}
              </div>
              {filteredUserChannels.length > 0 ? (
                filteredUserChannels.map((ch) => (
                  <ChannelRow
                    key={ch.id}
                    channel={ch}
                    connecting={connecting === ch.id}
                    onConnect={handleConnect}
                  />
                ))
              ) : (
                q && <div className="px-5 py-3 text-xs text-neutral-600 text-center">No matching channels</div>
              )}
            </div>
          )}

          {showExternalSection && (
            <div>
              <div className="px-5 py-2.5 text-xs text-neutral-500 font-medium text-center border-y border-neutral-800">
                Are.na {searching && "…"}
              </div>
              {externalResults.map((ch) => (
                <ChannelRow
                  key={ch.id}
                  channel={ch}
                  connecting={connecting === ch.id}
                  onConnect={handleConnect}
                />
              ))}
              {!searching && externalResults.length === 0 && (
                <div className="px-5 py-3 text-xs text-neutral-600 text-center">No results</div>
              )}
            </div>
          )}

          {!loading && !q && filteredUserChannels.length === 0 && (
            <div className="px-5 py-8 text-sm text-neutral-500 text-center">No channels yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChannelRow({
  channel,
  connecting,
  onConnect,
}: {
  channel: ArenaChannel;
  connecting: boolean;
  onConnect: (ch: ArenaChannel) => void;
}) {
  return (
    <button
      onClick={() => onConnect(channel)}
      disabled={connecting}
      className="flex items-center w-full px-5 py-3 text-left hover:bg-neutral-800 transition-colors group disabled:opacity-50"
    >
      <span className="flex-1 text-sm text-neutral-200 group-hover:text-white min-w-0 truncate">
        {channel.title}
      </span>
      <span className="ml-3 text-xs text-neutral-600 tabular-nums flex-shrink-0">
        {getBlockCount(channel)}
      </span>
      <span className="ml-4 text-xs text-neutral-600 flex-shrink-0">
        {getChannelOwnerName(channel)}
      </span>
    </button>
  );
}
