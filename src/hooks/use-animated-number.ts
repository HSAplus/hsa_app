"use client";

import { useSpring, useTransform, type MotionValue } from "framer-motion";

export function useAnimatedNumber(
  value: number,
  format: (n: number) => string = (n) => n.toLocaleString("en-US")
): MotionValue<string> {
  const spring = useSpring(value, { stiffness: 75, damping: 15, mass: 0.5 });
  return useTransform(spring, (latest) => format(Math.round(latest)));
}
