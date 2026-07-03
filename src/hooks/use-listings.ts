import { useEffect, useState } from "react";
import { listAll, listMine, subscribeListings } from "@/lib/listings-storage";

export function useListings() {
  const [all, setAll] = useState(() => listAll());
  const [mine, setMineState] = useState(() => listMine());
  useEffect(() => {
    const refresh = () => { setAll(listAll()); setMineState(listMine()); };
    refresh();
    return subscribeListings(refresh);
  }, []);
  return { all, mine };
}