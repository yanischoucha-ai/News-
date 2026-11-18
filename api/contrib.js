// Vercel serverless : pages publiques des textes d'auteurs (rendu côté serveur, donc indexable).
//   /fr/tribune, /en/community            → liste       (?lang=fr|en)
//   /fr/tribune/:slug, /en/community/:slug → un texte    (?lang=..&slug=..)
//   /sitemap-tribune.xml                  → plan du site (?sitemap=1)
// Lit uniquement les textes status = approved via la clé publique (RLS).
const fs = require('fs');
const path = require('path');
const MD = require('../assets/js/md.js');

const SB_URL = process.env.SUPABASE_URL || 'https://tucpoqyxtbxqqwtjmyqk.supabase.co';
const SB_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_AUE4MfiPR88DXuiY1FP9fg_pbHRWUUb';
const BASE = { fr: '/fr/tribune', en: '/en/community' };
const TPL = { fr: 'fr/reutilisation-contenu.html', en: 'en/content-reuse.html' };
const TXT = {
  fr: { list: 'Tribune des auteurs', listDesc: 'Textes d’auteurs indépendants : cas réels, chiffres, retours de terrain. Publiés sans relecture éditoriale.', by: 'Par', site: 'Site de l’auteur', note: 'Texte publié par un auteur indépendant, sans relecture éditoriale de la rédaction. Les liens sont déclarés « nofollow ».', report: 'Signaler ce texte', back: '← Tribune des auteurs', empty: 'Les premiers textes arrivent. Vous pouvez écrire le vôtre.', write: 'Écrire un texte', min: 'min de lecture', locale: 'fr-FR', home: 'Accueil', writeUrl: '/fr/espace-auteur', reuse: '/fr/reutilisation-contenu' },
  en: { list: 'Community voices', listDesc: 'Pieces by independent authors: real cases, numbers, field notes. Published without editorial review.', by: 'By', site: 'Author’s site', note: 'Published by an independent author, without editorial review by the newsroom. Links are marked “nofollow”.', report: 'Report this piece', back: '← Community voices', empty: 'The first pieces are coming. You can write yours.', write: 'Write a piece', min: 'min read', locale: 'en-US', home: 'Home', writeUrl: '/en/author-area', reuse: '/en/content-reuse' },
};
const esc = MD.esc;

async function sb(query) {
  const r = await fetch(`${SB_URL}/rest/v1/marge_posts?${query}`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
  if (!r.ok) throw new Error('supabase ' + r.status);
  return r.json();
}
const fmt = (iso, lang) => new Intl.DateTimeFormat(TXT[lang].locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date(iso));

function page(lang, origin, { title, desc, urlPath, main, jsonld, robots = 'index, follow' }) {
  let h = fs.readFileSync(path.join(process.cwd(), TPL[lang]), 'utf8');
  const url = origin + urlPath;
  h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)} | Marge</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<meta name="robots"[^>]*>/, `<meta name="robots" content="${robots}">`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}">`)
    .replace(/\s*<link rel="alternate" hreflang[^>]*>/g, '')
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}">`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(desc)}">`)
    .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}">`)
    .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${jsonld ? 'article' : 'website'}">`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : '')
    .replace(/<main class="s-page">[\s\S]*?<\/main>/, () => main);
  return h;
}

module.exports = async (req, res) => {
  const q = req.query || {};
  const lang = q.lang === 'en' ? 'en' : 'fr';
  const t = TXT[lang];
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const origin = process.env.SITE_URL || 'https://marge.media' || (host ? `https://${host}` : '');
  try {
    if (q.sitemap) {
      const rows = await sb('select=slug,lang,updated_at&status=eq.approved&order=published_at.desc&limit=2000');
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        ['fr', 'en'].map((l) => `<url><loc>${origin}${BASE[l]}</loc><changefreq>daily</changefreq></url>`).join('\n') + '\n' +
        rows.map((r) => `<url><loc>${origin}${BASE[r.lang]}/${esc(r.slug)}</loc><lastmod>${r.updated_at.slice(0, 10)}</lastmod></url>`).join('\n') + '\n</urlset>';
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=3600');
      return res.status(200).send(xml);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    if (q.slug) {
      const rows = await sb(`select=title,summary,body,author_name,author_bio,author_url,slug,published_at,updated_at,lang&status=eq.approved&lang=eq.${lang}&slug=eq.${encodeURIComponent(String(q.slug).slice(0, 80))}&limit=1`);
      const p = rows[0];
      if (!p) { res.statusCode = 404; return res.send(page(lang, origin, { title: '404', desc: '', urlPath: BASE[lang], robots: 'noindex', main: `<main class="s-page"><h1>404</h1><p><a href="${BASE[lang]}">${t.back}</a></p></main>` })); }
      const mins = Math.max(1, Math.round(MD.words(p.body) / 220));
      const desc = p.summary || p.body.replace(/\s+/g, ' ').slice(0, 155);
      const urlPath = `${BASE[lang]}/${p.slug}`;
      const main = `<main class="s-page tr-post"><p class="tr-back"><a href="${BASE[lang]}">${t.back}</a></p>
<article><h1>${esc(p.title)}</h1>
<p class="tr-meta">${t.by} <strong>${esc(p.author_name)}</strong> · <time datetime="${p.published_at}">${fmt(p.published_at, lang)}</time> · ${mins} ${t.min}</p>
${p.summary ? `<p class="s-intro">${esc(p.summary)}</p>` : ''}
<div class="article-body tr-body">${MD.render(p.body)}</div>
<aside class="tr-author"><strong>${esc(p.author_name)}</strong>${p.author_bio ? `<p>${esc(p.author_bio)}</p>` : ''}${p.author_url ? `<p><a href="${esc(p.author_url)}" rel="nofollow ugc sponsored noopener" target="_blank">${t.site}</a></p>` : ''}</aside>
<p class="tr-note">${t.note} <a href="${t.reuse}">${t.report}</a></p></article></main>`;
      const jsonld = { '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: desc, inLanguage: t.locale, datePublished: p.published_at, dateModified: p.updated_at, author: { '@type': 'Person', name: p.author_name }, mainEntityOfPage: origin + urlPath, publisher: { '@type': 'Organization', name: 'Marge' } };
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
      return res.status(200).send(page(lang, origin, { title: p.title, desc, urlPath, main, jsonld }));
    }

    const rows = await sb(`select=title,summary,author_name,slug,published_at&status=eq.approved&lang=eq.${lang}&order=published_at.desc&limit=60`);
    const items = rows.map((r) => `<li><a href="${BASE[lang]}/${esc(r.slug)}"><span class="tr-t">${esc(r.title)}</span>${r.summary ? `<span class="tr-s">${esc(r.summary)}</span>` : ''}<span class="tr-m">${t.by} ${esc(r.author_name)} · ${fmt(r.published_at, lang)}</span></a></li>`).join('');
    const main = `<main class="s-page"><h1>${t.list}</h1><p class="s-intro">${t.listDesc}</p>
${items ? `<ul class="tr-list">${items}</ul>` : `<p class="s-empty">${t.empty}</p>`}
<p><a class="tr-cta" href="${t.writeUrl}">${t.write}</a></p></main>`;
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).send(page(lang, origin, { title: t.list, desc: t.listDesc, urlPath: BASE[lang], main }));
  } catch (e) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(503).send('Temporarily unavailable');
  }
};
