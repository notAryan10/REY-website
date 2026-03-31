"use client";

import React from "react";
import { motion } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export const ScrollReveal = ({
  children,
  width = "100%",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) => {
  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
  };

  return (
    <div style={{ position: "relative", width, overflow: "visible" }}>
      <motion.div
        variants={{
          hidden: { 
            opacity: 0, 
            ...directions[direction] 
          },
          visible: { 
            opacity: 1, 
            x: 0, 
            y: 0 
          },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
        transition={{ 
          duration: 0.6, 
          delay: delay, 
          ease: [0.22, 1, 0.36, 1] 
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
