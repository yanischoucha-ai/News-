#!/usr/bin/env node
/**
 * build-site.js — régénère tout ce qui dérive du SCHEDULE (editorial-clock.js) et de site-config.js :
 *  - /fr/ et /en/ (pages d'accueil par langue), pages rubriques, pages « Écrire pour nous » et « Réutilisation »
 *  - hero / à la une / rubriques / footer de la homepage (zones balisées <!--S:NAME-->…<!--/S:NAME-->)
 *  - newsletter + footer + feuille de style + script sur chaque article publié (fr/*.html, en/*.html)
 *  - sitemap.xml
 * Idempotent. Appelé par update-editorial-clock.js ; lançable seul : node scripts/build-site.js
 */
const fs = require('fs');
const path = require('path');
const C = require('./site-config');

const { BRAND, DOMAIN, CATS, PAGES, T, PAGE_CONTENT, catPath } = C;
const ROOT = path.join(__dirname, '..');
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const wr = (p, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), s); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const prettyUrl = (slug) => slug.replace(/\.html$/, '');
const catById = (id) => CATS.find((c) => c.id === id) || CATS[0];

// ── Données ──────────────────────────────────────────────────────────────────
function readSchedule() {
  const src = fs.readFileSync(path.join(ROOT, 'assets/js/editorial-clock.js'), 'utf8');
  const m = src.match(/const SCHEDULE = (\[[\s\S]*?\]);/);
  if (!m) throw new Error('SCHEDULE introuvable dans editorial-clock.js');
  const list = new Function('return ' + m[1])();
  return list.map((a) => ({ ...a, cat: a.cat || CATS.find((c) => c.dow === new Date(a.date + 'T12:00:00Z').getUTCDay()).id }));
}

const FR_M = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const EN_M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmt(date, lang) {
  const [y, m, d] = date.split('-').map(Number);
  return lang === 'fr' ? `${d} ${FR_M[m - 1]} ${y}` : `${EN_M[m - 1]} ${d}, ${y}`;
}

// ── Partials ─────────────────────────────────────────────────────────────────
const nlForm = (lang, id, cta) => {
  const t = T[lang];
  return `<form class="s-form" data-s-form="newsletter" data-ok="${esc(t.nlOk)}">
  <label class="s-sr" for="nl-${id}">${t.emailLabel}</label>
  <input id="nl-${id}" type="email" name="email" required maxlength="254" placeholder="${t.emailPh}" autocomplete="email">
  <input type="text" name="website" class="s-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <button type="submit">${esc(cta)}</button>
  <p class="s-form-msg" role="status" aria-live="polite"></p>
</form>`;
};

const newsletter = (lang) => {
  const t = T[lang];
  return `<section class="s-newsletter"><div class="s-newsletter-inner">
<h2>${esc(t.nlTitle)}</h2>
<p class="s-lead">${esc(t.nlLead)}</p>
${nlForm(lang, 'box', t.nlCta)}
<p class="s-form-note">${esc(t.note)}</p>
</div></section>`;
};

const hero = (lang, gateway) => {
  const t = T[lang];
  const other = lang === 'fr' ? 'en' : 'fr';
  return `<header class="s-hero"><div class="s-hero-inner">
<span class="s-hero-tag">${esc(t.heroTag)}</span>
<h1>${esc(t.heroH1)}</h1>
<p class="s-hero-sub">${esc(t.heroSub)}</p>
${nlForm(lang, 'hero', t.heroCta)}
<p class="s-form-note">${esc(t.note)}</p>
<ul class="s-proof">${t.proof.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
${gateway ? `<p class="s-hero-alt">${esc(t.gatewayLabel)} <a href="/${other}/">${esc(t.gateway)}</a></p>` : ''}
</div></header>`;
};

const catsBlock = (lang, current) => {
  const t = T[lang];
  return `<div class="s-cats-wrap" id="rubriques"><div class="s-cats-label">${esc(t.cats)}</div><div class="s-cats">${CATS.map((c) => `<a href="${catPath(lang, c.id)}"${c.id === current ? ' aria-current="page"' : ''}>${esc(c[lang].name)}</a>`).join('')}</div></div>`;
};

