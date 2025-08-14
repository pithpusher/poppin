export default function SearchBar({placeholder="Search events…"}:{placeholder?:string}){
  return (
    <div className="h-12 rounded-full token-border bg-[rgb(var(--panel))] px-4 flex items-center gap-3">
      <span className="i-mdi-magnify w-5 h-5 opacity-70" aria-hidden />
      <input
        placeholder={placeholder}
        className="bg-transparent outline-none flex-1 text-sm placeholder:text-[rgb(var(--muted))] text-[rgb(var(--text))]"
      />
    </div>
  );
}
