# PetList — Legal Documents

Hosts the Privacy Policy and Terms of Service for the PetList mobile app
at stable public URLs, for App Store Connect / Google Play Console
submission fields.

This repo exists only because the main `petlist` app repository is
private, and GitHub Pages is not available on a private repo without a
paid GitHub plan. This repo holds no app source — only the two rendered
legal documents.

## Source of truth

The actual document content is authored and audited in the main
`petlist` repo, at `docs/privacy-policy.md` and `docs/terms-of-service.md`
(see those files' own "How this draft was produced" / "re-verified"
sections for what was checked against the codebase). The `source/`
folder here is a **copy**, not synced automatically.

## Regenerating after a content change

1. Copy the updated file(s) from the main repo:
   ```
   cp <petlist-repo>/docs/privacy-policy.md source/privacy-policy.md
   cp <petlist-repo>/docs/terms-of-service.md source/terms-of-service.md
   ```
2. Run the build script (uses `npx marked` — no local install needed):
   ```
   node build.js
   ```
3. Commit and push. GitHub Pages redeploys automatically on push to the
   default branch.

## Status

Both documents are first-pass drafts pending legal review — see the
draft banner at the top of each page.
