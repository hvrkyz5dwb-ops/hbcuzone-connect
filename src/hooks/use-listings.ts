import { useQuery } from "@tanstack/react-query";
import {
  fetchMarketplace, fetchMyListings, type DiscoveryFilters, type ListingWithExtras,
} from "@/lib/listings-db";
import { useSession } from "./use-session";

// Listings are students-only at the database level (no anonymous read path),
// so a signed-out visitor would get "permission denied" and a scary error
// screen. Return an empty result instead and let the auth gate do its job.
export function useMarketplace(filters: DiscoveryFilters) {
  const { user, loading } = useSession();
  return useQuery({
    queryKey: ["marketplace", user?.id ?? null, filters],
    enabled: !loading,
    queryFn: () => (user ? fetchMarketplace(filters) : Promise.resolve([] as ListingWithExtras[])),
    staleTime: 30_000,
  });
}

export function useMyListings() {
  return useQuery<ListingWithExtras[]>({
    queryKey: ["my-listings"],
    queryFn: fetchMyListings,
    staleTime: 10_000,
  });
}