const footer = (lang) => {
  const t = T[lang];
  const other = lang === 'fr' ? 'en' : 'fr';
  return `<footer class="site-footer">
<div class="sf-inner">
<div class="sf-brand"><a class="sf-logo" href="/">${BRAND}</a><p>${esc(t.footAbout)}</p></div>
<div class="sf-col"><h4>${t.footTitle1}</h4>${CATS.map((c) => `<a href="${catPath(lang, c.id)}">${esc(c[lang].name)}</a>`).join('')}</div>
<div class="sf-col"><h4>${t.footTitle2}</h4><a href="/${lang}/">${esc(t.latest)}</a><a href="${PAGES.write[lang]}">${esc(t.write)}</a><a href="${PAGES.reuse[lang]}">${esc(t.reuse)}</a><a href="/${other}/">${esc(t.other)}</a></div>
</div>
<div class="sf-legal">${esc(t.legal)} <a href="${PAGES.reuse[lang]}">${esc(t.legalMore)}</a>.</div>
</footer>`;
};

const nav = (lang, alt) => {
  const t = T[lang];
  const on = (l) => (l === lang ? ' style="color:var(--rm-gold)"' : '');
  return `<nav>
  <a class="logo" href="/">${BRAND}</a>
  <div class="nav-links"><a class="nav-write" href="${PAGES.write[lang]}">${esc(t.write)}</a><a href="${alt.fr}"${on('fr')}>FR</a><a href="${alt.en}"${on('en')}>EN</a></div>
</nav>`;
};

const card = (a, lang) => {
  const t = T[lang];
  return `<a class="card" href="${prettyUrl(a.slug)}"><div class="card-body">
<div class="card-tag">${esc(catById(a.cat)[lang].name)}</div>
<h2>${esc(a.title)}</h2>
${a.desc ? `<p>${esc(a.desc)}</p>` : ''}
<div class="card-meta">${fmt(a.date, lang)}${a.min ? ` · ${a.min} ${t.readMin}` : ''}</div>
</div></a>`;
};

// ── Pages générées ───────────────────────────────────────────────────────────
function shell({ lang, title, desc, urlPath, alt, jsonld, body, type = 'website' }) {
  const url = DOMAIN + urlPath;
  return `<!doctype html>
<!-- Page générée par scripts/build-site.js — ne pas éditer à la main (modifier scripts/site-config.js) -->
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="${url}">
  <link rel="alternate" hreflang="fr" href="${DOMAIN}${alt.fr}">
  <link rel="alternate" hreflang="en" href="${DOMAIN}${alt.en}">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:type" content="${type}">
  <meta property="og:url" content="${url}">
  <link rel="stylesheet" href="/assets/css/blog.css">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>
${nav(lang, alt)}
${body}
${footer(lang)}
<script src="/assets/js/site.js" defer></script>
</body>
</html>
`;
}

