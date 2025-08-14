import clsx from "clsx";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
};
export function Button({ className, variant="primary", size="md", ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm"
  };
  const variants = {
    primary:  "bg-brand text-white hover:opacity-95 focus:ring-2 focus:ring-[color:var(--ring)]",
    secondary:"bg-[rgb(var(--panel))] border border-[rgb(var(--border-color))] text-[rgb(var(--text))] hover:bg-white/5",
    ghost:    "bg-transparent text-[rgb(var(--text))] hover:bg-white/5",
  };
  return <button className={clsx(base, sizes[size], variants[variant], className)} {...props} />;
}
// components/ui/Chip.tsx (or inline where you render chips)
export function Chip({ active, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...props}
      className={
        "px-3 py-1.5 rounded-full text-sm transition " +
        (active
          ? "bg-[rgb(var(--bg))] text-[rgb(var(--text))] border border-[color:var(--border-color)] shadow"
          : "bg-[rgb(var(--panel))] text-[rgb(var(--muted))] border border-[color:var(--border-color)] hover:bg-white/5")
      }
    >
      {children}
    </button>
  );
}
