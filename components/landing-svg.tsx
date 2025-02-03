"use client";

import { useState } from "react";

interface LandingSvgProps {
  height?: number;
  width?: number;
}

export default function LandingSvg({
  height = 300,
  width = 300,
}: LandingSvgProps) {
  const svgWidth = 30.335;
  const svgHeight = 30.431;
  const columns = Math.ceil(width / svgWidth);
  const rows = Math.ceil(height / svgHeight);
  const totalSvgs = columns * rows;

  // Track which SVGs are flipped using a Set
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());

  const toggleFlip = (index: number) => {
    setFlippedIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div
      id="landing-svg"
      className="invisible grid lg:visible"
      style={{
        width,
        height,
        gridTemplateColumns: `repeat(${columns}, ${svgWidth}px)`,
        gridTemplateRows: `repeat(${rows}, ${svgHeight}px)`,
      }}
    >
      {Array(totalSvgs)
        .fill(null)
        .map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="446.461 214.122 30.335 30.431"
            width="30.335px"
            height="30.431px"
            style={{
              transform: flippedIndices.has(i) ? "scaleX(-1)" : undefined,
              transition: "transform 0.5s ease",
            }}
            onMouseEnter={() => toggleFlip(i)}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M 476.796 235.121 L 455.766 214.122 L 446.461 214.122 L 446.461 223.161 L 467.885 244.553 L 476.796 244.553 L 476.796 235.121 Z"
              fill="currentColor"
            />
          </svg>
        ))}
    </div>
  );
}

// The following randomly flips the SVGs on the landing page
//
// "use client";

// import { useEffect, useState } from "react";

// interface LandingSvgProps {
//   height?: number;
//   width?: number;
// }

// export default function LandingSvg({
//   height = 300,
//   width = 300,
// }: LandingSvgProps) {
//   const svgWidth = 30.335;
//   const svgHeight = 30.431;
//   const columns = Math.ceil(width / svgWidth);
//   const rows = Math.ceil(height / svgHeight);
//   const totalSvgs = columns * rows;

//   // Start with all SVGs unflipped
//   const [flips, setFlips] = useState<boolean[]>(() =>
//     Array(totalSvgs).fill(false),
//   );

//   // Random flips interval
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setFlips((currentFlips) => {
//         const newFlips = [...currentFlips];
//         const indexToFlip = Math.floor(Math.random() * totalSvgs);
//         newFlips[indexToFlip] = !newFlips[indexToFlip];
//         return newFlips;
//       });
//     }, 2000); // Flip one SVG every 0.5 seconds

//     return () => clearInterval(interval);
//   }, [totalSvgs]);

//   return (
//     <div
//       id="landing-svg"
//       className="grid"
//       style={{
//         width,
//         height,
//         gridTemplateColumns: `repeat(${columns}, ${svgWidth}px)`,
//         gridTemplateRows: `repeat(${rows}, ${svgHeight}px)`,
//       }}
//     >
//       {flips.map((isFlipped, i) => (
//         <svg
//           key={i}
//           xmlns="http://www.w3.org/2000/svg"
//           viewBox="446.461 214.122 30.335 30.431"
//           width="30.335px"
//           height="30.431px"
//           style={{
//             transform: isFlipped ? "scaleX(-1)" : undefined,
//             transition: "transform 0.5s ease",
//           }}
//         >
//           <path
//             fillRule="evenodd"
//             clipRule="evenodd"
//             d="M 476.796 235.121 L 455.766 214.122 L 446.461 214.122 L 446.461 223.161 L 467.885 244.553 L 476.796 244.553 L 476.796 235.121 Z"
//             fill="currentColor"
//           />
//         </svg>
//       ))}
//     </div>
//   );
// }

// The pattern below keeps every SVG the same and doesn't flip them
//
// interface LandingSvgProps {
//   height?: number;
//   width?: number;
// }

// export default function LandingSvg({
//   height = 300,
//   width = 300,
// }: LandingSvgProps) {
//   // Calculate number of SVGs needed to fill the space
//   const svgWidth = 30.335; // Original SVG width
//   const svgHeight = 30.431; // Original SVG height
//   const columns = Math.ceil(width / svgWidth);
//   const rows = Math.ceil(height / svgHeight);
//   const totalSvgs = columns * rows;

//   return (
//     <div
//       className="grid"
//       style={{
//         width,
//         height,
//         gridTemplateColumns: `repeat(${columns}, ${svgWidth}px)`,
//         gridTemplateRows: `repeat(${rows}, ${svgHeight}px)`,
//       }}
//     >
//       {Array.from({ length: totalSvgs }).map((_, i) => (
//         <svg
//           key={i}
//           xmlns="http://www.w3.org/2000/svg"
//           viewBox="446.461 214.122 30.335 30.431"
//           width="30.335px"
//           height="30.431px"
//         >
//           <path
//             fillRule="evenodd"
//             clipRule="evenodd"
//             d="M 476.796 235.121 L 455.766 214.122 L 446.461 214.122 L 446.461 223.161 L 467.885 244.553 L 476.796 244.553 L 476.796 235.121 Z"
//             fill="currentColor"
//           />
//         </svg>
//       ))}
//     </div>
//   );
// }
