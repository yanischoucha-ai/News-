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

const { BRAND, DOMAIN, CATS, PAGES, T, PAGE_CONTENT, catPath, NOINDEX, pillarForDate } = C;
const EX = require('./extras');
Object.assign(PAGES, EX.PAGES); Object.assign(PAGE_CONTENT, EX.CONTENT);
const SLUG_CAT = {};
const ROOT = path.join(__dirname, '..');
const rd = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const wr = (p, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), p.endsWith('.html') ? s.replace(/<main(?![^>]*\bid=)/, '<main id="contenu"') : s); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const prettyUrl = (slug) => slug.replace(/\.html$/, '');
const catById = (id) => CATS.find((c) => c.id === id) || CATS[0];

// ── Images d'illustration (assets/data/images.json, photos libres de droits créditées) ──
const IMAGES = (() => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data/images.json'), 'utf8')); } catch (e) { return {}; } })();
const imgOf = (slug) => {
  const v = IMAGES[slug];
  if (!v) return null;
  const base = path.basename(slug, '.html');
  const big = `/assets/img/articles/${base}.jpg`;
  const sm = `/assets/img/articles/${base}-sm.jpg`;
  if (!fs.existsSync(path.join(ROOT, big.slice(1)))) return null;
  return { ...v, big, sm: fs.existsSync(path.join(ROOT, sm.slice(1))) ? sm : big };
};
const altOf = (im, lang) => (im.alt && (im.alt[lang] || im.alt.fr || im.alt.en)) || '';
const thumb = (a, lang, cls = 'j-thumb', size = 'sm', eager = false) => {
  const im = imgOf(a.slug);
  if (!im) return '';
  return `<span class="${cls}"><img src="${size === 'big' ? im.big : im.sm}" alt="${esc(altOf(im, lang))}" width="${size === 'big' ? 1600 : 720}" height="${size === 'big' ? 900 : 405}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></span>`;
};
const creditHtml = (im, lang) => {
  const src = im.source || 'Unsplash';
  const srcUrl = im.page || 'https://unsplash.com';
  return `${lang === 'fr' ? 'Photo' : 'Photo'} : <a href="${esc(im.authorUrl || srcUrl)}" rel="noopener">${esc(im.author)}</a> / <a href="${esc(srcUrl)}" rel="noopener">${esc(src)}</a>`;
};

// ── Données ──────────────────────────────────────────────────────────────────
function readSchedule() {
  const src = fs.readFileSync(path.join(ROOT, 'assets/js/editorial-clock.js'), 'utf8');
  const m = src.match(/const SCHEDULE = (\[[\s\S]*?\]);/);
  if (!m) throw new Error('SCHEDULE introuvable dans editorial-clock.js');
  const list = new Function('return ' + m[1])();
  return list.map((a) => ({ ...a, cat: a.cat || pillarForDate(a.date) }));
}

const FR_M = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const EN_M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fmt(date, lang) {
  const [y, m, d] = date.split('-').map(Number);
  return lang === 'fr' ? `${d} ${FR_M[m - 1]} ${y}` : `${EN_M[m - 1]} ${d}, ${y}`;
}

// ── Partials ─────────────────────────────────────────────────────────────────
const nlForm = (lang, id, cta, pillar) => {
  const t = T[lang];
  return `<form class="s-form" data-s-form="newsletter" data-ok="${esc(t.nlOk)}">
  <input type="hidden" name="pillar" value="${pillar || 'all'}">
  <label class="s-sr" for="nl-${id}">${t.emailLabel}</label>
  <input id="nl-${id}" type="email" name="email" required maxlength="254" placeholder="${t.emailPh}" autocomplete="email">
  <div class="s-hp" aria-hidden="true" inert><input type="text" name="website" tabindex="-1" autocomplete="off"></div>
  <button type="submit">${esc(cta)}</button>
  <p class="s-form-msg" role="status" aria-live="polite"></p>
</form>`;
};

const newsletter = (lang, pillar) => {
  const t = T[lang];
  const pc = pillar && CATS.find((c) => c.id === pillar);
  const title = pc ? (lang === 'fr' ? `La newsletter ${pc.fr.name}` : `The ${pc.en.name} newsletter`) : t.nlTitle;
  const lead = pc ? (lang === 'fr' ? 'Les meilleurs articles et outils de ce pilier, par email, sans autre sujet.' : 'The best articles and tools of this pillar, by email, nothing else.') : t.nlLead;
  return `<section class="s-newsletter"><div class="s-newsletter-inner">
<h2>${esc(title)}</h2>
<p class="s-lead">${esc(lead)}</p>
${nlForm(lang, 'box', t.nlCta, pillar)}
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
<div class="sf-col"><p class="sf-h">${t.footTitle1}</p>${CATS.map((c) => `<a href="${catPath(lang, c.id)}">${esc(c[lang].name)}</a>`).join('')}</div>
<div class="sf-col"><p class="sf-h">${t.footTitle2}</p><a href="/${lang}/">${esc(t.latest)}</a><a href="${PAGES.write[lang]}">${esc(t.write)}</a><a href="${lang === 'fr' ? '/fr/tribune' : '/en/community'}">${lang === 'fr' ? 'Tribune des auteurs' : 'Community voices'}</a><a href="${PAGES.method[lang]}">${lang === 'fr' ? 'Comment nous travaillons' : 'How we work'}</a><a href="${PAGES.reuse[lang]}">${esc(t.reuse)}</a><a href="${PAGES.about[lang]}">${lang === 'fr' ? 'À propos' : 'About'}</a><a href="${PAGES.money[lang]}">${lang === 'fr' ? 'Comment nous gagnons de l’argent' : 'How we make money'}</a><a href="${PAGES.contact[lang]}">Contact</a><a href="${PAGES.legal[lang]}">${lang === 'fr' ? 'Mentions légales' : 'Legal notice'}</a><a href="${PAGES.search[lang]}">${lang === 'fr' ? 'Recherche' : 'Search'}</a><a href="/${other}/">${esc(t.other)}</a></div>
</div>
<div class="sf-legal">${esc(lang === 'fr' ? `${BRAND} est édité par ` : `${BRAND} is published by `)}<a href="https://alturacom-production.odoo.com" rel="noopener">AlturaCom</a>. ${esc(t.legal)} <a href="${PAGES.reuse[lang]}">${esc(t.legalMore)}</a>.</div>
</footer>`;
};

const MH = {
  fr: { tag: 'Le brief quotidien pour développer son activité', sub: 'Newsletter', more: 'Tout voir', up: 'Prochainement', all: 'Toute l’actualité', top: 'À la une', calH: 'Un nouvel article chaque jour, 7 jours sur 7.', dailySub: 'En français et en anglais · voir la semaine →', calP: 'Une rubrique par jour, en français et en anglais. Voici la semaine qui vient.', today: 'Aujourd’hui', done: 'Publié', soon: 'À venir', calNl: 'Recevoir la semaine par email', calNlP: 'Un seul email, le meilleur des 7 jours.', behindH: 'Derrière Marge Brief', behindP: 'Marge Brief est édité par AlturaCom. Nous le disons clairement : voici nos projets, présentés comme tels.', nlH: 'Les chiffres de la semaine, dans votre boîte mail.', nlP: 'Un seul email par semaine, que du concret : cas réels, chiffres vérifiés, zéro généralité.', date: 'fr-FR' },
  en: { tag: 'The daily brief to grow your business', sub: 'Newsletter', more: 'See all', up: 'Coming up', all: 'All stories', top: 'Top stories', calH: 'A new article every day, 7 days a week.', dailySub: 'In English and French · see the week →', calP: 'One topic per day, in English and French. Here is the week ahead.', today: 'Today', done: 'Published', soon: 'Coming up', calNl: 'Get the week by email', calNlP: 'One email, the best of the 7 days.', behindH: 'Behind Marge Brief', behindP: 'Marge Brief is published by AlturaCom. We say so plainly: here are our projects, presented as ours.', nlH: 'The week’s numbers, in your inbox.', nlP: 'One email a week, only what you can use: real cases, verified numbers, no filler.', date: 'en-US' },
};
const FONTS = '<link rel="preload" href="/assets/fonts/newsreader-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/fonts/inter-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>';
const fixFonts = (html) => {
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.g[^>]*>\s*/g, '').replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis[^>]*>\s*/g, '');
  if (!html.includes('/assets/fonts/')) html = html.replace(/(\s*<link rel="stylesheet" href="[^"]*journal\.css">)/, `\n  ${FONTS}$1`);
  return html;
};
const shortTitle = (t) => {
  if (t.length <= 60) return t;
  const m = t.split(/\s*[:\u2014]\s+/)[0];
  return m.length >= 25 && m.length <= 60 ? m : t;
};
const nav = (lang, alt, current) => {
  const t = T[lang]; const m = MH[lang];
  const nl = current === 'home' ? '#newsletter' : `/${lang}/#newsletter`;
  const menuLbl = lang === 'fr' ? 'Menu' : 'Menu';
  const cats = CATS.map((c) => `<a href="${catPath(lang, c.id)}"${c.id === current ? ' aria-current="page"' : ''}>${esc(c[lang].name)}</a>`).join('');
  return `<!--S:HEAD-->
<a class="skip-link" href="#contenu">${lang === 'fr' ? 'Aller au contenu' : 'Skip to content'}</a>
<header class="mh">
  <div class="mh-bar">
    <a class="mh-logo" href="/${lang}/">${BRAND}<i>.</i></a>
    <p class="mh-tag">${esc(m.tag)}</p>
    <div class="mh-tools">
      <a class="mh-write mh-tools-link" href="/${lang}/${lang === 'fr' ? 'outils' : 'tools'}/">${lang === 'fr' ? 'Outils gratuits' : 'Free tools'}</a>
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
      <div class="mh-nav-extra"><a class="mh-nav-tools" href="/${lang}/${lang === 'fr' ? 'outils' : 'tools'}/"${current === 'tools' ? ' aria-current="page"' : ''}>${lang === 'fr' ? 'Outils gratuits' : 'Free tools'}</a><a href="${PAGES.search[lang]}">${lang === 'fr' ? 'Recherche' : 'Search'}</a><a href="${PAGES.write[lang]}">${esc(t.write)}</a><a class="mh-nav-cta" href="${nl}">${m.sub}</a></div>
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
  <meta property="og:image" content="${DOMAIN}/assets/img/og-default.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/assets/css/blog.css">
  <link rel="stylesheet" href="/assets/css/site.css">
  ${FONTS}
  <link rel="stylesheet" href="/assets/css/journal.css">
  <script type="application/ld+json">${JSON.stringify(jsonld)}</script>
</head>
<body>
${nav(lang, alt, current)}
${body.includes('<main') ? body : `<main>${body}</main>`}
${footer(lang)}
<script src="/assets/js/site.js" defer></script>
${body.includes('au-form') ? '<script src="/assets/js/author.js" defer></script>' : ''}
</body>
</html>
`;
}

