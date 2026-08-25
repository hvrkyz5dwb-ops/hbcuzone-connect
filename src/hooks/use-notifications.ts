import { useEffect, useId } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { fetchNotifications, type NotifRow } from "@/lib/notifications-db";

export function useNotifications(): { list: NotifRow[]; unread: number; loading: boolean; isError: boolean; refetch: () => void } {
  const { session } = useSession();
  const uid = session?.user?.id ?? null;
  const qc = useQueryClient();
  // Unique per hook instance: AppShell and the notifications page both mount
  // this hook, and two supabase channels sharing one topic throw
  // "cannot add postgres_changes callbacks after subscribe()".
  const instanceId = useId();

  const q = useQuery({
    queryKey: ["notifications", uid],
    enabled: !!uid,
    queryFn: () => fetchNotifications(100),
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!uid) return;
    const channel = supabase
      .channel(`notif:${uid}:${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` },
        () => { qc.invalidateQueries({ queryKey: ["notifications", uid] }); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [uid, qc, instanceId]);

  const list = q.data ?? [];
  const unread = list.filter((n) => !n.read_at).length;
  return { list, unread, loading: q.isPending, isError: q.isError, refetch: () => void q.refetch() };
}