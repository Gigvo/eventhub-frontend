"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  Fragment,
} from "react";
import { motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
};

export default function Marquee({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [multiplier, setMultiplier] = useState(1);

  const calculateMultiplier = useCallback(() => {
    if (!containerRef.current || !marqueeRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const marqueeRect = marqueeRef.current.getBoundingClientRect();

    const containerWidth = containerRect.width;
    const marqueeWidth = marqueeRect.width;

    if (marqueeWidth < containerWidth) {
      setMultiplier(Math.ceil(containerWidth / marqueeWidth));
    } else {
      setMultiplier(1);
    }
  }, []);

  useEffect(() => {
    calculateMultiplier();
  }, [calculateMultiplier]);

  const multiplyChildren = useCallback(
    (multiplier: number) => {
      const arraySize = multiplier >= 0 ? multiplier : 0;
      return [...Array(arraySize)].map((_, i) => (
        <Fragment key={i}>{children}</Fragment>
      ));
    },
    [children],
  );

  return (
    <div
      className="flex overflow-x-hidden w-full bg-[#F3F4F6] mb-24"
      ref={containerRef}
    >
      <motion.div
        animate={{ x: ["0%", "-100%"] }}
        transition={{
          duration: 10,
          ease: "linear",
          repeat: Infinity,
        }}
        className="flex flex-shrink-0 flex-grow-0 basis-auto min-w-min"
      >
        <div
          ref={marqueeRef}
          className="flex flex-shrink flex-grow-0 basis-auto"
        >
          {children}
        </div>
        {multiplyChildren(multiplier - 1)}
      </motion.div>
      <motion.div
        animate={{ x: ["0%", "-100%"] }}
        transition={{
          duration: 10,
          ease: "linear",
          repeat: Infinity,
        }}
        className="flex flex-shrink-0 flex-grow-0 basis-auto min-w-min"
      >
        {multiplyChildren(multiplier)}
      </motion.div>
    </div>
  );
}
