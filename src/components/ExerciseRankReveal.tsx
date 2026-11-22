import { useLayoutEffect, useRef, useState } from "react";
import type { rankProgress } from "../engine/ladder";
import RankCrest from "./RankCrest";
import PromotionReveal from "./PromotionReveal";
import RankBar from "./RankBar";

type Division = NonNullable<ReturnType<typeof rankProgress>>;
export type SavedRank = { id: number; before: Division | null };

export default function ExerciseRankReveal({
  division,
  saved,
  elo,
}: {
  division: Division;
  saved: SavedRank | null;
  elo: number;
}) {
  const card = useRef<HTMLDivElement>(null);
  const { label, next, percent } = division;
  const [frame, setFrame] = useState<
    (Division & { save: SavedRank; target: number; targetLabel: string }) | null
  >(null);
  useLayoutEffect(() => {
    if (!saved) return;
    const before = saved.before;
    if (before?.label === label && before.percent === percent) return;
    card.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const promoted = before !== null && before.label !== label;
    const start = performance.now();
    let request = 0;
    const tick = (now: number) => {
      const elapsed = Math.max(0, now - start);
      if (promoted && elapsed < 650) {
        setFrame({
          ...before,
          save: saved,
          target: percent,
          targetLabel: label,
          percent: before.percent + (100 - before.percent) * Math.min(1, elapsed / 500),
        });
      } else {
        const t = Math.min(1, (elapsed - (promoted ? 650 : 0)) / 600);
        if (t >= 1) {
          setFrame(null);
          return;
        }
        const from = promoted ? 0 : (before?.percent ?? 0);
        setFrame({
          save: saved,
          target: percent,
          targetLabel: label,
          label,
          next,
          percent: from + (percent - from) * (1 - (1 - t) ** 3),
        });
      }
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [saved, label, next, percent]);
  const shown =
    frame && frame.save === saved && frame.target === percent && frame.targetLabel === label
      ? frame
      : division;
  return (
    <div ref={card}>
      <div className="flex items-center gap-3">
        <RankCrest label={shown.label} />
        <div>
          <h2 aria-live="polite">{shown.label}</h2>
          <p>{elo} Elo</p>
        </div>
      </div>
      <RankBar {...shown} />
      {saved?.before && saved.before.label !== label && (
        <PromotionReveal key={saved.id} before={saved.before.label} after={label} />
      )}
    </div>
  );
}
