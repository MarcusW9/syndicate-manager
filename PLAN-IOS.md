# Plan: the iOS app (scoping)

Scoped 2026-11-13. **Not started and not scheduled.** This is the plan to pick up when the
game is ready to become an app. Recommendations here are proposals until the owner ticks the
decisions in the next section; facts about Apple's rules were true as far as known on the date
above and must be re-checked at submission time, because they change.

What the repo already has going for it (checked 2026-11-13):

- A static Vite build with relative paths (`base: './'`), fonts bundled (`@fontsource/rajdhani`), no network calls at all in `src/`.
- All storage behind three functions in `src/save/save.js` (`storageGet`, `storageSet`, `storageRemove`).
- Save export and import as a file (`exportSave`, `importSave`), three slots, a backup per slot, and saves that can't be opened are kept aside, never overwritten (`unreadableSave`).
- `viewport-fit=cover` in `index.html`; only six `:hover` rules in `src/ui/styles.css`.
- No accounts, no purchases, no analytics, no ads.

**Read with this:** `drafts/REVIEW-2026-11-13.md`, the code review for the phone made the same day. It measured several things this plan depends on; its item numbers are cited below as (review N).

## Decisions for the owner

| # | Decision | Recommendation | Status |
| --- | --- | --- | --- |
| 1 | Wrapper | **Capacitor** (see Phase 2) | open |
| 2 | Price model: paid app, free, or free with a paid unlock | Decide before Phase 2. A paid app needs no purchase code. Anything bought inside the app must use Apple's in-app purchase. (`DESIGN.md` open question "Monetisation".) | open |
| 3 | Does the web version stay live after the app ships? | Yes, as the free demo and the route for existing saves. Needs the release rule in Phase 3. | open |
| 4 | Analytics | Start with Apple's own (no code, no privacy cost). Build the event layer with nothing attached. Add a service only when a question needs it (see Analytics). | open |
| 5 | Android later? | If yes, Capacitor covers it with the same code. | open |
| 6 | iCloud sync between a player's devices | Not at launch. Device backups already protect saves; sync adds conflict bugs. | open |
| 7 | Final names (title, city, districts in `src/config/names.js`) | Must be final and checked for trademark clashes before submission. | open |

## Needed before any native work

- A Mac with a current Xcode, and an Apple Developer account (US$99 a year).
- A real iPhone for testing. The simulator does not show memory pressure, real keyboard behaviour or true touch sizes.
- Cloud sessions cannot build or run iOS. Native steps run on the owner's Mac; sessions can write the code, config and tests.

## Phases, in order

### Phase 1 · Phone audit on the web build (can be done any time)

Cheap, needs no Mac, and everything it fixes also improves the web game.

- Script with Playwright at 360, 390 and 430px across every screen in `docs/SCREENS.md`: measure every tap target (44px minimum), flag sideways overflow, flag text under a readable size.
- Check the six `:hover` rules and any `title=` attributes: nothing may be shown on hover only.
- Check every fixed or sticky bar uses `env(safe-area-inset-*)`.
- Long-run check: play 200+ days hands-off in one page and watch memory and DOM size, because a WebView that runs out of memory is killed without warning.
- Start from what the review already found: controls under 44px at 360px (review 5), touch behaviour not set for the whole page (review 10), two hints that exist only as hover titles (review 11).
- Two fixes that belong here because they are plain web work and the app depends on them: **an in-game confirm sheet** in place of the 13 `confirm()` and `alert()` calls, which show as system alerts in a wrapper (review 3); and **a banner when a save fails**, since `saveGame`'s result is ignored today and three full slots can pass the browser's storage limit (review 1).
- Output: a list of fixes, then the fixes, with a screenshot set as usual.

### Phase 2 · The shell

**Capacitor**, because the game is a static web build with no native features.

- Rejected: a hand-written WKWebView shell (the storage bridge, file import and share sheet would all be written by hand in Swift); a rewrite in Swift or React Native (throws away `src/ui/` for no gain in a text-first game); a home-screen web app only (no App Store presence, and iOS can clear its storage).
- Add a build flag (for example `VITE_TARGET=ios`) so the app build: skips the service worker (`src/offline/serviceWorker.js`; the files ship inside the app), and hides web-only wording ("reload the page").
- Fix the app's WebView address (scheme and hostname) on day one and never change it. Anything stored by the WebView is tied to it.
- Plugins expected: Filesystem (saves), Share (export a save), App (pause and resume events), Status Bar, Splash Screen. Haptics is optional.
- Oldest iOS supported: **16**, set by the CSS and JavaScript already in use (review 9). State it in the Xcode project and the store listing.
- Lock to portrait unless the phone audit shows landscape works.
- Things to test only on a device: the keyboard pushing the layout, rubber-band scrolling, the notch and home bar, the swipe-back gesture, text selection and the long-press menu on buttons.

