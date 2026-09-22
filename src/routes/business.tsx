import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Store, Package, Scissors, Image as ImageIcon, Tag, Calendar,
  MessageSquare, BarChart3, DollarSign, CreditCard,
  Plus, X, Upload, ChevronRight, Sparkles, TrendingUp, ArrowRight,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, SectionHeader } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { listings } from "@/lib/mock-data";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Plug Business Center — PlugU" },
      { name: "description", content: "Run your hustle: products, services, bookings, orders, messages, analytics and payouts \u2014 all free." },
    ],
  }),
  component: BusinessCenter,
});

type TabKey =
  | "overview" | "products" | "services" | "orders" | "bookings"
  | "messages" | "analytics" | "revenue" | "discounts";

const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "overview", label: "Overview", icon: Sparkles },
  { key: "products", label: "Products", icon: Package },
  { key: "services", label: "Services", icon: Scissors },
  { key: "orders", label: "Orders", icon: Store },
  { key: "bookings", label: "Bookings", icon: Calendar },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "revenue", label: "Revenue", icon: DollarSign },
  { key: "discounts", label: "Discounts", icon: Tag },
];

/* ---------------- Mock data ---------------- */

const mockOrders = [
  { id: "o-1042", item: "STAYDOWN Hoodie", buyer: "@jadadrip", total: "$40", status: "Paid · Ship" },
  { id: "o-1041", item: "Sunday Plate", buyer: "@treybeats", total: "$12", status: "Picked up" },
  { id: "o-1039", item: "Custom Tee", buyer: "@k.amari", total: "$28", status: "Refund req" },
];

const mockBookings = [
  { id: "b-220", svc: "Fresh Fade", client: "Marcus B.", when: "Today · 4:30pm", status: "Confirmed" },
  { id: "b-219", svc: "Acrylic Full Set", client: "Aaliyah J.", when: "Fri · 1:00pm", status: "Pending" },
  { id: "b-218", svc: "Studio Block 2hr", client: "DJ Vault", when: "Sat · 9:00pm", status: "Confirmed" },
];

const mockMessages = [
  { id: "m-1", name: "Jada", preview: "Is the hoodie still in stock?", time: "2m", unread: true },
  { id: "m-2", name: "Marcus", preview: "Running 5 min late for my cut", time: "10m", unread: true },
  { id: "m-3", name: "Aaliyah", preview: "Can we move to 2pm?", time: "1h", unread: false },
];

const revenueDays = [12, 18, 9, 26, 22, 34, 41];
const trafficDays = [40, 55, 36, 72, 64, 91, 110];

/* ---------------- Helpers ---------------- */

