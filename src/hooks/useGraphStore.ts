"use client";

import { create } from "zustand";
import { toast } from "sonner";
import type { Node, Edge } from "@xyflow/react";
import type { ArenaChannel, ArenaBlock, ChannelNodeData, BlockNodeData } from "@/types";
import { calculateLayout, applyLayout, type LayoutMode } from "@/lib/layout";

const CHANNEL_COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#14b8a6", // teal
  "#a855f7", // purple
];

let colorIndex = 0;
const channelColorMap = new Map<string, string>();

function coloredEdge(id: string, source: string, target: string, edgeType?: string): Edge {
  const color = channelColorMap.get(source) || channelColorMap.get(target);
  return {
    id,
    source,
    target,
    type: edgeType || "labeled",
    ...(color ? { style: { stroke: `${color}60` } } : {}),
  };
}

function getChannelColor(channelNodeId: string): string {
  if (!channelColorMap.has(channelNodeId)) {
    channelColorMap.set(channelNodeId, CHANNEL_COLORS[colorIndex % CHANNEL_COLORS.length]);
    colorIndex++;
  }
  return channelColorMap.get(channelNodeId)!;
}

interface GraphState {
  nodes: Node[];
  edges: Edge[];
  expandedNodes: Set<string>;
  loadingNodes: Set<string>;
  activeNodeId: string | null;
  layoutMode: LayoutMode;

  setLayoutMode: (mode: LayoutMode) => void;
  addChannelNodes: (channels: ArenaChannel[], parentId?: string) => void;
  expandChannel: (channelSlug: string, nodeId: string) => Promise<void>;
  expandBlock: (blockId: number, nodeId: string) => Promise<void>;
  addSearchChannel: (channel: ArenaChannel, viewportCenter: { x: number; y: number }) => Promise<void>;
  loadMoreBlocks: (channelSlug: string, nodeId: string) => Promise<void>;
  collapseNode: (nodeId: string) => void;
  removeNodes: (nodeIds: string[]) => void;
  relayout: () => void;
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
  activeNodeId: null,
  layoutMode: "force" as LayoutMode,

  setLayoutMode: (mode) => {
    const state = get();
    const positioned = applyLayout(state.nodes, state.edges, mode, 0);
    set({ nodes: positioned, layoutMode: mode });
  },

  addChannelNodes: (channels, parentId) => {
    const state = get();
    const existingIds = new Set(state.nodes.map((n) => n.id));
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    for (const channel of channels) {
      const id = channelNodeId(channel);
      if (existingIds.has(id)) continue;

      const color = getChannelColor(id);
      const data: ChannelNodeData = {
        type: "channel",
        channel,
        expanded: false,
        loading: false,
        color,
      };

      newNodes.push({
        id,
        type: "channelNode",
        position: { x: 0, y: 0 },
        data,
      });

      if (parentId) {
        newEdges.push(coloredEdge(`${parentId}->${id}`, parentId, id, "default"));
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
      const res = await fetch(`/api/channels/${channelSlug}?per=50`);
      if (!res.ok) {
        if (res.status === 429) throw new Error("Rate limited by Are.na — try again in a minute");
        throw new Error(`Failed to load channel (${res.status})`);
      }
      const { contents, total_pages } = (await res.json()) as { contents: ArenaBlock[]; total_pages: number };
      const totalBlocks = total_pages * 50; // approximate

      const currentState = get();
      const existingIds = new Set(currentState.nodes.map((n) => n.id));
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      for (const block of contents) {
        const id = blockNodeId(block);
        if (existingIds.has(id)) {
          const edgeId = `${nodeId}->${id}`;
          if (!currentState.edges.find((e) => e.id === edgeId)) {
            newEdges.push(coloredEdge(edgeId, nodeId, id));
          }
          continue;
        }

        const channelColor = getChannelColor(nodeId);
        const data: BlockNodeData = {
          type: "block",
          block,
          expanded: false,
          loading: false,
          color: channelColor,
        };

        newNodes.push({
          id,
          type: "blockNode",
          position: { x: 0, y: 0 },
          data,
        });

        newEdges.push(coloredEdge(`${nodeId}->${id}`, nodeId, id));
      }

      const previewBlocks = contents.slice(0, 5);
      const loadedCount = contents.length;
      const channelNode = currentState.nodes.find((n) => n.id === nodeId);
      const channelTotal = (channelNode?.data as ChannelNodeData)?.channel?.length ?? totalBlocks;
      const allNodes = [...currentState.nodes, ...newNodes].map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, expanded: true, loading: false, previewBlocks, loadedCount, totalBlocks: channelTotal } } : n
      );
      const allEdges = [...currentState.edges, ...newEdges];
      const positioned = calculateLayout(allNodes, allEdges, currentState.nodes.length);

