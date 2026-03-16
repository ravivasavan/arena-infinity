import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";
import type { Node, Edge } from "@xyflow/react";

interface SimNode extends SimulationNodeDatum {
  id: string;
  fx?: number | null;
  fy?: number | null;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;

export function calculateLayout(
  nodes: Node[],
  edges: Edge[],
  fixedCount: number
): Node[] {
  const simNodes: SimNode[] = nodes.map((node, i) => {
    const isFixed = i < fixedCount;
    return {
      id: node.id,
      x: node.position.x,
      y: node.position.y,
      fx: isFixed ? node.position.x : null,
      fy: isFixed ? node.position.y : null,
    };
  });

  const nodeIndex = new Map(simNodes.map((n, i) => [n.id, i]));

  const simLinks: SimulationLinkDatum<SimNode>[] = edges
    .filter((e) => nodeIndex.has(e.source as string) && nodeIndex.has(e.target as string))
    .map((edge) => ({
      source: nodeIndex.get(edge.source as string)!,
      target: nodeIndex.get(edge.target as string)!,
    }));

  const simulation = forceSimulation(simNodes)
    .force(
      "link",
      forceLink(simLinks).distance(180).strength(0.5)
    )
    .force("charge", forceManyBody().strength(-400))
    .force("center", forceCenter(0, 0).strength(0.05))
    .force("collide", forceCollide(Math.max(NODE_WIDTH, NODE_HEIGHT) * 0.8))
    .stop();

  // Run simulation ticks
  for (let i = 0; i < 100; i++) {
    simulation.tick();
  }

  return nodes.map((node, i) => ({
    ...node,
    position: {
      x: simNodes[i].x ?? node.position.x,
      y: simNodes[i].y ?? node.position.y,
    },
  }));
}
