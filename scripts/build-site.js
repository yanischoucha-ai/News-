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
<div class="sf-col"><h4>${t.footTitle2}</h4><a href="/${lang}/">${esc(t.latest)}</a><a href="${PAGES.write[lang]}">${esc(t.write)}</a><a href="${lang === 'fr' ? '/fr/tribune' : '/en/community'}">${lang === 'fr' ? 'Tribune des auteurs' : 'Community voices'}</a><a href="${PAGES.reuse[lang]}">${esc(t.reuse)}</a><a href="/${other}/">${esc(t.other)}</a></div>
</div>
<div class="sf-legal">${esc(lang === 'fr' ? `${BRAND} est édité par ` : `${BRAND} is published by `)}<a href="https://alturacom-production.odoo.com" rel="noopener">AlturaCom</a>. ${esc(t.legal)} <a href="${PAGES.reuse[lang]}">${esc(t.legalMore)}</a>.</div>
</footer>`;
};

const MH = {
  fr: { tag: 'Le brief quotidien des hôtes, artisans et indépendants', sub: 'Newsletter', more: 'Tout voir', up: 'Prochainement', all: 'Toute l’actualité', top: 'À la une', calH: 'Un nouvel article chaque jour, 7 jours sur 7.', dailySub: 'En français et en anglais · voir la semaine →', calP: 'Une rubrique par jour, en français et en anglais. Voici la semaine qui vient.', today: 'Aujourd’hui', done: 'Publié', soon: 'À venir', calNl: 'Recevoir la semaine par email', calNlP: 'Un seul email, le meilleur des 7 jours.', behindH: 'Derrière Marge Brief', behindP: 'Marge Brief est édité par AlturaCom. Nous le disons clairement : voici nos projets, présentés comme tels.', nlH: 'Les chiffres de la semaine, dans votre boîte mail.', nlP: 'Un seul email par semaine, que du concret : cas réels, chiffres vérifiés, zéro généralité.', date: 'fr-FR' },
  en: { tag: 'The daily brief for hosts, tradespeople and independents', sub: 'Newsletter', more: 'See all', up: 'Coming up', all: 'All stories', top: 'Top stories', calH: 'A new article every day, 7 days a week.', dailySub: 'In English and French · see the week →', calP: 'One topic per day, in English and French. Here is the week ahead.', today: 'Today', done: 'Published', soon: 'Coming up', calNl: 'Get the week by email', calNlP: 'One email, the best of the 7 days.', behindH: 'Behind Marge Brief', behindP: 'Marge Brief is published by AlturaCom. We say so plainly: here are our projects, presented as ours.', nlH: 'The week’s numbers, in your inbox.', nlP: 'One email a week, only what you can use: real cases, verified numbers, no filler.', date: 'en-US' },
};
const FONTS = '<link rel="preload" href="/assets/fonts/newsreader-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>';
const fixFonts = (html) => {
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.g[^>]*>\s*/g, '').replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis[^>]*>\s*/g, '');
  if (!html.includes('/assets/fonts/')) html = html.replace(/(\s*<link rel="stylesheet" href="[^"]*journal\.css">)/, `\n  ${FONTS}$1`);
  return html;
};
const nav = (lang, alt, current) => {
  const t = T[lang]; const m = MH[lang];
  const nl = current === 'home' ? '#newsletter' : `/${lang}/#newsletter`;
  const menuLbl = lang === 'fr' ? 'Menu' : 'Menu';
  const cats = CATS.map((c) => `<a href="${catPath(lang, c.id)}"${c.id === current ? ' aria-current="page"' : ''}>${esc(c[lang].name)}</a>`).join('');
  return `<!--S:HEAD-->
<header class="mh">
  <div class="mh-bar">
    <a class="mh-logo" href="/${lang}/">${BRAND}<i>.</i></a>
    <p class="mh-tag">${esc(m.tag)}</p>
    <div class="mh-tools">
      <a class="mh-write" href="${PAGES.write[lang]}">${esc(t.write)}</a>
      <span class="mh-lang"><a href="${alt.fr}"${lang === 'fr' ? ' aria-current="true"' : ''}>FR</a><a href="${alt.en}"${lang === 'en' ? ' aria-current="true"' : ''}>EN</a></span>
      <a class="mh-sub" href="${nl}">${m.sub}</a>
      <button class="mh-burger" type="button" aria-expanded="false" aria-controls="mh-menu" aria-label="${menuLbl}"><span class="mh-burger-ico" aria-hidden="true"></span><span class="mh-burger-txt">${menuLbl}</span></button>
    </div>
  </div>
  <nav class="mh-nav" id="mh-menu" aria-label="${esc(t.cats)}">
    <div class="mh-nav-in">
      <a class="mh-nav-home" href="/${lang}/"${current === 'home' ? ' aria-current="page"' : ''}>${esc(t.latest)}</a>
      ${cats}
      <div class="mh-nav-extra"><a href="${PAGES.write[lang]}">${esc(t.write)}</a><a class="mh-nav-cta" href="${nl}">${m.sub}</a></div>
    </div>
  </nav>
</header>
<!--/S:HEAD-->`;
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
function shell({ lang, title, desc, urlPath, alt, jsonld, body, type = 'website', current }) {
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
  ${FONTS}
  <link rel="stylesheet" href="/assets/css/journal.css">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>
${nav(lang, alt, current)}
${body}
${footer(lang)}
<script src="/assets/js/site.js" defer></script>
${body.includes('au-form') ? '<script src="/assets/js/author.js" defer></script>' : ''}
</body>
</html>
`;
}

const jItem = (a, lang, withDesc) => `<a class="j-item" href="${prettyUrl(a.slug)}"><span class="j-kicker">${esc(catById(a.cat)[lang].name)}</span><h3>${esc(a.title)}</h3>${withDesc && a.desc ? `<p>${esc(a.desc)}</p>` : ''}<span class="j-meta">${fmt(a.date, lang)}${a.min ? ` · ${a.min} ${T[lang].readMin}` : ''}</span></a>`;


const parisToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

// Calendrier des 7 prochains jours (accueil)
function calendar(lang, schedule) {
  const m = MH[lang]; const today = parisToday();
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
  const cells = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    const dow = new Date(date + 'T12:00:00Z').getUTCDay();
    const cat = CATS.find((c) => c.dow === dow);
    const items = schedule.filter((a) => a.lang === lang && a.date === date);
    const it = items.find((a) => a.slug) || items[0];
    const wd = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));
    const dm = fmt(date, lang).replace(/ 20\d\d$/, '').replace(/, 20\d\d$/, '');
    const status = it && it.slug ? m.done : (i === 0 ? m.today : m.soon);
    const title = it ? it.title : cat[lang].desc;
    const tag = `<span class="j-kicker">${esc(cat[lang].name)}</span>`;
    const inner = `<span class="cal-date"><b>${esc(wd)}</b> ${esc(dm)}${i === 0 ? ` <em>${esc(m.today)}</em>` : ''}</span>${tag}<span class="cal-title">${esc(title)}</span><span class="cal-status ${it && it.slug ? 'is-done' : ''}">${esc(status)}</span>`;
    const cls = `cal-day${i === 0 ? ' is-today' : ''}`;
    cells.push(it && it.slug ? `<a class="${cls}" href="${prettyUrl(it.slug)}">${inner}</a>` : `<a class="${cls}" href="${catPath(lang, cat.id)}">${inner}</a>`);
  }
  cells.push(`<a class="cal-day cal-nl" href="#newsletter"><span class="cal-date"><b>${esc(m.sub)}</b></span><span class="cal-title">${esc(m.calNl)}</span><span class="cal-status">${esc(m.calNlP)}</span></a>`);
  return `<section class="j-cal" id="calendrier" aria-labelledby="cal-h"><div class="j-wrap"><div class="j-sec-h"><h2 id="cal-h">${esc(m.calH)}</h2></div><p class="j-cal-p">${esc(m.calP)}</p><div class="cal-grid">${cells.join('')}</div></div></section>`;
}

function buildLangIndex(lang, published, schedule) {
  const t = T[lang]; const m = MH[lang];
  const list = published.filter((a) => a.lang === lang);
  const lead = list[0];
  const side = list.slice(1, 5);
  const rest = list.slice(5);
  const leadHtml = lead ? `<a class="j-lead" href="${prettyUrl(lead.slug)}"><span class="j-kicker">${esc(catById(lead.cat)[lang].name)}</span><h2>${esc(lead.title)}</h2>${lead.desc ? `<p>${esc(lead.desc)}</p>` : ''}<span class="j-meta">${fmt(lead.date, lang)}${lead.min ? ` · ${lead.min} ${t.readMin}` : ''}</span></a>` : '';
  const catSecs = rest.length ? `<section class="j-sec"><div class="j-sec-h"><h2>${esc(m.all)}</h2></div><div class="j-grid">${rest.slice(0, 12).map((a) => jItem(a, lang, true)).join('')}</div></section>` : '';
  const body = `<a class="j-daily" href="#calendrier"><span class="j-daily-dot" aria-hidden="true"></span><strong>${esc(m.calH)}</strong><span class="j-daily-sub">${esc(m.dailySub)}</span></a>
<div class="j-wrap"><div class="j-top">${leadHtml}<aside><h2 class="j-side-h"><span>${m.top}</span></h2>${side.map((a) => jItem(a, lang, false)).join('')}</aside></div></div>
${calendar(lang, schedule)}
<section class="j-nl" id="newsletter"><div class="j-nl-in"><div><h2>${esc(m.nlH)}</h2><p>${esc(m.nlP)}</p></div><div>${nlForm(lang, 'home', t.nlCta)}<p class="s-form-note">${esc(t.note)}</p></div></div></section>
<div class="j-wrap">${catSecs}</div>
<div style="height:2.5rem"></div>`;
  wr(`${lang}/index.html`, shell({
    lang, title: `${t.siteTitle} | ${BRAND}`, desc: t.siteDesc, urlPath: `/${lang}/`, alt: { fr: '/fr/', en: '/en/' }, body, current: 'home',
    jsonld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${BRAND} — ${t.siteTitle}`, description: t.siteDesc, url: `${DOMAIN}/${lang}/`, inLanguage: t.locale, isPartOf: { '@type': 'WebSite', name: BRAND, url: DOMAIN + '/' } },
  }));
}

