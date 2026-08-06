---
name: Auth guard pattern — AppShell owns redirects
description: Auth redirects live in AppShell's effect guard; never add per-route beforeLoad auth gates on ssr:false routes (causes hydration mismatch)
type: constraint
---
All signed-out redirects are handled by the global guard in `src/components/AppShell.tsx` (useEffect → navigate to /auth with `next` param). Do NOT add `beforeLoad` + `supabase.auth.getSession()` redirect gates to routes: on `ssr: false` routes this produces a React hydration mismatch (server renders the pending shell, client renders /auth) with a full tree re-render.

**Why:** 12 routes had duplicate gates that caused hydration failures on every signed-out deep link; removing them fixed the errors and unified behavior with the other 30+ routes.

**Exceptions:** `[.]lovable.oauth.consent` is platform-managed — never touch.

**Signed-in redirects away from public routes (e.g. /auth → home):** also belong in a component `useEffect`, NOT `beforeLoad`. `/auth` previously kept a beforeLoad signed-in redirect; on hard loads the server (no session cookie, session is localStorage-only) rendered AuthPage while the client redirected before hydration → hydration mismatch + "state update on unmounted component". Fixed by moving the check into `AuthPage`'s `useEffect` with `window.location.replace(safeNext(next))`.
