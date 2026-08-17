// Supabase-backed listings CRUD + discovery.
// Uses the browser client with RLS — signed-in sellers can only write their own rows.

import { supabase } from "@/integrations/supabase/client";
import type { PriceType } from "@/lib/categories";

export type ListingStatus = "draft" | "active" | "paused" | "sold_out" | "removed";
export type ModerationStatus = "pending" | "approved" | "rejected";

export type DbListing = {
  id: string;
  seller_user_id: string;
  business_id: string | null;
  school_id: string | null;
  title: string;
  description: string | null;
  category: string;
  kind: "product" | "service";
  price_cents: number;
  price_type: PriceType;
  campus_name: string | null;
  fulfillment: string[];
  quantity: number | null;
  availability: string | null;
  fulfillment_time: string | null;
  cancellation_policy: string | null;
  status: ListingStatus;
  moderation_status: ModerationStatus;
  favorite_count: number;
  created_at: string;
  updated_at: string;
};

export type ListingWithExtras = DbListing & {
  images: { id: string; url: string; position: number }[];
  seller?: {
    id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
    school_name: string | null;
    verification_status: string | null;
    rating_avg: number | null;
  } | null;
  is_favorited?: boolean;
};

export type DiscoveryFilters = {
  q?: string;
  category?: string;              // category key, e.g. "hair"
  school_id?: string | null;
  campus_scope?: "mine" | "all";  // "mine" filters by school_id
  price_min_cents?: number;
  price_max_cents?: number;
  fulfillment?: string[];         // any of these must overlap
  sort?: "newest" | "rating" | "popular";
  limit?: number;
  offset?: number;
};

const sel = (s: string): string => s;

/** Public marketplace read: only active + approved listings. */
export async function fetchMarketplace(filters: DiscoveryFilters = {}): Promise<ListingWithExtras[]> {
  const limit = filters.limit ?? 24;
  const offset = filters.offset ?? 0;

  let q = supabase
    .from("listings")
    .select(sel(`
      id, seller_user_id, business_id, school_id, title, description, category, kind,
      price_cents, price_type, campus_name, fulfillment, quantity, availability,
      fulfillment_time, cancellation_policy, status, moderation_status,
      favorite_count, created_at, updated_at,
      listing_images ( id, url, position )
    `))
    .eq("status", "active")
    .eq("moderation_status", "approved");

  if (filters.category && filters.category !== "all") q = q.eq("category", filters.category);
  if (filters.campus_scope === "mine" && filters.school_id) q = q.eq("school_id", filters.school_id);
  if (typeof filters.price_min_cents === "number") q = q.gte("price_cents", filters.price_min_cents);
  if (typeof filters.price_max_cents === "number") q = q.lte("price_cents", filters.price_max_cents);
  if (filters.fulfillment && filters.fulfillment.length > 0) q = q.overlaps("fulfillment", filters.fulfillment);
  if (filters.q) q = q.ilike("title", `%${filters.q}%`);

  if (filters.sort === "popular") q = q.order("favorite_count", { ascending: false });
  else q = q.order("created_at", { ascending: false });

  q = q.range(offset, offset + limit - 1);

  const { data, error } = await q.returns<Array<DbListing & { listing_images: { id: string; url: string; position: number }[] }>>();
  if (error) throw error;

  const rows = (data ?? []).map((r) => {
    const images = (r.listing_images ?? []).slice().sort((a, b) => a.position - b.position);
    // strip helper key
    const { listing_images, ...rest } = r as typeof r & { listing_images?: unknown };
    void listing_images;
    return { ...rest, images } as ListingWithExtras;
  });

  // Attach favorite state for the signed-in user, if any.
  const { data: session } = await supabase.auth.getUser();
  const userId = session.user?.id;
  if (userId && rows.length > 0) {
    const ids = rows.map((r) => r.id);
    const { data: favs } = await supabase.from("favorites").select("listing_id").eq("user_id", userId).in("listing_id", ids);
    const set = new Set((favs ?? []).map((f) => f.listing_id));
    for (const r of rows) r.is_favorited = set.has(r.id);
  }

  // Sort by rating requires seller rating join — cheap follow-up query.
  if (filters.sort === "rating") {
    rows.sort((a, b) => (b.favorite_count ?? 0) - (a.favorite_count ?? 0)); // fallback proxy
  }

  // Category placement: KingPin sellers hold the highest placement and
  // Verified Pro sellers are pinned near the top. Array.prototype.sort is
  // stable, so each tier keeps its existing relevance order.
  if (rows.length > 1) {
    const sellerIds = [...new Set(rows.map((r) => r.seller_user_id))];
    const { data: ranks } = await supabase.rpc("seller_plan_ranks", { _seller_ids: sellerIds });
    const list = (ranks ?? []) as unknown as { user_id: string; plan_code: string }[];
    if (list.length > 0) {
      const rankOf = new Map(list.map((r) => [r.user_id, r.plan_code === "kingpin" ? 0 : 1]));
      rows.sort((a, b) => (rankOf.get(a.seller_user_id) ?? 2) - (rankOf.get(b.seller_user_id) ?? 2));
    }
  }

  return rows;
}

