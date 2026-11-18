#!/usr/bin/env node
/**
 * update-editorial-clock.js
 *
 * Script de mise à jour automatique du planning éditorial.
 * Appelé par la scheduled task quotidienne.
 *
 * Ce qu'il fait :
 * 1. Lit le SCHEDULE dans editorial-clock.js
 * 2. Met à jour les compteurs statiques dans index.html (fallback no-JS)
 * 3. Met à jour le bloc "NOUVEAU" et "Prochain article" du HTML statique
 *
 * Usage : node scripts/update-editorial-clock.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CLOCK_JS = path.join(ROOT, 'assets/js/editorial-clock.js');
const INDEX_HTML = path.join(ROOT, 'index.html');

// ── Lire le SCHEDULE depuis editorial-clock.js ─────────────────────────────
function readSchedule() {
  const src = fs.readFileSync(CLOCK_JS, 'utf8');
  const match = src.match(/const SCHEDULE = (\[[\s\S]*?\]);/);
  if (!match) throw new Error('SCHEDULE not found in editorial-clock.js');
  // eslint-disable-next-line no-eval
  return eval(match[1]);
}

// ── Helpers ────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

// ── Main ──────────────────────────────────────────────────────────────────
function main() {
  const schedule = readSchedule();
  const today = todayStr();

  const published = schedule.filter(a => a.slug !== null && a.date <= today);
  const upcoming = schedule.filter(a => a.slug === null && a.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const todayPub = published.filter(a => a.date === today);
  const nextArticle = upcoming[0] || null;

  // Streak
  const publishedDates = new Set(published.map(a => a.date));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 60; i++) {
    const s = d.toISOString().slice(0, 10);
    if (publishedDates.has(s)) streak++;
    else if (i > 0) break;
    d.setDate(d.getDate() - 1);
  }

  console.log(`📅 Date : ${today}`);
  console.log(`📊 Publiés : ${published.length} | Streak : ${streak} | En cours : ${upcoming.length}`);
  console.log(`📰 Aujourd'hui : ${todayPub.length} articles`);
  if (nextArticle) console.log(`⏭  Prochain : [${nextArticle.date}] ${nextArticle.title}`);

  // ── Mettre à jour les compteurs statiques dans index.html ──────────────
  let html = fs.readFileSync(INDEX_HTML, 'utf8');

  // Stats
  html = html.replace(
    /(<span class="ec-stat-num">)\d+(<\/span>\s*<span class="ec-stat-label">articles publiés<\/span>)/,
    `$1${published.length}$2`
  );
  html = html.replace(
    /(<span class="ec-stat-num">)\d+🔥?(<\/span>\s*<span class="ec-stat-label">jours actifs<\/span>)/,
    `$1${streak > 0 ? streak + '🔥' : '0'}$2`
  );
  html = html.replace(
    /(<span class="ec-stat-num">)\d+(<\/span>\s*<span class="ec-stat-label">articles en cours<\/span>)/,
    `$1${upcoming.length}$2`
  );

  // Section "NOUVEAU" (articles publiés aujourd'hui)
  if (todayPub.length > 0) {
    const links = todayPub.map(a =>
      `      <a href="${a.slug}" class="ec-today-link">${a.lang === 'fr' ? '🇫🇷' : '🇬🇧'} ${a.tag} · ${a.title.substring(0, 50)}${a.title.length > 50 ? '…' : ''}</a>`
    ).join('\n');

    html = html.replace(
      /(<div class="ec-today">[\s\S]*?<span class="ec-new-badge">NOUVEAU<\/span>)([\s\S]*?)(<\/div>\s*<div class="ec-next">)/,
      `$1\n${links}\n    $3`
    );
  }

  // Section "Prochain article"
  if (nextArticle) {
    const dNext = new Date(nextArticle.date + 'T00:00:00');
    const dNow = new Date(); dNow.setHours(0, 0, 0, 0);
    const diff = Math.round((dNext - dNow) / 86400000);
    let when = diff === 0 ? "aujourd'hui" : diff === 1 ? 'demain' : `dans ${diff} jours`;
    const langFlag = nextArticle.lang === 'fr' ? '🇫🇷' : '🇬🇧';
    const shortTitle = nextArticle.title.length > 55 ? nextArticle.title.substring(0, 55) + '…' : nextArticle.title;

    html = html.replace(
      /(<div class="ec-next">[\s\S]*?<span class="ec-label">Prochain article<\/span>\s*<span class="ec-next-when">)[^<]*(<\/span>\s*<span class="ec-next-title">)[^<]*(<\/span>)/,
      `$1${when}$2${langFlag} ${nextArticle.tag} · <em>${shortTitle}</em>$3`
    );
  }

  fs.writeFileSync(INDEX_HTML, html);
  console.log('✅ index.html mis à jour');

  // Régénère pages /fr/ /en/, rubriques, footer/newsletter des articles, sitemap
  require('./build-site').build();

  // ── Résumé pour notification ───────────────────────────────────────────
  const summary = [
    `📊 ${published.length} articles publiés | ${streak}🔥 jours actifs`,
    todayPub.length > 0 ? `✅ Publiés aujourd'hui : ${todayPub.map(a => a.title.substring(0, 40)).join(' | ')}` : '⚪ Aucun article publié aujourd\'hui',
    nextArticle ? `⏭  Prochain : [${nextArticle.date}] ${nextArticle.title.substring(0, 60)}` : '⚠️  Aucun article planifié',
  ].join('\n');

  console.log('\n' + summary);
  return summary;
}

main();
