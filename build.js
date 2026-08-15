const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

// The source docs end with a "How this draft was produced/re-verified"
// audit-trail section, marked off by its own `---` horizontal rule. That
// section is real engineering history (useful in the source repo, where
// it's also backed by git blame) but reads as internal changelog
// commentary on a page meant to look like a finished public document, so
// it's cut before rendering rather than published. The source markdown
// itself is untouched - only this generated site omits it.
function stripAuditTrail(markdown) {
  const match = markdown.match(/\r?\n---\r?\n/);
  if (!match) {
    throw new Error('Expected a `---` audit-trail marker in the source markdown, found none.');
  }
  return markdown.slice(0, match.index);
}

function markdownToHtml(mdPath) {
  const raw = fs.readFileSync(mdPath, 'utf8');
  const trimmed = stripAuditTrail(raw);
  const tmpFile = path.join(os.tmpdir(), `petlist-legal-${path.basename(mdPath)}`);
  fs.writeFileSync(tmpFile, trimmed);
  try {
    return execFileSync('npx', ['--yes', 'marked', tmpFile], {
      encoding: 'utf8',
      shell: true,
    });
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

// Restyled in PET-205 follow-up round 2 to match the marketing landing
// page: same color tokens, same Fraunces/Inter pairing loaded the same way
// (Google Fonts CDN link tags), same brand header. Only the wrapper changed
// -- the rendered legal copy inside .card is untouched.
//
// Deliberately light-mode only, unlike the previous version's
// prefers-color-scheme dark variant: css/styles.css (the landing page) is
// single-mode, and a legal page that went dark while the site it belongs to
// stayed light would reintroduce exactly the "different site" feeling this
// change exists to remove.
const STYLE = `
  :root {
    --purple-deep: #1B163F;
    --purple-secondary: #2D1B69;
    --coral: #E0637A;
    --lavender: #F3EFFA;
    --card: #FFFFFF;
    --on-dark-secondary: #C9C3E0;
    --text: #1B163F;
    --text-secondary: #55506E;
    --border: #E2DEEE;
    --banner-bg: #fff4e5;
    --banner-border: #e0a933;
    --banner-text: #6b4a00;

    --font-display: "Fraunces", Georgia, serif;
    --font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  * { box-sizing: border-box; }
  html { overflow-x: hidden; }
  body {
    margin: 0;
    background: var(--lavender);
    color: var(--text);
    font-family: var(--font-body);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  img { max-width: 100%; display: block; }

  header.site-header {
    background: var(--purple-deep);
    padding: 20px 0;
  }
  header.site-header .inner {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 20px;
  }
  header.site-header .brand-mark {
    height: 48px;
    width: auto;
  }

  main {
    max-width: 720px;
    margin: 0 auto;
    padding: 40px 20px 80px;
  }
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 32px 36px;
  }
  h1, h2, h3 {
    font-family: var(--font-display);
    color: var(--purple-deep);
    line-height: 1.2;
  }
  h1 { font-size: 2rem; font-weight: 700; margin-top: 0; }
  h2 {
    font-size: 1.3rem;
    font-weight: 700;
    margin-top: 2em;
    border-top: 1px solid var(--border);
    padding-top: 1em;
  }
  h2:first-of-type { border-top: none; padding-top: 0; }
  h3 { font-size: 1.05rem; font-weight: 600; }
  blockquote {
    background: var(--banner-bg);
    border: 1px solid var(--banner-border);
    color: var(--banner-text);
    border-radius: 8px;
    padding: 14px 18px;
    margin: 0 0 24px;
    font-size: 0.92rem;
  }
  blockquote p { margin: 0.4em 0; }
  code {
    background: var(--lavender);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.1em 0.4em;
    font-size: 0.9em;
    overflow-wrap: break-word;
  }
  hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 2.5em 0;
  }
  a { color: var(--purple-secondary); }
  ul, ol { padding-left: 1.4em; }

  footer.site-footer {
    background: var(--purple-deep);
    color: var(--on-dark-secondary);
    padding: 32px 0;
    font-size: 0.85rem;
  }
  footer.site-footer .inner {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    text-align: center;
  }
  @media (min-width: 640px) {
    footer.site-footer .inner {
      flex-direction: row;
      justify-content: space-between;
      text-align: left;
    }
  }
  footer.site-footer p { margin: 0; }
  footer.site-footer nav {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    justify-content: center;
  }
  footer.site-footer a {
    color: var(--on-dark-secondary);
    text-decoration: none;
  }
  footer.site-footer a:hover,
  footer.site-footer a:focus-visible {
    color: #fff;
    text-decoration: underline;
  }
`;

function page({ title, description, bodyHtml, currentPath, root }) {
  // The brand mark replaces the old live-text "PetList Legal" label and
  // links back to the homepage, matching the landing page's header (which
  // likewise carries no separate text wordmark -- the name is already baked
  // into the image). The sibling-document links moved to the footer, where
  // the landing page also keeps them.
  const footerNav = [
    currentPath === '/privacy-policy/'
      ? null
      : `<a href="${root}privacy-policy/">Privacy Policy</a>`,
    currentPath === '/terms-of-service/'
      ? null
      : `<a href="${root}terms-of-service/">Terms of Service</a>`,
    `<a href="mailto:support@mypetlist.app">Support</a>`,
  ].filter(Boolean).join('\n      ');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="noindex">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#1B163F">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>${STYLE}</style>
</head>
<body>
<header class="site-header">
  <div class="inner">
    <a href="${root}" aria-label="PetList home">
      <img class="brand-mark" src="${root}assets/marketing/petlist_icon-banner-web.png" alt="PetList" width="114" height="48">
    </a>
  </div>
</header>
<main>
  <div class="card">
    ${bodyHtml}
  </div>
</main>
<footer class="site-footer">
  <div class="inner">
    <p>&copy; 2026 PetList. All rights reserved.</p>
    <nav aria-label="Legal and support">
      ${footerNav}
    </nav>
  </div>
</footer>
</body>
</html>
`;
}

const privacyBody = markdownToHtml(path.join(__dirname, 'source', 'privacy-policy.md'));
const tosBody = markdownToHtml(path.join(__dirname, 'source', 'terms-of-service.md'))
  // The source markdown cross-links to the sibling doc as a repo-relative
  // file (privacy-policy.md); rewrite to the hosted page's actual path.
  .replace(/href="privacy-policy\.md"/g, 'href="../privacy-policy/"');

fs.writeFileSync(
  path.join(__dirname, 'privacy-policy', 'index.html'),
  page({
    title: 'Privacy Policy — PetList',
    description: 'PetList app Privacy Policy',
    bodyHtml: privacyBody,
    currentPath: '/privacy-policy/',
    root: '../',
  })
);

fs.writeFileSync(
  path.join(__dirname, 'terms-of-service', 'index.html'),
  page({
    title: 'Terms of Service — PetList',
    description: 'PetList app Terms of Service',
    bodyHtml: tosBody,
    currentPath: '/terms-of-service/',
    root: '../',
  })
);

// Root index.html is NOT generated here (PET-205): it's the hand-authored
// marketing landing page now, not the legal-documents hub. That hub page
// used to be built by this script on every run, which would have silently
// clobbered the marketing page the next time someone followed this repo's
// README and ran `node build.js` after a privacy-policy/terms-of-service
// content update. The landing page's own footer links to privacy-policy/
// and terms-of-service/ directly, so nothing lost that index.html's old
// body provided.

console.log('Built privacy-policy/index.html, terms-of-service/index.html');
