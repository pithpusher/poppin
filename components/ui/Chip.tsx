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
