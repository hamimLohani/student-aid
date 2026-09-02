"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

export default function AnimatedCounter({ value }: { value: string | number }) {
  const strValue = String(value || "");
  const numMatch = strValue.match(/\d+/);
  const targetNumber = numMatch ? parseInt(numMatch[0], 10) : 0;
  const suffix = strValue.replace(/\d+/g, "");

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (inView && targetNumber > 0) {
      const controls = animate(0, targetNumber, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (val) => setDisplayValue(Math.round(val)),
      });
      return controls.stop;
    }
  }, [inView, targetNumber]);

  if (!numMatch) return <span>{value}</span>;

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}
