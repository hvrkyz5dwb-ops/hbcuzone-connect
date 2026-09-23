import { useQuery } from "@tanstack/react-query";
import {
  fetchMarketplace, fetchMyListings, type DiscoveryFilters, type ListingWithExtras,
} from "@/lib/listings-db";
import { useSession } from "./use-session";

// Marketplace discovery is public. The database exposes only complete,
// approved listings to anonymous visitors; account checks stay on actions
// such as saving, messaging, and checkout.
export function useMarketplace(filters: DiscoveryFilters) {
  const { loading } = useSession();
  return useQuery({
    queryKey: ["marketplace", filters],
    enabled: !loading,
    queryFn: () => fetchMarketplace(filters),
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