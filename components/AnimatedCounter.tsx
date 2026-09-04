"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { toBnDigits } from "@/lib/i18n";

export default function AnimatedCounter({ value, startOnMount = false }: { value: string | number, startOnMount?: boolean }) {
  const { language } = useLanguage();
  const strValue = String(value ?? "");
  const numMatch = strValue.match(/\d+/);
  const targetNumber = numMatch ? parseInt(numMatch[0], 10) : 0;
  const suffix = strValue.replace(/\d+/g, "");

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // If startOnMount is true, or if it's in view, we animate.
    // Also, if targetNumber changes after we've already started, we should animate to the new number.
    if ((inView || startOnMount) && targetNumber >= 0) {
      const controls = animate(displayValue, targetNumber, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (val) => setDisplayValue(Math.round(val)),
      });
      return controls.stop;
    }
  }, [inView, targetNumber, startOnMount]); // excluding displayValue to avoid loops

  if (!numMatch && !strValue.match(/\d/)) return <span>{value}</span>;

  const formattedValue = language === "bn" ? toBnDigits(displayValue) : displayValue;
  const formattedSuffix = language === "bn" && suffix ? toBnDigits(suffix) : suffix;

  return (
    <span ref={ref}>
      {formattedValue}
      {formattedSuffix}
    </span>
  );
}
