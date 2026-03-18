"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ArrowSquareOut, GitFork, ArrowsInSimple, Link as LinkIcon, Play, Paperclip, Globe } from "@phosphor-icons/react";
import type { BlockNodeData } from "@/types";
import { useGraphStore } from "@/hooks/useGraphStore";

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function BlockNodeComponent({ id, data }: NodeProps) {
  const nodeData = data as unknown as BlockNodeData;
  const expandBlock = useGraphStore((s) => s.expandBlock);
  const collapseNode = useGraphStore((s) => s.collapseNode);

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nodeData.expanded && !nodeData.loading) {
      expandBlock(nodeData.block.id, id);
    }
  };

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.are.na/block/${nodeData.block.id}`, "_blank");
  };

  const block = nodeData.block;
  const title = block.title || block.class || "Untitled";
  const imageUrl = block.image?.display?.url || block.image?.thumb?.url;
  const sourceUrl = block.source?.url;
  const plainContent = block.content?.replace(/<[^>]*>/g, "").trim();

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-neutral-500" />
      <div
        style={nodeData.color ? { borderColor: `${nodeData.color}80` } : undefined}
        className={`cursor-grab rounded-lg border overflow-hidden transition-all w-[180px] ${
          nodeData.color
            ? "bg-neutral-800"
            : nodeData.expanded
              ? "border-blue-500 bg-blue-950/50"
              : "border-neutral-700 bg-neutral-800 hover:border-neutral-500"
        } ${nodeData.loading ? "animate-pulse" : ""}`}
      >
        {/* Image preview */}
        {block.class === "Image" && imageUrl && (
          <div className="w-full bg-neutral-900">
            <img src={imageUrl} alt={title} className="w-full h-auto block" draggable={false} />
          </div>
        )}

        {/* Text block */}
        {block.class === "Text" && (
          <div className="px-3 pt-3 pb-1">
            {plainContent ? (
              <p className="text-xs text-neutral-300 line-clamp-6 leading-relaxed whitespace-pre-wrap">
                {plainContent.slice(0, 300)}
              </p>
            ) : (
              <p className="text-xs text-neutral-600 italic">Empty text block</p>
            )}
          </div>
        )}

        {/* Link block */}
        {block.class === "Link" && (
          <>
            {imageUrl && (
              <div className="w-full bg-neutral-900">
                <img src={imageUrl} alt={title} className="w-full h-auto block" draggable={false} />
              </div>
            )}
            {sourceUrl && (
              <div className="px-3 py-1.5 flex items-center gap-1.5 bg-neutral-900/50">
                <Globe size={10} className="text-neutral-500 flex-shrink-0" />
                <span className="text-[10px] text-neutral-500 truncate">{extractDomain(sourceUrl)}</span>
              </div>
            )}
            {!imageUrl && !sourceUrl && (
              <div className="w-full py-6 flex items-center justify-center bg-neutral-900">
                <LinkIcon size={24} className="text-neutral-600" />
              </div>
            )}
          </>
        )}

        {/* Media / Video block */}
        {block.class === "Media" && (
          <>
            {imageUrl ? (
              <div className="w-full bg-neutral-900 relative">
                <img src={imageUrl} alt={title} className="w-full h-auto block" draggable={false} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                    <Play size={14} weight="fill" className="text-white ml-0.5" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full py-8 flex flex-col items-center justify-center gap-1 bg-neutral-900">
                <Play size={24} className="text-neutral-500" />
                {sourceUrl && (
                  <span className="text-[10px] text-neutral-600 truncate max-w-[160px]">{extractDomain(sourceUrl)}</span>
                )}
              </div>
            )}
          </>
        )}

        {/* Attachment block */}
        {block.class === "Attachment" && (
          <>
            {imageUrl ? (
              <div className="w-full bg-neutral-900">
                <img src={imageUrl} alt={title} className="w-full h-auto block" draggable={false} />
              </div>
            ) : (
              <div className="w-full py-6 flex items-center justify-center bg-neutral-900">
                <Paperclip size={24} className="text-neutral-600" />
              </div>
            )}
          </>
        )}

        {/* Title bar */}
        <div className="px-3 py-2">
          <span className="truncate text-xs text-neutral-400 block">{title}</span>
          {block.description && block.class !== "Text" && (
            <p className="text-[10px] text-neutral-600 line-clamp-2 mt-0.5 leading-snug">
              {block.description.replace(/<[^>]*>/g, "").slice(0, 100)}
            </p>
          )}
        </div>

        {nodeData.loading && (
          <div className="px-3 pb-2 text-xs text-yellow-500">loading…</div>
        )}

        {/* Toolbar */}
        <div className="flex items-stretch border-t border-neutral-700">
          {!nodeData.expanded && !nodeData.loading && (
            <button
              onClick={handleExpand}
              title="Find connections"
              className="flex-1 flex items-center justify-center py-1.5 text-neutral-500 hover:text-white hover:bg-neutral-700 transition-colors cursor-pointer border-r border-neutral-700"
            >
              <GitFork size={12} />
            </button>
          )}
          {nodeData.expanded && (
            <button
              onClick={(e) => { e.stopPropagation(); collapseNode(id); }}
              title="Collapse"
              className="flex-1 flex items-center justify-center py-1.5 text-neutral-500 hover:text-white hover:bg-neutral-700 transition-colors border-r border-neutral-700"
            >
              <ArrowsInSimple size={12} />
            </button>
          )}
          {sourceUrl && (
            <button
              onClick={(e) => { e.stopPropagation(); window.open(sourceUrl, "_blank"); }}
              title={`Open source: ${extractDomain(sourceUrl)}`}
              className="flex-1 flex items-center justify-center py-1.5 text-neutral-500 hover:text-white hover:bg-neutral-700 transition-colors border-r border-neutral-700"
            >
              <Globe size={12} />
            </button>
          )}
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
    </>
  );
}

export const BlockNode = memo(BlockNodeComponent);
