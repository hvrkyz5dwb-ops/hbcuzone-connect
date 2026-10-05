# PlugU — App Review Walkthrough

## Demo account

- Email: `appreview@plugudemo.com`
- Password: Use the currently verified value in App Store Connect. The
   previously submitted password failed review; do not resubmit until a new
   production credential is verified on a clean iPad install.
- School shown in app: Talladega College (Verified Student)

The account is permanent, pre-confirmed and pre-verified. There is no email
code, SMS code, two-factor step or personal information required. It holds no
admin or moderator privileges. Do not delete or suspend it.

## Policy URLs

- Support: in-app **Settings → Help & Safety → Contact support**
  (`plugusupport@gmail.com`, replies within 1–2 business days)
- Privacy Policy: `/privacy`
- Terms of Service: `/terms`
- Community Standards: `/community-guidelines`
- Safety Center: `/safety`

## Step-by-step

1. **Launch.** The intro plays and is skippable with **Skip**.
2. **Sign in.** On the account screen tap **Sign in**, enter the verified
   App Store Connect credentials, tap **Sign in**. No verification step may
   appear for this account.
3. **Verification state.** At the top of Home, the campus bar shows the school
   name with a green **Verified Student** pill.
4. **Campus feed.** Scroll Home: Happening at [School], Student Services Near
   You, Buy and Sell on Campus, Campus Events, Trending Student Businesses,
   Scholarships and Opportunities, and Campus Safety and Community Standards.
5. **Switch campus.** Tap **Switch campus** in the campus bar, pick another
   HBCU, confirm the feed re-scopes, then tap **Back to [home campus]**.
6. **Marketplace.** Open **Market**. Use the category chips, then the filter
   button: School, Sellers (**Verified students only**), Sort, Max price,
   Fulfillment.

   **Build 17 release gate:** The reviewer account must show active listings
   posted by real, verified Talladega College students. Open a listing, verify
   its price, description and seller profile, and do not proceed if the
   Talladega Market is empty. Never ask the reviewer to create inventory and
   never substitute sample or generated listings.
7. **Listing and seller.** Open a Talladega listing and verify its title,
   description, price, photo and seller profile. Continue through the buyer
   flow only with a genuine, currently available listing.
8. **Search.** Open **Search** and query a service such as "braids" or
   "tutoring"; results are campus-scoped first.
9. **Campus scoping.** Tap **Switch** in the campus bar and choose a different
   school. Content is scoped per school — a listing posted at one campus does
   not appear in another campus's feed. Schools that share a name are
   disambiguated in the picker (for example Lincoln University PA and Lincoln
   University (MO)).
10. **Campus events.** Open **Events**. Same rule as the marketplace: real
    events only, with an honest empty state where a campus has none yet.
11. **News.** Open **News**. Articles come from live public sources with the
    publisher name, the real publish time in your time zone, and a link out to
    the original story. If the source is unreachable you get an empty state
    with **Try again** — never a stand-in story.
12. **Report.** On a listing, profile or message, tap the three-dot menu →
    **Report**, choose a reason, add details, submit. The report is stored
    server-side and enters the moderation queue.
13. **Block and unblock.** Three-dot menu → **Block user**, confirm. Their
    content disappears. **Settings → Blocked users** to unblock.
14. **Location prompt.** Open **Map**. The permission screen explains why
    location is used and offers **Continue** and **Not Now**. Choosing Not Now
    is never re-prompted and the rest of the app stays fully usable; the map is
    campus-only by design.
15. **Policies and support.** Settings → Help & Safety for Terms, Privacy,
    Community Standards, Safety Center and Contact support.
16. **Account deletion.** Settings → Delete account. The flow is real and
    permanent — do not run it on the demo account.

## Guest access

Reviewers do not have to sign in. **Continue as Guest** on the account screen
allows browsing Home, Market, Events, Search, listing details, public profiles,
school pages, News and the Safety Center. Account-based actions (posting,
messaging, saving, reviewing, reporting, blocking, settings) show
"Create an account or sign in to use this feature." with Sign Up, Sign In and
Cancel; Cancel returns to the same screen.

## Checklist

- [x] Demo credentials never expire and require no code, SMS or 2FA
- [x] No screen requires a purchase; PlugU sells no memberships or upgrades in
      the app
- [ ] Build 17: Talladega Market contains active listings from real, verified
   Talladega students, and listing details and seller profiles load.
- [ ] Build 17: If Talladega Market is empty or only contains sample content,
   stop review preparation and obtain genuine seller listings before
   resubmission.
- [x] Report, block, unblock and moderation persist across app restarts
- [x] Terms, Privacy, Community Standards, Safety Center and Support all load
- [x] Single Bundle ID; no separate per-school application
