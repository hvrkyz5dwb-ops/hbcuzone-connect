// Searchable school picker for signup — type-ahead over every US college,
// with an HBCU-only toggle, a state filter and a "Near me" shortcut that
// snaps device location to the closest state.
import { useMemo, useState } from "react";
import { GraduationCap, Loader2, LocateFixed, Search, X, Check } from "lucide-react";
import {
  DIRECTORY_STATES,
  STATE_NAMES,
  nearestState,
  searchSchools,
  type SchoolEntry,
} from "@/lib/school-directory";

export function SchoolPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [hbcuOnly, setHbcuOnly] = useState(false);
  const [state, setState] = useState("");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const results = useMemo(
    () => searchSchools({ query, hbcuOnly, state }, 40),
    [query, hbcuOnly, state],
  );

  function useNearMe() {
    setLocError(null);
    if (!("geolocation" in navigator)) {
      setLocError("Location isn't available on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setState(nearestState(pos.coords.latitude, pos.coords.longitude));
        setOpen(true);
      },
      () => {
        setLocating(false);
        setLocError("Couldn't get your location. Pick a state instead.");
      },
      { timeout: 8000, maximumAge: 300000 },
    );
  }

  function pick(s: SchoolEntry) {
    onChange(s.name);
    setQuery("");
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
        School (search any US college)
      </span>

      {value ? (
        <div className="flex items-center gap-2 rounded-xl border border-primary/50 bg-primary/5 px-3 py-2.5">
          <GraduationCap className="h-4 w-4 shrink-0 text-primary" />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{value}</span>
          <button
            type="button"
            aria-label="Change school"
            onClick={() => {
              onChange("");
              setOpen(true);
            }}
            className="tap rounded-lg p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            placeholder="Search your school (Howard, UCLA, NYU…)"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setHbcuOnly((v) => !v);
            setOpen(true);
          }}
          aria-pressed={hbcuOnly}
          className="tap inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold"
          style={{
            borderColor: hbcuOnly ? "var(--plugu-gold)" : "var(--border)",
            background: hbcuOnly ? "color-mix(in oklab, var(--plugu-gold) 16%, transparent)" : "transparent",
            color: hbcuOnly ? "var(--plugu-gold)" : "var(--muted-foreground)",
          }}
        >
          {hbcuOnly && <Check className="h-3 w-3" />} HBCUs only
        </button>

        <select
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setOpen(true);
          }}
          aria-label="Filter by state"
          className="rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-semibold"
        >
          <option value="">All states</option>
          {DIRECTORY_STATES.map((s) => (
            <option key={s.code} value={s.code}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={useNearMe}
          disabled={locating}
          className="tap inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground disabled:opacity-50"
        >
          {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <LocateFixed className="h-3 w-3" />}
          Near me
        </button>

        {(state || hbcuOnly) && (
          <button
            type="button"
            onClick={() => {
              setState("");
              setHbcuOnly(false);
            }}
            className="text-[11px] text-muted-foreground underline"
          >
            Clear
          </button>
        )}
      </div>

      {state && (
        <p className="text-[11px] text-muted-foreground">
          Showing schools in {STATE_NAMES[state] ?? state}.
        </p>
      )}
      {locError && <p className="text-[11px] text-destructive">{locError}</p>}

      {/* Results */}
      {(!value || open) && (
        <div className="max-h-56 overflow-y-auto rounded-xl border border-border bg-background">
          {results.length === 0 ? (
            <div className="px-3 py-4 text-[12px] text-muted-foreground">
              No school matched. You can still type it in — access is granted by your .edu email.
              {query.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    onChange(query.trim());
                    setOpen(false);
                  }}
                  className="mt-2 block text-primary underline"
                >
                  Use “{query.trim()}”
                </button>
              )}
            </div>
          ) : (
            <ul>
              {results.map((s) => (
                <li key={`${s.name}-${s.state}`}>
                  <button
                    type="button"
                    onClick={() => pick(s)}
                    className="tap flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-secondary"
                  >
                    <span className="min-w-0 flex-1 truncate text-[13px]">{s.name}</span>
                    {s.hbcu && (
                      <span
                        className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black tracking-wider"
                        style={{ background: "var(--plugu-gold)", color: "#0b0b0b" }}
                      >
                        HBCU
                      </span>
                    )}
                    <span className="shrink-0 text-[10px] text-muted-foreground">{s.state}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
