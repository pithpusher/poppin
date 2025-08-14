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
    secondary:"bg-[rgb(var(--panel))] token-border text-[rgb(var(--text))] hover:bg-white/5",
    ghost:    "bg-transparent text-[rgb(var(--text))] hover:bg-white/5",
  };
  return <button className={clsx(base, sizes[size], variants[variant], className)} {...props} />;
}

