import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const NotificationBar = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUserId(user.id);
        fetchNotifications(user.id);
        subscribeToNotifications(user.id);
      }
    });
  }, []);

  const fetchNotifications = async (userId: string) => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("read", false)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
  };

  const subscribeToNotifications = (userId: string) => {
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const dismissNotification = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="bg-[hsl(var(--notification-bg))] text-[hsl(var(--notification-fg))] px-4 py-3 shadow-lg"
        >
          <div className="container mx-auto flex items-center justify-between">
            <p className="text-sm font-medium">{notification.message}</p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-[hsl(var(--notification-fg))] hover:bg-white/20"
              onClick={() => dismissNotification(notification.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