/** All listings the caller owns (any status). */
export async function fetchMyListings(): Promise<ListingWithExtras[]> {
  const { data: session } = await supabase.auth.getUser();
  const userId = session.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from("listings")
    .select(sel(`
      id, seller_user_id, business_id, school_id, title, description, category, kind,
      price_cents, price_type, campus_name, fulfillment, quantity, availability,
      fulfillment_time, cancellation_policy, status, moderation_status,
      favorite_count, created_at, updated_at,
      listing_images ( id, url, position )
    `))
    .eq("seller_user_id", userId)
    .neq("status", "removed")
    .order("created_at", { ascending: false })
    .returns<Array<DbListing & { listing_images: { id: string; url: string; position: number }[] }>>();

  if (error) throw error;
  return (data ?? []).map((r) => {
    const images = (r.listing_images ?? []).slice().sort((a, b) => a.position - b.position);
    const { listing_images, ...rest } = r as typeof r & { listing_images?: unknown };
    void listing_images;
    return { ...rest, images } as ListingWithExtras;
  });
}

export async function fetchListing(id: string): Promise<ListingWithExtras | null> {
  const { data, error } = await supabase
    .from("listings")
    .select(sel(`
      id, seller_user_id, business_id, school_id, title, description, category, kind,
      price_cents, price_type, campus_name, fulfillment, quantity, availability,
      fulfillment_time, cancellation_policy, status, moderation_status,
      favorite_count, created_at, updated_at,
      listing_images ( id, url, position )
    `))
    .eq("id", id)
    .maybeSingle()
    .returns<(DbListing & { listing_images: { id: string; url: string; position: number }[] }) | null>();
  if (error) throw error;
  if (!data) return null;
  const images = (data.listing_images ?? []).slice().sort((a, b) => a.position - b.position);
  const { listing_images, ...rest } = data as typeof data & { listing_images?: unknown };
  void listing_images;
  return { ...rest, images } as ListingWithExtras;
}

export type ListingInput = {
  title: string;
  description?: string;
  category: string;
  kind: "product" | "service";
  price_cents: number;
  price_type: PriceType;
  campus_name?: string | null;
  school_id?: string | null;
  business_id?: string | null;
  fulfillment?: string[];
  quantity?: number | null;
  availability?: string | null;
  fulfillment_time?: string | null;
  cancellation_policy?: string | null;
  images?: string[]; // data URLs or remote URLs
  status?: ListingStatus;
};

