# Terms of Service for PetList

**Effective Date:** August 19, 2026

## 1. Acceptance of Terms

By downloading, installing, or using PetList ("the app"), you agree to
these Terms of Service. If you do not agree, do not use the app. By using
PetList, you represent that you are of legal age to accept these terms in
your jurisdiction, or that you have a parent's or guardian's permission to
do so.

## 2. About PetList

PetList is an organizational tool for tracking pet and household
information: pet profiles, health-event history, reminders, weight
tracking, daily care tasks, and expenses. Grouping pets into a "household"
is an organizational feature within the app on your device - it does not
sync or share information between different people's devices. PetList does
not provide household sync or a user account. It also offers two optional
features that use outside services: a Home Base location picker, and Pet
ID, which publishes the recovery details you choose to a public page (see
sections 5 and 9).

## 3. Not Veterinary Advice

PetList is not a veterinary or medical service. Nothing in the app,
including its reminders, due-date calculations, or any record or summary
it displays, constitutes veterinary advice, diagnosis, or treatment.
Reminders and summaries reflect only the information you enter; PetList
does not verify that any schedule or record is appropriate for your pet's
actual health needs. Always consult a qualified veterinarian regarding
your pet's health and medical care, and do not treat information generated
by PetList as a substitute for professional veterinary advice.

## 4. Your Data and Responsibilities

You are responsible for the accuracy of the information you enter into
PetList. As described in the Privacy Policy, your care records (pet
profiles, health records, reminders, expenses, daily tasks, and photos) are
stored locally on your device. Except for the specific Pet ID recovery
details you explicitly choose to publish, PetList does not maintain a cloud
copy of your household and care database. PetList's backup feature lets you create your own backup file and
restore from it, but keeping and safeguarding that file is your
responsibility; a backup file is not encrypted and includes your Pet ID
contact details and update keys. Because PetList does not hold a copy of
those records, it cannot recover data that is lost without a backup you
made yourself.

## 5. Pet ID and Public Information

Pet ID is optional. When you create one, the details you choose to include
are published to a hosted public page, reachable through a QR code and link
that are designed to be readable by anyone who has them, without signing in
or using PetList. You decide what to include, and you are responsible for
publishing only information you are entitled and willing to make public,
including any phone number or email address that belongs to someone else.
Do not include information you do not want a finder, or anyone the link is
passed to, to see.

Updating your pet's details in PetList updates the published page, and
deleting a Pet ID asks for its removal, which completes only when the app
can reach the service (see the Privacy Policy). Pet ID is a convenience for
reuniting lost pets with their owners; PetList does not guarantee that the
page will be available, that a finder will see or act on it, or that a lost
pet will be found. Do not use Pet ID to publish unlawful, abusive, or
misleading content or other people's information without their permission.

## 6. License to Use PetList

Subject to these terms, PetList grants you a limited, non-exclusive,
non-transferable, revocable license to install and use the app on devices
you own or control, for lawful pet-care and household-organization
purposes - including as an individual owner, foster caregiver, pet sitter,
or small rescue organizing animals in your care.

## 7. Acceptable Use

You agree not to:

- Reverse-engineer, decompile, or disassemble the app, except to the
  extent applicable law expressly permits despite this restriction
- Use the app for any unlawful purpose
- Attempt to interfere with the app's operation or security

## 8. Intellectual Property

PetList, including its design, code, artwork, and branding, is owned by
Harley Canasa and protected by applicable intellectual property laws.
These terms do not grant you any ownership interest in the app itself. You
retain all rights to the content you enter into PetList, such as pet
names, notes, and photos.

## 9. Third-Party Services and App Stores

PetList may be distributed through third-party app stores, such as the
Apple App Store and Google Play. Your use of that store, and your purchase
or download of PetList through it, is also governed by that store's own
applicable terms.

Some optional features rely on third-party services: Mapbox and Geoapify
for the Home Base map, place search, and address lookup, and Firebase and
Google, with Apple App Attest or Google Play Integrity, for Pet ID. Expo
provides app updates. These services operate under their own terms and
privacy policies, and PetList does not control their availability or
accuracy. Map and address results may be inaccurate or unavailable.

## 10. Availability and Changes

PetList is currently offered as a one-time paid download rather than a
subscription. Features may be added, changed, or removed over time, and
the app may receive periodic updates. PetList does not guarantee
uninterrupted availability of the app or of any particular feature,
including features that depend on third-party services such as Home Base
search and Pet ID.

## 11. Disclaimer of Warranties

THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY
KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. PetList does not
warrant that its reminders, records, or exported summaries are accurate,
complete, or sufficient for your pet's actual care needs.

## 12. Limitation of Liability

To the maximum extent permitted by applicable law, Harley Canasa shall not
be liable for any indirect, incidental, special, consequential, or
punitive damages, or any loss of data, arising out of or related to your
use of, or inability to use, PetList - including any harm to a pet
resulting from reliance on information the app displays or produces.
Because your care records are stored on your device, PetList is not in
a position to prevent, mitigate, or recover from their loss.

## 13. Termination

You may stop using PetList at any time by uninstalling it, which also
removes its locally-stored data from your device. Uninstalling does not
remove a published Pet ID page. If you want the hosted page removed, delete
the Pet ID in the app and wait for the removal to complete before you
uninstall (see the Privacy Policy). PetList has no user account system, so there is no
mechanism for the developer to restrict access to a copy you have already
installed; removal of PetList from an app store
affects new downloads, not a copy already on your device.

## 14. Governing Law

These terms, and any dispute arising from them or your use of PetList, are
governed by the laws of the Republic of the Philippines, without regard to
its conflict-of-law principles.

## 15. Changes to These Terms

These terms may be updated from time to time. The current version is
always published at <https://mypetlist.app/terms-of-service/>, and the
effective date above reflects the most recent update.

## 16. Contact

Questions about these terms can be sent to `support@mypetlist.app`.

---

## How this content was verified against the app

Internal note for maintainers - not part of the published terms (stripped
before rendering; see `petlist-legal/build.js`).

- Confirmed no user-facing account, sign-in, or credential screen exists in
  the app. Hosted Pet ID uses a technical anonymous Firebase identity and an
  App Check attestation behind the scenes, disclosed in the Privacy Policy;
  it is not a user account (PET-496).
- Confirmed the household concept is purely a local, on-device grouping
  with no cross-device sync, matching the Privacy Policy. Household Sync is
  a design only and is not shipped.
- Confirmed against `package.json` and the app's store listing model that
  PetList is distributed as a one-time paid download, with no in-app
  purchase, subscription, or trial mechanism in the code.
- Section 4 (Your Data and Responsibilities) and the Privacy Policy's
  "Sharing and Exporting Information" section describe the same backup
  feature in matching terms - keep them in sync if that feature changes.

The Effective Date above was deliberately not changed by PET-460/PET-496
because these edits are not yet deployed; set it at the approved
deployment step, with the Privacy Policy.

If the business model changes to include subscriptions, in-app purchases,
or an account system, this document needs to be revised before that change
ships, not after.
