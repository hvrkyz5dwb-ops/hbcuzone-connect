import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SplashScreen } from "@/components/SplashScreen";
import { markSplashPlayed, shouldPlaySplash } from "@/lib/first-launch";
import { supabase } from "@/integrations/supabase/client";
import { RouteErrorFallback, RouteNotFoundFallback } from "@/components/QueryStates";
import { initNative, hideNativeSplash } from "@/lib/native";

function NotFoundComponent() {
  return <RouteNotFoundFallback />;
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const normalizedError = error instanceof Error ? error : new Error(String(error));
  useEffect(() => {
    reportLovableError(normalizedError, { boundary: "tanstack_root_error_component" });
  }, [normalizedError]);

  return <RouteErrorFallback error={normalizedError} reset={reset} />;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" },
      { title: "PlugU — Connecting Campus" },
      { name: "description", content: "Campus marketplace + utility app for HBCU students." },
      { name: "author", content: "PlugU" },
      { property: "og:title", content: "PlugU — Connecting Campus" },
      { property: "og:description", content: "Plug in. Stand out. Stay connected." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "application-name", content: "PlugU" },
      // Mobile install polish — iOS Add to Home Screen + Android PWA.
      { name: "theme-color", content: "#0a0a0a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "PlugU" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "format-detection", content: "telephone=no" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&display=swap",
      },
      { rel: "preload", as: "image", href: "/media/plugu-campus-intro-poster.jpg", fetchPriority: "high" },
      // Browser tab icons — small PNG first so tabs don't fetch the 512px file.
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      // iOS home-screen icon (180x180, flattened — iOS ignores alpha).
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(false);

  // The route is already rendered when this runs. The cinematic therefore
  // never replaces native launch work or delays access to a functioning page.
  useEffect(() => {
    if (!shouldPlaySplash()) return;
    markSplashPlayed();
    setShowIntro(true);
  }, []);

  // One global auth-state subscriber. Keeps the router + query cache in sync
  // with the Supabase session so signed-in/out state propagates everywhere.
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (
        event !== "SIGNED_IN" &&
        event !== "SIGNED_OUT" &&
        event !== "USER_UPDATED"
      ) {
        return;
      }
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      else queryClient.removeQueries({ queryKey: ["profile"] });
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  // Native (iOS/Android) shell bootstrap — no-ops on the web.
  // The launch screen is dismissed unconditionally on first paint, even if
  // the rest of the bootstrap (or any data/auth work) fails or is slow.
  useEffect(() => {
    void hideNativeSplash();
    void initNative();
    const t = setTimeout(() => { void hideNativeSplash(); }, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      {showIntro && <SplashScreen onDone={() => setShowIntro(false)} />}
    </QueryClientProvider>
  );
}
