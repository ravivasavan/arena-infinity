"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ChannelNode } from "./ChannelNode";
import { BlockNode } from "./BlockNode";
import { ChannelIndex } from "./ChannelIndex";
import { CanvasControls } from "./CanvasControls";
import { useGraphStore } from "@/hooks/useGraphStore";

const nodeTypes: NodeTypes = {
  channelNode: ChannelNode,
  blockNode: BlockNode,
};

export function Canvas() {
  const storeNodes = useGraphStore((s) => s.nodes);
  const storeEdges = useGraphStore((s) => s.edges);
  const activeNodeId = useGraphStore((s) => s.activeNodeId);
  const { setCenter, getZoom } = useReactFlow();
  const prevActiveRef = useRef<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  useEffect(() => {
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  useEffect(() => {
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  // Center on active node after layout changes
  useEffect(() => {
    if (!activeNodeId || activeNodeId === prevActiveRef.current) return;
    prevActiveRef.current = activeNodeId;

    // Small delay to let layout settle
    const timer = setTimeout(() => {
      const node = storeNodes.find((n) => n.id === activeNodeId);
      if (node) {
        const zoom = Math.max(getZoom(), 0.5);
        setCenter(node.position.x + 100, node.position.y + 50, { zoom, duration: 300 });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [activeNodeId, storeNodes, setCenter, getZoom]);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (event.metaKey && node.type === "channelNode") {
        const connectedIds = new Set<string>();
        connectedIds.add(node.id);
        for (const edge of storeEdges) {
          if (edge.source === node.id) connectedIds.add(edge.target);
          if (edge.target === node.id) connectedIds.add(edge.source);
        }
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            selected: connectedIds.has(n.id) || n.selected,
          }))
        );
      }
    },
    [storeEdges, setNodes]
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      animated: false,
      style: { stroke: "#525252" },
    }),
    []
  );

  return (
    <div className="h-screen w-screen bg-black">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        minZoom={0.05}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={32} />
        <CanvasControls />
        <ChannelIndex />
      </ReactFlow>
    </div>
  );
}
