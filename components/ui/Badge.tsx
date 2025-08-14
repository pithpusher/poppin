import clsx from "clsx";
export default function Badge({children, color="muted"}:{children:React.ReactNode;color?:"muted"|"success"|"warning"|"danger"}){
  const map:any = {
    muted:   "bg-white/5 border-[rgb(var(--border-color))] text-[rgb(var(--text))]",
    success: "bg-green-50 text-green-700 border border-green-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger:  "bg-red-50 text-red-700 border border-red-200",
  };
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", map[color])}>
      {children}
    </span>
  );
}
