import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { messagesList } from "@/lib/mock-data";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Inbox — PlugU" },
      { name: "description", content: "Direct message students, vendors, and sellers in real time." },
      { property: "og:title", content: "PlugU Inbox" },
      { property: "og:description", content: "Direct message students and vendors." },
    ],
  }),
  component: Messages,
});

function Messages() {
  return (
    <AppShell title="INBOX">
      <section className="px-5 pt-5">
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search messages" className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
        </div>
      </section>

      <ul className="mt-4 px-2">
        {messagesList.map((m) => (
          <li key={m.id}>
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-card transition-colors text-left">
              <div className="relative h-12 w-12 shrink-0">
                <div className="h-12 w-12 rounded-full bg-[image:var(--gradient-bronze)] grid place-items-center text-primary-foreground font-bold">
                  {m.name[0]}
                </div>
                {m.unread && (
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-accent border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${m.unread ? "font-semibold" : "font-medium"}`}>{m.name}</p>
                  <span className="text-[11px] text-muted-foreground">{m.time}</span>
                </div>
                <p className={`text-xs truncate ${m.unread ? "text-foreground" : "text-muted-foreground"}`}>{m.preview}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}