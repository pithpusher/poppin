import clsx from "clsx";
type Props = React.InputHTMLAttributes<HTMLInputElement>;
export function Input({ className, ...props }: Props) {
  return (
    <input
      className={clsx(
        "w-full rounded-lg token-border px-3 py-2 text-sm bg-white",
        "placeholder:text-zinc-400",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
      {...props}
    />
  );
}
