"use client";

interface SkillChipProps {
  label: string;
  variant?: "hard" | "soft";
  onRemove?: () => void;
}

export function SkillChip({ label, variant = "hard", onRemove }: SkillChipProps) {
  const textColor = variant === "hard" ? "text-primary" : "text-secondary";

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 bg-surface-container-high ${textColor} rounded-full text-sm`}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="material-symbols-outlined text-xs leading-none hover:opacity-70 transition-opacity"
          aria-label={`Remove ${label}`}
        >
          close
        </button>
      )}
    </span>
  );
}
