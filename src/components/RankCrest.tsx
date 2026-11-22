import { useId } from "react";
import type { Tier } from "../engine/ladder";

// Each face, rim and engraving is a separate layer so promotions can animate
// them independently without replacing the accessible rank text.
const metals = {
  Bronze: ["#edbb91", "#a86846", "#543327"],
  Silver: ["#f4f7f5", "#b2bdbf", "#505d64"],
  Gold: ["#fff1c8", "#dfb567", "#80602f"],
  Platinum: ["#f1f8f5", "#b4c7c2", "#65797c"],
  Diamond: ["#e3faff", "#83cce6", "#38576f"],
  Titan: ["#a4969e", "#544952", "#27242c"],
} satisfies Record<Tier, string[]>;
const round = "M48 4a44 44 0 1 1 0 88 44 44 0 1 1 0-88Z";
const shapes = {
  Bronze: round,
  Silver: round,
  Gold: round,
  Platinum: "M24 6h48l21 42-21 42H24L3 48Z",
  Diamond: "M29 4h38l25 26v36L67 92H29L4 66V30Z",
  Titan: "M30 5h36l5 7 13 3 8 22-5 10 5 9-8 24-15 3-6 8H32l-6-8-15-4-7-23 5-9-5-11 8-21 13-3Z",
} satisfies Record<Tier, string>;
export default function RankCrest({
  label,
  compact = false,
}: {
  label: `${Tier} ${string}`;
  compact?: boolean;
}) {
  const uid = useId();
  const [name, numeral] = label.split(" ");
  const tier = name as Tier;
  const [light, mid, dark] = metals[tier];
  const shape = shapes[tier];
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={compact ? 24 : 76}
      height={compact ? 24 : 76}
      className="shrink-0"
      viewBox="0 0 96 96"
    >
      <defs>
        <linearGradient id={uid} x2="0.65" y2="1">
          <stop stopColor={light} />
          <stop offset=".37" stopColor={mid} />
          <stop offset=".76" stopColor={dark} />
          <stop offset="1" stopColor={mid} />
        </linearGradient>
      </defs>
      <g className="crest-rim">
        <path d={shape} fill={dark} transform="translate(0 2)" />
        <path d={shape} fill={`url(#${uid})`} stroke={light} strokeWidth="1.6" />
        {tier === "Gold" && (
          <circle cx="48" cy="48" r="40" fill="none" stroke={dark} strokeWidth="2" />
        )}
        {tier === "Diamond" &&
          [0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <path
              key={angle}
              d="M29 5h37L49 17Z"
              transform={`rotate(${angle} 48 48)`}
              fill={i % 2 ? light : dark}
              opacity=".8"
            />
          ))}
      </g>
      <g className="crest-face">
        <circle
          cx="48"
          cy="48"
          r="32"
          fill={tier === "Diamond" || tier === "Titan" ? "#30343a" : mid}
          stroke={dark}
          strokeWidth="2"
        />
        {tier === "Silver" &&
          [0, 120, 240].map((angle) => (
            <path
              key={angle}
              d="M39 14Q48 11 57 14"
              transform={`rotate(${angle} 48 48)`}
              stroke="#252a29"
              fill="none"
              strokeLinecap="round"
              strokeWidth="6"
            />
          ))}
        {tier === "Titan" && (
          <path
            d="m66 6-8 11 3 7-7 9 M20 81l9-11-2-6 7-8"
            stroke="#f19890"
            strokeWidth="3"
            fill="none"
          />
        )}
        <circle cx="48" cy="45" r="12" fill={dark} stroke={light} strokeWidth="2" />
        <circle cx="48" cy="45" r="7" fill="#20211f" />
      </g>
      {!compact && (
        <text
          className="crest-engraving"
          x="48"
          y="72"
          textAnchor="middle"
          fontFamily="Georgia,serif"
          fontWeight="bold"
          fontSize="17"
          fill={tier === "Diamond" || tier === "Titan" ? light : "#312821"}
        >
          {numeral}
        </text>
      )}
    </svg>
  );
}
