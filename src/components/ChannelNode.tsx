"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { ChannelNodeData } from "@/types";
import { useGraphStore } from "@/hooks/useGraphStore";

const statusIcons: Record<string, string> = {
  public: "◉",
  closed: "◎",
  private: "●",
};

function ChannelNodeComponent({ id, data }: NodeProps) {
  const nodeData = data as unknown as ChannelNodeData;
  const expandChannel = useGraphStore((s) => s.expandChannel);

  const handleClick = () => {
    if (!nodeData.expanded && !nodeData.loading) {
      expandChannel(nodeData.channel.slug, id);
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-neutral-500" />
      <div
        onClick={handleClick}
        className={`cursor-pointer rounded-lg border px-4 py-3 transition-all min-w-[160px] max-w-[220px] ${
          nodeData.expanded
            ? "border-green-500 bg-green-950/50"
            : "border-neutral-600 bg-neutral-900 hover:border-neutral-400"
        } ${nodeData.loading ? "animate-pulse" : ""}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">
            {statusIcons[nodeData.channel.status] || "◉"}
          </span>
          <span className="truncate text-sm font-medium text-white">
            {nodeData.channel.title}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
          <span>{nodeData.channel.length} blocks</span>
          {nodeData.loading && <span className="text-yellow-500">loading…</span>}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-neutral-500" />
    </>
  );
}

export const ChannelNode = memo(ChannelNodeComponent);
