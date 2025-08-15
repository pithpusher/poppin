import clsx from "clsx";
export default function Card({className, ...props}: React.HTMLAttributes<HTMLDivElement>){
  return <div className={clsx("rounded-xl2 token-border bg-[rgb(var(--panel))] shadow-card", className)} {...props} />;
}
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={clsx("mb-2 flex items-center justify-between", props.className)} />;
}
export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 {...props} className={clsx("text-sm font-semibold", props.className)} />;
}
export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={clsx("text-sm text-zinc-700", props.className)} />;
}
