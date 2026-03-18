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
import type { Node, Edge } from "@xyflow/react";

interface SimNode extends SimulationNodeDatum {
  id: string;
  origX: number;
  origY: number;
  isExisting: boolean;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 160;

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
    .force(
      "link",
      forceLink(simLinks).distance(400).strength(0.2)
    )
    .force("charge", forceManyBody().strength(-1200).distanceMax(2000))
    .force(
      "collide",
      forceCollide<SimNode>(collideRadius).iterations(4).strength(1)
    )
    // Soft anchor: existing nodes drift back toward their original position
    .force(
      "anchorX",
      forceX<SimNode>((d) => d.origX).strength((d) => (d.isExisting ? 0.3 : 0.01))
    )
    .force(
      "anchorY",
      forceY<SimNode>((d) => d.origY).strength((d) => (d.isExisting ? 0.3 : 0.01))
    )
    .stop();

  // Run simulation — more ticks for better convergence
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
