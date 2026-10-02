# Pet ID Finder fonts

First-party web fonts for `/p/`. They are served from this origin so the Finder never contacts
Google Fonts or any other font host. Both files are the official upstream variable WOFF2 builds,
byte-for-byte unmodified; only the file names were shortened.

| File | Family | Used for | Upstream release | Upstream file | SHA-256 |
| --- | --- | --- | --- | --- | --- |
| `Fraunces-Variable.woff2` | Fraunces (weight 600) | pet name and state headings | [Fraunces 1.000](https://github.com/undercasetype/Fraunces/releases/tag/1.000) (`UnderCaseType_Fraunces_1.000.zip`) | `Fonts - Web/Fraunces[SOFT,WONK,opsz,wght].woff2` | `25e420d8c154303e08322ea77f08997c4aade75653ef18425772ada5abacd0ce` |
| `Inter-Variable.woff2` | Inter (weights 400, 600, 700) | functional and body text | [Inter 4.1](https://github.com/rsms/inter/releases/tag/v4.1) (`Inter-4.1.zip`) | `web/InterVariable.woff2` | `693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3` |

## Licenses

Both families are licensed under the SIL Open Font License 1.1, which permits redistribution
with the license text.

- `Fraunces-LICENSE.txt` is `OFL.txt` from the upstream repository at tag `1.000`
  (Copyright 2018 The Fraunces Project Authors). The release zip itself carries no license file.
- `Inter-LICENSE.txt` is `LICENSE.txt` from the `Inter-4.1.zip` release
  (Copyright 2016 The Inter Project Authors).

## Declaration

`p/finder.css` declares one `Fraunces` face (600) and three `Inter` faces (400, 600, 700, all
pointing at the single Inter variable file) with `font-display: swap`. To update a font, replace
the file from the official release, update the hash above, and keep the license text current.
