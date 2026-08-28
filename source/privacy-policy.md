# Privacy Policy for PetList

**Effective Date:** August 28, 2026

## Overview

PetList is a mobile app for organizing multi-pet household information: pet
profiles, health records, reminders, weight tracking, daily care tasks, and
expenses. This policy explains what information PetList handles and how it
is used.

PetList does not require an account. Your pet and household records are
stored locally on your device. PetList does not operate a cloud database or
sync service for your records, does not include advertising or
behavioral-tracking software, and does not sell your information.

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

PetList does not ask for your name, email address, or any other contact
information in order to use the app.

## Where Your Information Is Stored

The information above is stored locally, in a database on your device,
along with any photos you add - a pet's profile photo, any photos you
optionally attach to a logged health record, and any photos you optionally
attach to an expense, such as a receipt. Those photos stay associated
with your local PetList data and are not uploaded anywhere; they leave your
device only if you explicitly export or share them (see "Sharing and
Exporting Information" below). PetList does not operate a cloud database or
synchronization service, and its developer does not have access to, or a
copy of, your records at any time.

Because this information exists only on your device, uninstalling PetList
or losing your device without a backup you made yourself (see "Device
Backups" below) means it cannot be recovered by PetList or its developer.

## Network Communication and Service Providers

PetList's own features do not send your pet, health, or expense records
over a network. The app does periodically check for and download
application updates through Expo, PetList's update infrastructure
provider. That process involves standard technical information about your
device and app version, the same as any app update check, and does not
include your pet or household records. Expo's handling of that technical
information is described in its own privacy policy at
<https://expo.dev/privacy>.

## Sharing and Exporting Information

PetList never shares or transmits your information anywhere on its own.
Two features let you choose to do so yourself:

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
developer-operated server. Where the resulting file goes afterward is your
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
at once by uninstalling the app. PetList has no server-side copy to delete
on your behalf, because none exists.

## Children's Privacy

PetList is not directed at children and does not knowingly collect
personal information from anyone, including children under 13 or the
applicable age in your jurisdiction. Because the app requires no account
and collects no personal information to function, it has no means of
distinguishing a child user from any other user.

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

- `package.json` - no analytics, advertising, crash-reporting, or
  backend/cloud SDK is a dependency; no in-app-purchase library, consistent
  with the one-time-purchase App Store model described in the Terms.
- No `fetch`, `axios`, or other outbound HTTP call exists anywhere in the
  app's own code outside of `expo-updates`' built-in update check.
- All persistence is local (SQLite plus local file storage); no remote
  database or storage client exists.
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
- PET-341 (this pass): re-verified against PET-316 (optional photos
  attached to pet-scoped and household expenses, such as receipts).
  `expense-photo-picker.ts` calls the same local `expo-image-picker` module
  the pet-profile and health-event pickers already use - no new permission
  API, no network call. `expense-photos.ts` writes picked photos only to an
  app-owned local directory (`Paths.document/expense-photos`). The backup
  writer includes those files in the same local backup package pet and
  event photos already round-trip through (`backup-data.ts`) - no new
  remote flow, no change to the app's technical privacy posture.

If a future change adds analytics, advertising, cloud sync, a paid
subscription, or any other new data flow, this document needs to be
re-verified against that change before it can be considered accurate.