/** Create a listing (and its images) as the signed-in seller. */
export async function createListing(input: ListingInput): Promise<string> {
  const { data: session } = await supabase.auth.getUser();
  const userId = session.user?.id;
  if (!userId) throw new Error("Sign in to publish a listing");

  const { data: row, error } = await supabase
    .from("listings")
    .insert({
      seller_user_id: userId,
      title: input.title,
      description: input.description ?? null,
      category: input.category,
      kind: input.kind,
      price_cents: input.price_cents,
      price_type: input.price_type,
      campus_name: input.campus_name ?? null,
      school_id: input.school_id ?? null,
      business_id: input.business_id ?? null,
      fulfillment: input.fulfillment ?? [],
      quantity: input.quantity ?? null,
      availability: input.availability ?? null,
      fulfillment_time: input.fulfillment_time ?? null,
      cancellation_policy: input.cancellation_policy ?? null,
      status: input.status ?? "active",
      moderation_status: "approved",
    })
    .select("id")
    .single();
  if (error || !row) throw error ?? new Error("Failed to create listing");

  if (input.images && input.images.length > 0) {
    await replaceImages(row.id, input.images);
  }
  return row.id;
}

export async function updateListing(id: string, patch: Partial<ListingInput>): Promise<void> {
  const { images: _img, ...rest } = patch;
  void _img;
  if (Object.keys(rest).length > 0) {
    const { error } = await supabase.from("listings").update(rest as never).eq("id", id);
    if (error) throw error;
  }
  if (patch.images) await replaceImages(id, patch.images);
}

export async function setListingStatus(id: string, status: ListingStatus): Promise<void> {
  const { error } = await supabase.from("listings").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteListing(id: string): Promise<void> {
  // Soft delete so foreign keys (orders, messages) survive.
  const { error } = await supabase.from("listings").update({ status: "removed" }).eq("id", id);
  if (error) throw error;
}

async function replaceImages(listingId: string, urls: string[]): Promise<void> {
  await supabase.from("listing_images").delete().eq("listing_id", listingId);
  if (urls.length === 0) return;
  const rows = urls.map((url, position) => ({ listing_id: listingId, url, position }));
  const { error } = await supabase.from("listing_images").insert(rows);
  if (error) throw error;
}

/** Toggle a favorite for the signed-in user. Returns the new state. */
export async function toggleFavorite(listingId: string): Promise<boolean> {
  const { data: session } = await supabase.auth.getUser();
  const userId = session.user?.id;
  if (!userId) throw new Error("Sign in to save listings");

  const { data: existing } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", userId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("listing_id", listingId);
    if (error) throw error;
    return false;
  }
  const { error } = await supabase.from("favorites").insert({ user_id: userId, listing_id: listingId });
  if (error) throw error;
  return true;
}
/** Listings the signed-in user has saved, newest save first. */
export async function fetchSavedListings(): Promise<ListingWithExtras[]> {
  const { data: session } = await supabase.auth.getUser();
  const userId = session.user?.id;
  if (!userId) return [];

  const { data: favs, error: favErr } = await supabase
    .from("favorites")
    .select("listing_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(60);
  if (favErr) throw favErr;
  const ids = (favs ?? []).map((f) => f.listing_id);
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("listings")
    .select(sel(`
      id, seller_user_id, business_id, school_id, title, description, category, kind,
      price_cents, price_type, campus_name, fulfillment, quantity, availability,
      fulfillment_time, cancellation_policy, status, moderation_status,
      favorite_count, created_at, updated_at,
      listing_images ( id, url, position )
    `))
    .in("id", ids)
    .returns<Array<DbListing & { listing_images: { id: string; url: string; position: number }[] }>>();
  if (error) throw error;

  const byId = new Map(
    (data ?? []).map((r) => {
      const images = (r.listing_images ?? []).slice().sort((a, b) => a.position - b.position);
      const { listing_images, ...rest } = r as typeof r & { listing_images?: unknown };
      void listing_images;
      return [r.id, { ...rest, images, is_favorited: true } as ListingWithExtras] as const;
    }),
  );
  // Preserve save order, and silently drop listings that were removed.
  return ids.map((id) => byId.get(id)).filter(Boolean) as ListingWithExtras[];
}