function buildCategory(lang, cat, schedule, published) {
  const t = T[lang];
  const c = cat[lang];
  const list = published.filter((a) => a.lang === lang && a.cat === cat.id);
  const today = parisToday();
  const next = schedule.filter((a) => !a.slug && a.lang === lang && a.cat === cat.id && a.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const body = `<header class="s-cat-head"><h1>${esc(c.name)}</h1><p>${esc(c.desc)}</p></header>
<section class="s-section">
${list.length ? `<div class="j-grid">${list.map((a) => jItem(a, lang, true)).join('')}</div>` : `<p class="s-empty">${esc(t.emptyCat)}</p>`}
</section>
${next.length ? `<section class="s-section"><h2 class="s-h2">${esc(t.upcoming)}</h2><ul class="s-upcoming">${next.map((a) => `<li><time datetime="${a.date}">${fmt(a.date, lang)}</time><span>${esc(a.title)}</span></li>`).join('')}</ul></section>` : ''}
<div style="height:2.5rem"></div>
${newsletter(lang)}`;
  const urlPath = catPath(lang, cat.id);
  wr(urlPath.slice(1) + '.html', shell({
    lang, title: `${c.name} | ${BRAND}`, desc: c.desc, urlPath, alt: { fr: catPath('fr', cat.id), en: catPath('en', cat.id) }, body, current: cat.id,
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
  const alt = { fr: '/fr/', en: '/en/' };
  if (!html.includes('assets/css/site.css')) html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/css/site.css">\n</head>');
  if (!html.includes('assets/css/journal.css')) html = html.replace('</head>', `  ${FONTS}\n  <link rel="stylesheet" href="/assets/css/journal.css">\n</head>`);
  if (/property="og:site_name"/.test(html)) html = html.replace(/<meta property="og:site_name" content="[^"]*">/, `<meta property="og:site_name" content="${BRAND}">`);
  else html = html.replace('</head>', `  <meta property="og:site_name" content="${BRAND}">\n</head>`);
  if (!html.includes('assets/js/site.js')) html = html.replace('</body>', '  <script src="/assets/js/site.js" defer></script>\n</body>');
  // anciens articles : habillage ALTURA / Résidence Manager → Marge Brief
  const legacy = /<p class="meta">(ALTURA|Résidence Manager) ·/.test(html);
  if (legacy) {
    html = html.replace(/(<title>[^<]*?) \| (ALTURA|Résidence Manager)(<\/title>)/, `$1 | ${BRAND}$3`);
    html = html.replace(/"author": \{[^}]*\}/, `"author": { "@type": "Organization", "name": "${BRAND}" }`);
    html = html.replace(/"publisher": \{[^}]*\}/, `"publisher": { "@type": "Organization", "name": "${BRAND}", "url": "${DOMAIN}" }`);
    html = html.replace(/<p class="meta">(ALTURA|Résidence Manager) ·/, lang === 'fr' ? `<p class="meta">Rédaction ${BRAND} ·` : `<p class="meta">${BRAND} Newsroom ·`);
  }
  html = fixFonts(html);
  html = html.replace(/\n?<footer>\s*<p>&copy;[\s\S]*?<\/footer>\n?/, '\n');
  const head = nav(lang, alt, null);
  if (/<!--S:HEAD-->/.test(html)) html = setBlock(html, 'HEAD', head.replace(/^<!--S:HEAD-->\n|\n<!--\/S:HEAD-->$/g, ''));
  else html = html.replace(/<nav[\s\S]*?<\/nav>/, () => head);
  const hasMain = html.includes('</main>');
  html = html.replace(/<!--S:PROMO-->[\s\S]*?<!--\/S:PROMO-->\n?/, '');
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
  const m = MH.fr;
  const band = `<section class="j-nl" id="newsletter"><div class="j-nl-in"><div><h2>${esc(m.nlH)}</h2><p>${esc(m.nlP)} <a href="/en/">${esc(T.fr.gateway)}</a></p></div><div>${nlForm('fr', 'root', T.fr.nlCta)}<p class="s-form-note">${esc(T.fr.note)}</p></div></div></section>`;
  html = setBlock(html, 'HERO', band);
  const head = nav('fr', { fr: '/fr/', en: '/en/' }, 'home');
  if (/<!--S:HEAD-->/.test(html)) html = setBlock(html, 'HEAD', head.replace(/^<!--S:HEAD-->\n|\n<!--\/S:HEAD-->$/g, ''));
  else html = html.replace(/<nav>[\s\S]*?<\/nav>/, () => head);
  if (!html.includes('assets/css/journal.css')) html = html.replace('</head>', `  ${FONTS}\n  <link rel="stylesheet" href="assets/css/journal.css">\n</head>`);
  html = setBlock(html, 'FEATURED', `<div class="featured-grid">\n${feat}\n</div>`);
  html = setBlock(html, 'CATS', '');
  html = setBlock(html, 'NEWSLETTER', '');
  html = setBlock(html, 'FOOTER', footer('fr'));
  if (!html.includes('assets/css/site.css')) html = html.replace('</head>', '  <link rel="stylesheet" href="assets/css/site.css">\n</head>');
  if (!html.includes('assets/js/site.js')) html = html.replace('</body>', '  <script src="assets/js/site.js" defer></script>\n</body>');
  html = fixFonts(html);
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


// ── llms.txt : plan du site lisible par les assistants IA (ChatGPT, Claude, Perplexity…) ──
function buildLlms(published) {
  const L = (lang) => published.filter((a) => (a.lang || (a.slug && a.slug.startsWith('en/') ? 'en' : null)) === lang || prettyUrl(a.slug).startsWith('/' + lang + '/'))
    .map((a) => `- [${a.title}](${DOMAIN}${prettyUrl(a.slug)})${a.desc ? ': ' + a.desc.replace(/\s+/g, ' ') : ''}`);
  const txt = `# ${BRAND}

> ${BRAND} is a bilingual (French/English) independent publication with one new sourced article every day, covering short-term rental and property management, real estate investment, AI and automation for small businesses, trades and contractors, business and freelancing, social media, tech and sustainability. Every article states its numbers, shows the calculation and cites its sources. ${BRAND} is published by AlturaCom (https://alturacom-production.odoo.com), a digital agency; products of the same publisher are disclosed as such.

## Sections
${CATS.map((c) => `- ${c.en.name}: ${c.en.desc}`).join('\n')}

## Articles (English)
${L('en').join('\n') || '- (coming)'}

## Articles (Français)
${L('fr').join('\n') || '- (à venir)'}

## Community authors
- [Community voices](${DOMAIN}/en/community): pieces by independent authors, published without editorial review, links marked nofollow.
- [Tribune des auteurs](${DOMAIN}/fr/tribune)

## Reuse and citation
- [Citing and reusing our articles](${DOMAIN}${PAGES.reuse.en}): short quotations with attribution and a link to the source are welcome.
`;
  wr('llms.txt', txt);
}

// ── Main ─────────────────────────────────────────────────────────────────────
function build() {
  const schedule = readSchedule();
  const published = schedule.filter((a) => a.slug).sort((a, b) => b.date.localeCompare(a.date));

  ['fr', 'en'].forEach((lang) => {
    buildLangIndex(lang, published, schedule);
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
  buildLlms(published);
  console.log(`✅ build-site : ${published.length} articles publiés, ${CATS.length * 2} pages rubriques, sitemap régénéré`);
}

if (require.main === module) build();
module.exports = { build };
