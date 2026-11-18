#!/usr/bin/env node
/**
 * new-article.js — génère une page article complète (SEO, JSON-LD Article + FAQPage, sources, citation)
 * à partir d'un fichier JSON de contenu, puis enregistre l'article dans le SCHEDULE.
 *
 * Usage : node scripts/new-article.js chemin/vers/article.json
 *
 * JSON attendu :
 * {
 *   "lang": "fr" | "en",
 *   "date": "2026-11-19",            // doit correspondre à une entrée du SCHEDULE sans slug (date + lang)
 *   "slug": "mon-slug-sans-extension",
 *   "title": "Titre final",
 *   "desc": "Meta description 140-160 caractères (aussi résumé des cartes)",
 *   "subtitle": "Sous-titre sous le H1",
 *   "summary": "Résumé 2-3 phrases (encadré « En résumé »)",
 *   "bodyHtml": "<h2 id=...>...</h2><p>...</p>…",   // contenu uniquement : h2/h3/p/ul/ol/blockquote/table/div.article-callout
 *   "sources": [ { "title": "...", "publisher": "...", "url": "https://...", "date": "2026-10" }, ... ],   // 3 minimum
 *   "faq": [ { "q": "...", "a": "..." }, ... ],      // 4, réponses tirées de l'article
 *   "tags": ["...", "..."],
 *   "cat": "airbnb|ia|immobilier|artisans|tech|business|social"   // facultatif (défaut : entrée du SCHEDULE)
 * }
 * Le script REFUSE l'article (exit 1) s'il contient des tournures génériques, moins de 3 sources, ou une longueur hors plage.
 */
const fs = require('fs');
const path = require('path');
const C = require('./site-config');

const ROOT = path.join(__dirname, '..');
const { BRAND, DOMAIN, CATS } = C;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();

