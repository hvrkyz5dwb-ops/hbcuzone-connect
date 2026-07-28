import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { fetchNotifications, type NotifRow } from "@/lib/notifications-db";

export function useNotifications(): { list: NotifRow[]; unread: number; loading: boolean } {
  const { session } = useSession();
  const uid = session?.user?.id ?? null;
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["notifications", uid],
    enabled: !!uid,
    queryFn: () => fetchNotifications(100),
    staleTime: 15_000,
  });

  useEffect(() => {
    if (!uid) return;
    const channel = supabase
      .channel(`notif:${uid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` },
        () => { qc.invalidateQueries({ queryKey: ["notifications", uid] }); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [uid, qc]);

  const list = q.data ?? [];
  const unread = list.filter((n) => !n.read_at).length;
  return { list, unread, loading: q.isPending };
}