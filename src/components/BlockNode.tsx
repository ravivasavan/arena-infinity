"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { BlockNodeData } from "@/types";
import { useGraphStore } from "@/hooks/useGraphStore";

const typeIcons: Record<string, string> = {
  Image: "🖼",
  Text: "¶",
  Link: "🔗",
  Media: "▶",
  Attachment: "📎",
};

function BlockNodeComponent({ id, data }: NodeProps) {
  const nodeData = data as unknown as BlockNodeData;
  const expandBlock = useGraphStore((s) => s.expandBlock);

  const handleClick = () => {
    if (!nodeData.expanded && !nodeData.loading) {
      expandBlock(nodeData.block.id, id);
    }
  };

  const title = nodeData.block.title || nodeData.block.class || "Untitled";
  const icon = typeIcons[nodeData.block.class] || "·";

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-neutral-500" />
      <div
        onClick={handleClick}
        className={`cursor-pointer rounded-lg border px-4 py-3 transition-all min-w-[140px] max-w-[200px] ${
          nodeData.expanded
            ? "border-blue-500 bg-blue-950/50"
            : "border-neutral-700 bg-neutral-800 hover:border-neutral-500"
        } ${nodeData.loading ? "animate-pulse" : ""}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="truncate text-sm text-neutral-200">{title}</span>
        </div>
        {nodeData.loading && (
          <div className="mt-1 text-xs text-yellow-500">loading…</div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-neutral-500" />
    </>
  );
}

export const BlockNode = memo(BlockNodeComponent);
