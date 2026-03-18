"use client";

import { memo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { type NodeProps, useInternalNode } from "@xyflow/react";

interface AnimatedNodeWrapperProps {
  children: ReactNode;
  nodeId: string;
}

function AnimatedNodeWrapperComponent({ children, nodeId }: AnimatedNodeWrapperProps) {
  const node = useInternalNode(nodeId);
  if (!node) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export const AnimatedNodeWrapper = memo(AnimatedNodeWrapperComponent);

// HOC to wrap any node component with entrance animation
export function withAnimation<P extends NodeProps>(
  Component: React.ComponentType<P>
) {
  const Wrapped = memo((props: P) => (
    <AnimatedNodeWrapper nodeId={props.id}>
      <Component {...props} />
    </AnimatedNodeWrapper>
  ));
  Wrapped.displayName = `Animated(${Component.displayName || Component.name})`;
  return Wrapped;
}
