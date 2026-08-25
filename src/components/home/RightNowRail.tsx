// RIGHT NOW — what is live on campus this minute: sellers who went active on
// the map, plus flash drops that expire soon. Purely read-only + public data.
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Zap, MapPin, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useActiveCampus, useLivePins } from "@/hooks/use-campus-os";

function minutesLeft(iso: string) {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000));
}

export function RightNowRail() {
  const { campus } = useActiveCampus();
  const pins = useLivePins(campus?.id);

  const drops = useQuery({
    queryKey: ["home-right-now-drops", campus?.id],
    staleTime: 45_000,
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("drops")
        .select("id, body, cta, zone_name, expires_at, price_cents, is_flash")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(6);
      return (data ?? []) as any[];
    },
  });

  const livePins = pins.data ?? [];
  const liveDrops = drops.data ?? [];
  if (!livePins.length && !liveDrops.length) return null;

  return (
    <section className="mt-6" aria-labelledby="right-now-h">
      <div className="flex items-center justify-between px-5">
        <h2 id="right-now-h" className="flex items-center gap-1.5 text-sm font-black tracking-tight">
          <Zap className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} aria-hidden="true" />
          Right now
        </h2>
        <Link to="/map" className="tap text-[11px] font-semibold text-muted-foreground">
          Open map
        </Link>
      </div>

      <ul tabIndex={0} className="mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {livePins.map((p: any) => (
          <li key={p.id} className="w-[220px] shrink-0 snap-start">
            <Link
              to="/map"
              className="tap block h-full rounded-2xl border border-border bg-card p-3.5"
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" /> Active now
              </span>
              <p className="mt-2 truncate text-sm font-bold">{p.label ?? "Student seller"}</p>
              <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3" aria-hidden="true" /> {p.zone_name ?? "On campus"}
              </p>
              {p.expires_at && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden="true" /> {minutesLeft(p.expires_at)} min left
                </p>
              )}
            </Link>
          </li>
        ))}

        {liveDrops.map((d) => (
          <li key={d.id} className="w-[220px] shrink-0 snap-start">
            <Link to="/market" className="tap block h-full rounded-2xl border border-border bg-card p-3.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {d.is_flash ? "Flash drop" : "Drop"}
              </span>
              <p className="mt-2 line-clamp-2 text-sm font-semibold">{d.body}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden="true" /> {minutesLeft(d.expires_at)} min left
                {d.zone_name ? ` · ${d.zone_name}` : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
