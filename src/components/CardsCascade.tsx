"use client";

import { m as motion, LazyMotion, domAnimation } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import type { RefObject, ReactNode } from "react";

interface Props {
  children: ReactNode[];
  className?: string;
}

export default function CardsCascade({ children, className = "" }: Props) {
  const { ref, inView } = useInView(0.05);

  return (
    <LazyMotion features={domAnimation}>
      <div
        ref={ref as RefObject<HTMLDivElement>}
        className={className}
      >
        {children.map((child, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.1 }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </LazyMotion>
  );
}
