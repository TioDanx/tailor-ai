interface BadgeProps {
  children: React.ReactNode;
  variant?: "tertiary" | "primary" | "secondary" | "outline";
  className?: string;
}

export function Badge({ children, variant = "tertiary", className = "" }: BadgeProps) {
  const variants = {
    tertiary: "bg-tertiary/10 text-tertiary",
    primary:  "bg-primary/10 text-primary",
    secondary:"bg-secondary-container text-on-secondary-container",
    outline:  "border border-outline-variant/30 text-outline",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-label ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
