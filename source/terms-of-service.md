# Terms of Service for PetList

> **⚠️ DRAFT — NOT FINAL. NOT LEGALLY REVIEWED.**
> This document was generated as a first draft (PET-130) alongside
> PetList's draft [Privacy Policy](privacy-policy.md) — it is **not** a
> substitute for review by a qualified lawyer, and it must not be
> published, linked from the app, or submitted to any app store until
> that review happens and every `[bracketed placeholder]` below is filled
> in. It was written grounded in what the app actually does, per the audit
> described in the Privacy Policy's own closing section — not copied from
> a generic template, though the boilerplate legal sections below (limitation
> of liability, indemnification, dispute resolution, etc.) are exactly the
> kind of clause that most needs a lawyer's eyes, not an engineer's.

**Last updated:** `[DATE — set on actual publish]`

## 1. Acceptance of these terms

By downloading, installing, or using PetList ("the app"), you agree to
these Terms of Service. If you don't agree, don't use the app.
`[Placeholder — confirm minimum age requirement for accepting these terms
in your distribution markets; the app itself has no age-gating and, per
the Privacy Policy, collects no data that would let it verify age.]`

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
copy of it. `[Placeholder: revisit this section once/if a general
backup/export feature (tracked internally as PET-70) ships.]`

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

The app, including its design, code, and branding, is owned by
`[Placeholder: developer/company legal name]` and is protected by
applicable intellectual property laws. These terms do not grant you any
ownership interest in the app itself. You retain all rights to the
content you enter (pet names, notes, photos, etc.) — the app claims no
ownership over it, consistent with the fact that it never leaves your
device in the first place.

## 7. No warranty

`[Placeholder — standard "AS IS" disclaimer, needs legal drafting for your
jurisdiction.]` THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT
WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE, OR NON-INFRINGEMENT. In particular, and per Section 2 above, the
developer does not warrant that the app's reminders or scheduling features
are accurate, complete, or sufficient for your pet's actual health needs.

## 8. Limitation of liability

`[Placeholder — standard limitation-of-liability clause, needs legal
drafting for your jurisdiction; typically caps liability and excludes
indirect/consequential damages, but the exact enforceable language varies
significantly by jurisdiction and should not be engineer-drafted.]`

## 9. Termination

You may stop using the app at any time by uninstalling it, which — per
the Privacy Policy — also removes its locally-stored data from your
device. `[Placeholder: describe any circumstances under which the
developer could restrict access, if applicable — currently the app has no
account system and no remote kill-switch, so there is nothing today for
the developer to unilaterally revoke beyond app-store-level removal.]`

## 10. Changes to the app or these terms

The app may be updated from time to time (see the Privacy Policy's "App
updates" section for how updates are delivered). `[Placeholder: describe
the actual process for notifying users of material changes to these
terms once decided.]`

## 11. Governing law

`[Placeholder — governing law and jurisdiction for disputes; depends on
where the developer is legally based and where the app is distributed.]`

## 12. Contact

Questions about these terms: `support@petlist.app`
**(placeholder address — replace with a real, monitored inbox before
publishing, same as the placeholder flagged in the app's own About
screen and in the Privacy Policy.)**

`[Placeholder: developer/company legal name and, if required, physical
mailing address.]`

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
