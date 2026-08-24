// Blocking has to take effect instantly, without a restart. Every surface
// reads the same cached blocklist and the cache is invalidated the moment a
// user blocks or unblocks someone.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBlockedUserIds } from "@/lib/moderation";
import { hiddenContentTags, HIDDEN_CONTENT_EVENT } from "@/lib/ugc-safety";
import { useSession } from "./use-session";

export const BLOCKLIST_KEY = ["blocked-user-ids"] as const;

export function useBlocklist() {
  const { session } = useSession();
  const uid = session?.user?.id ?? null;
  const q = useQuery({
    queryKey: [...BLOCKLIST_KEY, uid],
    enabled: !!uid,
    staleTime: 30_000,
    queryFn: fetchBlockedUserIds,
  });
  const ids = useMemo(() => new Set(q.data ?? []), [q.data]);
  const isBlocked = useCallback((userId?: string | null) => !!userId && ids.has(userId), [ids]);
  return { blockedIds: ids, isBlocked, loading: q.isPending };
}

/** Invalidate every surface that filters on the blocklist. */
export function useRefreshBlocklist() {
  const qc = useQueryClient();
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: BLOCKLIST_KEY });
    qc.invalidateQueries();
  }, [qc]);
}

/** Content the current user hid (via Report or Hide), reactive to changes. */
export function useHiddenContent() {
  const [tags, setTags] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setTags(hiddenContentTags());
    sync();
    window.addEventListener(HIDDEN_CONTENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(HIDDEN_CONTENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const set = useMemo(() => new Set(tags), [tags]);
  const isHidden = useCallback(
    (type: string, id?: string | null) => !!id && set.has(`${type}:${id}`),
    [set],
  );
  return { isHidden };
}

/** Combined filter: hide blocked authors and individually hidden content. */
export function useContentVisibility() {
  const { isBlocked } = useBlocklist();
  const { isHidden } = useHiddenContent();
  return useCallback(
    (item: { type: string; id?: string | null; authorId?: string | null }) =>
      !isBlocked(item.authorId) && !isHidden(item.type, item.id),
    [isBlocked, isHidden],
  );
}
