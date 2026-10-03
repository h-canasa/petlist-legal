# Privacy Policy for PetList

**Effective Date:** August 28, 2026

## Overview

PetList is a mobile app for organizing multi-pet household information: pet
profiles, health records, reminders, weight tracking, daily care tasks, and
expenses. This policy explains what information PetList handles and how it
is used.

PetList does not require you to create an account or sign in. Your pet and
household records are stored locally on your device. PetList does not
operate a cloud database or sync service for those records, does not
include advertising or analytics software, and does not sell your
information.

PetList is local-first, not offline-only. A few features use outside
services, and this policy describes each one: the optional Home Base map,
place search and address lookup (see "Home Base and Location Services"),
the optional Pet ID, which publishes the details you choose to a public
hosted profile (see "Pet ID: Hosted Public Profile"), and app update
checks (see "Network Communication and Service Providers").

## Information You Store in PetList

When you use PetList, you choose what to enter. This may include:

- Household and pet profiles (name, species, breed, birthdate, weight,
  gender, photo)
- Health records, such as vaccinations, deworming, vet visits, medications,
  grooming, spay/neuter records, weight logs, optional photos you attach to
  a logged record, and any notes you add
- Reminders and their scheduling
- Expenses, both per-pet and household-wide, including optional photos you
  attach to an expense (such as a receipt)
