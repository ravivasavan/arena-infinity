"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ArrowSquareOut, GridFour, ArrowsInSimple, Plus, PlugsConnected } from "@phosphor-icons/react";
import type { ChannelNodeData, ArenaBlock } from "@/types";
import { getBlockCount, getChannelStatus, getChannelOwnerSlug, getBlockThumbUrl, getBlockType } from "@/types";
import { useGraphStore } from "@/hooks/useGraphStore";
import { ConnectModal } from "./ConnectModal";

const statusIcons: Record<string, string> = {
  public: "◉",
  closed: "◎",
  private: "●",
};

function BlockPreview({ block }: { block: ArenaBlock }) {
  const imageUrl = getBlockThumbUrl(block);
  const blockType = getBlockType(block);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={block.title || ""}
        className="w-full h-full object-cover"
        draggable={false}
      />
    );
  }

  if (blockType === "Text" && block.content) {
    const text = typeof block.content === "string" ? block.content.replace(/<[^>]*>/g, "") : "";
    return (
      <div className="w-full h-full p-1 overflow-hidden bg-neutral-800">
        <p className="text-[6px] leading-tight text-neutral-400 line-clamp-6">
          {text.slice(0, 100)}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
      <span className="text-[8px] text-neutral-600">{blockType}</span>
    </div>
  );
}

function ChannelNodeComponent({ id, data }: NodeProps) {
  const nodeData = data as unknown as ChannelNodeData;
  const expandChannel = useGraphStore((s) => s.expandChannel);
  const loadMoreBlocks = useGraphStore((s) => s.loadMoreBlocks);
  const collapseNode = useGraphStore((s) => s.collapseNode);
  const [showConnect, setShowConnect] = useState(false);

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nodeData.expanded && !nodeData.loading) {
      expandChannel(nodeData.channel.slug, id);
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const ownerSlug = getChannelOwnerSlug(nodeData.channel);
    const url = ownerSlug
      ? `https://www.are.na/${ownerSlug}/${nodeData.channel.slug}`
      : `https://www.are.na/channel/${nodeData.channel.slug}`;
    window.open(url, "_blank");
  };

  const previews = nodeData.previewBlocks || [];

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-neutral-500" />
      <div
        style={nodeData.color ? { borderColor: nodeData.color } : undefined}
        className={`cursor-grab rounded-lg border overflow-hidden transition-all w-[220px] ${
          nodeData.color
            ? "bg-neutral-900"
            : nodeData.expanded
              ? "border-green-500 bg-green-950/50"
              : "border-neutral-600 bg-neutral-900 hover:border-neutral-400"
        } ${nodeData.loading ? "animate-pulse" : ""}`}
      >
        {/* Header */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">
              {statusIcons[getChannelStatus(nodeData.channel)] || "◉"}
            </span>
            <span className="truncate text-sm font-medium text-white">
              {nodeData.channel.title}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
            <span>{getBlockCount(nodeData.channel)} blocks</span>
            {nodeData.loading && <span className="text-yellow-500">loading…</span>}
          </div>
        </div>

        {/* Block previews grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-5 gap-px bg-neutral-700 border-t border-neutral-700">
            {previews.map((block) => (
              <div key={block.id} className="aspect-square overflow-hidden">
                <BlockPreview block={block} />
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-stretch border-t border-neutral-700">
          {!nodeData.expanded && !nodeData.loading && (
            <button
              onClick={getBlockCount(nodeData.channel) ? handleExpand : undefined}
              title={`${getBlockCount(nodeData.channel)} blocks`}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] border-r border-neutral-700 transition-colors ${
                getBlockCount(nodeData.channel)
                  ? "text-neutral-500 hover:text-white hover:bg-neutral-700 cursor-pointer"
                  : "text-neutral-700 cursor-default opacity-30"
              }`}
            >
              <GridFour size={12} /> <span>{getBlockCount(nodeData.channel)}</span>
            </button>
          )}
          {nodeData.expanded && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); collapseNode(id); }}
                title="Collapse"
                className="flex-1 flex items-center justify-center py-1.5 text-neutral-500 hover:text-white hover:bg-neutral-700 transition-colors border-r border-neutral-700"
              >
                <ArrowsInSimple size={12} />
              </button>
              {(nodeData.loadedCount || 0) < getBlockCount(nodeData.channel) && (
                <button
                  onClick={(e) => { e.stopPropagation(); loadMoreBlocks(nodeData.channel.slug, id); }}
                  title={`Load more (${nodeData.loadedCount || 0}/${getBlockCount(nodeData.channel)})`}
                  className="flex-1 flex items-center justify-center gap-0.5 py-1.5 text-[10px] text-neutral-500 hover:text-white hover:bg-neutral-700 transition-colors border-r border-neutral-700"
                >
                  <Plus size={10} /> <span>{nodeData.loadedCount || 0}/{getBlockCount(nodeData.channel)}</span>
                </button>
              )}
            </>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setShowConnect(true); }}
            title="Connect to channel"
            className="flex-1 flex items-center justify-center py-1.5 text-neutral-500 hover:text-white hover:bg-neutral-700 transition-colors border-r border-neutral-700"
          >
            <PlugsConnected size={12} />
          </button>
          <button
            onClick={handleOpen}
            title="Open on Are.na"
            className="flex-1 flex items-center justify-center py-1.5 text-neutral-500 hover:text-white hover:bg-neutral-700 transition-colors"
          >
            <ArrowSquareOut size={12} />
          </button>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-neutral-500" />
      {showConnect && (
        <ConnectModal
          sourceId={nodeData.channel.id}
          sourceType="Channel"
          sourceTitle={nodeData.channel.title}
          onClose={() => setShowConnect(false)}
        />
      )}
    </>
  );
}

export const ChannelNode = memo(ChannelNodeComponent);
