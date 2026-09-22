import { useEffect, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const AUTH_PROMPT_EVENT = "plugu:require-auth";

export function requestAuthentication(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_PROMPT_EVENT));
}

export function RequireAuthPrompt() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useRouterState({ select: (state) => state.location });

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(AUTH_PROMPT_EVENT, show);
    return () => window.removeEventListener(AUTH_PROMPT_EVENT, show);
  }, []);

  const returnTo = `${location.pathname}${location.searchStr || ""}`;
  const goToAuth = (mode: "sign-in" | "sign-up") => {
    setOpen(false);
    navigate({ to: "/auth", search: { next: returnTo, mode } });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="mx-4 w-[calc(100%-2rem)] max-w-sm rounded-2xl border-border">
        <AlertDialogHeader>
          <AlertDialogTitle>Join PlugU</AlertDialogTitle>
          <AlertDialogDescription>
            Create an account or sign in to use this feature.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:space-x-0">
          <AlertDialogCancel className="min-h-11">Cancel</AlertDialogCancel>
          <Button variant="outline" className="min-h-11" onClick={() => goToAuth("sign-in")}>Sign In</Button>
          <Button className="min-h-11" onClick={() => goToAuth("sign-up")}>Sign Up</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}