function buildLangIndex(lang, published) {
  const t = T[lang];
  const list = published.filter((a) => a.lang === lang);
  const body = `${hero(lang, false)}
${catsBlock(lang)}
<section class="s-section"><h2 class="s-h2">${esc(t.latest)}</h2><div class="articles-grid">
${list.map((a) => card(a, lang)).join('\n')}
</div></section>
${newsletter(lang)}`;
  wr(`${lang}/index.html`, shell({
    lang, title: `${t.siteTitle} | ${BRAND}`, desc: t.siteDesc, urlPath: `/${lang}/`, alt: { fr: '/fr/', en: '/en/' }, body,
    jsonld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${BRAND} — ${t.siteTitle}`, description: t.siteDesc, url: `${DOMAIN}/${lang}/`, inLanguage: t.locale, isPartOf: { '@type': 'WebSite', name: BRAND, url: DOMAIN + '/' } },
  }));
}

function buildCategory(lang, cat, schedule, published) {
  const t = T[lang];
  const c = cat[lang];
  const list = published.filter((a) => a.lang === lang && a.cat === cat.id);
  const today = new Date().toISOString().slice(0, 10);
  const next = schedule.filter((a) => !a.slug && a.lang === lang && a.cat === cat.id && a.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const body = `<header class="s-cat-head"><h1>${esc(c.name)}</h1><p>${esc(c.desc)}</p></header>
${catsBlock(lang, cat.id)}
<section class="s-section">
${list.length ? `<div class="articles-grid">${list.map((a) => card(a, lang)).join('\n')}</div>` : `<p class="s-empty">${esc(t.emptyCat)}</p>`}
</section>
${next.length ? `<section class="s-section"><h2 class="s-h2">${esc(t.upcoming)}</h2><ul class="s-upcoming">${next.map((a) => `<li><time datetime="${a.date}">${fmt(a.date, lang)}</time><span>${esc(a.title)}</span></li>`).join('')}</ul></section>` : ''}
<div style="height:2.5rem"></div>
${newsletter(lang)}`;
  const urlPath = catPath(lang, cat.id);
  wr(urlPath.slice(1) + '.html', shell({
    lang, title: `${c.name} | ${BRAND}`, desc: c.desc, urlPath, alt: { fr: catPath('fr', cat.id), en: catPath('en', cat.id) }, body,
    jsonld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.name, description: c.desc, url: DOMAIN + urlPath, inLanguage: t.locale, isPartOf: { '@type': 'WebSite', name: BRAND, url: DOMAIN + '/' } },
  }));
}

function buildStaticPage(key, lang) {
  const p = PAGE_CONTENT[key][lang];
  const urlPath = PAGES[key][lang];
  wr(urlPath.slice(1) + '.html', shell({
    lang, title: `${p.title} | ${BRAND}`, desc: p.meta, urlPath, alt: PAGES[key], body: `<main class="s-page">${p.html()}</main>`,
    jsonld: { '@context': 'https://schema.org', '@type': 'WebPage', name: p.title, description: p.meta, url: DOMAIN + urlPath, inLanguage: T[lang].locale, isPartOf: { '@type': 'WebSite', name: BRAND, url: DOMAIN + '/' } },
  }));
}

// ── Injection dans les fichiers existants ────────────────────────────────────
const block = (name, inner) => `<!--S:${name}-->\n${inner}\n<!--/S:${name}-->`;
function setBlock(html, name, inner, fallback) {
  const re = new RegExp(`<!--S:${name}-->[\\s\\S]*?<!--\\/S:${name}-->`);
  const b = block(name, inner);
  if (re.test(html)) return html.replace(re, () => b);
  return fallback ? fallback(html, b) : html;
}

function processArticle(file, lang) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('assets/css/site.css')) html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/css/site.css">\n</head>');
  if (!/property="og:site_name"/.test(html)) html = html.replace('</head>', `  <meta property="og:site_name" content="${BRAND}">\n</head>`);
  if (!html.includes('assets/js/site.js')) html = html.replace('</body>', '  <script src="/assets/js/site.js" defer></script>\n</body>');
  const hasMain = html.includes('</main>');
  html = setBlock(html, 'NEWSLETTER', newsletter(lang), (h, b) => (hasMain ? h.replace('</main>', () => `${b}\n</main>`) : h.replace('</body>', () => `${b}\n</body>`)));
  html = setBlock(html, 'FOOTER', footer(lang), (h, b) => (hasMain ? h.replace('</main>', () => `</main>\n${b}`) : h.replace('</body>', () => `${b}\n</body>`)));
  fs.writeFileSync(file, html);
}

function buildHome(published) {
  const p = path.join(ROOT, 'index.html');
  if (!fs.existsSync(p)) return;
  let html = fs.readFileSync(p, 'utf8');
  const fr = published.filter((a) => a.lang === 'fr');
  const en = published.filter((a) => a.lang === 'en');
  const picks = [fr[0], en[0], fr[1], en[1]].filter(Boolean);
  const feat = picks.map((a, i) => `<a class="featured-card${i === 0 ? ' big' : ''}" href="${prettyUrl(a.slug)}">
  <div class="card-tag">${esc(catById(a.cat)[a.lang].name)} · ${a.lang.toUpperCase()}</div>
  <h3>${esc(a.title)}</h3>
  ${a.desc ? `<p>${esc(a.desc)}</p>` : ''}
  <div class="card-meta">${fmt(a.date, a.lang)}${a.min ? ` · ${a.min} ${T[a.lang].readMin}` : ''}</div>
</a>`).join('\n');
  const catRow = (lang) => `<div class="s-cats-row"><div class="s-cats-label">${lang === 'fr' ? '🇫🇷 Rubriques' : '🇬🇧 Topics'}</div><div class="s-cats">${CATS.map((c) => `<a href="${catPath(lang, c.id)}">${esc(c[lang].name)}</a>`).join('')}</div></div>`;
  html = setBlock(html, 'HERO', hero('fr', true));
  html = setBlock(html, 'FEATURED', `<div class="featured-grid">\n${feat}\n</div>`);
  html = setBlock(html, 'CATS', `<div class="s-cats-wrap">${catRow('fr')}${catRow('en')}</div>`);
  html = setBlock(html, 'NEWSLETTER', newsletter('fr'));
  html = setBlock(html, 'FOOTER', footer('fr'));
  if (!html.includes('assets/css/site.css')) html = html.replace('</head>', '  <link rel="stylesheet" href="assets/css/site.css">\n</head>');
  if (!html.includes('assets/js/site.js')) html = html.replace('</body>', '  <script src="assets/js/site.js" defer></script>\n</body>');
  fs.writeFileSync(p, html);
}

// ── Sitemap ──────────────────────────────────────────────────────────────────
function buildSitemap(published) {
  const latest = published.map((a) => a.date).sort().pop() || new Date().toISOString().slice(0, 10);
  const url = (loc, lastmod, freq, prio, alt) => `  <url>
    <loc>${DOMAIN}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>${alt ? `\n    <xhtml:link rel="alternate" hreflang="fr" href="${DOMAIN}${alt.fr}"/>\n    <xhtml:link rel="alternate" hreflang="en" href="${DOMAIN}${alt.en}"/>` : ''}
  </url>`;
  const out = [url('/', latest, 'daily', '1.0'), url('/fr/', latest, 'daily', '0.9', { fr: '/fr/', en: '/en/' }), url('/en/', latest, 'daily', '0.9', { fr: '/fr/', en: '/en/' })];
  CATS.forEach((c) => ['fr', 'en'].forEach((l) => out.push(url(catPath(l, c.id), latest, 'daily', '0.7', { fr: catPath('fr', c.id), en: catPath('en', c.id) }))));
  Object.values(PAGES).forEach((pg) => ['fr', 'en'].forEach((l) => out.push(url(pg[l], latest, 'yearly', '0.3', pg))));
  published.forEach((a) => out.push(url(prettyUrl(a.slug), a.date, 'monthly', '0.8')));
  wr('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${out.join('\n')}\n</urlset>\n`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
function build() {
  const schedule = readSchedule();
  const published = schedule.filter((a) => a.slug).sort((a, b) => b.date.localeCompare(a.date));

  ['fr', 'en'].forEach((lang) => {
    buildLangIndex(lang, published);
    CATS.forEach((cat) => buildCategory(lang, cat, schedule, published));
    Object.keys(PAGES).forEach((k) => buildStaticPage(k, lang));
  });

  const generated = new Set(['index.html', ...Object.values(PAGES).map((p) => path.basename(p.fr) + '.html'), ...Object.values(PAGES).map((p) => path.basename(p.en) + '.html')]);
  ['fr', 'en'].forEach((lang) => {
    fs.readdirSync(path.join(ROOT, lang), { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith('.html') && !generated.has(d.name))
      .forEach((d) => processArticle(path.join(ROOT, lang, d.name), lang));
  });

  buildHome(published);
  buildSitemap(published);
  console.log(`✅ build-site : ${published.length} articles publiés, ${CATS.length * 2} pages rubriques, sitemap régénéré`);
}

if (require.main === module) build();
module.exports = { build };
