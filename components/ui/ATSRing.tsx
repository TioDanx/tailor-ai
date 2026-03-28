interface ATSRingProps {
  score: number;
  size?: number;
}

export function ATSRing({ score, size = 48 }: ATSRingProps) {
  // Color thresholds matching Stitch designs
  const color =
    score >= 88 ? "text-tertiary"  :
    score >= 75 ? "text-primary"   :
                  "text-secondary";

  const textColor =
    score >= 88 ? "text-tertiary"  :
    score >= 75 ? "text-primary"   :
                  "text-secondary";

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg className="ats-ring absolute w-full h-full" viewBox="0 0 36 36">
        <path
          className="text-surface-container-high"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className={color}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${score}, 100`}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <span className={`text-[10px] font-black ${textColor}`}>{score}</span>
    </div>
  );
}
