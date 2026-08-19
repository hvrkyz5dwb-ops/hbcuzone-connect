import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Settings, Heart, ListOrdered, CreditCard, ChevronRight, ShieldAlert, Sparkles, Receipt, ShieldCheck, Store, Briefcase, Scale, LogOut, Pencil, Star, ShoppingBag, GraduationCap, Gift } from "lucide-react";
import { VerifiedStudentBadge } from "@/components/VerifiedStudentBadge";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/hooks/use-profile";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useMyListings } from "@/hooks/use-listings";
import { useSession } from "@/hooks/use-session";
import { ReviewsList } from "@/components/ReviewsList";
import { useQueryClient } from "@tanstack/react-query";
import { signOutAndReset } from "@/lib/sign-out";
import pluguLogo from "@/assets/plugu-logo.png";
import statue from "@/assets/plugu-statue.jpg.asset.json";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — PlugU" },
      { name: "description", content: "Your PlugU profile, listings, saved items, payments, and settings." },
      { property: "og:title", content: "PlugU Profile" },
      { property: "og:description", content: "Your campus profile." },
    ],
  }),
  component: Profile,
});

type MenuItem = { label: string; icon: typeof Heart; to: string };
const baseMenu: MenuItem[] = [
  { label: "Seller Dashboard", icon: Store, to: "/seller" },
  { label: "My Listings", icon: ListOrdered, to: "/seller/listings" },
  { label: "Orders", icon: ShoppingBag, to: "/orders" },
  { label: "Saved", icon: Heart, to: "/saved" },
  { label: "Payment History", icon: Receipt, to: "/payment-history" },
  { label: "Manage Plan", icon: CreditCard, to: "/manage-plan" },
  { label: "Referral Center", icon: Gift, to: "/referrals" },
  { label: "Career & Money Hub", icon: Briefcase, to: "/hub" },
  { label: "Trust Center", icon: Scale, to: "/trust" },
  { label: "Safety & Tools", icon: ShieldAlert, to: "/safety" },
  { label: "Settings", icon: Settings, to: "/settings" },
];

function Profile() {
  return <ProfileInner />;
}

function StatCell({ icon, value, label }: { icon?: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="py-4 text-center">
      <p className="font-bold flex items-center justify-center gap-1">{icon}{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ProfileInner() {
  const { profile } = useProfile();
  const { user } = useSession();
  const { isAdmin } = useIsAdmin();
  const { data: myListings } = useMyListings();
  const queryClient = useQueryClient();
  const displayName = profile?.display_name ?? profile?.full_name ?? "Plug";
  const handle = profile?.username ? `@${profile.username}` : null;
  const isAlumni = profile?.status === "alumni";
  const grad = profile?.graduation_year ?? profile?.year;
  const joined = profile?.created_at ? new Date(profile.created_at) : null;
  const subline = profile
    ? [profile.school_name, grad, profile.major].filter(Boolean).join(" · ")
    : "Set up your profile";
  const menu: MenuItem[] = isAdmin
    ? [...baseMenu, { label: "Admin", icon: ShieldCheck, to: "/admin" }]
    : baseMenu;
  return (
    <AppShell title="PROFILE">
      {/* Cover photo */}
      <section className="relative">
        <div className="relative h-32 overflow-hidden">
          <img src={statue.url} alt="cover" className="absolute inset-0 h-full w-full object-cover object-[50%_30%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-background" />
        </div>
      </section>
      <section className="px-5 -mt-12 text-center relative">
        <div className="mx-auto h-24 w-24 rounded-full border-2 border-primary/60 bg-card grid place-items-center shadow-[var(--shadow-glow)] overflow-hidden">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
            : <img src={pluguLogo} alt="avatar" className="h-16 w-16 object-contain" />}
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
          {displayName} <Crown className="h-5 w-5 text-accent" />
          <VerifiedStudentBadge size="xs" iconOnly />
        </h1>
        {handle && <p className="text-xs text-muted-foreground">{handle}</p>}
        <p className="text-sm text-muted-foreground">{subline}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
          {profile?.verification_status === "verified" && <VerifiedStudentBadge size="sm" />}
          {profile && <PlugScoreBadge profile={profile} />}
          <span className={`inline-flex items-center gap-1 text-[11px] tracking-wider uppercase px-3 py-1 rounded-full border ${isAlumni ? "border-accent/40 text-accent" : "border-primary/40 text-primary"}`}>
            <GraduationCap className="h-3.5 w-3.5" /> {isAlumni ? "Alumni" : "Student"}
          </span>
        </div>
        {profile?.bio && (
          <p className="mt-3 text-sm text-muted-foreground max-w-xs mx-auto">{profile.bio}</p>
        )}
        <div className="mt-4 flex items-center justify-center gap-2">
          <Link to="/profile/edit" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground">
            <Pencil className="h-3 w-3" /> Edit profile
          </Link>
          <button
            onClick={() => signOutAndReset(queryClient)}
            className="tap inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
      </section>

      <section className="mt-5 px-5">
        <div className="grid grid-cols-3 rounded-2xl bg-card border border-border divide-x divide-border">
          <StatCell
            icon={<Star className="h-3.5 w-3.5 text-primary" />}
            value={profile && profile.rating_count > 0 ? profile.rating_avg.toFixed(1) : "—"}
            label={`Rating (${profile?.rating_count ?? 0})`}
          />
          <StatCell
            icon={<ShoppingBag className="h-3.5 w-3.5 text-primary" />}
            value={profile?.completed_transactions ?? 0}
            label="Deals done"
          />
          <StatCell
            value={joined ? joined.toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "—"}
            label="Joined"
          />
        </div>
      </section>

      <section className="mt-5 px-5">
        <ul className="rounded-2xl bg-card border border-border divide-y divide-border">
          {menu.map((m) => {
            const Icon = m.icon;
            return (
              <li key={m.label}>
                <Link to={m.to as "/upgrade"} className="w-full flex items-center gap-3 px-4 py-4 text-sm">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="flex-1 text-left">{m.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {user?.id && (
        <section className="mt-6 px-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-tight">Verified Reviews</h2>
            <Link to="/trust" className="text-[11px] tracking-wider uppercase text-accent inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Trust Center
            </Link>
          </div>
          <ReviewsList userId={user.id} />
        </section>
      )}

      <section className="mt-6 px-5 pb-4">
        <h2 className="text-sm font-semibold tracking-tight mb-3">My Listings</h2>
        {myListings && myListings.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {myListings.slice(0, 9).map((l) => {
              const src = l.images?.[0]?.url ?? null;
              return (
                <Link
                  key={l.id}
                  to="/seller/listings"
                  className="aspect-square rounded-xl overflow-hidden border border-border bg-secondary grid place-items-center text-[10px] text-muted-foreground"
                >
                  {src ? (
                    <img src={src} alt={l.title} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <span className="px-1 text-center">{l.title}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground">You haven't posted any listings yet.</p>
            <Link
              to="/seller/listings"
              className="mt-3 inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Sparkles className="h-3.5 w-3.5" /> Create your first listing
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  );
}