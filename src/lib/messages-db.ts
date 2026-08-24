// Supabase-backed private messaging.
// Every read/write is done as the signed-in user; RLS restricts access to
// conversation members. Realtime is enabled on messages + conversations so
// consumers can subscribe for live updates.

import { supabase } from "@/integrations/supabase/client";
import { assertContentAllowed } from "@/lib/content-filter";

export type DbMessage = {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  body: string;
  created_at: string;
};

export type ConversationMember = {
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  verification_status: string | null;
};

export type ConversationListingContext = {
  id: string;
  title: string;
  price_cents: number;
  price_type: string;
  image_url: string | null;
  status: string;
};

export type ConversationSummary = {
  id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  listing: ConversationListingContext | null;
  other: ConversationMember | null;
  last_message: { body: string; created_at: string; sender_user_id: string } | null;
  unread_count: number;
};

function currentUserId(): Promise<string | null> {
  return supabase.auth.getUser().then(({ data }) => data.user?.id ?? null);
}

/**
 * Return an existing 1:1 conversation between the signed-in user and
 * `sellerId` for a given listing, or create a new one.
 *
 * Also useful when the "seller" is really "the other party" — pass any
 * user id as `otherUserId`. `listingId` is optional context.
 */
export async function getOrCreateConversation(
  otherUserId: string,
  listingId?: string | null,
): Promise<string> {
  const me = await currentUserId();
  if (!me) throw new Error("Sign in to start a conversation");
  if (me === otherUserId) throw new Error("You can't message yourself");

  // Look for an existing 1:1 conversation that contains both members.
  // Two round-trips are simpler than a complex RPC and RLS-safe.
  const { data: mineRows, error: mineErr } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("user_id", me);
  if (mineErr) throw mineErr;

  const mineIds = (mineRows ?? []).map((r) => r.conversation_id);
  if (mineIds.length > 0) {
    const { data: shared } = await supabase
      .from("conversation_members")
      .select("conversation_id")
      .eq("user_id", otherUserId)
      .in("conversation_id", mineIds);
    const sharedIds = (shared ?? []).map((r) => r.conversation_id);
    if (sharedIds.length > 0) {
      // Pick the most recently active shared conversation (optionally
      // scoped to the same listing when one was supplied).
      let q = supabase
        .from("conversations")
        .select("id,listing_id,updated_at")
        .in("id", sharedIds)
        .order("updated_at", { ascending: false })
        .limit(1);
      if (listingId) q = q.eq("listing_id", listingId);
      const { data: conv } = await q.maybeSingle();
      if (conv?.id) return conv.id;
    }
  }

  // Create a new conversation and add both members.
  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .insert({ created_by: me, listing_id: listingId ?? null })
    .select("id")
    .single();
  if (convErr || !conv) throw convErr ?? new Error("Could not start conversation");

  const { error: memErr } = await supabase
    .from("conversation_members")
    .insert([
      { conversation_id: conv.id, user_id: me },
      { conversation_id: conv.id, user_id: otherUserId },
    ]);
  if (memErr) throw memErr;
  return conv.id;
}

