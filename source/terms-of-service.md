# Terms of Service for PetList

> **Reviewed informally — not a substitute for legal advice.**
> This document was grounded in what the app actually does — not copied
> from a generic template — and its identifying details (entity, contact,
> governing law) have since been filled in with real values. It has still
> never been drafted or reviewed by a qualified lawyer, and the boilerplate
> legal sections below (limitation of liability, warranty disclaimer,
> governing law) are exactly the kind of clause that most needs a lawyer's
> eyes, not an engineer's. If you have concerns about its legal
> sufficiency for a particular distribution market, have it reviewed
> before relying on it as final.

**Last updated:** `2026-08-11`

## 1. Acceptance of these terms

By downloading, installing, or using PetList ("the app"), you agree to
these Terms of Service. If you don't agree, don't use the app. By using
the app, you represent that you are of legal age to agree to these terms
in your jurisdiction, or that you have a parent's or guardian's
permission to do so. The app itself has no age-gating and, per the
Privacy Policy, collects no data that would let it verify age.

## 2. What PetList is

PetList is a personal organizational tool for tracking multi-pet
household information: pet profiles, health-event history (vaccinations,
deworming, vet visits, medications, grooming, and similar records you
choose to log), reminders for upcoming due dates, and expense tracking.

**PetList is not a veterinary or medical service.** Nothing in the app —
including its reminders, due-date calculations, or any record you log —
constitutes veterinary advice, a diagnosis, or a recommendation about
your pet's care. Reminders reflect only the dates and recurrence rules
*you* enter; the app has no medical knowledge of its own and does not
verify that any schedule you set is appropriate for your pet. Always
consult a licensed veterinarian for your pet's actual medical care, and
do not rely on the app's reminders as your only safeguard against a missed
or overdue vaccination, medication, or appointment.

## 3. Household — a local, single-device concept

The app lets you group pets under one or more named "households." This is
an organizational feature only — it is not a shared account, does not
sync between devices, and is not visible to or accessible by anyone else
through the app. If more than one person wants to track the same pets,
each would need to enter that data separately on their own device; PetList
has no mechanism to invite, link, or share a household between devices or
people.

## 4. Your data

As described in detail in the [Privacy Policy](privacy-policy.md), all
information you enter into PetList is stored locally on your own device.
You are solely responsible for the accuracy of the information you enter
and for maintaining your own backups if you want one. PetList can generate
a PDF summary of a single pet's health records on-device and hand it to
your device's own share sheet (see the Privacy Policy's "Exporting a vet
summary" section) — that is the only export capability that exists today.
There is no cloud backup and no export of your full database, so data lost
from uninstalling the app, resetting your device, or device loss/damage
cannot be recovered by the developer, because the developer never has a
copy of it. (This section will be revisited if a general backup/export
feature, tracked internally as PET-70, ships.)

## 5. License to use the app

Subject to these terms, the developer grants you a personal,
non-exclusive, non-transferable, revocable license to install and use
PetList on devices you own or control, for your own personal, non-commercial
household-organization purposes.

You agree not to:

- Reverse-engineer, decompile, or disassemble the app except to the
  extent applicable law expressly permits despite this restriction
- Use the app for any unlawful purpose
- Attempt to interfere with the app's operation or security

## 6. Intellectual property

The app, including its design, code, mascot character and artwork, logo,
icon, and all other branding, is owned by Harley Canasa and is protected
by applicable intellectual property laws. These terms do not grant you any
ownership interest in the app itself. You retain all rights to the
content you enter (pet names, notes, photos, etc.) — the app claims no
ownership over it, consistent with the fact that it never leaves your
device in the first place.

## 7. No warranty

The following is standard "AS IS" boilerplate language; it has not been
drafted or reviewed by a lawyer for enforceability in any specific
jurisdiction. THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT
WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE, OR NON-INFRINGEMENT. In particular, and per Section 2 above, the
developer does not warrant that the app's reminders or scheduling features
are accurate, complete, or sufficient for your pet's actual health needs.

## 8. Limitation of liability

