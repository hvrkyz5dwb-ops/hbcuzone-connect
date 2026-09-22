# PlugU Build 13 App Review Repair

## Goal
Make clean-install guest browsing work without an account, remove reviewer-visible sample or incomplete content, and keep all existing authenticated safety and account controls intact.

## Implementation

1. **Guest entry and navigation**
   - Add a prominent **Continue as Guest** button on the auth screen.
   - Record Terms/Privacy acceptance locally before guest entry without creating an account.
   - Let signed-out visitors remain on Home, Market, Hub, Events, Search, listing details, public profiles, and public campus information.
   - Keep account pages such as settings, orders, saved items, messages, profile editing, and seller management protected.

2. **One consistent account-action prompt**
   - Add a reusable prompt with the exact message: **“Create an account or sign in to use this feature.”**
   - Include working **Sign Up**, **Sign In**, and **Cancel** controls.
   - Preserve the current public URL so Cancel stays on the same screen and authentication can return there.
   - Apply it to selling, messaging, ordering, saving, reviews, reporting, blocking, RSVPs, event creation, organization follows, and similar member-only actions.

3. **Real public data only**
   - Replace mock Search and Events results with approved database content.
   - Remove seeded sample listings and demo sellers from public discovery.
   - Show listings only when title, description, price, category, school, seller identity, and at least one valid image are present.
   - Remove all image fallbacks and hide incomplete rows instead.
   - Keep intentional empty states with clear navigation to available public content; do not expose unfinished calls to action to guests.

4. **Public read permissions and privacy**
   - Add narrowly scoped anonymous read access only for approved, complete public marketplace rows and published campus content needed by guest screens.
   - Expose only public profile fields required for seller/student profile pages; keep email and private account fields inaccessible.
   - Preserve all existing authenticated write policies, block filtering, reporting, moderation, Terms acceptance, and account deletion behavior.

5. **Hide incomplete surfaces**
   - Audit visible navigation, cards, filters, and menus for beta/test/demo/preview/coming-soon language and nonfunctional destinations.
   - Remove or hide reviewer-visible unfinished features while preserving complete HBCU, safety, legal, and real-world goods/services functionality.

6. **Verification**
   - Test a clean browser profile with no session, cookies, or storage: accept Terms, continue as guest, browse every required public screen, open listings/profiles, navigate back, and trigger every protected-action prompt.
   - Repeat key flows at iPad Air 11-inch portrait and landscape sizes, including throttled network conditions.
   - Verify authenticated demo sign-in and the existing report, block/unblock, Terms, privacy, support, and account-deletion paths.
   - Check image responses, console/network failures, horizontal overflow, and touch targets.
   - Run the production build and update the completion checklist with every changed file and any native Mac/Xcode checks that remain outside this environment.

## Technical details
- Use a shared client-side guest-access helper/dialog; no anonymous account is created.
- Public database policies remain read-only and row-limited to approved content.
- No paid upgrades, boosts, subscriptions, bundle-ID changes, destructive migrations, or automatic publishing.
