// Campus Hub React Query hooks — real-time RSVP counts, events, orgs.
import { useEffect, useId } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscribeChannel } from "@/lib/realtime";
import { useSession } from "./use-session";
import { useCampusSchoolId } from "./use-campus-scope";
import { useProfile } from "./use-profile";
import {
  addComment, addRsvp, createEvent, deleteEvent, fetchComments, fetchEvents, fetchMyFollows,
  fetchMyRsvps, fetchOrgs, followOrg, removeRsvp, unfollowOrg, updateEvent,
  type EventInput,
} from "@/lib/campus-db";

export function useCampusEvents() {
  const instanceId = useId();
  const { schoolId } = useCampusSchoolId();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["campus-events", schoolId],
    queryFn: () => fetchEvents({ schoolId }),
    staleTime: 20_000,
  });

  // Live RSVP counts + new events without a full refetch storm.
  useEffect(() => {
    return subscribeChannel(`campus-events-live-${instanceId}`, (ch) =>
      ch
      .on("postgres_changes", { event: "*", schema: "public", table: "campus_events" }, () => {
        qc.invalidateQueries({ queryKey: ["campus-events"] });
      })
    );
  }, [qc, instanceId]);

  return query;
}

export function useMyRsvps() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["campus-rsvps", user?.id ?? null],
    enabled: !!user?.id,
    queryFn: () => fetchMyRsvps(user!.id),
    staleTime: 20_000,
  });
}

export function useRsvpToggle() {
  const { user } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, going }: { eventId: string; going: boolean }) => {
      if (!user?.id) throw new Error("Sign in to RSVP");
      if (going) await addRsvp(eventId, user.id);
      else await removeRsvp(eventId, user.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campus-rsvps"] });
      qc.invalidateQueries({ queryKey: ["campus-events"] });
    },
  });
}

export function useCreateEvent() {
  const { user } = useSession();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: EventInput) => {
      if (!user?.id) throw new Error("Sign in first");
      return createEvent(input, user.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campus-events"] }),
  });
}

export function useEventMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["campus-events"] });
  return {
    update: useMutation({
      mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateEvent>[1] }) => updateEvent(id, patch),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: (id: string) => deleteEvent(id), onSuccess: invalidate }),
  };
}

export function useEventComments(eventId: string | null) {
  const { user } = useSession();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["event-comments", eventId],
    enabled: !!eventId,
    queryFn: () => fetchComments(eventId!),
  });
  const post = useMutation({
    mutationFn: async (body: string) => {
      if (!user?.id || !eventId) throw new Error("Sign in first");
      await addComment(eventId, user.id, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["event-comments", eventId] }),
  });
  return { ...query, post };
}

export function useOrgs() {
  const { profile } = useProfile();
  return useQuery({
    queryKey: ["campus-orgs", profile?.school_id ?? null],
    queryFn: () => fetchOrgs(profile?.school_id ?? null),
    staleTime: 60_000,
  });
}

export function useOrgFollows() {
  const { user } = useSession();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["org-follows", user?.id ?? null],
    enabled: !!user?.id,
    queryFn: () => fetchMyFollows(user!.id),
  });
  const toggle = useMutation({
    mutationFn: async ({ orgId, following }: { orgId: string; following: boolean }) => {
      if (!user?.id) throw new Error("Sign in first");
      if (following) await followOrg(orgId, user.id);
      else await unfollowOrg(orgId, user.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-follows"] });
      qc.invalidateQueries({ queryKey: ["campus-orgs"] });
    },
  });
  return { ...query, toggle };
}
