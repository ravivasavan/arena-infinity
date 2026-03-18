"use client";

import { memo, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { useGraphStore } from "@/hooks/useGraphStore";
import type { ChannelNodeData, BlockNodeData } from "@/types";
import { getBlockType } from "@/types";

function LabeledEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  source,
  target,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false);
  const nodes = useGraphStore((s) => s.nodes);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Build label from source/target node data
  let label = "";
  if (hovered) {
    const sourceNode = nodes.find((n) => n.id === source);
    const targetNode = nodes.find((n) => n.id === target);

    if (sourceNode?.data && targetNode?.data) {
      const srcData = sourceNode.data as ChannelNodeData | BlockNodeData;
      const tgtData = targetNode.data as ChannelNodeData | BlockNodeData;

      if (srcData.type === "channel" && tgtData.type === "block") {
        label = (srcData as ChannelNodeData).channel.title;
      } else if (srcData.type === "block" && tgtData.type === "channel") {
        const blockType = getBlockType((srcData as BlockNodeData).block);
        label = `${blockType} → ${(tgtData as ChannelNodeData).channel.title}`;
      }
    }
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: hovered ? 2 : 1,
          transition: "stroke-width 0.15s ease",
        }}
      />
      {/* Invisible wider path for easier hover */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {hovered && label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "none",
            }}
            className="rounded bg-neutral-800/95 border border-neutral-700 px-2 py-1 text-[10px] text-neutral-300 whitespace-nowrap shadow-lg backdrop-blur-sm"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const LabeledEdge = memo(LabeledEdgeComponent);