### Phase 3 · Saves (the part that must not go wrong)

Two separate problems.

**A. Where saves live in the app.**

- Not in the WebView's `localStorage`: iOS can clear it when the phone is short on space.
- Store each key as a file in the app's Documents folder. That folder is included in the phone's iCloud and computer backups, so a new phone restores the saves with no code from us.
- The three storage functions are synchronous and native storage is not, so this is more than swapping three functions: `main.js` loads and mounts at once, and prefs are read while screens draw (review 2). Keep the rest of `save.js` untouched by: reading every save key into memory at start, before the first screen is drawn; serving reads from memory; writing through to disk in the background.
- Write safely: write to a temporary file, then rename over the old one, so a crash mid-write cannot leave half a save. The per-slot backup stays as the second line of defence.
- Flush pending writes when the app goes to the background (the App plugin's pause event). iOS may kill a backgrounded app at any time.
- Save size: measured at about 270,000 characters after 52 weeks, the same again for the backup, and mostly inbox (review 1 and 8). Files have no 5 MB limit, but every tap writes the whole save (review 7): measure again at day 500+ and write behind, not on every tap.
- Keys to carry (from `save.js`): `syndicate-slot-N`, `-backup`, `-unreadable`, `syndicate-active-slot`, `syndicate-ironman-progress`, `syndicate-pref-*`, and the legacy `syndicate-save-v1`.

**B. Getting a web save into the app.**

- The app cannot read Safari's storage for the GitHub Pages site. The only route is the file: export on the web, import in the app.
- Web side, before launch: make export easy to find, and tell players why.
- **Export does not work in a WebView as written:** it clicks a download link, which `WKWebView` ignores (review 4). In the app, export hands the file to the share sheet (a fourth function in `save.js` beside the storage three). The backup reminder points at this button, so it must work.
- App side: import through the Files picker, and accept a save file opened from Files, Mail or AirDrop ("Open in..."), which needs a declared file type. Give exported saves their own extension then, and keep reading the old one.
- `migrate` is the same code in both, so a v1 web save loads in the app exactly as it does on the web.

**Tests to add (in `tests/saves.test.js` or beside it):**

- Real exported save files from several old versions kept as fixtures (at least: the oldest still around, v50, and the version live at app launch), each loaded and checked.
- The storage layer against a fake async backend: a write interrupted before it lands leaves the old save readable; start-up with a damaged file falls back to the backup.
- A save newer than the app is refused and kept aside (already the behaviour; pin it with a test).

**Release rule (needed if decision 3 is yes).** The web deploys in minutes; the app waits for review. A player could export from the web a save newer than the app can read. `save.js` already refuses these without harm, but the player is stuck until the update. Rule: a change that bumps `SAVE_VERSION` goes to the App Store first, and the web build follows once the app update is live. The "newer version" message needs app wording ("update the app").

### Phase 4 · TestFlight

- Internal testing first, then a small outside group through TestFlight, with real web saves imported.
- Watch for: lost or reset saves (must be zero), crashes on long sessions, anything the phone audit missed.

### Phase 5 · App Store pass, then submit

See the next three sections. Do a full pass against the current guidelines in the week of submission.

## Privacy and data

The game collects nothing, which is the easiest position there is. Keep it that way unless a decision here changes it.

| Item | What's needed |
| --- | --- |
| Privacy label (App Store Connect) | "Data Not Collected", as long as no analytics service or crash reporter that sends data is added. |
| Privacy policy | Apple requires a public URL for every app, even ones that collect nothing. One short page (can live on the GitHub Pages site): what's stored (saves, on the device only), what's collected (nothing), contact. |
| Privacy manifest (`PrivacyInfo.xcprivacy`) | Apple requires a declared reason for certain system calls, including reading file timestamps and `UserDefaults`. Capacitor and its plugins ship their own; the app needs one too. Check the list against the plugins actually used. |
| Tracking prompt (App Tracking Transparency) | Not needed: no tracking, no ad identifier. Never add an SDK that uses one. |
| Encryption question | The app uses no encryption of its own. Set `ITSAppUsesNonExemptEncryption` to `NO` in `Info.plist` so the question isn't asked on every upload. |
| Accounts | None, so the account-deletion rule doesn't apply. |
| Children | Not for children: don't list in the Kids category. No age gate needed beyond the store rating. |
| EU and UK law (GDPR) | With nothing collected there is nothing to consent to. This changes if analytics are added: see below. |
| Player's own data | Saves stay on the device and in the player's own backups. Export gives them a copy; deleting the app deletes everything. Say so in the policy. |

Not legal advice: for the policy text and any analytics, have someone qualified read it if the game earns money.

## App Store review: what to check

A model can't say how Apple will rule. These are the things worth checking.

- **"It's just a website" (guideline 4.2).** The common rejection for wrapped web apps. The answer is that it behaves like an app: works offline, saves as files, no browser bars, proper safe areas, no links out to a web version for core play.
- **Age rating.** Answer the questionnaire honestly: organised crime, violence in text and on the job map, death of crew, and whatever the jobs contain on drugs, alcohol and gambling (the racecourse, any dens). Review `src/data/missions/` against each question when filling it in. Expect a teen-or-older rating. Apple changed its rating bands in 2025; use the current form.
- **Purchases (3.1.1).** None today. If decision 2 adds any, they go through Apple's in-app purchase, with a "restore purchases" button, and the web version must not be advertised in the app as a cheaper place to buy.
- **Real places and people.** The setting uses real Hong Kong geography with invented firms, gangs, police units and people (`DESIGN.md`, 2026-10-24). Before submission, read the content once more for anything that reads as a real organisation or living person.
- **Mainland China storefront.** Games need a government licence number to be sold there. Leave that storefront unticked.
- **Art and fonts.** Confirm the right to ship every asset commercially: Rajdhani's licence (Open Font License) allows it; check the portraits and any generated art against the terms of the tool that made them.
- **Store listing.** Screenshots at the required sizes (the screenshot script can produce them), an icon with no transparency, a support URL, and a description that matches what the app does.
- **Review notes.** Tell the reviewer there's no login and how to reach a job quickly, so they see the game and not just the menu.
- **Completeness (2.1).** No placeholder text, no dead buttons, no crashes on the first run. The placeholder names in `src/config/names.js` count.

## Analytics and funnels

Worth scoping now, cheap to defer. The honest position: analytics are only worth their cost when there are enough players for the numbers to mean something and a decision waiting on them. Before that, playtests and the sims in `scripts/` tell more. The cost is real: any service that receives events ends "Data Not Collected" and adds a line to the privacy policy.

**Three levels, cheapest first.**

| Level | What it is | Privacy cost | When |
| --- | --- | --- | --- |
| 0 | **Apple's App Analytics and crash reports** in App Store Connect. Store page views to downloads, sessions, retention at day 1, 7 and 28, crashes. Only from players who agreed to share with developers. | None. No code, label stays "Data Not Collected". | At launch. |
| 1 | **The event layer with nothing attached.** One `track(name, props)` function in a new `src/telemetry/` module (the only code allowed to send anything, like `save.js` for storage). The default backend does nothing. Calls are made from `src/ui/`, never from `src/core/`. | None while the backend does nothing. | Build with the app, so the game is ready. |
| 2 | **An anonymous, cookieless service** behind that function (candidates to compare at the time: TelemetryDeck, Aptabase, PostHog). No user ID that follows a person, no ad identifier, no IP stored. | Label becomes "Usage Data, not linked to you, not used for tracking". Policy updated. An off switch in settings. | Only when a question below can't be answered at level 0. |

Rejected: ad-network or attribution SDKs (they need the tracking prompt and work against the game's tone); recording screens or taps wholesale; anything that sends save contents.

**The funnels worth measuring (level 2 events, named now so level 1 can be wired once).**

1. **First session.** `app_open` → `new_game_started` → `first_job_planned` → `first_job_finished` → `first_week_ended`. Where do new players stop? This is the one most likely to change the design.
2. **Coming back.** Second session within a day, a week, a month (Apple gives this at level 0); `day_reached` at 7, 30, 100, 365 game days for how far runs go.
3. **How a run ends.** `run_ended` with a reason (broke, crew wiped, walked away), the game day, the tong's rank. Shows whether the economy or the difficulty ends runs.
4. **Feature use.** Hands-off runs against played jobs, side tasks, scouting and signings, hall building, risk level picked (cautious, steady, committed). Shows what's ignored.
5. **Deaths.** `runner_died` with which accepted risk it followed. Checks the design promise holds in the wild and how it feels in practice.
6. **Save health.** `save_unreadable`, `backup_restored`, `save_imported`, `save_exported`. A lost save is the worst bug; this is the alarm for it.
7. **If something is sold (decision 2).** Paywall seen → purchase started → purchase finished, and restore.

Rules for every event: no free text, no runner or save names, no identifiers; coarse values only (bands, not exact cash); a version and platform tag on each.

**The web build.** The same `track()` could be switched on for the web playtest build sooner, which is where the first-session funnel would teach the most. It would need the privacy page first, and cookieless anonymous counting is the form least likely to need a consent banner in the EU and UK; check before turning it on.

## Being stuck

Native build errors and WebView-only bugs (keyboard, scrolling, memory on long runs) can't be reproduced in a cloud session. Bring the exact Xcode error or a description of what the device does, with the iOS version and the device model.
