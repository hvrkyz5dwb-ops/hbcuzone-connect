// Home personalization: order + hidden sections, persisted per user.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HOME_SECTIONS, fetchHomeLayout, saveHomeLayout, type HomeSectionKey } from "@/lib/campus-os";
import { useSession } from "@/hooks/use-session";

const DEFAULT_ORDER = HOME_SECTIONS.map((s) => s.key) as HomeSectionKey[];

export function useHomeLayout() {
  const { session } = useSession();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["home-layout", session?.user.id ?? "guest"],
    enabled: !!session,
    staleTime: 5 * 60_000,
    queryFn: fetchHomeLayout,
  });

  const stored = q.data;
  const order: HomeSectionKey[] = (() => {
    const raw = (stored?.section_order ?? []) as HomeSectionKey[];
    const known = raw.filter((k) => DEFAULT_ORDER.includes(k));
    return [...known, ...DEFAULT_ORDER.filter((k) => !known.includes(k))];
  })();
  const hidden = new Set((stored?.hidden_sections ?? []) as HomeSectionKey[]);

  const save = useMutation({
    mutationFn: (next: { order: HomeSectionKey[]; hidden: HomeSectionKey[] }) =>
      saveHomeLayout(next.order, next.hidden),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["home-layout"] }),
  });

  return {
    order,
    hidden,
    loading: q.isPending && !!session,
    toggle(key: HomeSectionKey) {
      const next = new Set(hidden);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      save.mutate({ order, hidden: Array.from(next) });
    },
    move(key: HomeSectionKey, dir: -1 | 1) {
      const i = order.indexOf(key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= order.length) return;
      const next = [...order];
      [next[i], next[j]] = [next[j], next[i]];
      save.mutate({ order: next, hidden: Array.from(hidden) });
    },
    reset() {
      save.mutate({ order: DEFAULT_ORDER, hidden: [] });
    },
    saving: save.isPending,
  };
}
