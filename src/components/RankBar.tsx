type Props = { next: string | null; percent: number };

export default function RankBar({ next, percent }: Props) {
  return (
    <progress
      className="rank-bar"
      value={percent}
      max={100}
      aria-label={next ? `Progress to ${next}` : "Highest rank reached"}
    />
  );
}