The following is standard limitation-of-liability boilerplate; like the
warranty disclaimer above, it has not been drafted or reviewed by a
lawyer, and enforceable language for this kind of clause varies
significantly by jurisdiction. To the maximum extent permitted by
applicable law, the developer (Harley Canasa) shall not be liable for any
indirect, incidental, special, consequential, or punitive damages, or any
loss of data, arising out of or related to your use of (or inability to
use) the app — including, without limitation, any harm to a pet resulting
from reliance on a reminder, record, or export the app produced. Because
all data lives solely on your device and nowhere else, the developer is
in no position to prevent, mitigate, or recover from data loss on your
device, and disclaims liability for it accordingly.

## 9. Termination

You may stop using the app at any time by uninstalling it, which — per
the Privacy Policy — also removes its locally-stored data from your
device. There are no circumstances today under which the developer could
unilaterally restrict your access to the app, since it has no account
system and no remote kill-switch — the only way access to the app could
end on the developer's side is removal from an app store, which affects
new installs, not a copy already on your device.

## 10. Changes to the app or these terms

The app may be updated from time to time (see the Privacy Policy's "App
updates" section for how updates are delivered). The current version of
these terms is always published at
<https://h-canasa.github.io/petlist-legal/terms-of-service/>. When they
change, the "Last updated" date at the top of this document will be
updated to match. This app does not currently link to these terms or
notify you in-app of changes to them; if that changes, this section will
be updated to describe how.

## 11. Governing law

These terms, and any dispute arising from them or your use of the app,
are governed by the laws of the Republic of the Philippines, without
regard to its conflict-of-law principles.

## 12. Contact

Questions about these terms: `petlist.app.support@gmail.com`

These terms are issued by Harley Canasa, operating as a sole
proprietorship (there is no separate registered company). No physical
mailing address is listed, as none is currently required for this app's
distribution markets; one will be added here if a specific market's
requirements make it necessary.

---

## How this draft was re-verified (PET-130 hosting pass)

The original draft (`a042c5f`) was written alongside the Privacy Policy's
first version. Since then, `docs/privacy-policy.md` was re-audited and
updated for PET-232 (the vet-summary PDF export); this document had not
been re-checked against that change until now. Re-verified for this pass:

- **Section 3 (Household)** — added. The original draft never addressed
  whether "household" implies multi-device or shared-account behavior,
  which this ticket's own investigation steps asked to confirm.
  Confirmed via `src/lib/petData.ts`'s household functions
  (`getAllHouseholds`/`setActiveHousehold`/`createHousehold`) and
  `CLAUDE.md`'s documented household model: multi-household support exists
  at the data layer, but nothing in the app creates a second household,
  switches between them, or shares one across devices/people.
- **Section 4 (Your data)** — corrected. It previously stated PetList "has
  no ... export feature," which was accurate when written (Aug 7) but is
  now stale: PET-232 added the vet-summary PDF export/share (Aug 9-10).
  Reworded to match the Privacy Policy's own "Exporting a vet summary"
  section exactly, so the two documents don't contradict each other on
  this point — the flagged risk in this ticket's own verification steps.
- **No accounts / no login** — re-confirmed with a fresh search of `src/`
  for authentication, login, sign-up, or credential handling; still none
  exists anywhere in the codebase or its schema.
- All other sections (warranty, liability, IP, termination, governing law,
  contact) were reviewed and found still accurate — no other code changes
  since the original draft affect their content.

**2026-08-11 (PET-130 follow-up):** all remaining bracketed placeholders
resolved with real values — contact email, entity name (including an
explicit mascot/artwork mention in Intellectual Property, matching the
original ticket's content requirement), governing law, the minimum-age
representation, and the "changes to these terms" process. The Limitation
of Liability section previously had no actual clause, only a placeholder
noting one was needed — it now has real (if boilerplate, non-lawyer-drafted)
text. No code or data-practice change prompted this pass. This pass also
left the app's own About screen (`profile.tsx`'s `SUPPORT_EMAIL`
constant) out of sync with the real address used here — fixed in a
same-day follow-up, so the two now match.

**2026-08-11 (later same day):** this changelog-style section itself was
removed from the *published* petlist-legal pages (it read as internal
commentary on what's meant to be a finished-looking public document) —
it remains here in the source markdown, which is the actual audit trail
for future engineers. See the petlist-legal repo's own commit history for
the public-site build change.
