import { screenBeforePublish } from "@/lib/screen";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/use-profile";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { PageLoader } from "@/components/QueryStates";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-errors";

export const Route = createFileRoute("/profile/edit")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Edit profile — PlugU" },
      { name: "description", content: "Update your public PlugU profile: display name, username, bio, and more." },
    ],
  }),
  component: EditProfile,
});

function EditProfile() {
  const { profile, loading, refetch } = useProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [gradYear, setGradYear] = useState<string>("");
  const [status, setStatus] = useState<"student" | "alumni">("student");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? profile.full_name ?? "");
    setUsername(profile.username ?? "");
    setGradYear(profile.graduation_year ? String(profile.graduation_year) : "");
    setStatus((profile.status as "student" | "alumni") ?? "student");
    setBio(profile.bio ?? "");
    setAvatarUrl(profile.avatar_url ?? "");
  }, [profile?.id]);

  const usernameOk = !username || /^[a-z0-9_]{3,20}$/.test(username);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setErr(null);
    if (username && !usernameOk) {
      setErr("Username must be 3–20 characters: lowercase letters, numbers, or underscores.");
      return;
    }
    const year = gradYear ? parseInt(gradYear, 10) : null;
    if (year && (year < 1950 || year > 2100)) {
      setErr("Enter a graduation year between 1950 and 2100.");
      return;
    }
    setSaving(true);
    try {
      await screenBeforePublish("profile", `${displayName}\n${username}\n${bio}`, profile.id);
    } catch (e) {
      setErr((e as Error).message);
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        username: username.trim() ? username.trim().toLowerCase() : null,
        graduation_year: year,
        status,
        bio: bio.trim() || null,
        avatar_url: avatarUrl.trim() || null,
      })
      .eq("id", profile.id);
    setSaving(false);
    if (error) {
      if (/duplicate|unique/i.test(error.message)) {
        setErr("That username is already taken. Try another.");
      } else {
        setErr(friendlyError(error));
      }
      return;
    }
    await refetch();
    qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Profile updated");
    navigate({ to: "/profile" });
  }

  if (loading || !profile) {
    return (
      <AppShell title="EDIT PROFILE">
        <PageLoader message="Loading your profile…" />
      </AppShell>
    );
  }

  return (
    <AppShell title="EDIT PROFILE">
      <form onSubmit={onSave} className="p-5 space-y-4">
        <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
          <Field label="Display name">
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              maxLength={60} placeholder="Jordan Carter"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          </Field>
          <Field label="Username (public @handle)">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground text-sm">@</span>
              <input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())}
                maxLength={20} placeholder="jordanc"
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            </div>
            <p className="text-[10px] text-muted-foreground">Lowercase letters, numbers, and underscores. 3–20 chars.</p>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Graduation year">
              <input value={gradYear} onChange={(e) => setGradYear(e.target.value)}
                inputMode="numeric" placeholder="2027" maxLength={4}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as "student" | "alumni")}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm">
                <option value="student">Current student</option>
                <option value="alumni">Alumni</option>
              </select>
            </Field>
          </div>
          <Field label="Short bio">
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={280}
              placeholder="What you sell, what you're about, what you're studying."
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
            <p className="text-[10px] text-muted-foreground">{bio.length}/280</p>
          </Field>
          <Field label="Profile photo URL (optional)">
            <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm" />
          </Field>

          <p className="text-[11px] text-muted-foreground">
            School, verification, and rating are managed by PlugU and can't be edited here.
          </p>

          {err && (
            <p className="flex items-start gap-1.5 text-[12px] text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {err}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={() => navigate({ to: "/profile" })} className="rounded-xl border border-border px-3 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}