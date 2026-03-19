"use client";

import { useReactFlow } from "@xyflow/react";
import {
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  CornersOut,
  ArrowsInSimple,
  TreeStructure,
  Trash,
} from "@phosphor-icons/react";
import { useGraphStore } from "@/hooks/useGraphStore";

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const storeNodes = useGraphStore((s) => s.nodes);
  const expandedNodes = useGraphStore((s) => s.expandedNodes);
  const collapseNode = useGraphStore((s) => s.collapseNode);
  const relayout = useGraphStore((s) => s.relayout);
  const resetGraph = useGraphStore((s) => s.resetGraph);
  const hasNodes = storeNodes.length > 0;

  const btnBase = "flex items-center justify-center p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors";
  const divider = "w-px h-5 bg-neutral-700 flex-shrink-0";

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center rounded-lg border border-neutral-700 bg-neutral-900/95 backdrop-blur-sm shadow-xl overflow-hidden">
      {/* Zoom controls */}
      <button onClick={() => zoomIn()} title="Zoom in" className={btnBase}>
        <MagnifyingGlassPlus size={16} />
      </button>
      <button onClick={() => zoomOut()} title="Zoom out" className={btnBase}>
        <MagnifyingGlassMinus size={16} />
      </button>
      <button onClick={() => fitView({ padding: 0.2 })} title="Fit view" className={btnBase}>
        <CornersOut size={16} />
      </button>

      {/* Graph actions — only when nodes exist */}
      {hasNodes && (
        <>
          <div className={divider} />
          <button
            onClick={() => { relayout(); setTimeout(() => fitView({ padding: 0.2 }), 50); }}
            title="Rearrange"
            className={btnBase}
          >
            <TreeStructure size={16} />
          </button>
          <button
            onClick={() => { for (const id of expandedNodes) collapseNode(id); }}
            title="Collapse all"
            className={btnBase}
          >
            <ArrowsInSimple size={16} />
          </button>
          <div className={divider} />
          <button
            onClick={resetGraph}
            title="Clear canvas"
            className="flex items-center justify-center p-2 text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
          >
            <Trash size={16} />
          </button>
        </>
      )}
    </div>
  );
}
