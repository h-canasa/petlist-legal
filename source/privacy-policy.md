# Privacy Policy for PetList

> **Reviewed informally — not a substitute for legal advice.**
> This document was grounded in an engineering audit of what the PetList
> app actually does, and its identifying details (entity, contact,
> governing law) have since been filled in with real values. It has still
> never been drafted or reviewed by a qualified privacy lawyer. If you
> have concerns about its legal sufficiency for a particular distribution
> market, have it reviewed before relying on it as final.

**Last updated:** `2026-08-11`

## Overview

PetList ("the app") is a mobile app for organizing multi-pet household
records — vaccination and deworming history, health event timelines, and
expense tracking. This policy explains what information the app handles
and, just as importantly, what it does not.

**The short version:** PetList stores everything you enter — your pets'
profiles, health records, expenses, and photos — in a database on your own
device. As of this writing, the app has no user accounts, does not send
your data to any server the developer operates, includes no analytics or
advertising SDKs, and includes no crash-reporting service. The only
network activity the app performs on its own is checking for app updates
(see "App updates" below).

## Information the app stores

All of the following is entered directly by you and stored **only in a
local SQLite database on your device** (via `expo-sqlite`), plus a local
photos folder in the app's own document storage (via `expo-file-system`)
for pet profile photos:

- Household name(s)
- Pet profiles: name, species, breed, birthdate, weight, gender, photo
- Health event records: vaccinations, deworming, vet visits, medications,
  grooming, neuter/spay records, weight logs, and free-text notes/location
  you enter for any of them
- Reminders and their scheduling (due dates, recurrence, time of day)
- Expense records: amounts, categories, descriptions, dates
- Daily-task checklists and completion history
- App preferences (currency, units, theme, notification settings)

None of this is transmitted to the developer, to the developer's
infrastructure, or to any analytics or advertising company, because no
code path in the app sends it anywhere. It is not backed up to any cloud
service by the app itself. If your device is lost, or the app is
uninstalled, this data is not recoverable by the developer — the developer
never had a copy of it.

**Multiple pets/households:** the app can organize records for more than
one pet or (in principle) more than one household, but this is a purely
local organizational grouping within the on-device database — it is not a
shared or synced feature between different people's devices. Nothing about
adding another pet or household sends anything off your device either.

## Permissions the app requests

### Camera and Photo Library

The app asks for camera and/or photo library access only when you choose
to set or change a pet's profile photo. The photo you pick or take is
copied into the app's own local storage on your device and displayed
within the app. It is not uploaded anywhere. You can deny these
permissions and still use every other feature of the app — a pet simply
has no photo.

### Notifications

The app asks for notification permission so it can remind you about
upcoming health events and daily tasks. These are **local notifications**
scheduled directly on your device by the app itself — the app does not use
push notifications, does not register your device with any push
notification service, and does not collect a device token or any other
identifier for this purpose. You can decline or later revoke notification
permission in your device's Settings; the app continues to show upcoming
items in-app either way, it just won't alert you.

## Exporting a vet summary

PetList can generate a PDF summary of a single pet's health records —
identity details, logged health events, vaccinations, spay/neuter status,
current medications and recent weight readings — and hand it to your
device's own share sheet. It is reached from the "..." menu on that pet's
profile screen and only ever runs when you tap it.

What happens, precisely:

- The PDF is created **on your device**, from data already stored locally.
  Nothing is sent anywhere to produce it.
- It is written to the app's own temporary storage, so your device can
  reclaim that space automatically. It is not added to your photo library
  or to any shared folder.
- It is then passed to your operating system's standard share sheet.
  **Where it goes next is entirely your choice** — PetList does not upload
  it, does not send it anywhere on your behalf, and has no knowledge of
  what you pick. If you send it to another app, that app's own privacy
  policy governs whatever happens to it from that point on.
- Expense records are deliberately excluded from this summary; it contains
  health information only.

## What the app does not do

As of this writing, PetList does **not**:

- Require or offer an account, login, sign-up, or any form of
  authentication
- Collect your name, email address, or any other contact information
  (other than the free-text pet/household names you choose to enter, which
  stay local)
- Include any analytics, advertising, or tracking SDK of any kind
- Include any crash-reporting or error-monitoring service
- Sync or back up your data to any cloud service
- Share, sell, or transmit your data to any third party — including the
  vet summary above, which your device shares at your instruction, not the
  app
- Offer any bulk export of your whole database. The vet summary above is
  the only export that exists, and it covers one pet's health records.
  **A general export/backup feature remains planned (tracked internally as
  PET-70) and has not been built.** If and when it ships, this policy will
  be updated to describe exactly what it does before it's published.

## App updates

PetList uses Expo's over-the-air update service (`expo-updates`) to check
for and deliver app updates without requiring a full app store
reinstall. As part of this, your device communicates with Expo's update
servers, which — like any network request — necessarily involves standard
technical information such as your device's platform and the app's current
version/build. This is operational infrastructure for delivering app
updates, not data collection by the developer, and no data from your
pet/health/expense records is involved. This is a data flow to a
third-party infrastructure provider (Expo), even though no app content is
included in it — Expo's own privacy policy, covering their update/EAS
service, is published at <https://expo.dev/privacy>.

