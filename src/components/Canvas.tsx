"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ChannelNode } from "./ChannelNode";
import { BlockNode } from "./BlockNode";
import { SearchBar } from "./SearchBar";
import { useGraphStore } from "@/hooks/useGraphStore";
import type { ArenaChannel } from "@/types";

const nodeTypes: NodeTypes = {
  channelNode: ChannelNode,
  blockNode: BlockNode,
};

export function Canvas() {
  const storeNodes = useGraphStore((s) => s.nodes);
  const storeEdges = useGraphStore((s) => s.edges);
  const addChannelNodes = useGraphStore((s) => s.addChannelNodes);

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  // Sync store → local state
  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  // Load user's channels on mount
  useEffect(() => {
    async function loadInitialChannels() {
      try {
        const res = await fetch("/api/users/channels");
        if (res.ok) {
          const data = await res.json();
          const channels: ArenaChannel[] = data.channels || [];
          addChannelNodes(channels);
        }
      } catch {
        // silently fail — user can use search
      }
    }
    loadInitialChannels();
  }, [addChannelNodes]);

  const defaultEdgeOptions = useMemo(
    () => ({
      animated: true,
      style: { stroke: "#525252" },
    }),
    []
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, _node: { id: string; position: { x: number; y: number } }) => {
      // Node positions are updated by React Flow's internal state via onNodesChange
    },
    []
  );

  return (
    <div className="h-screen w-screen bg-black">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        minZoom={0.05}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={32} />
        <Controls className="!bg-neutral-800 !border-neutral-700 [&>button]:!bg-neutral-800 [&>button]:!border-neutral-700 [&>button]:!text-white [&>button:hover]:!bg-neutral-700" />
        <MiniMap
          nodeColor={(n) =>
            n.type === "channelNode" ? "#22c55e" : "#3b82f6"
          }
          maskColor="rgba(0,0,0,0.8)"
          className="!bg-neutral-900 !border-neutral-700"
        />
        <SearchBar />
      </ReactFlow>
    </div>
  );
}
