import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import pluguLogo from "@/assets/plugu-logo.png";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — PlugU" }] }),
  component: Onboarding,
});

const STEPS = [
  { title: "Welcome to PlugU", body: "The campus marketplace built for HBCU students. Buy, sell, book, and link up." },
  { title: "Find your plug", body: "Tap Market for haircuts, food, rides, tutoring and more — all on your campus." },
  { title: "Live Campus Map", body: "See what's open, what's poppin, and how to get there in real time." },
  { title: "Get verified", body: "Add your .edu email for the trusted badge, campus chats, and student deals." },
  { title: "Become a KingPin", body: "Upgrade to boost listings, feature your vendor page, and rep your campus." },
];

function Onboarding() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <AppShell title="WELCOME">
      <section className="px-5 pt-10 text-center">
        <img src={pluguLogo} alt="" className="h-16 w-16 mx-auto" />
        <h1 className="mt-4 text-2xl font-bold">{step.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">{step.body}</p>

        <div className="mt-6 flex justify-center gap-1.5">
          {STEPS.map((_, idx) => (
            <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-1.5 bg-border"}`} />
          ))}
        </div>

        <div className="mt-8 grid gap-2 max-w-xs mx-auto">
          <button
            onClick={() => last ? navigate({ to: "/" }) : setI(i + 1)}
            className="py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-sm font-medium"
          >
            {last ? "Enter PlugU" : "Next"}
          </button>
          {!last && (
            <button onClick={() => navigate({ to: "/" })} className="text-xs text-muted-foreground">
              Skip
            </button>
          )}
        </div>
      </section>
    </AppShell>
  );
}