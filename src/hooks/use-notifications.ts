import { useEffect, useState } from "react";
import { listNotifications, subscribeNotifications, unreadCount, type PluguNotification } from "@/lib/notifications-storage";

export function useNotifications(): { list: PluguNotification[]; unread: number } {
  const [list, setList] = useState<PluguNotification[]>([]);
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    const refresh = () => {
      setList(listNotifications());
      setUnread(unreadCount());
    };
    refresh();
    return subscribeNotifications(refresh);
  }, []);
  return { list, unread };
}