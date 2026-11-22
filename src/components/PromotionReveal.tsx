import { useEffect, useRef } from "react";
import type { Tier } from "../engine/ladder";
import RankCrest from "./RankCrest";
import "./promotion.css";

type Label = `${Tier} ${string}`;
export default function PromotionReveal({ before, after }: { before: Label; after: Label }) {
  const ref = useRef<HTMLDialogElement>(null);
  const tierUp = before.split(" ")[0] !== after.split(" ")[0];
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    const timer = window.setTimeout(() => dialog.close(), 4200);
    return () => {
      window.clearTimeout(timer);
      dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="promotion"
      data-tier-up={tierUp}
      aria-labelledby="promotion-title"
      aria-describedby="promotion-from"
    >
      <div className="promotion-stage">
        <RankCrest label={before} />
        <RankCrest label={after} />
      </div>
      <small>{tierUp ? "TIER PROMOTION" : "DIVISION PROMOTION"}</small>
      <h2 id="promotion-title">{after}</h2>
      <p id="promotion-from">Promoted from {before}</p>
      <button autoFocus onClick={() => ref.current?.close()}>
        Continue
      </button>
    </dialog>
  );
}
