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
  text = "/cot/mem.txt",
}: LandingSvgProps) {
  const svgWidth = 30.333;
  const svgHeight = 30.333;
  const columns = Math.ceil(width / svgWidth);
  const rows = Math.ceil(height / svgHeight);
  const totalSvgs = columns * rows;

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
      className="invisible relative grid lg:visible"
      style={{
        width,
        height,
        gridTemplateColumns: `repeat(${columns}, ${svgWidth}px)`,
        gridTemplateRows: `repeat(${rows}, ${svgHeight}px)`,
        overflow: "hidden", // Prevent SVGs from overflowing
      }}
    >
      {/* Center text */}
      {text && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: "52%",
            top: "52%",
            transform: "translate(-50%, -50%)",
            width: "auto",
            height: "auto",
            zIndex: 10,
          }}
        >
          <span className="cursor-not-allowed font-mono whitespace-pre-wrap dark:text-neutral-300">
            {text}
          </span>
        </div>
      )}

      {/* SVG grid */}
      {Array(totalSvgs)
        .fill(null)
        .map((_, i) => {
          const row = Math.floor(i / columns);
          const col = i % columns;

          const isInHole =
            text &&
            row >= Math.floor(rows * 0.4) &&
            row <= Math.ceil(rows * 0.5) &&
            col >= Math.floor(columns * 0.3) &&
            col <= Math.ceil(columns * 0.6);

          return (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{
                visibility: isInHole ? "hidden" : "visible",
              }}
              onMouseEnter={() => toggleFlip(i)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="444.461 212.122 34.333 34.333" // Expanded viewBox by 2 units on each side
                width={`${svgWidth}px`}
                height={`${svgHeight}px`}
                style={{
                  transform: flippedIndices.has(i) ? "scaleX(-1)" : undefined,
                  transition: "transform 0.25s ease",
                }}
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M 476.796 235.121 L 455.766 214.122 L 446.461 214.122 L 446.461 223.161 L 467.885 244.553 L 476.796 244.553 L 476.796 235.121 Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          );
        })}
    </div>
  );
}

// The following flips the SVGs on the landing page
//
// "use client";

// import { useState } from "react";

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

//   // Track which SVGs are flipped using a Set
//   const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());

//   const toggleFlip = (index: number) => {
//     setFlippedIndices((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(index)) {
//         newSet.delete(index);
//       } else {
//         newSet.add(index);
//       }
//       return newSet;
//     });
//   };

//   return (
//     <div
//       id="landing-svg"
//       className="invisible grid lg:visible"
//       style={{
//         width,
//         height,
//         gridTemplateColumns: `repeat(${columns}, ${svgWidth}px)`,
//         gridTemplateRows: `repeat(${rows}, ${svgHeight}px)`,
//       }}
//     >
//       {Array(totalSvgs)
//         .fill(null)
//         .map((_, i) => (
//           <svg
//             key={i}
//             xmlns="http://www.w3.org/2000/svg"
//             viewBox="446.461 214.122 30.335 30.431"
//             width="30.335px"
//             height="30.431px"
//             style={{
//               transform: flippedIndices.has(i) ? "scaleX(-1)" : undefined,
//               transition: "transform 0.5s ease",
//             }}
//             onMouseEnter={() => toggleFlip(i)}
//           >
//             <path
//               fillRule="evenodd"
//               clipRule="evenodd"
//               d="M 476.796 235.121 L 455.766 214.122 L 446.461 214.122 L 446.461 223.161 L 467.885 244.553 L 476.796 244.553 L 476.796 235.121 Z"
//               fill="currentColor"
//             />
//           </svg>
//         ))}
//     </div>
//   );
// }

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
