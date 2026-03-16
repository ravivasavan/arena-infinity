"use client";

import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";
import type { ArenaChannel, ArenaBlock, ChannelNodeData, BlockNodeData } from "@/types";
import { calculateLayout } from "@/lib/layout";

interface GraphState {
  nodes: Node[];
  edges: Edge[];
  expandedNodes: Set<string>;
  loadingNodes: Set<string>;

  addChannelNodes: (channels: ArenaChannel[], parentId?: string) => void;
  expandChannel: (channelSlug: string, nodeId: string) => Promise<void>;
  expandBlock: (blockId: number, nodeId: string) => Promise<void>;
  addSearchChannel: (channel: ArenaChannel, viewportCenter: { x: number; y: number }) => void;
  resetGraph: () => void;
}

function channelNodeId(channel: ArenaChannel) {
  return `channel-${channel.id}`;
}

function blockNodeId(block: ArenaBlock) {
  return `block-${block.id}`;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  expandedNodes: new Set(),
  loadingNodes: new Set(),

  addChannelNodes: (channels, parentId) => {
    const state = get();
    const existingIds = new Set(state.nodes.map((n) => n.id));
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    for (const channel of channels) {
      const id = channelNodeId(channel);
      if (existingIds.has(id)) continue;

      const data: ChannelNodeData = {
        type: "channel",
        channel,
        expanded: false,
        loading: false,
      };

      newNodes.push({
        id,
        type: "channelNode",
        position: { x: 0, y: 0 },
        data,
      });

      if (parentId) {
        newEdges.push({
          id: `${parentId}->${id}`,
          source: parentId,
          target: id,
          type: "default",
        });
      }
    }

    if (newNodes.length === 0) return;

    const allNodes = [...state.nodes, ...newNodes];
    const allEdges = [...state.edges, ...newEdges];
    const positioned = calculateLayout(allNodes, allEdges, state.nodes.length);

    set({ nodes: positioned, edges: allEdges });
  },

  expandChannel: async (channelSlug, nodeId) => {
    const state = get();
    if (state.expandedNodes.has(nodeId) || state.loadingNodes.has(nodeId)) return;

    set((s) => ({
      loadingNodes: new Set(s.loadingNodes).add(nodeId),
      nodes: s.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, loading: true } } : n
      ),
    }));

    try {
      const res = await fetch(`/api/channels/${channelSlug}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const { contents } = (await res.json()) as { contents: ArenaBlock[] };

      const currentState = get();
      const existingIds = new Set(currentState.nodes.map((n) => n.id));
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      for (const block of contents) {
        const id = blockNodeId(block);
        if (existingIds.has(id)) {
          // Still add edge if missing
          const edgeId = `${nodeId}->${id}`;
          if (!currentState.edges.find((e) => e.id === edgeId)) {
            newEdges.push({ id: edgeId, source: nodeId, target: id });
          }
          continue;
        }

        const data: BlockNodeData = {
          type: "block",
          block,
          expanded: false,
          loading: false,
        };

        newNodes.push({
          id,
          type: "blockNode",
          position: { x: 0, y: 0 },
          data,
        });

        newEdges.push({
          id: `${nodeId}->${id}`,
          source: nodeId,
          target: id,
        });
      }

      const allNodes = [...currentState.nodes, ...newNodes].map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, expanded: true, loading: false } } : n
      );
      const allEdges = [...currentState.edges, ...newEdges];
      const positioned = calculateLayout(allNodes, allEdges, currentState.nodes.length);

      const expanded = new Set(currentState.expandedNodes).add(nodeId);
      const loading = new Set(currentState.loadingNodes);
      loading.delete(nodeId);

      set({ nodes: positioned, edges: allEdges, expandedNodes: expanded, loadingNodes: loading });
    } catch {
      set((s) => {
        const loading = new Set(s.loadingNodes);
        loading.delete(nodeId);
        return {
          loadingNodes: loading,
          nodes: s.nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, loading: false } } : n
          ),
        };
      });
    }
  },

  expandBlock: async (blockId, nodeId) => {
    const state = get();
    if (state.expandedNodes.has(nodeId) || state.loadingNodes.has(nodeId)) return;

    set((s) => ({
      loadingNodes: new Set(s.loadingNodes).add(nodeId),
      nodes: s.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, loading: true } } : n
      ),
    }));

    try {
      const res = await fetch(`/api/blocks/${blockId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const { connections } = (await res.json()) as { connections: ArenaChannel[] };

      const currentState = get();
      const existingIds = new Set(currentState.nodes.map((n) => n.id));
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      for (const channel of connections) {
        const id = channelNodeId(channel);
        if (existingIds.has(id)) {
          const edgeId = `${nodeId}->${id}`;
          if (!currentState.edges.find((e) => e.id === edgeId)) {
            newEdges.push({ id: edgeId, source: nodeId, target: id });
          }
          continue;
        }

        const data: ChannelNodeData = {
          type: "channel",
          channel,
          expanded: false,
          loading: false,
        };

        newNodes.push({
          id,
          type: "channelNode",
          position: { x: 0, y: 0 },
          data,
        });

        newEdges.push({
          id: `${nodeId}->${id}`,
          source: nodeId,
          target: id,
        });
      }

      const allNodes = [...currentState.nodes, ...newNodes].map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, expanded: true, loading: false } } : n
      );
      const allEdges = [...currentState.edges, ...newEdges];
      const positioned = calculateLayout(allNodes, allEdges, currentState.nodes.length);

      const expanded = new Set(currentState.expandedNodes).add(nodeId);
      const loading = new Set(currentState.loadingNodes);
      loading.delete(nodeId);

      set({ nodes: positioned, edges: allEdges, expandedNodes: expanded, loadingNodes: loading });
    } catch {
      set((s) => {
        const loading = new Set(s.loadingNodes);
        loading.delete(nodeId);
        return {
          loadingNodes: loading,
          nodes: s.nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, loading: false } } : n
          ),
        };
      });
    }
  },

  addSearchChannel: (channel, viewportCenter) => {
    const state = get();
    const id = channelNodeId(channel);
    if (state.nodes.find((n) => n.id === id)) return;

    const data: ChannelNodeData = {
      type: "channel",
      channel,
      expanded: false,
      loading: false,
    };

    const newNode: Node = {
      id,
      type: "channelNode",
      position: viewportCenter,
      data,
    };

    set({ nodes: [...state.nodes, newNode] });
  },

  resetGraph: () => {
    set({ nodes: [], edges: [], expandedNodes: new Set(), loadingNodes: new Set() });
  },
}));