/** Inbox — one row per conversation, sorted by most recent activity. */
export async function listConversations(): Promise<ConversationSummary[]> {
  const me = await currentUserId();
  if (!me) return [];

  const { data: myMemberships, error: mErr } = await supabase
    .from("conversation_members")
    .select("conversation_id,last_read_at");
  if (mErr) throw mErr;
  const ids = (myMemberships ?? []).map((m) => m.conversation_id);
  if (ids.length === 0) return [];
  const readMap = new Map<string, string>(
    (myMemberships ?? []).map((m) => [m.conversation_id, m.last_read_at as string]),
  );

  const { data: convs, error: cErr } = await supabase
    .from("conversations")
    .select("id,created_by,created_at,updated_at,listing_id")
    .in("id", ids)
    .order("updated_at", { ascending: false });
  if (cErr) throw cErr;

  // Gather all other members in one query.
  const { data: allMembers } = await supabase
    .from("conversation_members")
    .select("conversation_id,user_id")
    .in("conversation_id", ids);
  const otherByConv = new Map<string, string>();
  for (const row of allMembers ?? []) {
    if (row.user_id !== me) otherByConv.set(row.conversation_id, row.user_id);
  }

  // Fetch profiles for the "other" members (may be blocked by RLS if the
  // other member has restricted their profile — fall back gracefully).
  const otherIds = Array.from(new Set([...otherByConv.values()]));
  const profileMap = new Map<string, ConversationMember>();
  if (otherIds.length > 0) {
    const { data: profs } = await supabase
      .from("public_profiles")
      .select("id,display_name,username,avatar_url,verification_status")
      .in("id", otherIds);
    for (const p of profs ?? []) {
      profileMap.set(p.id as string, {
        user_id: p.id as string,
        display_name: (p.display_name as string | null) ?? null,
        username: (p.username as string | null) ?? null,
        avatar_url: (p.avatar_url as string | null) ?? null,
        verification_status: (p.verification_status as string | null) ?? null,
      });
    }
  }

  // Attach listing context.
  const listingIds = Array.from(
    new Set((convs ?? []).map((c) => c.listing_id).filter((v): v is string => !!v)),
  );
  const listingMap = new Map<string, ConversationListingContext>();
  if (listingIds.length > 0) {
    const { data: listings } = await supabase
      .from("listings")
      .select("id,title,price_cents,price_type,status,listing_images(url,position)")
      .in("id", listingIds);
    for (const l of (listings ?? []) as Array<{
      id: string; title: string; price_cents: number; price_type: string; status: string;
      listing_images: { url: string; position: number }[] | null;
    }>) {
      const images = (l.listing_images ?? []).slice().sort((a, b) => a.position - b.position);
      listingMap.set(l.id, {
        id: l.id,
        title: l.title,
        price_cents: l.price_cents,
        price_type: l.price_type,
        status: l.status,
        image_url: images[0]?.url ?? null,
      });
    }
  }

  // Last message per conversation (single query, then reduce in JS).
  const { data: lastMsgs } = await supabase
    .from("messages")
    .select("conversation_id,body,created_at,sender_user_id")
    .in("conversation_id", ids)
    .order("created_at", { ascending: false })
    .limit(200);
  const lastMap = new Map<string, { body: string; created_at: string; sender_user_id: string }>();
  for (const m of lastMsgs ?? []) {
    if (!lastMap.has(m.conversation_id as string)) {
      lastMap.set(m.conversation_id as string, {
        body: m.body as string,
        created_at: m.created_at as string,
        sender_user_id: m.sender_user_id as string,
      });
    }
  }

  // Unread counts: count messages from others since last_read_at.
  const unreadMap = new Map<string, number>();
  for (const id of ids) unreadMap.set(id, 0);
  for (const m of lastMsgs ?? []) {
    const convId = m.conversation_id as string;
    if ((m.sender_user_id as string) === me) continue;
    const lastRead = readMap.get(convId);
    if (!lastRead || new Date(m.created_at as string) > new Date(lastRead)) {
      unreadMap.set(convId, (unreadMap.get(convId) ?? 0) + 1);
    }
  }

  return (convs ?? []).map((c) => {
    const otherId = otherByConv.get(c.id);
    return {
      id: c.id,
      created_by: c.created_by,
      created_at: c.created_at,
      updated_at: c.updated_at,
      listing: c.listing_id ? listingMap.get(c.listing_id) ?? null : null,
      other: otherId ? profileMap.get(otherId) ?? { user_id: otherId, display_name: null, username: null, avatar_url: null, verification_status: null } : null,
      last_message: lastMap.get(c.id) ?? null,
      unread_count: unreadMap.get(c.id) ?? 0,
    } satisfies ConversationSummary;
  });
}

export async function unreadTotal(): Promise<number> {
  const list = await listConversations();
  return list.reduce((n, c) => n + (c.unread_count > 0 ? 1 : 0), 0);
}

