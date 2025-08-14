// components/ui/Chip.tsx (or inline where you render chips)
export function Chip({ active, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      {...props}
      className={
        "px-3 py-1.5 rounded-full text-sm transition " +
        (active
          ? "bg-[rgb(var(--bg))] text-[rgb(var(--text))] token-border shadow"
          : "bg-[rgb(var(--panel))] text-[rgb(var(--muted))] token-border hover:bg-white/5")
      }
    >
      {children}
    </button>
  );
}
