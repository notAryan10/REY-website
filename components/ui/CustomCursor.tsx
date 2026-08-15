"use client";

import React, { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

type CursorMode = "default" | "pointer" | "text";

// Inputs that take a caret. Buttons, checkboxes and the like are excluded so
// they keep the pointer.
const TEXT_INPUT = `textarea, [contenteditable=""], [contenteditable="true"],
  input:is([type="text"], [type="email"], [type="password"], [type="search"],
  [type="tel"], [type="url"], [type="number"], :not([type]))`;

export default function CustomCursor() {
  const [mode, setMode] = useState<CursorMode>("default");
  const [isVisible, setIsVisible] = useState(false);
  const isHovering = mode === "pointer";

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Trail springs with more delay
  const trailX1 = useSpring(cursorX, { damping: 30, stiffness: 150 });
  const trailY1 = useSpring(cursorY, { damping: 30, stiffness: 150 });
  const trailX2 = useSpring(cursorX, { damping: 40, stiffness: 120 });
  const trailY2 = useSpring(cursorY, { damping: 40, stiffness: 120 });
  const trailX3 = useSpring(cursorX, { damping: 50, stiffness: 100 });
  const trailY3 = useSpring(cursorY, { damping: 50, stiffness: 100 });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Text first: an input inside a label would otherwise read as a pointer.
      if (target.closest(TEXT_INPUT)) {
        setMode("text");
      } else if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.closest("button") ||
        target.closest("a") ||
        window.getComputedStyle(target).cursor === "pointer"
      ) {
        setMode("pointer");
      } else {
        setMode("default");
      }
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseleave", () => setIsVisible(false));
    document.addEventListener("mouseenter", () => setIsVisible(true));

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Trail particles - more like sparks */}
      {[trailX3, trailX2, trailX1].map((tx, i) => (
        <motion.div
          key={i}
          className="fixed top-0 left-0 w-1.5 h-1.5 bg-white"
          style={{
            x: tx,
            y: [trailY3, trailY2, trailY1][i],
            translateX: "-50%",
            translateY: "-50%",
            opacity: (i + 1) * 0.1,
            scale: 1 - i * 0.2,
            boxShadow: "0 0 10px currentColor",
            color: ["#FF6B35", "#4CAF50", "#5BC0EB"][i]
          }}
        />
      ))}

      {/* Retro Pixel Caret - shown over text fields */}
      <motion.div
        className="fixed top-0 left-0"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          // Centred on the hotspot, unlike the arrow which points from its tip.
          translateX: "-50%",
          translateY: "-50%",
          display: mode === "text" ? "block" : "none",
        }}
      >
        <motion.svg
          width="17"
          height="26"
          viewBox="0 0 16 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{ opacity: [1, 1, 0.35, 0.35, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, times: [0, 0.45, 0.5, 0.95, 1] }}
        >
          {/* Outline, one block larger than the body on every side */}
          <rect x="3" y="2" width="10" height="4" fill="black" />
          <rect x="6" y="4" width="4" height="16" fill="black" />
          <rect x="3" y="18" width="10" height="4" fill="black" />

          {/* Body */}
          <rect x="4" y="3" width="8" height="2" fill="white" />
          <rect x="7" y="5" width="2" height="14" fill="white" />
          <rect x="4" y="19" width="8" height="2" fill="white" />
        </motion.svg>
      </motion.div>

      {/* Retro Pixel Pointer - Classic RPG Style */}
      <motion.div
        className="fixed top-0 left-0"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: "-10%",
          translateY: "-10%",
          display: mode === "text" ? "none" : "block",
        }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={isHovering ? "scale-125 transition-transform duration-200" : "transition-transform duration-200"}
        >
          {/* Shadow/Outline */}
          <path d="M4 2H6V4H4V2Z" fill="black"/>
          <path d="M4 4H2V16H4V18H6V20H8V22H10V20H8V18H10V16H8V14H6V4H4Z" fill="black"/>
          <path d="M6 4H8V6H6V4Z" fill="black"/>
          <path d="M8 6H10V8H8V6Z" fill="black"/>
          <path d="M10 8H12V10H10V8Z" fill="black"/>
          <path d="M12 10H14V12H12V10Z" fill="black"/>
          <path d="M14 12H16V16H14V12Z" fill="black"/>
          <path d="M14 16H12V18H10V20H12V18H14V16Z" fill="black"/>
          
          {/* Main White Body */}
          <path d="M4 4H6V14H8V16H10V18H12V16H14V12H12V10H10V8H8V6H6V4Z" fill="white"/>
          
          {/* Highlight/Detail */}
          <path d="M6 6H8V8H6V6Z" fill="#D1D1D1"/>
          <path d="M8 8H10V10H8V8Z" fill="#D1D1D1"/>
          <path d="M10 10H12V12H10V12Z" fill="#D1D1D1"/>
        </svg>
      </motion.div>
      
      {/* Click Pulse Effect would go here if we wanted it */}
    </div>
  );
}
