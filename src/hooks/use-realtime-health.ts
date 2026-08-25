import { useSyncExternalStore } from "react";
import {
  getRealtimeHealth,
  getRealtimeServerHealth,
  subscribeToRealtimeHealth,
  type RealtimeHealth,
} from "@/lib/realtime";

export function useRealtimeHealth(): RealtimeHealth {
  return useSyncExternalStore(subscribeToRealtimeHealth, getRealtimeHealth, getRealtimeServerHealth);
}
