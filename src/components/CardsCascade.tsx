"use client";

import { m as motion, LazyMotion, domAnimation } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode[];
  className?: string;
}

export default function CardsCascade({ children, className = "" }: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <div className={className}>
        {children.map((child, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: i * 0.07 }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </LazyMotion>
  );
}