function Bars({ data, accent = "gold" }: { data: number[]; accent?: "gold" | "purple" }) {
  const max = Math.max(...data);
  const color = accent === "gold" ? "var(--plugu-gold)" : "var(--plugu-purple)";
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-md"
          style={{
            height: `${Math.max(8, (v / max) * 100)}%`,
            background: `linear-gradient(to top, color-mix(in oklab, ${color} 70%, transparent), ${color})`,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string; sub?: string; icon: LucideIcon; accent?: "gold" | "purple";
}) {
  const color = accent === "purple" ? "var(--plugu-purple)" : "var(--plugu-gold)";
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground">{label}</p>
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </div>
      <p className="mt-1 text-lg font-bold tracking-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

/* ---------------- New listing sheet ---------------- */

function NewListingSheet({
  open, onClose, defaultKind,
}: { open: boolean; onClose: () => void; defaultKind: "product" | "service" }) {
  const [kind, setKind] = useState<"product" | "service">(defaultKind);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function pick() { fileRef.current?.click(); }
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setPhoto(url);
  }
  function submit() {
    if (!title.trim() || !price.trim()) {
      toast.error("Add a title and price first");
      return;
    }
    toast.success(`${kind === "product" ? "Product" : "Service"} listed · ${title}`);
    setTitle(""); setPrice(""); setDesc(""); setPhoto(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-t-3xl border border-border bg-card p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">New {kind}</h3>
          <button onClick={onClose} aria-label="Close" className="h-8 w-8 grid place-items-center rounded-full bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Kind toggle */}
        <div className="mt-3 grid grid-cols-2 rounded-2xl bg-secondary p-1 text-xs">
          {(["product", "service"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`py-2 rounded-xl font-semibold capitalize transition-colors ${
                kind === k ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Photo */}
        <button
          onClick={pick}
          className="mt-4 w-full h-36 rounded-2xl border border-dashed border-border bg-secondary/50 grid place-items-center overflow-hidden relative"
        >
          {photo ? (
            <img src={photo} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Upload className="h-5 w-5" />
              <span className="text-xs">Upload photo</span>
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

        {/* Fields */}
        <div className="mt-3 space-y-2">
          <input
            value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80}
            placeholder={kind === "product" ? "Title (e.g. STAYDOWN Hoodie)" : "Service (e.g. Fresh Fade)"}
            className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-sm placeholder:text-muted-foreground outline-none"
          />
          <input
            value={price} onChange={(e) => setPrice(e.target.value)} maxLength={12}
            placeholder={kind === "product" ? "Price ($40)" : "Price ($25)"}
            className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-sm placeholder:text-muted-foreground outline-none"
          />
          <textarea
            value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={400} rows={3}
            placeholder="Short description"
            className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-sm placeholder:text-muted-foreground outline-none resize-none"
          />
        </div>

        <button
          onClick={submit}
          className="mt-4 w-full py-3 rounded-2xl text-sm font-bold text-primary-foreground"
          style={{ background: "var(--gradient-bronze)", boxShadow: "var(--shadow-glow)" }}
        >
          Publish
        </button>
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */

function BusinessCenter() {
  return <Navigate to="/seller" replace />;
  const [tab, setTab] = useState<TabKey>("overview");
  const [sheet, setSheet] = useState<null | "product" | "service">(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountAmt, setDiscountAmt] = useState("");

  const myProducts = useMemo(() => listings.slice(0, 4), []);
  const myServices = useMemo(() => listings.slice(4, 6), []);

  function createDiscount() {
    if (!discountCode.trim() || !discountAmt.trim()) {
      toast.error("Enter a code and amount");
      return;
    }
    toast.success(`Discount ${discountCode.toUpperCase()} created`);
    setDiscountCode(""); setDiscountAmt("");
  }

  return (
    <AppShell title="BUSINESS">
      {/* Brand header */}
      <section className="px-5 pt-5">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-4">
          <div
            className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full blur-3xl opacity-40"
            style={{ background: "var(--plugu-purple)" }}
          />
          <div className="relative flex items-start gap-3">
            <div className="h-11 w-11 grid place-items-center rounded-2xl bg-[image:var(--gradient-bronze)]">
              <Store className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--plugu-gold)" }}>
                Plug Business Center
              </p>
              <h1 className="text-lg font-bold tracking-tight mt-0.5">Run your hustle like a brand.</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Sell, book, message, and grow — all in one place.
              </p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="relative mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => setSheet("product")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-bronze)" }}
            >
              <Plus className="h-4 w-4" /> Add Product
            </button>
            <button
              onClick={() => setSheet("service")}
              className="flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold border border-border bg-secondary"
            >
              <Plus className="h-4 w-4" /> Add Service
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div tabIndex={0} className="mt-5 px-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium tracking-wide border transition-colors ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <section className="mt-4 mb-6 px-5">
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Revenue · 7d" value="$486" sub="+12% vs last wk" icon={DollarSign} />
              <StatCard label="Orders" value="18" sub="3 to ship" icon={Store} accent="purple" />
              <StatCard label="Bookings" value="9" sub="2 pending" icon={Calendar} accent="purple" />
              <StatCard label="Views · 7d" value="1.4K" sub="+8%" icon={TrendingUp} />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">This week</p>
                <span className="text-[10px] tracking-widest uppercase text-muted-foreground">Revenue</span>
              </div>
              <div className="mt-3"><Bars data={revenueDays} /></div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">Next up</p>
              <ul className="mt-2 space-y-2 text-sm">
                {mockBookings.slice(0, 2).map((b) => (
                  <li key={b.id} className="flex items-center justify-between">
                    <span className="truncate">{b.svc} · {b.client}</span>
                    <span className="text-[11px] text-primary">{b.when}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "products" && (
          <div>
            <SectionHeader title="Your products" action="Add" />
            <div className="grid grid-cols-2 gap-3">
              {myProducts.map((l) => (
                <div key={l.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="aspect-square bg-secondary overflow-hidden">
                    <img src={l.image} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold truncate">{l.title}</p>
                    <p className="text-[11px] text-primary">{l.price}</p>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setSheet("product")}
                className="aspect-square rounded-2xl border border-dashed border-border grid place-items-center text-muted-foreground hover:text-foreground"
              >
                <div className="flex flex-col items-center gap-1">
                  <Plus className="h-5 w-5" />
                  <span className="text-[11px]">New product</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {tab === "services" && (
          <div>
            <SectionHeader title="Your services" action="Add" />
            <ul className="space-y-2">
              {myServices.map((l) => (
                <li key={l.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
                  <div className="h-12 w-12 rounded-xl bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                    {l.title[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{l.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{l.category} · {l.price}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
              <li>
                <button
                  onClick={() => setSheet("service")}
                  className="w-full p-3 rounded-2xl border border-dashed border-border flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4" /> New service
                </button>
              </li>
            </ul>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <SectionHeader title="Orders" action="Export" />
            {mockOrders.length === 0 ? (
              <EmptyState icon={Store} title="No orders yet" description="Share your shop link to start getting sales." />
            ) : (
              <ul className="space-y-2">
                {mockOrders.map((o) => (
                  <li key={o.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
                    <div className="h-10 w-10 grid place-items-center rounded-xl border border-border" style={{ background: "color-mix(in oklab, var(--plugu-gold) 12%, transparent)" }}>
                      <Package className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{o.item}</p>
                      <p className="text-[11px] text-muted-foreground">{o.id} · {o.buyer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{o.total}</p>
                      <p className="text-[10px] text-primary">{o.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "bookings" && (
          <div>
            <SectionHeader title="Bookings" action="Calendar" />
            <ul className="space-y-2">
              {mockBookings.map((b) => (
                <li key={b.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
                  <div className="h-10 w-10 grid place-items-center rounded-xl border border-border" style={{ background: "color-mix(in oklab, var(--plugu-purple) 14%, transparent)" }}>
                    <Calendar className="h-4 w-4" style={{ color: "var(--plugu-purple)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{b.svc}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{b.client} · {b.when}</p>
                  </div>
                  <span className={`text-[10px] tracking-widest uppercase ${b.status === "Confirmed" ? "text-primary" : "text-muted-foreground"}`}>
                    {b.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "messages" && (
          <div>
            <SectionHeader title="Customer messages" action="Inbox" />
            <ul className="space-y-2">
              {mockMessages.map((m) => (
                <li key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border">
                  <div className="relative h-10 w-10 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                    {m.name[0]}
                    {m.unread && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card"
                        style={{ background: "var(--plugu-gold)" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold truncate">{m.name}</p>
                      <span className="text-[10px] text-muted-foreground">{m.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{m.preview}</p>
                  </div>
                  <Link to="/messages" className="text-[11px] font-semibold text-primary">Reply</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "analytics" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Views" value="1.4K" sub="7d" icon={TrendingUp} />
              <StatCard label="Saves" value="86" sub="+22%" icon={ImageIcon} accent="purple" />
              <StatCard label="Conv." value="3.4%" sub="View → buy" icon={BarChart3} />
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">Profile traffic</p>
              <div className="mt-3"><Bars data={trafficDays} accent="purple" /></div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">Top product</p>
              <p className="text-xs text-muted-foreground mt-1">STAYDOWN Hoodie · 412 views · 14 sold</p>
            </div>
          </div>
        )}

        {tab === "revenue" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Lifetime" value="$3,840" icon={DollarSign} />
              <StatCard label="This month" value="$612" sub="Next payout Fri" icon={CreditCard} accent="purple" />
              <StatCard label="Pending" value="$84" sub="Clearing" icon={Receipt} />
              <StatCard label="Tips" value="$22" icon={Sparkles} accent="purple" />
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">Daily revenue</p>
              <div className="mt-3"><Bars data={revenueDays} /></div>
              <Link to="/payment-history" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                Order receipts <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}

        {tab === "discounts" && (
          <div>
            <SectionHeader title="Create discount" />
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <input
                value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} maxLength={20}
                placeholder="Code (PLUG15)"
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-sm outline-none uppercase tracking-widest"
              />
              <input
                value={discountAmt} onChange={(e) => setDiscountAmt(e.target.value)} maxLength={6}
                placeholder="Amount (15% or $5)"
                className="w-full px-4 py-3 rounded-2xl bg-secondary border border-border text-sm outline-none"
              />
              <button
                onClick={createDiscount}
                className="w-full py-3 rounded-2xl text-sm font-bold text-primary-foreground"
                style={{ background: "var(--gradient-bronze)" }}
              >
                Create
              </button>
            </div>
            <p className="mt-4 mb-2 text-xs font-semibold text-muted-foreground tracking-widest uppercase">Active</p>
            <ul className="space-y-2">
              {[
                { code: "FRESH5", offer: "$5 off first cut" },
                { code: "PLUGU15", offer: "15% off with .edu" },
              ].map((d) => (
                <li key={d.code} className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border">
                  <div>
                    <p className="text-sm font-semibold">{d.code}</p>
                    <p className="text-[11px] text-muted-foreground">{d.offer}</p>
                  </div>
                  <Tag className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
                </li>
              ))}
            </ul>
          </div>
        )}

      </section>

      <NewListingSheet open={sheet !== null} onClose={() => setSheet(null)} defaultKind={sheet ?? "product"} />
    </AppShell>
  );
}