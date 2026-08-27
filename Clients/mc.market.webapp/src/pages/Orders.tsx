import { useState } from "react";

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

const statusStyle: Record<OrderStatus, { color: string; bg: string }> = {
  Processing: { color: "#f0c842", bg: "rgba(240,200,66,0.08)" },
  "In Transit": { color: "#5b8def", bg: "rgba(91,141,239,0.08)" },
  Delivered: { color: "#4caf82", bg: "rgba(76,175,130,0.08)" },
};

const filters: Filter[] = ["All", "Processing", "In Transit", "Delivered"];

export default function Orders() {
  const [filter, setFilter] = useState<Filter>("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const visible =
    filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="bg-[#080808] min-h-screen px-4 py-8 md:px-12 lg:px-16 lg:py-12">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-8 lg:mb-10">
        <div>
          <h1
            className="text-[32px] font-bold text-[#f0ece3] leading-none lg:text-[38px]"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            Orders
          </h1>
          <p
            className="text-xs text-[#5a5550] mt-2"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            {orders.length} total orders
          </p>
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-0.5 bg-[#111] border border-[#1e1e1e] p-1 self-start sm:self-auto overflow-x-auto"
          style={{ borderRadius: "2px" }}
        >
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[10px] tracking-wide transition-colors whitespace-nowrap md:px-4 md:text-xs ${
                filter === f
                  ? "bg-[#f0ece3] text-[#080808] font-bold"
                  : "text-[#5a5550] hover:text-[#a09890]"
              }`}
              style={{ borderRadius: "2px", fontFamily: "DM Mono, monospace" }}
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
              className="border border-[#1e1e1e] bg-[#111] overflow-hidden transition-colors hover:border-[#2a2a2a]"
              style={{ borderRadius: "2px" }}
            >
              {/* Row */}
              <button
                className="w-full flex items-center gap-3 px-4 py-4 text-left md:gap-5 md:px-5"
                onClick={() => setExpanded(isOpen ? null : order.id)}
              >
                {/* Image */}
                <div
                  className="w-12 h-12 shrink-0 overflow-hidden bg-[#0d0d0d] md:w-14 md:h-14"
                  style={{ borderRadius: "2px" }}
                >
                  <img
                    src={`https://images.unsplash.com/${order.image}?w=128&h=128&fit=crop&auto=format`}
                    alt={order.item}
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] text-[#5a5550]"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {order.id}
                    </span>
                    <span className="text-[#2a2a2a] hidden sm:block">·</span>
                    <span
                      className="text-[10px] text-[#5a5550] hidden sm:block"
                      style={{ fontFamily: "DM Mono, monospace" }}
                    >
                      {order.date}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-[#f0ece3] truncate">
                    {order.item}
                  </div>
                  <div
                    className="text-[10px] text-[#3a3532] mt-0.5 hidden sm:block"
                    style={{ fontFamily: "DM Mono, monospace" }}
                  >
                    from {order.seller} · {order.location}
                  </div>
                </div>

                {/* Status — hidden on smallest screens, shown inline on sm+ */}
                <div
                  className="hidden sm:block shrink-0 text-[10px] font-bold tracking-widest uppercase px-3 py-1"
                  style={{
                    fontFamily: "DM Mono, monospace",
                    color: s.color,
                    backgroundColor: s.bg,
                    borderRadius: "2px",
                  }}
                >
                  {order.status}
                </div>

                {/* Total + chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className="text-lg font-bold text-[#f0ece3] md:text-xl"
                    style={{ fontFamily: "Fraunces, Georgia, serif" }}
                  >
                    ${order.total.toLocaleString()}
                  </div>
                  <div
                    className="text-[#3a3532] transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
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
              <div className="sm:hidden px-4 pb-3 -mt-2 flex items-center gap-2">
                <span
                  className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5"
                  style={{
                    fontFamily: "DM Mono, monospace",
                    color: s.color,
                    backgroundColor: s.bg,
                    borderRadius: "2px",
                  }}
                >
                  {order.status}
                </span>
                <span
                  className="text-[10px] text-[#3a3532]"
                  style={{ fontFamily: "DM Mono, monospace" }}
                >
                  {order.date}
                </span>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div className="px-4 pb-5 border-t border-[#1e1e1e] md:px-5">
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
                    <div>
                      <div
                        className="text-[10px] text-[#5a5550] tracking-[0.15em] uppercase mb-1.5"
                        style={{ fontFamily: "DM Mono, monospace" }}
                      >
                        Tracking number
                      </div>
                      <div
                        className="text-sm text-[#f0ece3]"
                        style={{ fontFamily: "DM Mono, monospace" }}
                      >
                        {order.tracking}
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-[10px] text-[#5a5550] tracking-[0.15em] uppercase mb-1.5"
                        style={{ fontFamily: "DM Mono, monospace" }}
                      >
                        Delivery
                      </div>
                      <div
                        className="text-sm text-[#f0ece3]"
                        style={{ fontFamily: "DM Mono, monospace" }}
                      >
                        {order.eta}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        className="text-xs border border-[#2a2a2a] text-[#f0ece3] px-3 py-2 hover:border-[#4a4540] transition-colors"
                        style={{
                          borderRadius: "2px",
                          fontFamily: "DM Mono, monospace",
                        }}
                      >
                        Contact seller
                      </button>
                      {order.status === "Delivered" && (
                        <button
                          className="text-xs bg-[#e8820c] text-[#080808] px-3 py-2 font-bold hover:bg-[#cf7108] transition-colors"
                          style={{
                            borderRadius: "2px",
                            fontFamily: "DM Mono, monospace",
                          }}
                        >
                          Leave review
                        </button>
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
        <div className="flex flex-col items-center justify-center py-24">
          <div
            className="text-5xl text-[#2a2a2a] mb-4"
            style={{ fontFamily: "Fraunces, Georgia, serif" }}
          >
            ∅
          </div>
          <p
            className="text-xs text-[#3a3532] tracking-widest"
            style={{ fontFamily: "DM Mono, monospace" }}
          >
            No orders with this status
          </p>
        </div>
      )}
    </div>
  );
}