      const expanded = new Set(currentState.expandedNodes).add(nodeId);
      const loading = new Set(currentState.loadingNodes);
      loading.delete(nodeId);

      set({ nodes: positioned, edges: allEdges, expandedNodes: expanded, loadingNodes: loading, activeNodeId: nodeId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to expand channel");
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
      if (!res.ok) {
        if (res.status === 429) throw new Error("Rate limited by Are.na — try again in a minute");
        throw new Error(`Failed to load block (${res.status})`);
      }
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
            newEdges.push(coloredEdge(edgeId, nodeId, id));
          }
          continue;
        }

        const color = getChannelColor(id);
        const data: ChannelNodeData = {
          type: "channel",
          channel,
          expanded: false,
          loading: false,
          color,
        };

        newNodes.push({
          id,
          type: "channelNode",
          position: { x: 0, y: 0 },
          data,
        });

        newEdges.push(coloredEdge(`${nodeId}->${id}`, nodeId, id));
      }

      const allNodes = [...currentState.nodes, ...newNodes].map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, expanded: true, loading: false } } : n
      );
      const allEdges = [...currentState.edges, ...newEdges];
      const positioned = calculateLayout(allNodes, allEdges, currentState.nodes.length);

      const expanded = new Set(currentState.expandedNodes).add(nodeId);
      const loading = new Set(currentState.loadingNodes);
      loading.delete(nodeId);

      set({ nodes: positioned, edges: allEdges, expandedNodes: expanded, loadingNodes: loading, activeNodeId: nodeId });

      // Fetch previews for new channel nodes in background
      for (const node of newNodes) {
        const ch = (node.data as ChannelNodeData).channel;
        fetch(`/api/channels/${ch.slug}?per=5`)
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (!data?.contents) return;
            set((s) => ({
              nodes: s.nodes.map((n) =>
                n.id === node.id ? { ...n, data: { ...n.data, previewBlocks: data.contents.slice(0, 5) } } : n
              ),
            }));
          })
          .catch(() => {});
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to find connections");
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

  addSearchChannel: async (channel, viewportCenter) => {
    const state = get();
    const id = channelNodeId(channel);
    if (state.nodes.find((n) => n.id === id)) return;

    const color = getChannelColor(id);
    const data: ChannelNodeData = {
      type: "channel",
      channel,
      expanded: false,
      color,
      loading: false,
    };

    const newNode: Node = {
      id,
      type: "channelNode",
      position: viewportCenter,
      data,
    };

    set({ nodes: [...state.nodes, newNode], activeNodeId: id });

    // Fetch first 5 blocks for preview
    try {
      const res = await fetch(`/api/channels/${channel.slug}`);
      if (res.ok) {
        const { contents } = (await res.json()) as { contents: ArenaBlock[] };
        const previewBlocks = contents.slice(0, 5);
        set((s) => ({
          nodes: s.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, previewBlocks } } : n
          ),
        }));
      }
    } catch {
      // previews are optional, fail silently
    }
  },

  loadMoreBlocks: async (channelSlug, nodeId) => {
    const state = get();
    if (state.loadingNodes.has(nodeId)) return;
    const nodeData = state.nodes.find((n) => n.id === nodeId)?.data as ChannelNodeData | undefined;
    if (!nodeData) return;

    const currentLoaded = nodeData.loadedCount || 0;
    const nextPage = Math.floor(currentLoaded / 50) + 1;

    set((s) => ({
      loadingNodes: new Set(s.loadingNodes).add(nodeId),
      nodes: s.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, loading: true } } : n
      ),
    }));

    try {
      const res = await fetch(`/api/channels/${channelSlug}?page=${nextPage + 1}&per=50`);
      if (!res.ok) {
        if (res.status === 429) throw new Error("Rate limited by Are.na — try again in a minute");
        throw new Error(`Failed to load more (${res.status})`);
      }
      const { contents } = (await res.json()) as { contents: ArenaBlock[] };

      const currentState = get();
      const existingIds = new Set(currentState.nodes.map((n) => n.id));
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      const channelColor = getChannelColor(nodeId);

      for (const block of contents) {
        const id = blockNodeId(block);
        if (existingIds.has(id)) {
          const edgeId = `${nodeId}->${id}`;
          if (!currentState.edges.find((e) => e.id === edgeId)) {
            newEdges.push(coloredEdge(edgeId, nodeId, id));
          }
          continue;
        }
        const data: BlockNodeData = {
          type: "block",
          block,
          expanded: false,
          loading: false,
          color: channelColor,
        };
        newNodes.push({ id, type: "blockNode", position: { x: 0, y: 0 }, data });
        newEdges.push(coloredEdge(`${nodeId}->${id}`, nodeId, id));
      }

      const newLoadedCount = currentLoaded + contents.length;
      const allNodes = [...currentState.nodes, ...newNodes].map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, loading: false, loadedCount: newLoadedCount } } : n
      );
      const allEdges = [...currentState.edges, ...newEdges];
      const positioned = calculateLayout(allNodes, allEdges, currentState.nodes.length);

      const loading = new Set(currentState.loadingNodes);
      loading.delete(nodeId);

      set({ nodes: positioned, edges: allEdges, loadingNodes: loading, activeNodeId: nodeId });
      if (contents.length > 0) toast.success(`Loaded ${contents.length} more blocks`);
      else toast.info("No more blocks to load");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load more blocks");
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

  collapseNode: (nodeId) => {
    const state = get();
    // Find all edges from this node
    const childEdges = state.edges.filter((e) => e.source === nodeId);
    const childIds = new Set(childEdges.map((e) => e.target));

    // Don't remove children that have other parents
    for (const edge of state.edges) {
      if (edge.source !== nodeId && childIds.has(edge.target)) {
        childIds.delete(edge.target);
      }
    }

    // Remove child nodes and their edges
    const removedIds = new Set(childIds);
    const nodes = state.nodes
      .filter((n) => !removedIds.has(n.id))
      .map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, expanded: false, loading: false } } : n
      );
    const edges = state.edges.filter(
      (e) => !removedIds.has(e.target) && !removedIds.has(e.source) && e.source !== nodeId
    );

    const expanded = new Set(state.expandedNodes);
    expanded.delete(nodeId);
    // Also remove collapsed children from expanded set
    for (const id of removedIds) expanded.delete(id);

    set({ nodes, edges, expandedNodes: expanded });
  },

  removeNodes: (nodeIds) => {
    const removedSet = new Set(nodeIds);
    const state = get();
    const nodes = state.nodes.filter((n) => !removedSet.has(n.id));
    const edges = state.edges.filter(
      (e) => !removedSet.has(e.source as string) && !removedSet.has(e.target as string)
    );
    const expanded = new Set(state.expandedNodes);
    for (const id of nodeIds) expanded.delete(id);
    set({ nodes, edges, expandedNodes: expanded });
  },

  relayout: () => {
    const state = get();
    if (state.nodes.length === 0) return;
    const positioned = applyLayout(state.nodes, state.edges, state.layoutMode, 0);
    set({ nodes: positioned });
  },

  resetGraph: () => {
    channelColorMap.clear();
    colorIndex = 0;
    set({ nodes: [], edges: [], expandedNodes: new Set(), loadingNodes: new Set() });
  },
}));