const jItem = (a, lang, withDesc) => `<a class="j-item${imgOf(a.slug) ? ' has-img' : ''}" href="${prettyUrl(a.slug)}">${thumb(a, lang)}<span class="j-kicker">${esc(catById(a.cat)[lang].name)}</span><h3>${esc(a.title)}</h3>${withDesc && a.desc ? `<p>${esc(a.desc)}</p>` : ''}<span class="j-meta">${fmt(a.date, lang)}${a.min ? ` · ${a.min} ${T[lang].readMin}` : ''}</span></a>`;


const parisToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
const addDays = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

// Calendrier des 7 prochains jours (accueil)
function calendar(lang, schedule) {
  const m = MH[lang]; const today = parisToday();
  const locale = lang === 'fr' ? 'fr-FR' : 'en-US';
  const cells = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(today, i);
    const cat = catById(pillarForDate(date));
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
  const leadHtml = lead ? `<a class="j-lead" href="${prettyUrl(lead.slug)}">${thumb(lead, lang, 'j-lead-img', 'big', true)}<span class="j-kicker">${esc(catById(lead.cat)[lang].name)}</span><h2>${esc(lead.title)}</h2>${lead.desc ? `<p>${esc(lead.desc)}</p>` : ''}<span class="j-meta">${fmt(lead.date, lang)}${lead.min ? ` · ${lead.min} ${t.readMin}` : ''}</span></a>` : '';
  const catSecs = rest.length ? `<section class="j-sec"><div class="j-sec-h"><h2>${esc(m.all)}</h2></div><div class="j-grid">${rest.slice(0, 12).map((a) => jItem(a, lang, true)).join('')}</div></section>` : '';
  const body = `<h1 class="s-sr">${esc(t.heroH1)}</h1>
<a class="j-daily" href="#calendrier"><span class="j-daily-dot" aria-hidden="true"></span><strong>${esc(m.calH)}</strong><span class="j-daily-sub">${esc(m.dailySub)}</span></a>
<div class="j-wrap"><div class="j-top">${leadHtml}<aside><h2 class="j-side-h"><span>${m.top}</span></h2>${side.map((a) => jItem(a, lang, false)).join('')}</aside></div></div>
${toolsSection(lang)}
${calendar(lang, schedule)}
<section class="j-nl" id="newsletter"><div class="j-nl-in"><div><h2>${esc(m.nlH)}</h2><p>${esc(m.nlP)}</p></div><div>${nlForm(lang, 'home', t.nlCta)}<p class="s-form-note">${esc(t.note)}</p></div></div></section>
<div class="j-wrap">${catSecs}</div>
<div style="height:2.5rem"></div>`;
  wr(`${lang}/index.html`, shell({
    lang, title: `${t.siteTitle} | ${BRAND}`, desc: t.siteDesc, urlPath: `/${lang}/`, alt: { fr: '/fr/', en: '/en/' }, body, current: 'home',
    jsonld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${BRAND} — ${t.siteTitle}`, description: t.siteDesc, url: `${DOMAIN}/${lang}/`, inLanguage: t.locale, isPartOf: { '@type': 'WebSite', name: BRAND, url: DOMAIN + '/' } },
  }));
}


const TOOL_HOME = (lang) => `/${lang}/${lang === 'fr' ? 'outils' : 'tools'}/`;
function toolCards(lang, ids) {
  const fr = lang === 'fr';
  return EX.TOOLS.filter((t) => !ids || ids.includes(t.id)).map((t) => `<a class="tool-card" href="${EX.toolPath(t, lang)}"><span class="tool-card-k">${fr ? 'Outil gratuit' : 'Free tool'}</span><strong>${esc(t[lang].title)}</strong><span>${esc(t[lang].desc)}</span><span class="tool-card-go">${fr ? 'Ouvrir le calculateur →' : 'Open the calculator →'}</span></a>`).join('');
}
function toolsSection(lang) {
  const fr = lang === 'fr';
  return `<section class="s-section tools-strip" id="outils"><div class="j-wrap"><h2 class="j-side-h"><span>${fr ? 'Outils gratuits, sans inscription' : 'Free tools, no signup'}</span></h2><div class="tool-cards">${toolCards(lang)}</div></div></section>`;
}
function buildToolsIndex(lang) {
  const fr = lang === 'fr'; const p = TOOL_HOME(lang);
  const alt = { fr: TOOL_HOME('fr'), en: TOOL_HOME('en') };
  const title = fr ? 'Outils gratuits pour hôtes, artisans et éditeurs de SaaS' : 'Free tools for hosts, contractors and SaaS founders';
  const desc = fr ? 'Calculateurs gratuits, sans inscription : rentabilité d’une location courte durée, coût d’un appel manqué, CAC et délai de récupération.' : 'Free calculators, no signup: short-term rental profitability, cost of a missed call, CAC and payback period.';
  wr(p.slice(1) + 'index.html', shell({ lang, title: `${title} | ${BRAND}`, desc, urlPath: p, alt, current: 'tools', body: `<main class="s-page"><h1>${title}</h1><p class="s-intro">${fr ? 'Chaque outil se calcule dans votre navigateur, rien n’est envoyé. Les valeurs affichées sont des exemples : remplacez-les par les vôtres.' : 'Every tool runs in your browser and nothing is sent. The values shown are examples: replace them with yours.'}</p><div class="tool-cards">${toolCards(lang)}</div></main>`, jsonld: { '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url: DOMAIN + p, inLanguage: T[lang].locale } }));
}

function pillarExtras(lang, cat, list) {
  const fr = lang === 'fr';
  const tools = EX.TOOLS.filter((t) => t.id === cat.id);
  const src = new Map();
  list.forEach((a) => {
    const f = path.join(ROOT, a.slug.replace(/^\//, ''));
    if (!fs.existsSync(f)) return;
    const h = fs.readFileSync(f, 'utf8');
    const m = h.match(/<ol class="article-sources">([\s\S]*?)<\/ol>/);
    if (!m) return;
    (m[1].match(/<a [^>]*href="https?:[^"]+"[^>]*>[\s\S]*?<\/a>/g) || []).forEach((x) => {
      const u = (x.match(/href="([^"]+)"/) || [])[1]; const tx = x.replace(/<[^>]+>/g, '').trim();
      if (u && !/residencemanager|mayapilot|alturacom|margebrief/.test(u) && !src.has(u)) src.set(u, tx);
    });
  });
  return `${tools.length ? `<section class="s-section"><h2 class="s-h2">${fr ? 'Outils gratuits' : 'Free tools'}</h2><ul class="s-upcoming">${tools.map((t) => `<li><a href="${EX.toolPath(t, lang)}">${esc(t[lang].title)}</a> <span>${esc(t[lang].desc)}</span></li>`).join('')}</ul></section>` : ''}
${src.size ? `<section class="s-section"><h2 class="s-h2">${fr ? 'Sources citées dans nos articles' : 'Sources cited in our articles'}</h2><ul class="s-sources">${[...src].map(([u, tx]) => `<li><a href="${esc(u)}" rel="noopener">${esc(tx || u)}</a></li>`).join('')}</ul></section>` : ''}`;
}

function buildCategory(lang, cat, schedule, published) {
  const t = T[lang];
  const c = cat[lang];
  const list = published.filter((a) => a.lang === lang && a.cat === cat.id);
  const today = parisToday();
  const next = schedule.filter((a) => !a.slug && a.lang === lang && a.cat === cat.id && a.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const n = list.length;
  const countTxt = lang === 'fr' ? `${n} article${n > 1 ? 's' : ''} publié${n > 1 ? 's' : ''}` : `${n} article${n > 1 ? 's' : ''} published`;
  const h3to2 = (x) => x.replace(/<h3>/g, '<h2>').replace(/<\/h3>/g, '</h2>');
  const body = h3to2(`<header class="s-cat-head"><span class="s-cat-kicker">${lang === 'fr' ? 'Rubrique' : 'Section'}</span><h1>${esc(c.name)}</h1><p>${esc(c.desc)}</p><span class="s-cat-meta">${countTxt}${next.length ? ` · ${lang === 'fr' ? 'prochain le' : 'next on'} ${fmt(next[0].date, lang)}` : ''}</span></header>
<section class="s-section">
${list.length ? `<div class="j-grid">${list.map((a) => jItem(a, lang, true)).join('')}</div>` : `<p class="s-empty">${esc(t.emptyCat)}</p>`}
</section>
${next.length ? `<section class="s-section"><h2 class="s-h2">${esc(t.upcoming)}</h2><ul class="s-upcoming">${next.map((a) => `<li><time datetime="${a.date}">${fmt(a.date, lang)}</time><span>${esc(a.title)}</span></li>`).join('')}</ul></section>` : ''}
${pillarExtras(lang, cat, list)}
<div style="height:2.5rem"></div>
${newsletter(lang, cat.id)}`);
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
  html = html.replace(/<title>([^<]*?) \u2014 ([^<]*)<\/title>/, (m, a, b) => `<title>${shortTitle(a)} \u2014 ${b}</title>`);
  // anciens articles : habillage ALTURA / Résidence Manager → Marge Brief
  const legacy = /<p class="meta">(ALTURA|Résidence Manager) ·/.test(html);
  if (legacy) {
    html = html.replace(/(<title>[^<]*?) \| (ALTURA|Résidence Manager)(<\/title>)/, `$1 | ${BRAND}$3`);
    html = html.replace(/"author": \{[^}]*\}/, `"author": { "@type": "Organization", "name": "${BRAND}" }`);
    html = html.replace(/"publisher": \{[^}]*\}/, `"publisher": { "@type": "Organization", "name": "${BRAND}", "url": "${DOMAIN}" }`);
    html = html.replace(/<p class="meta">(ALTURA|Résidence Manager) ·/, lang === 'fr' ? `<p class="meta">Rédaction ${BRAND} ·` : `<p class="meta">${BRAND} Newsroom ·`);
  }
  // photo d'illustration + og:image (assets/data/images.json)
  const slug = '/' + lang + '/' + path.basename(file);
  const im = imgOf(slug);
  if (im) {
    const fig = `<figure class="article-hero"><img src="${im.big}" alt="${esc(altOf(im, lang))}" width="1600" height="900" fetchpriority="high" decoding="async"><figcaption>${creditHtml(im, lang)}</figcaption></figure>`;
    html = setBlock(html, 'IMG', fig, (h, b) => h.replace(/(<header class="article-header">[\s\S]*?<\/header>)/, (m) => `${m}\n      ${b}`));
    const og = `<meta property="og:image" content="${DOMAIN}${im.big}">\n  <meta property="og:image:width" content="1600">\n  <meta property="og:image:height" content="900">\n  <meta property="og:image:alt" content="${esc(altOf(im, lang))}">\n  <meta name="twitter:card" content="summary_large_image">\n  <meta name="twitter:image" content="${DOMAIN}${im.big}">`;
    html = setBlock(html, 'OGIMG', og, (h, b) => h.replace('</head>', () => `  ${b}\n</head>`));
  }
  const pcx = SLUG_CAT[slug];
  if (pcx) { const tl = EX.TOOLS.find((t) => t.id === pcx); if (tl) { const box = `<aside class="article-tool"><strong>${lang === 'fr' ? 'À refaire avec vos chiffres' : 'Run it with your numbers'}</strong> <a href="${EX.toolPath(tl, lang)}">${esc(tl[lang].title)}</a> <span>${lang === 'fr' ? '(gratuit, sans inscription)' : '(free, no signup)'}</span></aside>`; html = setBlock(html, 'TOOLBOX', box, (h, b) => h.replace(/(<section class="article-sources"|<h2[^>]*>(?:Sources|Sources et références)<\/h2>)/, (m) => `${b}\n${m}`)); } }
  const pc = SLUG_CAT[slug];
  if (pc) html = html.replace(/<span class="article-tag">[^<]*<\/span>/, `<span class="article-tag">${esc(catById(pc)[lang].name).replace(/&amp;/g, '&amp;')}</span>`);
  const dm = (html.match(/"dateModified":"(\d{4}-\d{2}-\d{2})"/) || [])[1];
  html = html.replace(/<span class="article-updated">[^<]*<\/span>\s*/, '');
  if (dm) html = html.replace(/(<span class="article-date">[^<]*<\/span>)/, `$1\n          <span class="article-updated">${lang === 'fr' ? 'Mis à jour et vérifié le' : 'Updated and verified'} ${fmt(dm, lang)}</span>`);
  html = fixFonts(html);
  html = html.replace(/\n?<footer>\s*<p>&copy;[\s\S]*?<\/footer>\n?/, '\n');
  const head = nav(lang, alt, null);
  if (/<!--S:HEAD-->/.test(html)) html = setBlock(html, 'HEAD', head.replace(/^<!--S:HEAD-->\n|\n<!--\/S:HEAD-->$/g, ''));
  else html = html.replace(/<nav[\s\S]*?<\/nav>/, () => head);
  const hasMain = html.includes('</main>');
  html = html.replace(/<!--S:PROMO-->[\s\S]*?<!--\/S:PROMO-->\n?/, '');
  html = setBlock(html, 'NEWSLETTER', newsletter(lang, SLUG_CAT[slug]), (h, b) => (hasMain ? h.replace('</main>', () => `${b}\n</main>`) : h.replace('</body>', () => `${b}\n</body>`)));
  html = setBlock(html, 'FOOTER', footer(lang), (h, b) => (hasMain ? h.replace('</main>', () => `</main>\n${b}`) : h.replace('</body>', () => `${b}\n</body>`)));
  fs.writeFileSync(file, html.replace(/<main(?![^>]*\bid=)/, '<main id="contenu"'));
}

function buildHome(published) {
  const p = path.join(ROOT, 'index.html');
  if (!fs.existsSync(p)) return;
  let html = fs.readFileSync(p, 'utf8');
  const fr = published.filter((a) => a.lang === 'fr');
  const en = published.filter((a) => a.lang === 'en');
  const picks = [fr[0], en[0], fr[1], en[1]].filter(Boolean);
  const feat = picks.map((a, i) => `<a class="featured-card${i === 0 ? ' big' : ''}" href="${prettyUrl(a.slug)}">
  ${thumb(a, a.lang, 'card-img', i === 0 ? 'big' : 'sm', i === 0)}
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
  if (!html.includes('<main')) html = html.replace('<!--/S:HEAD-->', '<!--/S:HEAD-->\n<main id="contenu"><h1 class="s-sr">Marge Brief</h1>').replace('<!--S:FOOTER-->', '</main>\n<!--S:FOOTER-->');
  if (!/<h1[ >]/.test(html)) html = html.replace(/<main id="contenu">/, '<main id="contenu"><h1 class="s-sr">Marge Brief</h1>');
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
  out.push(url(TOOL_HOME('fr'), latest, 'monthly', '0.8', { fr: TOOL_HOME('fr'), en: TOOL_HOME('en') }), url(TOOL_HOME('en'), latest, 'monthly', '0.8', { fr: TOOL_HOME('fr'), en: TOOL_HOME('en') }));
  EX.TOOLS.forEach((t) => ['fr', 'en'].forEach((l) => out.push(url(EX.toolPath(t, l), latest, 'monthly', '0.7', { fr: EX.toolPath(t, 'fr'), en: EX.toolPath(t, 'en') }))));
  published.filter((a) => !NOINDEX.includes(a.slug)).forEach((a) => out.push(url(prettyUrl(a.slug), a.date, 'monthly', '0.8')));
  wr('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${out.join('\n')}\n</urlset>\n`);
}


// ── llms.txt : plan du site lisible par les assistants IA (ChatGPT, Claude, Perplexity…) ──
function buildLlms(allPublished) {
  const published = allPublished.filter((a) => !NOINDEX.includes(a.slug));
  const L = (lang) => published.filter((a) => (a.lang || (a.slug && a.slug.startsWith('en/') ? 'en' : null)) === lang || prettyUrl(a.slug).startsWith('/' + lang + '/'))
    .map((a) => `- [${a.title}](${DOMAIN}${prettyUrl(a.slug)})${a.desc ? ': ' + a.desc.replace(/\s+/g, ' ') : ''}`);
  const txt = `# ${BRAND}

> ${BRAND} is a bilingual (French/English) independent publication with one new sourced article every day, covering three pillars only: short-term rental hosts, contractors and small service businesses, and SaaS marketing and growth. English content targets the United States, French content targets France. Every article states its numbers, shows the calculation and cites its sources. ${BRAND} is published by AlturaCom (https://alturacom-production.odoo.com), a digital agency; products of the same publisher are disclosed as such.

## Sections
${CATS.map((c) => `- ${c.en.name}: ${c.en.desc}`).join('\n')}

## Articles (English)
${L('en').join('\n') || '- (coming)'}

## Articles (Français)
${L('fr').join('\n') || '- (à venir)'}

## Community authors
- [Community voices](${DOMAIN}/en/community): pieces by independent authors, published without editorial review, links marked nofollow.
- [Tribune des auteurs](${DOMAIN}/fr/tribune)

## Editorial method
- [How we work](${DOMAIN}${PAGES.method.en}): who publishes, how articles are written and checked (AI-assisted, sourced, dated), rules and corrections. Français : [Comment nous travaillons](${DOMAIN}${PAGES.method.fr}).

## Reuse and citation
- [Citing and reusing our articles](${DOMAIN}${PAGES.reuse.en}): short quotations with attribution and a link to the source are welcome.
`;
  wr('llms.txt', txt);
}

// ── Main ─────────────────────────────────────────────────────────────────────
// Versionne les CSS/JS (?v=hash du contenu) pour que les navigateurs, dont ceux intégrés à Instagram, rechargent après chaque changement.
function versionAssets() {
  const crypto = require('crypto');
  const hashes = {};
  const hashOf = (rel) => {
    if (!hashes[rel]) {
      const f = path.join(ROOT, rel);
      hashes[rel] = fs.existsSync(f) ? crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex').slice(0, 8) : '0';
    }
    return hashes[rel];
  };
  const files = [path.join(ROOT, 'index.html')];
  ['fr', 'en'].forEach((l) => {
    const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
      const f = path.join(dir, d.name);
      if (d.isDirectory()) walk(f); else if (d.name.endsWith('.html')) files.push(f);
    });
    if (fs.existsSync(path.join(ROOT, l))) walk(path.join(ROOT, l));
  });
  files.filter((f) => fs.existsSync(f)).forEach((f) => {
    const html = fs.readFileSync(f, 'utf8');
    const out = html.replace(/((?:src|href)=")(\/?assets\/(?:css|js)\/[\w.-]+\.(?:css|js))(?:\?v=\w+)?(")/g, (m, a, u, c) => `${a}${u}?v=${hashOf(u.replace(/^\//, ''))}${c}`);
    if (out !== html) fs.writeFileSync(f, out);
  });
}

// Pages mises en noindex (articles à réécrire) : meta robots + hors sitemap
function applyNoindex() {
  NOINDEX.forEach((slug) => {
    const f = path.join(ROOT, slug.replace(/^\//, ''));
    if (!fs.existsSync(f)) return;
    let html = fs.readFileSync(f, 'utf8');
    const tag = '<meta name="robots" content="noindex, follow">';
    const out = /<meta name="robots"[^>]*>/.test(html) ? html.replace(/<meta name="robots"[^>]*>/, tag) : html.replace('</head>', `  ${tag}\n</head>`);
    if (out !== html) fs.writeFileSync(f, out);
  });
}

function buildTool(t, lang) {
  const c = t[lang]; const urlPath = EX.toolPath(t, lang);
  const alt = { fr: EX.toolPath(t, 'fr'), en: EX.toolPath(t, 'en') };
  wr(urlPath.slice(1) + '.html', shell({
    lang, title: `${c.title} | ${BRAND}`, desc: c.desc, urlPath, alt, body: EX.toolBody(t, lang), current: t.id,
    jsonld: { '@context': 'https://schema.org', '@type': 'WebApplication', name: c.title, description: c.desc, url: DOMAIN + urlPath, inLanguage: T[lang].locale, applicationCategory: 'BusinessApplication', offers: { '@type': 'Offer', price: '0', priceCurrency: lang === 'fr' ? 'EUR' : 'USD' }, publisher: { '@type': 'Organization', name: BRAND, url: DOMAIN + '/' } },
  }));
}

function buildSearchIndex(published) {
  const idx = [];
  published.filter((a) => !NOINDEX.includes(a.slug)).forEach((a) => idx.push({ t: a.title, d: a.desc || '', u: prettyUrl(a.slug), l: a.lang }));
  EX.TOOLS.forEach((t) => ['fr', 'en'].forEach((l) => idx.push({ t: t[l].title, d: t[l].desc, u: EX.toolPath(t, l), l })));
  wr('assets/data/search.json', JSON.stringify(idx));
}

function build() {
  const schedule = readSchedule();
  const published = schedule.filter((a) => a.slug).sort((a, b) => b.date.localeCompare(a.date));

  ['fr', 'en'].forEach((lang) => {
    buildLangIndex(lang, published, schedule);
    CATS.forEach((cat) => buildCategory(lang, cat, schedule, published));
    Object.keys(PAGES).forEach((k) => buildStaticPage(k, lang));
    EX.TOOLS.forEach((t) => buildTool(t, lang));
    buildToolsIndex(lang);
  });
  published.forEach((a) => { SLUG_CAT[a.slug] = a.cat; });
  buildSearchIndex(published);

  const generated = new Set(['index.html', ...Object.values(PAGES).map((p) => path.basename(p.fr) + '.html'), ...Object.values(PAGES).map((p) => path.basename(p.en) + '.html')]);
  ['fr', 'en'].forEach((lang) => {
    fs.readdirSync(path.join(ROOT, lang), { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith('.html') && !generated.has(d.name))
      .forEach((d) => processArticle(path.join(ROOT, lang, d.name), lang));
  });

  buildHome(published);
  buildSitemap(published);
  buildLlms(published);
  applyNoindex();
  versionAssets();
  console.log(`✅ build-site : ${published.length} articles publiés, ${CATS.length * 2} pages rubriques, sitemap régénéré`);
}

if (require.main === module) build();
module.exports = { build };
