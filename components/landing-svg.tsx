"use client";

import { useState } from "react";

interface LandingSvgProps {
  height?: number;
  width?: number;
  text?: string;
}

export default function LandingSvg({
  height = 325,
  width = 325,
  text = "The Onchain Arena\nfor Agents",
}: LandingSvgProps) {
  const svgWidth = 30;
  const svgHeight = 30;
  const columns = Math.ceil(width / svgWidth);
  const rows = Math.ceil(height / svgHeight);
  const totalSvgs = columns * rows;

  // Define a ~symmetrical hole range for the text
  const rowStart = Math.floor(rows * 0.4);
  const rowEnd = Math.ceil(rows * 0.6);
  const colStart = Math.floor(columns * 0.2);
  const colEnd = Math.ceil(columns * 0.8);

  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());

  const toggleFlip = (index: number) => {
    setFlippedIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) newSet.delete(index);
      else newSet.add(index);
      return newSet;
    });
  };

  return (
    <div
      id="landing-svg"
      className="relative"
      style={{
        width,
        height,
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, ${svgWidth}px)`,
        gridTemplateRows: `repeat(${rows}, ${svgHeight}px)`,
      }}
    >
      {/* Center text (only if `text` is present) */}
      {text && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="pointer-events-auto mt-2 ml-1 cursor-not-allowed text-center font-mono whitespace-pre-wrap dark:text-neutral-300">
            {text}
          </span>
        </div>
      )}

      {Array.from({ length: totalSvgs }, (_, i) => {
        const row = Math.floor(i / columns);
        const col = i % columns;

        // Check if this grid cell is inside the "hole"
        const isInHole =
          !!text && // only create the hole if there is text
          row >= rowStart &&
          row < rowEnd &&
          col >= colStart &&
          col < colEnd;

        return (
          <div
            key={i}
            className="flex items-center justify-center"
            style={{ visibility: isInHole ? "hidden" : "visible" }}
            onMouseEnter={() => toggleFlip(i)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="104.417 259.631 48.908 49.135"
              width={`${svgWidth}px`}
              height={`${svgHeight}px`}
              style={{
                transform: flippedIndices.has(i) ? "scaleX(-1)" : undefined,
                transition: "transform 0.25s ease",
              }}
            >
              <path
                d="M 153.325 298.252 L 153.325 308.766 L 127.165 308.766 L 104.417 286.018 L 104.417 259.631 L 114.704 259.631 L 153.325 298.252 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
