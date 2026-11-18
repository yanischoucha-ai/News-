/**
 * Editorial Clock — planning éditorial dynamique
 * Affiche le prochain article, le streak de publication, et le countdown
 * Se base sur un planning JSON embarqué (mis à jour par la scheduled task)
 */

(function () {
  // ─── PLANNING ÉDITORIAL ───────────────────────────────────────────────────
  // Chaque entrée : { date: "YYYY-MM-DD", title, lang, slug, tag }
  // La scheduled task met à jour ce tableau en ajoutant les nouvelles entrées
  const SCHEDULE = [
    { date: "2026-11-10", title: "Comment automatiser votre conciergerie Airbnb en 2026", lang: "fr", slug: "/fr/automatiser-conciergerie-airbnb.html", tag: "Conciergerie" },
    { date: "2026-11-10", title: "The Best Airbnb Concierge App for Hosts in 2026", lang: "en", slug: "/en/airbnb-host-concierge-app-2026.html", tag: "Airbnb" },
    { date: "2026-11-11", title: "L'IA pour les artisans : comment se lancer sans se perdre", lang: "fr", slug: "/fr/ia-pour-artisans-comment-se-lancer.html", tag: "IA & PME" },
    { date: "2026-11-11", title: "How HVAC & Plumbing Contractors Are Using AI to Win More Jobs", lang: "en", slug: "/en/ai-for-hvac-plumbing-contractors.html", tag: "AI" },
    { date: "2026-11-18", title: "Faut-il encore investir en location courte durée en 2026 ?", lang: "fr", slug: "/fr/investir-location-courte-duree-2026.html", tag: "Immobilier" },
    { date: "2026-11-18", title: "Les 7 outils IA que j'utilise vraiment dans mon business en 2026", lang: "fr", slug: "/fr/7-outils-ia-business-2026.html", tag: "Tech & IA" },
    { date: "2026-11-18", title: "Why Most Airbnb Hosts Plateau at 3 Listings (And How to Break Through)", lang: "en", slug: "/en/airbnb-host-plateau-3-listings.html", tag: "Airbnb" },
    { date: "2026-11-18", title: "The Honest Guide to AI Tools for Small Contractors in 2026", lang: "en", slug: "/en/honest-guide-ai-tools-contractors-2026.html", tag: "AI Tools" },
    // ── UPCOMING (not yet published) ──
    { date: "2026-11-19", title: "Comment fixer le bon prix sur Airbnb en 2026 (sans PriceLabs)", lang: "fr", slug: null, tag: "Immobilier" },
    { date: "2026-11-19", title: "The Contractor's Guide to Google Reviews in 2026", lang: "en", slug: null, tag: "Business" },
    { date: "2026-11-20", title: "Automatiser ses relances clients avec l'IA : guide pratique", lang: "fr", slug: null, tag: "IA & Auto" },
    { date: "2026-11-20", title: "5 Things Every Airbnb Host Should Automate Before Their 3rd Listing", lang: "en", slug: null, tag: "Airbnb" },
    { date: "2026-11-21", title: "Loi Le Meur : ce qui change vraiment en 2026 pour les hôtes Airbnb", lang: "fr", slug: null, tag: "Réglementation" },
    { date: "2026-11-21", title: "How to Write an HVAC Estimate in 10 Minutes with AI", lang: "en", slug: null, tag: "Contractors" },
    { date: "2026-11-22", title: "Les meilleurs logiciels de conciergerie en 2026 : comparatif honnête", lang: "fr", slug: null, tag: "Outils" },
    { date: "2026-11-22", title: "Airbnb vs Furnished Finder: Which Platform Wins in 2026?", lang: "en", slug: null, tag: "Real Estate" },
  ];

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function parseDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function msUntilMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(9, 0, 0, 0); // next 9 AM Paris
    if (midnight <= now) midnight.setDate(midnight.getDate() + 1);
    return midnight - now;
  }

  function formatCountdown(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if (h > 0) return `dans ${h}h${m > 0 ? m + 'min' : ''}`;
    return `dans ${m} min`;
  }

  // ─── CALCULS ──────────────────────────────────────────────────────────────
  const today = todayStr();

  // Streak : combien de jours consécutifs (en remontant depuis aujourd'hui) ont ≥1 article publié
  function computeStreak() {
    const publishedDates = new Set(
      SCHEDULE.filter(a => a.slug !== null && a.date <= today).map(a => a.date)
    );
    let streak = 0;
    let d = new Date();
    for (let i = 0; i < 60; i++) {
      const s = d.toISOString().slice(0, 10);
      if (publishedDates.has(s)) {
        streak++;
      } else if (i > 0) {
        break; // gap → stop
      }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  // Prochain article à venir (slug === null et date >= today)
  function nextUpcoming() {
    return SCHEDULE
      .filter(a => a.slug === null && a.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0] || null;
  }

  // Articles publiés aujourd'hui
  function todayArticles() {
    return SCHEDULE.filter(a => a.date === today && a.slug !== null);
  }

  // Total articles publiés
  function totalPublished() {
    return SCHEDULE.filter(a => a.slug !== null).length;
  }

  // ─── INJECT DOM ──────────────────────────────────────────────────────────
  function inject() {
    const container = document.getElementById('editorial-clock');
    if (!container) return;

    const streak = computeStreak();
    const next = nextUpcoming();
    const todayPub = todayArticles();
    const total = totalPublished();

    // Build next-article label
    let nextHtml = '';
    if (next) {
      const dNext = parseDate(next.date);
      const dNow = new Date();
      dNow.setHours(0, 0, 0, 0);
      const diff = Math.round((dNext - dNow) / 86400000);
      let when = '';
      if (diff === 0) when = `aujourd'hui`;
      else if (diff === 1) when = 'demain';
      else when = `dans ${diff} jours`;

      const langLabel = next.lang === 'fr' ? '🇫🇷' : '🇬🇧';
      nextHtml = `
        <div class="ec-next">
          <span class="ec-label">Prochain article</span>
          <span class="ec-next-when">${when}</span>
          <span class="ec-next-title">${langLabel} ${next.tag} · <em>${next.title}</em></span>
        </div>`;
    }

    // Build today badge
    let todayHtml = '';
    if (todayPub.length > 0) {
      const links = todayPub.map(a =>
        `<a href="${a.slug}" class="ec-today-link">${a.lang === 'fr' ? '🇫🇷' : '🇬🇧'} ${a.title}</a>`
      ).join('');
      todayHtml = `<div class="ec-today"><span class="ec-new-badge">NOUVEAU</span>${links}</div>`;
    }

    container.innerHTML = `
      <div class="ec-inner">
        <div class="ec-stats">
          <div class="ec-stat">
            <span class="ec-stat-num">${total}</span>
            <span class="ec-stat-label">articles publiés</span>
          </div>
          <div class="ec-stat">
            <span class="ec-stat-num">${streak > 0 ? streak + '🔥' : '0'}</span>
            <span class="ec-stat-label">jours actifs</span>
          </div>
          <div class="ec-stat">
            <span class="ec-stat-num">${SCHEDULE.filter(a => a.slug === null).length}</span>
            <span class="ec-stat-label">articles en cours</span>
          </div>
        </div>
        ${todayHtml}
        ${nextHtml}
      </div>`;

    // Live countdown dans le label "quand"
    if (next) {
      const dNext = parseDate(next.date);
      const dNow2 = new Date(); dNow2.setHours(0, 0, 0, 0);
      const diff2 = Math.round((dNext - dNow2) / 86400000);
      if (diff2 === 0) {
        // Update countdown every minute
        const whenEl = container.querySelector('.ec-next-when');
        function tick() {
          if (whenEl) whenEl.textContent = formatCountdown(msUntilMidnight());
        }
        tick();
        setInterval(tick, 60000);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
