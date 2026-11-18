/**
 * Editorial Clock — planning éditorial dynamique
 * Affiche le prochain article, le streak de publication, et le countdown
 * Se base sur un planning JSON embarqué (mis à jour par la scheduled task)
 */

(function () {
  // ─── PLANNING ÉDITORIAL ───────────────────────────────────────────────────
  // Chaque entrée : { date: "YYYY-MM-DD", title, lang, slug, tag }
  // La scheduled task met à jour ce tableau en ajoutant les nouvelles entrées
  // ── THÉMATIQUE PAR JOUR ───────────────────────────────────────────────────
  // Lun: Airbnb & gestion locative → residencemanager.online
  // Mar: IA & automatisation business
  // Mer: Immobilier & investissement → residencemanager.online (si locatif)
  // Jeu: Contractors & artisans / trades
  // Ven: Tech & outils productivité
  // Sam: Business & entrepreneuriat
  // Dim: Réseaux sociaux & personal branding → mayapilot.com

  const SCHEDULE = [
    // ── PUBLIÉS ──────────────────────────────────────────────────────────────
    // Mardi 10 nov (IA)
    { date: "2026-11-10", title: "Comment automatiser votre conciergerie Airbnb en 2026", lang: "fr", slug: "/fr/automatiser-conciergerie-airbnb.html", tag: "Conciergerie" },
    { date: "2026-11-10", title: "The Best Airbnb Concierge App for Hosts in 2026", lang: "en", slug: "/en/airbnb-host-concierge-app-2026.html", tag: "Airbnb" },
    // Mercredi 11 nov (Immobilier)
    { date: "2026-11-11", title: "L'IA pour les artisans : comment se lancer sans se perdre", lang: "fr", slug: "/fr/ia-pour-artisans-comment-se-lancer.html", tag: "IA & PME" },
    { date: "2026-11-11", title: "How HVAC & Plumbing Contractors Are Using AI to Win More Jobs", lang: "en", slug: "/en/ai-for-hvac-plumbing-contractors.html", tag: "AI" },
    // Mardi 18 nov (IA + Immobilier)
    { date: "2026-11-18", title: "Faut-il encore investir en location courte durée en 2026 ?", lang: "fr", slug: "/fr/investir-location-courte-duree-2026.html", tag: "Immobilier" },
    { date: "2026-11-18", title: "Les 7 outils IA que j'utilise vraiment dans mon business en 2026", lang: "fr", slug: "/fr/7-outils-ia-business-2026.html", tag: "Tech & IA" },
    { date: "2026-11-18", title: "Why Most Airbnb Hosts Plateau at 3 Listings (And How to Break Through)", lang: "en", slug: "/en/airbnb-host-plateau-3-listings.html", tag: "Airbnb" },
    { date: "2026-11-18", title: "The Honest Guide to AI Tools for Small Contractors in 2026", lang: "en", slug: "/en/honest-guide-ai-tools-contractors-2026.html", tag: "AI Tools" },

    // ── SEMAINE 47 (19–22 nov) ───────────────────────────────────────────────
    // Jeu 19 — Contractors & artisans
    { date: "2026-11-19", title: "Artisan : comment répondre à chaque devis sans perdre 2h par jour", lang: "fr", slug: null, tag: "Artisans" },
    { date: "2026-11-19", title: "The Contractor's Guide to Google Reviews in 2026", lang: "en", slug: null, tag: "Contractors" },
    // Ven 20 — Tech & outils productivité
    { date: "2026-11-20", title: "Les 5 extensions Chrome qui m'ont fait gagner 1h par jour", lang: "fr", slug: null, tag: "Productivité" },
    { date: "2026-11-20", title: "5 Chrome Extensions That Save Entrepreneurs an Hour Every Day", lang: "en", slug: null, tag: "Productivity" },
    // Sam 21 — Business & entrepreneuriat
    { date: "2026-11-21", title: "Micro-entreprise ou SASU : ce que j'aurais voulu savoir avant", lang: "fr", slug: null, tag: "Business" },
    { date: "2026-11-21", title: "Sole Trader vs LLC: What American Contractors Actually Need to Know", lang: "en", slug: null, tag: "Business" },
    // Dim 22 — Réseaux sociaux → MayaPilot
    { date: "2026-11-22", title: "Comment gérer 3 comptes Instagram professionnels sans y passer sa vie", lang: "fr", slug: null, tag: "Réseaux sociaux" },
    { date: "2026-11-22", title: "How to Run 3 Business Instagram Accounts Without Burning Out", lang: "en", slug: null, tag: "Social Media" },

    // ── SEMAINE 48 (23–29 nov) ───────────────────────────────────────────────
    // Lun 23 — Airbnb & gestion locative → residencemanager.online
    { date: "2026-11-23", title: "Comment gérer 5 logements Airbnb seul en 2026 (sans agence)", lang: "fr", slug: null, tag: "Gestion locative" },
    { date: "2026-11-23", title: "How to Manage 5 Airbnb Listings Solo in 2026 (Without an Agency)", lang: "en", slug: null, tag: "Airbnb Management" },
    // Mar 24 — IA & automatisation
    { date: "2026-11-24", title: "Make.com vs Zapier : lequel choisir pour automatiser son business en 2026 ?", lang: "fr", slug: null, tag: "Automatisation" },
    { date: "2026-11-24", title: "Make.com vs Zapier: Which Is Better for Small Business Automation in 2026?", lang: "en", slug: null, tag: "Automation" },
    // Mer 25 — Immobilier → residencemanager.online
    { date: "2026-11-25", title: "Loi Le Meur 2026 : ce qui change vraiment pour les hôtes Airbnb", lang: "fr", slug: null, tag: "Réglementation" },
    { date: "2026-11-25", title: "France's New Airbnb Regulations in 2026: What Every Host Needs to Know", lang: "en", slug: null, tag: "Regulation" },
    // Jeu 26 — Contractors & artisans
    { date: "2026-11-26", title: "Plombier, électricien : comment fixer ses tarifs sans perdre des clients", lang: "fr", slug: null, tag: "Artisans" },
    { date: "2026-11-26", title: "How to Price Your Trade Services Without Losing Jobs in 2026", lang: "en", slug: null, tag: "Contractors" },
    // Ven 27 — Tech & outils
    { date: "2026-11-27", title: "Notion vs Obsidian : quel outil de notes pour les indépendants en 2026 ?", lang: "fr", slug: null, tag: "Outils" },
    { date: "2026-11-27", title: "Notion vs Obsidian: Which Note-Taking App Wins for Freelancers in 2026?", lang: "en", slug: null, tag: "Tools" },
    // Sam 28 — Business
    { date: "2026-11-28", title: "Comment facturer ce que vous valez vraiment (sans avoir peur)", lang: "fr", slug: null, tag: "Business" },
    { date: "2026-11-28", title: "How to Charge What You're Actually Worth (Without Flinching)", lang: "en", slug: null, tag: "Business" },
    // Dim 29 — Réseaux sociaux → MayaPilot
    { date: "2026-11-29", title: "Le meilleur moment pour poster sur Instagram en 2026 (par secteur)", lang: "fr", slug: null, tag: "Réseaux sociaux" },
    { date: "2026-11-29", title: "Best Time to Post on Instagram in 2026 (By Industry)", lang: "en", slug: null, tag: "Social Media" },

    // ── SEMAINE 49 (30 nov–6 déc) ────────────────────────────────────────────
    // Lun 30 — Airbnb → residencemanager.online
    { date: "2026-11-30", title: "Check-in automatique Airbnb : guide complet 2026 (boîte à clés, Nuki, Igloohome)", lang: "fr", slug: null, tag: "Gestion locative" },
    { date: "2026-11-30", title: "Airbnb Self Check-In in 2026: Smart Locks, Key Boxes & the Best Options", lang: "en", slug: null, tag: "Airbnb" },
    // Mar 1 déc — IA
    { date: "2026-12-01", title: "Comment j'ai automatisé ma prospection client avec l'IA (retour d'expérience)", lang: "fr", slug: null, tag: "IA Business" },
    { date: "2026-12-01", title: "How I Automated Client Outreach with AI — What Worked, What Didn't", lang: "en", slug: null, tag: "AI Business" },
    // Mer 2 — Immobilier
    { date: "2026-12-02", title: "Investir dans un Airbnb rural en 2026 : les villes qui surperforment", lang: "fr", slug: null, tag: "Investissement" },
    { date: "2026-12-02", title: "Rural Airbnb Investing in 2026: The Markets That Are Still Growing", lang: "en", slug: null, tag: "Real Estate" },
    // Jeu 3 — Contractors
    { date: "2026-12-03", title: "CRM pour artisans : lequel choisir en 2026 (comparatif honnête)", lang: "fr", slug: null, tag: "Outils artisans" },
    { date: "2026-12-03", title: "Best CRM for Small Contractors in 2026: Jobber vs Housecall Pro vs ServiceTitan", lang: "en", slug: null, tag: "Contractor Tools" },
    // Ven 4 — Tech
    { date: "2026-12-04", title: "Les meilleurs outils IA gratuits pour entrepreneurs en 2026", lang: "fr", slug: null, tag: "Tech gratuit" },
    { date: "2026-12-04", title: "Best Free AI Tools for Entrepreneurs in 2026 (That Actually Work)", lang: "en", slug: null, tag: "Free AI Tools" },
    // Sam 5 — Business
    { date: "2026-12-05", title: "Trouver ses premiers clients en freelance : ce qui marche vraiment en 2026", lang: "fr", slug: null, tag: "Freelance" },
    { date: "2026-12-05", title: "How to Land Your First Freelance Clients in 2026 (No Fluff Guide)", lang: "en", slug: null, tag: "Freelance" },
    // Dim 6 — Réseaux sociaux → MayaPilot
    { date: "2026-12-06", title: "Créer du contenu professionnel sur LinkedIn en 30 min par semaine", lang: "fr", slug: null, tag: "LinkedIn" },
    { date: "2026-12-06", title: "How to Build a Professional LinkedIn Presence in 30 Minutes a Week", lang: "en", slug: null, tag: "LinkedIn" },

    // ── SEMAINE 50 (7–13 déc) ────────────────────────────────────────────────
    // Lun 7 — Airbnb → residencemanager.online
    { date: "2026-12-07", title: "Comment augmenter son taux d'occupation Airbnb en hiver 2026", lang: "fr", slug: null, tag: "Airbnb" },
    { date: "2026-12-07", title: "How to Boost Your Airbnb Occupancy Rate in Winter 2026", lang: "en", slug: null, tag: "Airbnb" },
    // Mar 8 — IA
    { date: "2026-12-08", title: "Claude vs ChatGPT pour les entrepreneurs : lequel choisir en 2026 ?", lang: "fr", slug: null, tag: "IA" },
    { date: "2026-12-08", title: "Claude vs ChatGPT for Business Owners: Which AI Is Worth Paying For in 2026?", lang: "en", slug: null, tag: "AI" },
    // Mer 9 — Immobilier
    { date: "2026-12-09", title: "Location meublée non professionnelle (LMNP) en 2026 : guide fiscal complet", lang: "fr", slug: null, tag: "Fiscalité" },
    { date: "2026-12-09", title: "Short-Term Rental Tax Guide for US Hosts in 2026", lang: "en", slug: null, tag: "Tax" },
    // Jeu 10 — Contractors
    { date: "2026-12-10", title: "Comment un plombier a multiplié par 2 ses avis Google en 3 mois", lang: "fr", slug: null, tag: "Artisans" },
    { date: "2026-12-10", title: "How One Plumber Doubled His Google Reviews in 3 Months (Exact Strategy)", lang: "en", slug: null, tag: "Contractors" },
    // Ven 11 — Tech
    { date: "2026-12-11", title: "Automatiser sa comptabilité freelance avec l'IA en 2026", lang: "fr", slug: null, tag: "Comptabilité" },
    { date: "2026-12-11", title: "How to Automate Your Freelance Accounting with AI in 2026", lang: "en", slug: null, tag: "Finance Tools" },
    // Sam 12 — Business
    { date: "2026-12-12", title: "Construire une offre à 1000€/mois récurrents : le modèle qui marche", lang: "fr", slug: null, tag: "Business" },
    { date: "2026-12-12", title: "How to Build a $1,000/Month Recurring Revenue Stream as a Freelancer", lang: "en", slug: null, tag: "Business" },
    // Dim 13 — Réseaux sociaux → MayaPilot
    { date: "2026-12-13", title: "Stratégie Instagram 2026 pour les professionnels de l'immobilier", lang: "fr", slug: null, tag: "Réseaux sociaux" },
    { date: "2026-12-13", title: "Instagram Strategy for Real Estate Professionals in 2026", lang: "en", slug: null, tag: "Social Media" },
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