const BANNED = [
  /il est important de noter/i, /il convient de souligner/i, /dans le monde d['’]aujourd['’]hui/i, /à l['’]ère du numérique/i,
  /en conclusion/i, /pour conclure/i, /game[- ]changer/i, /révolutionn/i, /incontournable/i, /plongeons/i, /dans cet article, nous/i,
  /it['’]s important to note/i, /in today['’]s (fast-paced|digital)/i, /in conclusion/i, /to sum up/i, /game[- ]changer/i,
  /revolutioni[sz]/i, /let['’]s dive/i, /delve/i, /in this article, we/i, /unlock the (power|potential)/i,
];
const GENERIC_H2 = /^(introduction|conclusion|avantages|inconv[ée]nients|overview|benefits|final thoughts|summary|pour finir|en résumé)$/i;

function fail(msgs) {
  console.error('❌ Article refusé :\n - ' + msgs.join('\n - '));
  process.exit(1);
}

function validate(a) {
  const errs = [];
  ['lang', 'date', 'slug', 'title', 'desc', 'subtitle', 'summary', 'bodyHtml'].forEach((k) => { if (!a[k]) errs.push(`champ manquant : ${k}`); });
  if (errs.length) fail(errs);
  if (!['fr', 'en'].includes(a.lang)) errs.push('lang doit valoir fr ou en');
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(a.slug)) errs.push('slug invalide (minuscules, chiffres, tirets)');
  if (a.desc.length < 110 || a.desc.length > 175) errs.push(`desc : ${a.desc.length} caractères (visé : 120-165)`);
  const words = plain(a.bodyHtml).split(' ').length;
  if (words < 900 || words > 2300) errs.push(`corps : ${words} mots (visé : 1200-1800, toléré 900-2300)`);
  if (!Array.isArray(a.sources) || a.sources.length < 3) errs.push('au moins 3 sources requises');
  else a.sources.forEach((s, i) => { if (!/^https?:\/\//.test(s.url || '') || !s.title || !s.publisher) errs.push(`source #${i + 1} incomplète (title, publisher, url https)`); });
  if (!Array.isArray(a.faq) || a.faq.length !== 4) errs.push('la FAQ doit contenir exactement 4 questions');
  const h2s = [...a.bodyHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => plain(m[1]));
  if (h2s.length < 4) errs.push('au moins 4 intertitres H2 narratifs');
  h2s.forEach((h) => { if (GENERIC_H2.test(h)) errs.push(`H2 générique interdit : « ${h} »`); });
  const all = [a.title, a.subtitle, a.summary, plain(a.bodyHtml)].join(' ');
  BANNED.forEach((re) => { const m = all.match(re); if (m) errs.push(`tournure générique interdite : « ${m[0]} »`); });
  if (/<h1/i.test(a.bodyHtml)) errs.push('pas de <h1> dans bodyHtml (le titre est généré)');
  if (errs.length) fail(errs);
  return words;
}

function render(a, words, catId) {
  const fr = a.lang === 'fr';
  const cat = CATS.find((c) => c.id === catId)[a.lang].name;
  const url = `${DOMAIN}/${a.lang}/${a.slug}`;
  const [y, m, d] = a.date.split('-').map(Number);
  const FR_M = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const EN_M = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const human = fr ? `${d} ${FR_M[m - 1]} ${y}` : `${EN_M[m - 1]} ${d}, ${y}`;
  const mins = Math.max(1, Math.round(words / 220));
  const L = fr
    ? { read: 'min de lecture', share: '🔗 Copier le lien', sum: 'En résumé :', toc: 'Sommaire', sources: 'Sources', faq: 'Questions fréquentes', back: '← Tous les articles', cite: 'Citer cet article', citeTpl: `Source : « ${a.title} », ${BRAND}, ${human}, ${url}`, nav: 'Articles', other: 'English', otherHref: '/en/', home: '/fr/' }
    : { read: 'min read', share: '🔗 Copy link', sum: 'In short:', toc: 'Contents', sources: 'Sources', faq: 'Frequently asked questions', back: '← All articles', cite: 'Cite this article', citeTpl: `Source: “${a.title}”, ${BRAND}, ${human}, ${url}`, nav: 'Articles', other: 'Français', otherHref: '/fr/', home: '/en/' };
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: a.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
  const artLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.desc, datePublished: a.date, dateModified: a.date,
    author: { '@type': 'Organization', name: BRAND }, publisher: { '@type': 'Organization', name: BRAND }, inLanguage: a.lang,
    mainEntityOfPage: url, citation: a.sources.map((s) => s.url), copyrightHolder: { '@type': 'Organization', name: BRAND }, copyrightYear: y,
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.article-summary', 'h1', '.article-body h2'] },
  };
  const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="${a.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(a.title)} — ${BRAND}</title>
  <meta name="description" content="${esc(a.desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:title" content="${esc(a.title)}">
  <meta property="og:description" content="${esc(a.desc)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta name="copyright" content="© ${y} ${BRAND}">
  <link rel="alternate" hreflang="${a.lang}" href="${url}">
  <link rel="stylesheet" href="/assets/css/blog.css">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script type="application/ld+json">${json(artLd)}</script>
  <script type="application/ld+json">${json(faqLd)}</script>
</head>
<body>

  <nav class="blog-nav">
    <a href="${L.home}" class="blog-logo">${BRAND} <span>/ ${a.lang.toUpperCase()}</span></a>
    <div class="nav-links">
      <a href="${L.home}">${L.nav}</a>
      <a href="${L.otherHref}">${L.other}</a>
    </div>
  </nav>

  <main class="article-container">
    <article>
      <header class="article-header">
        <div class="article-meta">
          <span class="article-tag">${esc(cat)}</span>
          <span class="article-date">${human}</span>
          <span id="read-time">${mins} ${L.read}</span>
        </div>
        <h1>${esc(a.title)}</h1>
        <p class="article-subtitle">${esc(a.subtitle)}</p>
        <div class="article-actions"><button id="share-btn">${L.share}</button></div>
      </header>

      <div class="article-summary"><strong>${L.sum}</strong> ${esc(a.summary)}</div>

      <div id="toc" class="toc-block"><strong>${L.toc}</strong></div>

      <div class="article-body">
${a.bodyHtml}

        <h2 id="sources">${L.sources}</h2>
        <ol class="article-sources">
${a.sources.map((s) => `          <li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a> — ${esc(s.publisher)}${s.date ? `, ${esc(s.date)}` : ''}</li>`).join('\n')}
        </ol>

        <h2 id="faq">${L.faq}</h2>
${a.faq.map((f) => `        <h3>${esc(f.q)}</h3>\n        <p>${esc(f.a)}</p>`).join('\n')}
      </div>

      <footer class="article-footer">
        <div class="article-tags">${(a.tags || []).map((t) => `<span>${esc(t)}</span>`).join('')}</div>
        <p class="article-cite" style="font:.8rem/1.6 system-ui,sans-serif;color:#666;margin-bottom:1.25rem"><strong>${L.cite} :</strong> ${esc(L.citeTpl)}</p>
        <div class="article-nav-links"><a href="${L.home}" class="back-link">${L.back}</a></div>
      </footer>
    </article>
  </main>

  <script src="/assets/js/article.js"></script>
</body>
</html>
`;
}

function main() {
  const file = process.argv[2];
  if (!file) { console.error('Usage : node scripts/new-article.js article.json'); process.exit(1); }
  const a = JSON.parse(fs.readFileSync(file, 'utf8'));
  const words = validate(a);

  const clockPath = path.join(ROOT, 'assets/js/editorial-clock.js');
  const src = fs.readFileSync(clockPath, 'utf8');
  const lines = src.split('\n');
  const idx = lines.findIndex((l) => l.includes(`date: "${a.date}"`) && l.includes(`lang: "${a.lang}"`) && /slug: null/.test(l));
  if (idx < 0) fail([`aucune entrée du SCHEDULE sans slug pour ${a.date} / ${a.lang} (déjà publiée ou date inconnue)`]);
  const old = lines[idx];
  const tag = (old.match(/tag: "([^"]*)"/) || [])[1] || '';
  const defCat = CATS.find((c) => c.dow === new Date(a.date + 'T12:00:00Z').getUTCDay()).id;
  const cat = a.cat || (old.match(/cat: "([^"]*)"/) || [])[1] || defCat;
  if (!CATS.some((c) => c.id === cat)) fail([`cat inconnue : ${cat}`]);

  const outPath = path.join(ROOT, a.lang, `${a.slug}.html`);
  fs.writeFileSync(outPath, render(a, words, cat));

  const mins = Math.max(1, Math.round(words / 220));
  lines[idx] = `    { date: ${JSON.stringify(a.date)}, title: ${JSON.stringify(a.title)}, lang: ${JSON.stringify(a.lang)}, slug: ${JSON.stringify(`/${a.lang}/${a.slug}.html`)}, tag: ${JSON.stringify(a.tagLabel || tag)}, cat: ${JSON.stringify(cat)}, min: ${mins}, desc: ${JSON.stringify(a.desc)} },`;
  fs.writeFileSync(clockPath, lines.join('\n'));
  console.log(`✅ ${a.lang}/${a.slug}.html (${words} mots, ${mins} min) — SCHEDULE mis à jour`);
}

main();
