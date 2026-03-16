"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { Canvas } from "@/components/Canvas";

export function CanvasClient() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
}