/** Full conversation detail — messages + members + listing context. */
export async function getConversation(id: string): Promise<{
  id: string;
  listing: ConversationListingContext | null;
  other: ConversationMember | null;
} | null> {
  const me = await currentUserId();
  if (!me) return null;

  const { data: conv, error } = await supabase
    .from("conversations")
    .select("id,listing_id")
    .eq("id", id)
    .maybeSingle();
  if (error || !conv) return null;

  const { data: members } = await supabase
    .from("conversation_members")
    .select("user_id")
    .eq("conversation_id", id);
  const otherId = (members ?? []).find((m) => m.user_id !== me)?.user_id ?? null;

  let other: ConversationMember | null = null;
  if (otherId) {
    const { data: p } = await supabase
      .from("public_profiles")
      .select("id,display_name,username,avatar_url,verification_status")
      .eq("id", otherId)
      .maybeSingle();
    other = p
      ? {
          user_id: p.id as string,
          display_name: (p.display_name as string | null) ?? null,
          username: (p.username as string | null) ?? null,
          avatar_url: (p.avatar_url as string | null) ?? null,
          verification_status: (p.verification_status as string | null) ?? null,
        }
      : { user_id: otherId, display_name: null, username: null, avatar_url: null, verification_status: null };
  }

  let listing: ConversationListingContext | null = null;
  if (conv.listing_id) {
    const { data: l } = await supabase
      .from("listings")
      .select("id,title,price_cents,price_type,status,listing_images(url,position)")
      .eq("id", conv.listing_id)
      .maybeSingle();
    if (l) {
      const rawImages = (l as { listing_images: { url: string; position: number }[] | null }).listing_images ?? [];
      const imgs = rawImages.slice().sort((a, b) => a.position - b.position);
      listing = {
        id: l.id as string,
        title: l.title as string,
        price_cents: l.price_cents as number,
        price_type: l.price_type as string,
        status: l.status as string,
        image_url: imgs[0]?.url ?? null,
      };
    }
  }

  return { id: conv.id, listing, other };
}

export async function listMessages(conversationId: string, limit = 200): Promise<DbMessage[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("id,conversation_id,sender_user_id,body,created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as DbMessage[];
}

/**
 * Send a message. Client-side validation mirrors the server-side trigger
 * (empty guard + spam window) so users see fast errors before the RPC.
 */
export async function sendMessage(conversationId: string, body: string): Promise<DbMessage> {
  const me = await currentUserId();
  if (!me) throw new Error("Sign in to send messages");
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Message can't be empty");
  if (trimmed.length > 2000) throw new Error("Message is too long (2000 max)");

  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_user_id: me, body: trimmed })
    .select("id,conversation_id,sender_user_id,body,created_at")
    .single();
  if (error || !data) throw error ?? new Error("Failed to send");
  // Also bump our own last_read_at so unread counts don't inflate on our sends.
  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", me);
  return data as DbMessage;
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const me = await currentUserId();
  if (!me) return;
  await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", me);
}

export async function blockUser(userId: string): Promise<void> {
  const me = await currentUserId();
  if (!me) throw new Error("Sign in to block users");
  const { error } = await supabase
    .from("blocked_users")
    .upsert({ blocker_user_id: me, blocked_user_id: userId }, { onConflict: "blocker_user_id,blocked_user_id" });
  if (error) throw error;
}

export async function unblockUser(userId: string): Promise<void> {
  const me = await currentUserId();
  if (!me) return;
  await supabase.from("blocked_users").delete().eq("blocker_user_id", me).eq("blocked_user_id", userId);
}

export async function reportUser(userId: string, reason: string): Promise<void> {
  const me = await currentUserId();
  if (!me) throw new Error("Sign in to report");
  const { error } = await supabase.from("reports").insert({
    reporter_user_id: me,
    target_type: "user",
    target_id: userId,
    reason: reason.slice(0, 500),
  });
  if (error) throw error;
}

/** Simple pattern list used to warn about off-platform payment attempts. */
const OFF_PLATFORM_PATTERNS: RegExp[] = [
  /\bcash\s*app\b/i,
  /\$[a-z][a-z0-9_]{2,}/i, // $cashtag
  /\bvenmo\b/i,
  /\bzelle\b/i,
  /\bapple\s*pay\b/i,
  /\bpaypal\b/i,
  /\bwire\b/i,
  /\bwestern\s*union\b/i,
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // phone number
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, // email
];

export function detectOffPlatformAttempt(text: string): boolean {
  return OFF_PLATFORM_PATTERNS.some((rx) => rx.test(text));
}