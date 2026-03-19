import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCollide,
  forceX,
  forceY,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import Dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";

interface SimNode extends SimulationNodeDatum {
  id: string;
  origX: number;
  origY: number;
  isExisting: boolean;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 160;

export type LayoutMode = "tree" | "tree-lr";

// ─── Force-directed layout (existing) ────────────────────────────────────────

export function calculateLayout(
  nodes: Node[],
  edges: Edge[],
  fixedCount: number
): Node[] {
  if (nodes.length === 0) return nodes;

  const simNodes: SimNode[] = nodes.map((node, i) => ({
    id: node.id,
    x: node.position.x,
    y: node.position.y,
    origX: node.position.x,
    origY: node.position.y,
    isExisting: i < fixedCount,
  }));

  const nodeIndex = new Map(simNodes.map((n, i) => [n.id, i]));

  const simLinks: SimulationLinkDatum<SimNode>[] = edges
    .filter((e) => nodeIndex.has(e.source as string) && nodeIndex.has(e.target as string))
    .map((edge) => ({
      source: nodeIndex.get(edge.source as string)!,
      target: nodeIndex.get(edge.target as string)!,
    }));

  const collideRadius = Math.max(NODE_WIDTH, NODE_HEIGHT) * 0.9;

  const simulation = forceSimulation(simNodes)
    .force("link", forceLink(simLinks).distance(400).strength(0.2))
    .force("charge", forceManyBody().strength(-1200).distanceMax(2000))
    .force("collide", forceCollide<SimNode>(collideRadius).iterations(4).strength(1))
    .force("anchorX", forceX<SimNode>((d) => d.origX).strength((d) => (d.isExisting ? 0.3 : 0.01)))
    .force("anchorY", forceY<SimNode>((d) => d.origY).strength((d) => (d.isExisting ? 0.3 : 0.01)))
    .stop();

  for (let i = 0; i < 200; i++) {
    simulation.tick();
  }

  return nodes.map((node, i) => ({
    ...node,
    position: {
      x: Math.round(simNodes[i].x ?? node.position.x),
      y: Math.round(simNodes[i].y ?? node.position.y),
    },
  }));
}

// ─── Dagre hierarchical/tree layout ──────────────────────────────────────────

export function calculateTreeLayout(
  nodes: Node[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB"
): Node[] {
  if (nodes.length === 0) return nodes;

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: direction,
    nodesep: 60,
    ranksep: 120,
    edgesep: 30,
    marginx: 40,
    marginy: 40,
  });

  for (const node of nodes) {
    const w = node.type === "channelNode" ? 220 : 180;
    const h = node.type === "channelNode" ? 140 : 200;
    g.setNode(node.id, { width: w, height: h });
  }

  for (const edge of edges) {
    if (g.hasNode(edge.source as string) && g.hasNode(edge.target as string)) {
      g.setEdge(edge.source as string, edge.target as string);
    }
  }

  Dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const w = node.type === "channelNode" ? 220 : 180;
    const h = node.type === "channelNode" ? 140 : 200;
    return {
      ...node,
      position: {
        x: Math.round(pos.x - w / 2),
        y: Math.round(pos.y - h / 2),
      },
    };
  });
}

// ─── Unified layout dispatcher ───────────────────────────────────────────────

export function applyLayout(
  nodes: Node[],
  edges: Edge[],
  mode: LayoutMode,
): Node[] {
  switch (mode) {
    case "tree-lr":
      return calculateTreeLayout(nodes, edges, "LR");
    case "tree":
    default:
      return calculateTreeLayout(nodes, edges, "TB");
  }
}
