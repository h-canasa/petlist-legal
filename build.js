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

const STYLE = `
  :root {
    color-scheme: light dark;
    --bg: #ECECEE;
    --card: #ffffff;
    --text: #1B163F;
    --text-secondary: #55506e;
    --border: #d8d6e0;
    --accent: #2D1B69;
    --banner-bg: #fff4e5;
    --banner-border: #e0a933;
    --banner-text: #6b4a00;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #151519;
      --card: #201d29;
      --text: #ECECEE;
      --text-secondary: #b3aec4;
      --border: #34303f;
      --accent: #A79DDE;
      --banner-bg: #3a2e0f;
      --banner-border: #a97a1f;
      --banner-text: #f0cf8a;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
  }
  header.site-nav {
    max-width: 720px;
    margin: 0 auto;
    padding: 24px 20px 0;
    display: flex;
    gap: 20px;
    font-size: 14px;
  }
  header.site-nav a {
    color: var(--text-secondary);
    text-decoration: none;
  }
  header.site-nav a[aria-current="page"] {
    color: var(--accent);
    font-weight: 600;
  }
  main {
    max-width: 720px;
    margin: 0 auto;
    padding: 24px 20px 80px;
  }
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 32px 36px;
  }
  h1 { font-size: 1.7rem; margin-top: 0; }
  h2 { font-size: 1.25rem; margin-top: 2em; border-top: 1px solid var(--border); padding-top: 1em; }
  h2:first-of-type { border-top: none; padding-top: 0; }
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
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.1em 0.4em;
    font-size: 0.9em;
  }
  hr {
    border: none;
    border-top: 1px solid var(--border);
    margin: 2.5em 0;
  }
  a { color: var(--accent); }
  ul, ol { padding-left: 1.4em; }
  footer.site-footer {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 20px 40px;
    font-size: 13px;
    color: var(--text-secondary);
  }
`;

function page({ title, description, bodyHtml, currentPath, root }) {
  const nav = (href, label, current) =>
    `<a href="${href}"${current ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="noindex">
<style>${STYLE}</style>
</head>
<body>
<header class="site-nav">
  ${nav(`${root}`, 'PetList Legal', currentPath === '/')}
  ${nav(`${root}privacy-policy/`, 'Privacy Policy', currentPath === '/privacy-policy/')}
  ${nav(`${root}terms-of-service/`, 'Terms of Service', currentPath === '/terms-of-service/')}
</header>
<main>
  <div class="card">
    ${bodyHtml}
  </div>
</main>
<footer class="site-footer">
  PetList &mdash; hosted documents for App Store / Google Play submission.
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

fs.writeFileSync(
  path.join(__dirname, 'index.html'),
  page({
    title: 'PetList — Legal Documents',
    description: 'PetList app Privacy Policy and Terms of Service',
    bodyHtml: `
      <h1>PetList — Legal Documents</h1>
      <p>These documents are hosted here for App Store Connect and Google Play
      Console submission purposes.</p>
      <ul>
        <li><a href="privacy-policy/">Privacy Policy</a></li>
        <li><a href="terms-of-service/">Terms of Service</a></li>
      </ul>
    `,
    currentPath: '/',
    root: './',
  })
);

console.log('Built privacy-policy/index.html, terms-of-service/index.html, index.html');