## Children's privacy

PetList is not directed at children and, based on the "What the app does
not do" section above (no accounts, no analytics, no advertising), the
app does not knowingly collect personal information from anyone,
including children under 13 or the relevant age in your jurisdiction.
This assessment is an engineering-level judgment, not a lawyer's review
against COPPA (US) or any other applicable children's-privacy law for the
app's actual distribution markets — treat it accordingly.

## Data deletion

Because all data lives only on your device, you control its deletion
directly:

- Delete an individual pet, health event, or expense from within the app.
- "Clear household data" and "Delete household" (in Profile settings)
  remove all pets and records for a household from the local database.
- Uninstalling the app removes its local database and photo storage
  entirely, per your device OS's normal app-data handling.

There is currently no server-side copy for the developer to delete on your
behalf, because none is ever created.

## Changes to this policy

The current version of this policy is always published at
<https://mypetlist.app/privacy-policy/>. When it
changes, the "Last updated" date at the top of this document will be
updated to match. This app does not currently link to this policy or
notify you in-app of changes to it; if that changes, this section will be
updated to describe how.

## Contact

Questions about this policy: `support@mypetlist.app`

This policy is issued by Harley Canasa, operating as a sole
proprietorship (there is no separate registered company). No physical
mailing address is listed, as none is currently required for this app's
distribution markets; one will be added here if a specific market's
requirements make it necessary.

## Governing law

These practices, and this policy, are governed by the laws of the
Republic of the Philippines, without regard to its conflict-of-law
principles.

---

## How this draft was produced

Written by auditing the actual codebase as of this commit, not assumed
from a template. Specifically checked:

- `package.json` — full dependency list reviewed; no analytics, ads,
  crash-reporting, or backend/cloud SDK of any kind is a dependency.
- Every network-capable call in `src/` — no `fetch`, `axios`, or other
  HTTP client calls exist anywhere in the app's own code.
- `app.json` — confirms the only permission-requesting plugin is
  `expo-image-picker` (camera + photo library, with the exact permission
  strings shown to the user), and confirms `expo-updates`' OTA endpoint is
  Expo's own (`u.expo.dev`).
- `src/lib/database.ts` / `src/lib/schema.ts` — all persistence is local
  SQLite via `expo-sqlite`, no remote database client exists.
- `src/lib/pet-photos.ts` — photos are copied into the app's own local
  document-directory storage (`expo-file-system`), never uploaded.
- `src/lib/notifications.ts` — every scheduled notification is a **local**
  `expo-notifications` trigger; no push-token registration or remote
  push-notification call exists anywhere in the code.
- `src/lib/vet-summary-export.ts` / `src/utils/vet-summary-html.ts` — the
  vet-summary PDF is built from a local HTML string and rendered by
  `expo-print` on-device, written to the app's own cache directory via
  `expo-file-system`, and passed to `expo-sharing`'s system share sheet.
  There is no network call on that path, and the app never learns which
  destination the user picks. Re-audited when that feature shipped
  (PET-232), which is what this section's own closing paragraph requires.
- A general bulk export/backup (ticket PET-70) is still not built — the
  vet summary is scoped to one pet's health records and is the only export
  that exists.

This audit reflects the code as it exists right now. If new dependencies,
permissions, or data flows are added later (analytics, crash reporting,
cloud sync, an export/share feature, etc.), this document needs to be
re-audited and updated before it can be considered accurate again — it is
not "set and forget."

**2026-08-11 (PET-129 follow-up):** all remaining bracketed placeholders
resolved with real values — contact email, entity name, governing law,
Expo's own privacy policy link, and the "changes to this policy" process.
No code or data-practice change prompted this pass, only identifying
details that were previously unfilled; the audit above still reflects the
current codebase. This pass also left the app's own About screen
(`profile.tsx`'s `SUPPORT_EMAIL` constant) out of sync with the real
address used here — fixed in a same-day follow-up, so the two now match.

**2026-08-11 (later same day):** this changelog-style section itself was
removed from the *published* petlist-legal pages (it read as internal
commentary on what's meant to be a finished-looking public document) —
it remains here in the source markdown, which is the actual audit trail
for future engineers. See the petlist-legal repo's own commit history for
the public-site build change.

**2026-08-13 (PET-205 follow-up round 3):** contact address changed from
`petlist.app.support@gmail.com` to `support@mypetlist.app`, now that the
domain-based address is confirmed working. **This reopens the exact
sync gap the 2026-08-11 entry above describes and fixed**: the app's own
About screen (`profile.tsx`'s `SUPPORT_EMAIL` constant, in the main
`petlist` repo) still reads `petlist.app.support@gmail.com` as of this
pass — that repo is out of scope for this change, so the two are
mismatched again until a follow-up updates it there too.

**2026-08-13 (PET-205 follow-up round 5):** the "Changes to this policy"
section's self-referential URL changed from the GitHub Pages address
(`https://h-canasa.github.io/petlist-legal/privacy-policy/`) to the
custom domain (`https://mypetlist.app/privacy-policy/`), now that the
custom domain is the canonical public one. A repo-wide grep for
`github.io` found this as the only remaining hardcoded GitHub Pages
reference outside the site's own internal nav links (which already use
relative paths, unaffected by which domain serves them).
