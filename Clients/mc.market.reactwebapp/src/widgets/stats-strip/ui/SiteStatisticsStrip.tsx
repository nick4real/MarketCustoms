export default function SiteStatisticsStrip() {
  return (
    <div className="border-border grid grid-cols-2 gap-5 overflow-x-auto border-y px-6 py-6 md:flex md:items-center md:gap-12 md:px-12 lg:gap-16 lg:px-16">
      {[
        { value: "48,291", label: "Active listings" },
        { value: "12,847", label: "Verified sellers" },
        { value: "$2.1M", label: "Traded this month" },
        { value: "4.92", label: "Avg seller rating" },
      ].map((stat) => (
        <div
          key={stat.label}
          className="flex shrink-0 flex-col gap-1 md:flex-row md:items-baseline md:gap-3"
        >
          <span
            className="text-foreground text-[26px] leading-none font-bold lg:text-[32px]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            {stat.value}
          </span>
          <span
            className="text-muted-foreground text-[10px] tracking-wide"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
