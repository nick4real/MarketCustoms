import { useState } from "react";
import { Button, StatusMessage } from "@/shared/ui";
import { cx } from "@/shared/lib";

type OrderStatus = "Processing" | "In Transit" | "Delivered";
type Filter = "All" | OrderStatus;

const orders = [
  {
    id: "ORD-4821",
    date: "Aug 18, 2026",
    item: "Leica M6 TTL Black",
    seller: "K. Nakamura",
    location: "Tokyo, JP",
    total: 2400,
    status: "Delivered" as OrderStatus,
    image: "photo-1606983340126-99ab4feaa64a",
    tracking: "JL929281092JP",
    eta: "Delivered Aug 22, 2026",
  },
  {
    id: "ORD-4717",
    date: "Aug 09, 2026",
    item: "Arc'teryx Beta AR Jacket",
    seller: "T. Berg",
    location: "Oslo, NO",
    total: 380,
    status: "In Transit" as OrderStatus,
    image: "photo-1551698618-1dfe5d97d256",
    tracking: "NO849201038DE",
    eta: "Expected Aug 28, 2026",
  },
  {
    id: "ORD-4598",
    date: "Jul 25, 2026",
    item: "Braun T3 Alarm Clock",
    seller: "M. Weiss",
    location: "Berlin, DE",
    total: 180,
    status: "Processing" as OrderStatus,
    image: "photo-1563861826100-9cb868fdbe1c",
    tracking: "—",
    eta: "Est. Aug 30 – Sep 2, 2026",
  },
  {
    id: "ORD-4452",
    date: "Jul 12, 2026",
    item: "Technics SL-1200 MK5",
    seller: "D. Okafor",
    location: "Lagos, NG",
    total: 1200,
    status: "Delivered" as OrderStatus,
    image: "photo-1558618666-fcd25c85cd64",
    tracking: "NG012938201DE",
    eta: "Delivered Jul 22, 2026",
  },
  {
    id: "ORD-4201",
    date: "Jun 30, 2026",
    item: "Levi's 501 Vintage 1988",
    seller: "A. Perez",
    location: "NYC, US",
    total: 220,
    status: "Delivered" as OrderStatus,
    image: "photo-1542272604-787c3835535d",
    tracking: "US92037261US",
    eta: "Delivered Jul 8, 2026",
  },
];

const statusStyle: Record<OrderStatus, string> = {
  Processing: "text-accent bg-accent/8",
  "In Transit": "text-info bg-info/8",
  Delivered: "text-success bg-success/8",
};

const filters: Filter[] = ["All", "Processing", "In Transit", "Delivered"];

export function OrdersPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="bg-background min-h-screen px-4 py-8 md:px-12 lg:px-16 lg:py-12">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between lg:mb-10">
        <div>
          <h1 className="text-foreground font-display text-[32px] leading-none font-bold lg:text-[38px]">
            Orders
          </h1>
          <p className="text-muted-foreground mt-2 font-mono text-xs">
            {orders.length} total orders
          </p>
        </div>

        {/* Filter tabs */}
        <div className="border-border bg-card flex gap-0.5 self-start overflow-x-auto rounded-xs border p-1 sm:self-auto">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cx(
                "rounded-xs px-3 py-1.5 font-mono text-[10px] tracking-wide whitespace-nowrap transition-colors md:px-4 md:text-xs",
                filter === f
                  ? "bg-foreground text-primary-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground-muted",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-2">
        {visible.map((order) => {
          const isOpen = expanded === order.id;
          const s = statusStyle[order.status];
          return (
            <div
              key={order.id}
              className="border-border bg-card hover:border-border-subtle overflow-hidden rounded-xs border transition-colors"
            >
              {/* Row */}
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-4 text-left md:gap-5 md:px-5"
                onClick={() => setExpanded(isOpen ? null : order.id)}
              >
                {/* Image */}
                <div className="bg-surface h-12 w-12 shrink-0 overflow-hidden rounded-xs md:h-14 md:w-14">
                  <img
                    src={`https://images.unsplash.com/${order.image}?w=128&h=128&fit=crop&auto=format`}
                    alt={order.item}
                    className="h-full w-full object-cover opacity-80"
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1 text-left">
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {order.id}
                    </span>
                    <span className="text-border-subtle hidden sm:block">
                      ·
                    </span>
                    <span className="text-muted-foreground hidden font-mono text-[10px] sm:block">
                      {order.date}
                    </span>
                  </div>
                  <div className="text-foreground truncate text-sm font-medium">
                    {order.item}
                  </div>
                  <div className="text-foreground-subtle mt-0.5 hidden font-mono text-[10px] sm:block">
                    from {order.seller} · {order.location}
                  </div>
                </div>

                {/* Status — hidden on smallest screens, shown inline on sm+ */}
                <div
                  className={cx(
                    "hidden shrink-0 rounded-xs px-3 py-1 font-mono text-[10px] font-bold tracking-widest uppercase sm:block",
                    s,
                  )}
                >
                  {order.status}
                </div>

                {/* Total + chevron */}
                <div className="flex shrink-0 items-center gap-2">
                  <div className="text-foreground font-display text-lg font-bold md:text-xl">
                    ${order.total.toLocaleString()}
                  </div>
                  <div
                    className={cx(
                      "text-foreground-subtle transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Mobile status bar (only on xs) */}
              <div className="-mt-2 flex items-center gap-2 px-4 pb-3 sm:hidden">
                <span
                  className={cx(
                    "rounded-xs px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase",
                    s,
                  )}
                >
                  {order.status}
                </span>
                <span className="text-foreground-subtle font-mono text-[10px]">
                  {order.date}
                </span>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div className="border-border border-t px-4 pb-5 md:px-5">
                  <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3 sm:gap-8">
                    <div>
                      <div className="text-muted-foreground mb-1.5 font-mono text-[10px] tracking-[0.15em] uppercase">
                        Tracking number
                      </div>
                      <div className="text-foreground font-mono text-sm">
                        {order.tracking}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1.5 font-mono text-[10px] tracking-[0.15em] uppercase">
                        Delivery
                      </div>
                      <div className="text-foreground font-mono text-sm">
                        {order.eta}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="outline" size="sm">
                        Contact seller
                      </Button>
                      {order.status === "Delivered" && (
                        <Button variant="primary" size="sm">
                          Leave review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <StatusMessage
          size="block"
          symbol="∅"
          message="No orders with this status"
        />
      )}
    </div>
  );
}
