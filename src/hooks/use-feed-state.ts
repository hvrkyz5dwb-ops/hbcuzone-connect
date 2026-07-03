import { useEffect, useState } from "react";
import { getFeedState, subscribeFeed, type FeedState } from "@/lib/feed-storage";

export function useFeedState(): FeedState {
  const [state, setState] = useState<FeedState>(getFeedState);
  useEffect(() => {
    setState(getFeedState());
    return subscribeFeed(() => setState(getFeedState()));
  }, []);
  return state;
}