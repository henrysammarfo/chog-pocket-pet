export function JarMark({
  percent,
  fromPercent,
  label,
  skin = "plain",
}: {
  percent: number;
  fromPercent?: number;
  label: string;
  skin?: "plain" | "peach";
}) {
  const from = fromPercent ?? percent;
  const to = Math.max(0, Math.min(100, percent));
  const start = Math.max(0, Math.min(100, from));

  return (
    <div className="absolute inset-x-0 bottom-2 flex justify-end pr-1 sm:bottom-4 sm:justify-center sm:pr-0" data-testid="jar" role="img" aria-label={label}>
      <div
        className="relative h-52 w-20 sm:h-[22rem] sm:w-36"
        style={{ filter: skin === "peach" ? "drop-shadow(0 12px 18px rgba(244,132,95,0.85))" : "drop-shadow(0 18px 30px rgba(0,0,0,0.28))" }}
      >
        <div className={`absolute inset-x-2 -top-1 h-3 rounded-full ${skin === "peach" ? "bg-[#F4845F]" : "bg-white/70"}`} />
        <div className="absolute inset-x-0 top-2 bottom-0 overflow-hidden rounded-t-2xl rounded-b-[1.8rem] border-2 border-white/80 bg-black/20 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]">
          <div
            data-testid="jar-fill"
            className="jar-level absolute inset-x-0 bottom-0 bg-[#6FFF00]"
            style={{
              height: `${to}%`,
              ["--jar-from" as string]: `${start}%`,
              ["--jar-to" as string]: `${to}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
