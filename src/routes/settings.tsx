import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useTheme } from "@/hooks/use-theme";
import { useProfile } from "@/hooks/use-profile";
import { useSession } from "@/hooks/use-session";
import { useQueryClient } from "@tanstack/react-query";
import { signOutAndReset } from "@/lib/sign-out";
import {
  Sun, Moon, Bell, ShieldCheck, CreditCard, Scale, ShieldAlert,
  User, LogOut, ChevronRight, Trash2, Info, LifeBuoy, Bug, FileWarning, FileText, Ban, Mail,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { NotificationCategories, LocationPrivacy } from "@/components/settings/PrivacyAndNotifications";
import { SUPPORT_EMAIL, SUPPORT_RESPONSE_TIME } from "@/lib/support-contact";


export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — PlugU" },
      { name: "description", content: "Manage your PlugU account, appearance, notifications, and privacy." },
      { property: "og:title", content: "PlugU Settings" },
      { property: "og:description", content: "Account, appearance, notifications, and privacy." },
    ],
  }),
  component: SettingsPage,
});

const NOTIF_KEY = "plugu.notifications.enabled";

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { profile } = useProfile();
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [notifs, setNotifs] = useState(true);

  useEffect(() => {
    try {
      const v = window.localStorage.getItem(NOTIF_KEY);
      if (v !== null) setNotifs(v === "1");
    } catch {}
  }, []);

  const toggleNotifs = (v: boolean) => {
    setNotifs(v);
    try { window.localStorage.setItem(NOTIF_KEY, v ? "1" : "0"); } catch {}
    toast.success(v ? "Notifications on" : "Notifications muted");
  };

  const clearLocal = () => {
    try {
      const keys = Object.keys(window.localStorage).filter((k) => k.startsWith("plugu."));
      keys.forEach((k) => window.localStorage.removeItem(k));
      toast.success("Local data cleared");
    } catch {
      toast.error("Couldn't clear local data");
    }
  };

  const email = profile?.email ?? session?.user?.email ?? "—";
  const school = profile?.school_name ?? "—";

  return (
    <AppShell title="SETTINGS">
      <section className="px-5 pt-4">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account, appearance and privacy.</p>
      </section>

      {/* Account */}
      <section className="mt-5 px-5">
        <h2 className="text-[11px] tracking-widest uppercase text-muted-foreground mb-2">Account</h2>
        <div className="rounded-2xl bg-card border border-border divide-y divide-border">
          <Row icon={User} label="Signed in as" value={email} />
          <Row icon={ShieldCheck} label="Verified school" value={school} />
        </div>
      </section>

      {/* Appearance */}
      <section className="mt-5 px-5">
        <h2 className="text-[11px] tracking-widest uppercase text-muted-foreground mb-2">Appearance</h2>
        <div className="rounded-2xl bg-card border border-border p-1 grid grid-cols-2 gap-1">
          <button
            onClick={() => setTheme("dark")}
            className={`tap flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm ${theme === "dark" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
          >
            <Moon className="h-4 w-4" /> Dark
          </button>
          <button
            onClick={() => setTheme("light")}
            className={`tap flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm ${theme === "light" ? "bg-secondary text-foreground" : "text-muted-foreground"}`}
          >
            <Sun className="h-4 w-4" /> Light
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="mt-5 px-5">
        <h2 className="text-[11px] tracking-widest uppercase text-muted-foreground mb-2">Notifications</h2>
        <div className="rounded-2xl bg-card border border-border divide-y divide-border">
          <ToggleRow
            icon={Bell}
            label="Push notifications"
            hint="Likes, orders, messages, rank changes"
            value={notifs}
            onChange={toggleNotifs}
          />
        </div>
      </section>

      <NotificationCategories />

      <LocationPrivacy />

      {/* Privacy & Safety */}
      <section className="mt-5 px-5">
        <h2 className="text-[11px] tracking-widest uppercase text-muted-foreground mb-2">Privacy & Safety</h2>
        <div className="rounded-2xl bg-card border border-border divide-y divide-border">
          <LinkRow to="/blocked" icon={Ban} label="Blocked users" />
          <LinkRow to="/community-guidelines" icon={FileText} label="Community Guidelines" />
          <LinkRow to="/report-problem" icon={FileWarning} label="Report content or a user" />
        </div>
      </section>


      {/* Purchases & Trust */}
      <section className="mt-5 px-5">
        <h2 className="text-[11px] tracking-widest uppercase text-muted-foreground mb-2">Purchases & Trust</h2>
        <div className="rounded-2xl bg-card border border-border divide-y divide-border">
          <LinkRow to="/payment-history" icon={CreditCard} label="Payment history" />
          <LinkRow to="/trust" icon={Scale} label="Trust Center" />
          <LinkRow to="/safety" icon={ShieldAlert} label="Safety & tools" />
        </div>
      </section>

      {/* Privacy & Data */}
      <section className="mt-5 px-5">
        <h2 className="text-[11px] tracking-widest uppercase text-muted-foreground mb-2">Privacy & Data</h2>
        <div className="rounded-2xl bg-card border border-border divide-y divide-border">
          <button onClick={clearLocal} className="w-full flex items-center gap-3 px-4 py-4 text-sm text-left">
            <Trash2 className="h-4 w-4 text-primary" />
            <span className="flex-1">Clear local app data</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <LinkRow to="/delete-account" icon={Trash2} label="Delete account" />
        </div>
      </section>

      {/* Legal */}
      <section className="mt-5 px-5">
        <h2 className="text-[11px] tracking-widest uppercase text-muted-foreground mb-2">Legal</h2>
        <div className="rounded-2xl bg-card border border-border divide-y divide-border">
          <LinkRow to="/terms" icon={Info} label="Terms of Service" />
          <LinkRow to="/privacy" icon={Info} label="Privacy Policy" />
          <LinkRow to="/community-guidelines" icon={FileText} label="Community Guidelines" />
          <LinkRow to="/seller-agreement" icon={FileText} label="Seller Agreement" />
          <LinkRow to="/refunds" icon={FileWarning} label="Refund & Cancellation Policy" />
          <LinkRow to="/prohibited-items" icon={Ban} label="Prohibited Items" />
          <LinkRow to="/safety" icon={ShieldAlert} label="Safety Guidelines" />
        </div>
      </section>

      {/* Help & Safety */}
      <section className="mt-5 px-5">
        <h2 className="text-[11px] tracking-widest uppercase text-muted-foreground mb-2">Help &amp; Safety</h2>
        <div className="rounded-2xl bg-card border border-border divide-y divide-border">
          <LinkRow to="/support" icon={LifeBuoy} label="Contact support" />
          <LinkRow to="/report-problem" icon={Bug} label="Report content or a problem" />
          <LinkRow to="/blocked" icon={Ban} label="Blocked users" />
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="w-full flex items-center gap-3 px-4 py-4 text-sm"
          >
            <Mail className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p>Email the PlugU team</p>
              <p className="text-[11px] text-muted-foreground">{SUPPORT_EMAIL} · replies {SUPPORT_RESPONSE_TIME}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </a>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          PlugU · Trust &amp; Safety, {SUPPORT_EMAIL}. Reports and blocks are reviewed by a human
          moderator, and abusive accounts are warned, suspended or removed.
        </p>
      </section>

      {/* Sign out */}
      <section className="mt-5 px-5 pb-8">
        <button
          onClick={() => signOutAndReset(queryClient)}
          className="tap w-full flex items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-4 py-3 text-sm text-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">PlugU · v1.0</p>
      </section>
    </AppShell>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 text-sm">
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1 text-muted-foreground">{label}</span>
      <span className="text-right truncate max-w-[55%]">{value}</span>
    </div>
  );
}

function LinkRow({ to, icon: Icon, label }: { to: string; icon: typeof User; label: string }) {
  return (
    <Link to={to as "/trust"} className="w-full flex items-center gap-3 px-4 py-4 text-sm">
      <Icon className="h-4 w-4 text-primary" />
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function ToggleRow({
  icon: Icon, label, hint, value, onChange,
}: { icon: typeof User; label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-4 text-sm">
      <Icon className="h-4 w-4 text-primary" />
      <div className="flex-1">
        <p>{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className={`tap relative h-6 w-11 rounded-full transition-colors ${value ? "bg-primary" : "bg-secondary border border-border"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}