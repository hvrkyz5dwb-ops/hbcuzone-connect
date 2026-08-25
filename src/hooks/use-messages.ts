// React Query wrappers + realtime subscriptions for messaging.
import { useEffect, useId } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { subscribeChannel } from "@/lib/realtime";
import {
  listConversations,
  listMessages,
  getConversation,
  unreadTotal,
  type ConversationSummary,
  type DbMessage,
} from "@/lib/messages-db";
import { useSession } from "./use-session";

export function useConversations() {
  const instanceId = useId();
  const { user } = useSession();
  const qc = useQueryClient();

  const query = useQuery<ConversationSummary[]>({
    queryKey: ["conversations", user?.id ?? null],
    enabled: !!user?.id,
    queryFn: listConversations,
    staleTime: 15_000,
  });

  // Live refresh whenever any message the user can see changes.
  useEffect(() => {
    if (!user?.id) return;
    return subscribeChannel(`inbox-${user.id}-${instanceId}`, (ch) =>
      ch
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        qc.invalidateQueries({ queryKey: ["conversations", user.id] });
        qc.invalidateQueries({ queryKey: ["unread-total", user.id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_members" }, () => {
        qc.invalidateQueries({ queryKey: ["conversations", user.id] });
      })
    );
  }, [user?.id, qc, instanceId]);

  return query;
}

export function useUnreadCount() {
  const instanceId = useId();
  const { user } = useSession();
  const qc = useQueryClient();

  const query = useQuery<number>({
    queryKey: ["unread-total", user?.id ?? null],
    enabled: !!user?.id,
    queryFn: unreadTotal,
    staleTime: 10_000,
  });

  useEffect(() => {
    if (!user?.id) return;
    return subscribeChannel(`unread-${user.id}-${instanceId}`, (ch) =>
      ch
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        qc.invalidateQueries({ queryKey: ["unread-total", user.id] });
      })
    );
  }, [user?.id, qc, instanceId]);

  return query.data ?? 0;
}

export function useConversation(id: string | undefined) {
  const instanceId = useId();
  const { user } = useSession();
  const qc = useQueryClient();

  const header = useQuery({
    queryKey: ["conversation-header", id],
    enabled: !!id && !!user?.id,
    queryFn: () => getConversation(id!),
    staleTime: 60_000,
  });

  const messages = useQuery<DbMessage[]>({
    queryKey: ["conversation-messages", id],
    enabled: !!id && !!user?.id,
    queryFn: () => listMessages(id!),
    staleTime: 5_000,
  });

  // Live-append incoming messages for this specific conversation.
  useEffect(() => {
    if (!id || !user?.id) return;
    return subscribeChannel(`conv-${id}-${instanceId}`, (ch) =>
      ch
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          const row = payload.new as DbMessage;
          qc.setQueryData<DbMessage[]>(["conversation-messages", id], (prev) => {
            if (!prev) return [row];
            if (prev.some((m) => m.id === row.id)) return prev;
            return [...prev, row];
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, user?.id, qc]);

  return { header, messages };
}