- Daily care tasks and their completion history
- App preferences such as currency, units, theme, and notification settings
- Optionally, a Home Base for a pet: a name you choose for the place the
  pet lives or usually stays, an optional map location, and an optional
  street address that PetList looks up from that location (see "Home Base
  and Location Services")

PetList does not ask for your name, email address, or any other contact
information in order to use the app.

## Where Your Information Is Stored

The information above is stored locally, in a database on your device,
along with any photos you add - a pet's profile photo, any photos you
optionally attach to a logged health record, and any photos you optionally
attach to an expense, such as a receipt. Those photos stay associated
with your local PetList data and are not uploaded by PetList for storage;
they leave your device only if you explicitly export or share them (see
"Sharing and Exporting Information" below). PetList does not operate a
cloud database or synchronization service for these records, and its
developer does not receive or hold a copy of your health records,
expenses, reminders, daily tasks, or backups. The exception is the
optional Pet ID, which publishes only the details you choose (see "Pet ID:
Hosted Public Profile").

Because these records exist only on your device, uninstalling PetList or
losing your device without a backup you made yourself (see "Device
Backups" below) means they cannot be recovered by PetList or its
developer.

## Home Base and Location Services

Home Base is optional. If you never open it, none of what follows happens.

**What PetList saves on your device.** A Home Base label you type, an
optional map location (latitude and longitude), and, if one could be
looked up, a street address and any extra data-source credits that came
with it. These are stored with the pet's local record and are included in
your backups. Place-search results themselves are not saved; only the
location you pick is.

**Using your current location.** If you tap "Use Current Location", your
device asks for foreground ("while using the app") location permission,
and PetList reads your position once to centre the map. PetList does not
track your location in the background or continuously, does not track
your pet, and does not keep a location history. The position becomes part
of a Home Base only if you save it. Approximate location is accepted if
that is what your device provides.

**Map display (Mapbox).** The map is provided by Mapbox. To draw it, the
app requests map data from Mapbox, which necessarily reveals the map area
being viewed, together with technical information such as your IP address,
the app and device type, and PetList's Mapbox access token. The map
appears on the Home Base screen and in the Pet ID preview on your device
when that preview includes a Home Base location. PetList turns off
Mapbox's optional usage telemetry. Mapbox's handling of data is described
in its privacy policy at <https://www.mapbox.com/legal/privacy>.

**Place search (Geoapify).** When you type at least three characters into
the Home Base search box, the text you type is sent to Geoapify to return
suggestions, shortly after you pause typing. The request also asks Geoapify
to favour results in your country, which Geoapify works out from your IP
address, so Geoapify receives your IP address as a normal part of the
request. PetList sends no other pet or household information with it.

**Address lookup (Geoapify).** When you save a Home Base with a map
location that is new or changed, PetList sends that location's
coordinates to Geoapify to look up a street address to display. If the
lookup fails, the Home Base is saved without an address. Geoapify's
handling of request data is described in its privacy policy at
<https://www.geoapify.com/privacy-policy/>. Geoapify's place data is
derived from OpenStreetMap contributors.

PetList does not choose, and does not control, how long Mapbox or Geoapify
keep the technical request data they receive. The developer does not
receive that data.

## Pet ID: Hosted Public Profile

Pet ID is optional and is the one feature that deliberately publishes
information about your pet. If you never create a Pet ID, none of this
section applies.

**What it is.** A Pet ID is a QR code and link
(`https://mypetlist.app/p/?id=...`) that lets someone who finds your pet
see how to reach you. For that to work without the finder having PetList
or any account, the details you choose are published to a hosted public
profile on Firebase, Google's app infrastructure. A hosted profile is an
ordinary online copy that exists in addition to the details in your
PetList app.

**What is published.** Only what is listed here, and only when you save a
Pet ID:

- Your pet's name (always included).
- A phone number and/or an email address you enter for this purpose (at
  least one is required), and an optional "If found" note. These are
  published exactly as you typed them.
- Optionally, if you switch them on: your pet's photo (cropped and resized
  on your device to a small square image before upload), your pet's
  temperament traits, and your pet's Home Base name and, if it has one, its
  map location. Each is off unless you turn it on. The street address
  that Home Base lookup may have found is never published.

Breed, species, health records, expenses, reminders, daily tasks, backups,
and the rest of your household's information are not published. Creating a
Pet ID does not upload them.

**Public means public by link.** Anyone who has the QR code or link, such
as a finder who scans a tag, or anyone you or they pass it on to, can open
the profile and read what you chose to publish, without signing in. The
link contains a long random identifier rather than your pet's name, and
the hosted profiles cannot be listed or searched, but anything on a public page should be treated as public. Publish only
contact details you are comfortable sharing with anyone who finds your pet
and the link.

**It stays in step with your pet.** The QR code and link stay the same when
you change a Pet ID. While a Pet ID exists, the published profile is
updated to match your pet's current name and, where you have included them,
photo, temperament, and Home Base. Changing those details in PetList
therefore changes the public profile the next time PetList can connect.

**Technical service identity.** To let your device add, change, or remove
its own hosted profile, PetList uses Firebase Authentication to create a
technical anonymous identifier for the app installation, and Firebase App
Check, which relies on Apple App Attest on iOS and Google Play Integrity on
Android, to confirm the request comes from a genuine copy of PetList.
This is not an account: you do not create, see, or sign in to anything, and
PetList does not ask for your name or email address for it. PetList also
generates a secret update key for each Pet ID, stored on your device and
in backups you create; only a one-way hash of it is kept on the server, and
it is used to check that a request to change or remove a profile comes from
the owner. Firebase, Google, Apple, and Google Play process technical
information such as IP address and device or app information when these
requests are made, under their own policies, including
<https://firebase.google.com/support/privacy> and
<https://policies.google.com/privacy>. The Pet ID photo is uploaded to a
private staging area first and then copied to the public profile.

**When it happens.** PetList contacts these services only when you have
saved, changed, or removed a Pet ID and a change is waiting to be sent.
Households that have never used Pet ID cause no such requests. If you are
offline, the change stays queued on your device and is sent the next time
the app is open and can connect.

**Opening a profile.** When someone opens a Pet ID link, their browser loads
the page from `mypetlist.app` (hosted on GitHub Pages) and reads the
published profile and photo directly from Google's servers. The page has
no login, analytics, or advertising. Those hosts receive ordinary
technical information about the visitor's request, and a visitor who taps
the phone, email, or map link leaves the page for their own phone, email,
or map app.

**Removing a Pet ID.** If you delete a Pet ID, delete the pet, clear the
household's data, or restore a backup that replaces it, PetList asks the
server to remove the public profile and photo. The removal request is
sent when the app can connect: until it succeeds, the profile may remain
available to anyone with the link. If you uninstall PetList or lose the
device before the request has been sent, the request cannot be sent and the
profile may remain online. Delete the Pet ID in the app, and confirm it has
finished removing, before uninstalling. After removal, a minimal
non-public technical record (the identifier, a hash of the update key, and
a deleted status) may remain so the same link cannot be reused. Copies a
finder has already saved, such as a screenshot, a downloaded page, or a
photo, are outside PetList's control, and so are copies in Google's
routine system logs or backups.

## Network Communication and Service Providers

PetList's ordinary features do not send your pet, health, or expense
records over a network. The outside services the app can contact are:

- **Expo (app updates).** The app periodically checks for and downloads
  application updates through Expo, PetList's update infrastructure
  provider. That involves standard technical information about your device
  and app version, the same as any app update check, and does not include
  your pet or household records. Expo's handling of that technical
  information is described in its privacy policy at
  <https://expo.dev/privacy>.
- **Mapbox and Geoapify (Home Base only).** As described in "Home Base and
  Location Services" above.
- **Firebase and Google, with Apple App Attest or Google Play Integrity
  (Pet ID only).** As described in "Pet ID: Hosted Public Profile" above.

When you tap a link inside PetList, such as a store listing or this
policy, the destination site's own privacy practices apply.

## Sharing and Exporting Information

PetList does not share or transmit your pet, health, or expense records
anywhere on its own. Two features let you choose to export them yourself:

- **Vet summary:** generates a PDF summary of a single pet's health
  information and hands it to your device's share sheet.
- **Backup:** creates a single file containing your household's
  information - including any photos you've added, such as pet profile
  photos, photos attached to health records, and photos attached to
  expenses - so you can restore it later or move it to a new device. You
  can also import a backup file to restore it. Either direction can
  likewise hand a file to your device's share sheet or file picker.

Both are created entirely on your device and only run when you choose to
use them. PetList itself never uploads a backup or export to any
developer-operated server. A backup also contains each Pet ID's contact
details and secret update key, so anyone who obtains a backup file could
read them and could change or remove that Pet ID's hosted profile.
Restoring a backup on a device can resume publishing the Pet IDs in it. Where the resulting file goes afterward is your
choice - PetList has no visibility into it and cannot confirm which
destination ultimately received it. If you save or share a file to a
destination you choose (such as cloud storage, messaging, or email), that
destination's own privacy practices apply to it from that point on. A
backup file is not encrypted, so store it somewhere you consider private.

## Notifications and Device Permissions

PetList may ask for permission to send local notifications, so it can
remind you about upcoming health events and daily tasks. These
notifications are scheduled directly on your device; PetList does not use
push notifications or register your device with any notification service.

PetList asks for foreground location permission only if you tap "Use
Current Location" in Home Base (see "Home Base and Location Services").
Declining it does not affect the rest of the app; you can still search for
or place a Home Base location by hand.

PetList may also ask for camera or photo library access when you choose to
add or change a pet's profile photo, attach an optional photo to a logged
health record, or attach an optional photo (such as a receipt) to an
expense. Each request happens only at the moment you use one of these
features - PetList does not access your camera or photo library at any
other time, and attaching a photo is always optional. Declining any of
these permissions does not prevent you from using the rest of the app -
the associated feature is simply unavailable.

## Device Backups

PetList does not provide its own cloud backup or sync service for your
records. However, your device's operating system, or account services you
have separately configured (such as iCloud or a similar account), may back
up PetList's data as part of your device's general backup settings.
Whether that happens, and what it covers, is controlled by your device and
account settings, not by PetList.

## Data Retention and Deletion

Your information stays on your device for as long as you keep it there.
You can delete an individual pet, record, or expense from within the app,
clear or delete a household from Settings, or remove all of PetList's data
at once by uninstalling the app. PetList holds no server-side copy of your
ordinary records to delete on your behalf. The one server-side copy is a
hosted Pet ID profile, which you remove by deleting the Pet ID in the app
(see "Pet ID: Hosted Public Profile" for how and when removal completes);
uninstalling the app does not remove it. Technical request data that Mapbox or
Geoapify received through Home Base (see "Home Base and Location
Services") is held by them under their own policies, and PetList cannot
delete it for you.

## Children's Privacy

PetList is not directed at children and does not knowingly collect
personal information from anyone, including children under 13 or the
applicable age in your jurisdiction. The app requires no account and does
not ask for personal information to function, so it has no means of
distinguishing a child user from any other user. Contact details a user
chooses to publish in a Pet ID are entered and published by that user.

## Changes to This Policy

This policy may be updated from time to time. The current version is
always published at <https://mypetlist.app/privacy-policy/>, and the
effective date above reflects the most recent update.

## Contact

Questions about this policy can be sent to `support@mypetlist.app`.

PetList is developed and operated by Harley Canasa. These practices, and
this policy, are governed by the laws of the Republic of the Philippines,
without regard to its conflict-of-law principles.

---

## How this content was verified against the app

Internal note for maintainers - not part of the published policy (stripped
before rendering; see `petlist-legal/build.js`).

Checked directly against the current codebase rather than assumed:

- `package.json` - no analytics, advertising, or crash-reporting SDK is a
  dependency; no in-app-purchase library, consistent with the one-time-purchase
  App Store model described in the Terms.
- Outbound network surfaces in the app's own code: the two Geoapify
  `fetch` calls (Home Base), the `@rnmapbox/maps` native map (Home Base),
  `expo-updates`' built-in update check, and the optional hosted Pet ID
  path (see below). Nothing else.
- Ordinary persistence is local (SQLite plus local file storage); the only
  remote database/storage client use is hosted Pet ID.
- Every scheduled notification is local; no push-token registration or
  remote push call exists anywhere.
- The vet-summary export and the backup/restore feature are both built
  entirely from local data, write only to the app's own local storage, and
  hand off to the device's system share sheet or file picker - neither
  makes a network call, and neither lets the app observe where a file goes
  or comes from.
- PET-324 (this pass): re-verified against PET-152 (optional photos
  attached to a logged health event) and PET-314 (those photos round-trip
  through Backup & Restore). `event-photo-picker.ts` calls the same local
  `expo-image-picker` module `pet-photos.ts` already used for profile
  photos - no new permission API, no network call. `event-photos.ts` writes
  picked photos only to an app-owned local directory
  (`Paths.document/event-photos`). The backup writer inlines those files as
  base64 into the same local backup document pet photos were already
  included in - no new remote flow. Confirmed the v1.2.0 Vet Summary PDF
  does not include event photos, so no policy language claims otherwise.
- PET-460 (this pass): re-verified the Home Base disclosures against the
  accepted v1.5 source. Geoapify autocomplete (`geoapify-place-search.ts`)
  sends the normalized query (3+ non-whitespace characters, 350 ms
  debounce, `bias=countrycode:auto`) with the client API key; Geoapify
  reverse geocoding (`geoapify-reverse-geocode.ts`) sends the final
  coordinate only at Save/Done, only when changed or address-less.
  `use-current-location-request.ts` makes one foreground permission
  request and one `getCurrentPositionAsync` on tap; `app.json` disables
  always/background/foreground-service location. `home-base-map-view.tsx`
  is the only `@rnmapbox/maps` importer and calls `setTelemetryEnabled(false)`;
  Mapbox tile/style traffic is inherent to rendering and is described
  generically. Home Base persists `{label, coordinate, address{text,
  attributions}}` locally (version 2); search results are never stored.
  Provider retention statements are deliberately not restated here beyond
  linking to each provider's policy.
- PET-496 (this pass): re-verified the hosted Pet ID disclosures against the
  accepted source. `pet-id-desired-profile.ts` is the only projection:
  name, phone/email (>= 1), If Found, and consent-gated Home Base
  (label + coordinate only; no provider address), Temperament and photo
  (all default off); Breed/Species are unrepresentable in
  `pet-id-public-profile.ts`. `pet-id-cloud-runtime.ts` signs in to Firebase
  Auth anonymously, obtains an App Check token (App Attest / Play Integrity;
  debug provider only in `__DEV__`), stages a 512 px JPEG to
  `pet-id-staging/<uid>/...`, and POSTs to the Functions endpoint
  (asia-southeast1). The backend verifies both tokens and the capability
  hash, writes `petIdPublic/<id>` (public `get` only, no list) and the
  backend-only `petIdControl/<id>`, copies the thumbnail to
  `pet-id-public/<id>/<version>.jpg` and deletes the staged object. Delete
  removes the public document and thumbnail and leaves a control record with
  `status: deleted` and the capability hash. `pet-id-publications.ts`
  `queuePetIdRevocation` / `preparePetIdPublicationForPetDeletion` persist a
  `pending_delete` outbox row (backed up, restore-aware) that is flushed on
  foreground; there is no server-side expiry, so an uninstall before a
  successful flush leaves the profile online. `pet-id-reconciliation.ts`
  re-projects name/photo/Temperament/Home Base on changes. Backups include
  `publicId` and `updateCapability`. The finder (`petlist-legal/p/`)
  performs one unauthenticated Firestore REST GET and loads the public
  thumbnail; no analytics. The legacy `pet363/*` Firestore/Storage rules are
  user-scoped and reachable only from the retained spike harness, not the
  shipped product. No household sync is implemented.
- PET-341 (this pass): re-verified against PET-316 (optional photos
  attached to pet-scoped and household expenses, such as receipts).
  `expense-photo-picker.ts` calls the same local `expo-image-picker` module
  the pet-profile and health-event pickers already use - no new permission
  API, no network call. `expense-photos.ts` writes picked photos only to an
  app-owned local directory (`Paths.document/expense-photos`). The backup
  writer includes those files in the same local backup package pet and
  event photos already round-trip through (`backup-data.ts`) - no new
  remote flow, no change to the app's technical privacy posture.

The Effective Date above was deliberately not changed by PET-460/PET-496
because these edits are not yet deployed. It must be set to the actual
publication date in the final approved deployment step, together with the
Terms.

If a future change adds analytics, advertising, cloud sync, a paid
subscription, or any other new data flow, this document needs to be
re-verified against that change before it can be considered accurate.
