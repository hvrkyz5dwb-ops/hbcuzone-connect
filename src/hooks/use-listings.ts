import { useQuery } from "@tanstack/react-query";
import {
  fetchMarketplace, fetchMyListings, type DiscoveryFilters, type ListingWithExtras,
} from "@/lib/listings-db";

export function useMarketplace(filters: DiscoveryFilters) {
  return useQuery({
    queryKey: ["marketplace", filters],
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