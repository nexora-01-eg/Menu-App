"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  /** Pre-formatted display (e.g. "8.2M") — if set, animates to `target` then swaps to this. */
  compactLabel?: string;
  className?: string;
}

export function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  compactLabel,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1600, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (inView) motionValue.set(target);
  }, [inView, motionValue, target]);

  useEffect(() => {
    const unsub = spring.on("change", (latest) => {
      setDisplay(Math.floor(latest).toLocaleString());
    });
    return unsub;
  }, [spring]);

  useEffect(() => {
    if (inView && compactLabel) {
      const t = setTimeout(() => setDisplay(compactLabel), 1650);
      return () => clearTimeout(t);
    }
  }, [inView, compactLabel]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
