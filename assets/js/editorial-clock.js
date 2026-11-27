/**
 * Editorial Clock — planning éditorial dynamique
 * Affiche le prochain article, le streak de publication, et le countdown
 * Se base sur un planning JSON embarqué (mis à jour par la scheduled task)
 */

(function () {
  // ─── PLANNING ÉDITORIAL ───────────────────────────────────────────────────
  // Chaque entrée : { date: "YYYY-MM-DD", title, lang, slug, tag, cat, min, desc }
  // cat = hotes|artisans|saas (3 piliers) ; si absent : selon le jour (voir ci-dessous). min = minutes de lecture ; desc = résumé 1-2 phrases (cartes, listes)
  // La scheduled task met à jour ce tableau en ajoutant les nouvelles entrées
  // ── PILIERS PAR JOUR (FR = France, EN = États-Unis uniquement) ────────────
  // Lun: Hôtes & location courte durée → residencemanager.online
  // Mar: Artisans & petites entreprises de services (appels manqués, devis, IA) → alturacom
  // Mer: Hôtes : réglementation, fiscalité, investissement locatif → residencemanager.online
  // Jeu: Artisans : tarifs, visibilité, avis, outils → alturacom
  // Ven: Marketing & contenu des éditeurs de SaaS → mayapilot.com
  // Sam: Artisans & indépendants : statuts, prix, trésorerie → alturacom
  // Dim: Réseaux sociaux & croissance des SaaS → mayapilot.com

  const SCHEDULE = [
    // ── PUBLIÉS ──────────────────────────────────────────────────────────────
    // Mardi 10 nov (IA)
    { date: "2026-11-10", title: "Conciergerie Airbnb à 20 % ou gestion directe : le calcul qui tranche en 2026", lang: "fr", slug: "/fr/automatiser-conciergerie-airbnb.html", tag: "Conciergerie", cat: "hotes", min: 6, desc: "À 20 % de commission, une conciergerie doit faire passer l'occupation de 65 à 81 % pour battre la gestion directe. Calcul, coûts d'outils et seuil d'heures." },
    { date: "2026-11-10", title: "Airbnb Host Software in 2026: The Fee Switch Most Small Hosts Miss", lang: "en", slug: "/en/airbnb-host-concierge-app-2026.html", tag: "Airbnb", cat: "hotes", min: 5, desc: "Connecting software can move your Airbnb account to a 15.5% host-only fee. The math on a $150 night, vendor pricing, and a break-even test before you subscribe." },
    // Mercredi 11 nov (Immobilier)
    { date: "2026-11-11", title: "IA et artisans : par où commencer quand 27 % seulement s'y mettent", lang: "fr", slug: "/fr/ia-pour-artisans-comment-se-lancer.html", tag: "IA & PME", cat: "artisans", min: 5, desc: "27 % des artisans utilisent l'IA, moins de 10 % dans le BTP : les trois usages à tester d'abord, le calcul de gain à refaire et les règles CNIL sur les appels." },
    { date: "2026-11-11", title: "Missed Calls in HVAC and Plumbing: The Math to Run Before You Buy an AI Receptionist", lang: "en", slug: "/en/ai-for-hvac-plumbing-contractors.html", tag: "AI", cat: "artisans", min: 4, desc: "HVAC shops reportedly answer only 34% of calls. A formula for what each missed call costs, a break-even for answering services, and the FCC ruling on AI voices." },
    // Mardi 18 nov (IA + Immobilier)
    { date: "2026-11-18", title: "Investir en location courte durée en 2026 : le calcul net, plafonds et commission à 15,5 %", lang: "fr", slug: "/fr/investir-location-courte-duree-2026.html", tag: "Immobilier", cat: "hotes", min: 6, desc: "Micro-BIC à 15 000 € ou 83 600 €, commission Airbnb unique de 15,5 %, DPE : un exemple chiffré à refaire pour savoir ce qu'un meublé rapporte vraiment." },
    { date: "2026-11-18", title: "Outils IA pour un petit business : les prix publiés et l'ordre dans lequel les essayer", lang: "fr", slug: "/fr/7-outils-ia-business-2026.html", tag: "Tech & IA", cat: "saas", min: 4, desc: "Prix lus sur les pages des éditeurs (Claude, Otter, Make, Tidio, Notion), coût d'une pile complète à 81 $ par mois et ordre d'essai du moins au plus engageant." },
    { date: "2026-11-18", title: "Going From 2 to 3 Short-Term Rentals: The Time Math and the U.S. Tax Rules That Start to Matter", lang: "en", slug: "/en/airbnb-host-plateau-3-listings.html", tag: "Airbnb", cat: "hotes", min: 5, desc: "A worksheet to price your time per turnover, what Airbnb's single 15.5% host fee does to three listings, and the IRS 7-day and 14-day rules to know." },
    { date: "2026-11-18", title: "AI Answering for Contractors: Published Prices and the Break-Even Math (2026)", lang: "en", slug: "/en/honest-guide-ai-tools-contractors-2026.html", tag: "AI Tools", cat: "artisans", min: 4, desc: "Jobber's $99 AI Receptionist add-on against Smith.ai's per-call plans: a formula to see how many recovered calls each needs to pay for itself." },

    // ── SEMAINE 47 (19–22 nov) ───────────────────────────────────────────────
    // Jeu 19 — Contractors & artisans
    { date: "2026-11-19", title: "Devis : répondre dans l'heure sans y passer 2 h par jour (calcul et gabarit)", lang: "fr", slug: "/fr/devis-repondre-vite-sans-y-passer-2h-par-jour.html", tag: "Artisans", cat: "artisans", min: 8, desc: "Un point de taux de signature vaut 390 € de marge par mois sur 20 devis à 6 500 €. Le calcul à refaire, le devis d'une page conforme et deux messages à copier." },
    { date: "2026-11-19", title: "Contractor Google Reviews in 2026: The Rating Math and What Google Now Removes", lang: "en", slug: "/en/contractor-google-reviews-2026-rating-math-policy.html", tag: "Contractors", cat: "artisans", min: 7, desc: "BrightLocal's 2026 survey says 47% skip businesses under 20 reviews. How many reviews lift 4.3 to 4.5, what Google bars you from asking, and what changed this fall." },
    // Ven 20 — Tech & outils productivité
    { date: "2026-11-20", title: "Meublé de tourisme classé F : la pompe à chaleur se rembourse en 4 à 10 ans, mais sans MaPrimeRénov'", lang: "fr", slug: "/fr/pompe-a-chaleur-meuble-tourisme-dpe-aides-2027.html", tag: "Durable", cat: "hotes", min: 9, desc: "DPE F ou G en meublé de tourisme : calendrier 2025-2034, fin annoncée des aides au 1er janvier 2027, calcul de retour sur investissement refaisable." },
    { date: "2026-11-20", title: "Heat Pump for a US Short-Term Rental: The Federal Credit Is Gone, and the Payback Math Depends on Your Electric Rate", lang: "en", slug: "/en/heat-pump-short-term-rental-us-tax-credit-gone-depreciation-math-2026.html", tag: "Hosts", cat: "hotes", min: 7, desc: "Section 25C ended for 2026 and never covered landlords. What a host can deduct instead, and a 5.5 to 17.8-year payback range by state, with math you can redo." },
    // Sam 21 — Business & entrepreneuriat
    { date: "2026-11-21", title: "Micro-entreprise ou SASU en 2026 : le seuil qui compte n'est pas le chiffre d'affaires, c'est la part de frais", lang: "fr", slug: "/fr/micro-entreprise-ou-sasu-seuil-frais-calcul-2026.html", tag: "Business", cat: "artisans", min: 8, desc: "Micro-entreprise ou SASU en 2026 : calcul du net à 30 000, 60 000 et 83 600 € de CA, et la part de frais réels (36 à 53 %) où la société devient meilleure." },
    { date: "2026-11-21", title: "Sole Proprietor vs. LLC vs. S-Corp: The Salary Share That Decides Whether the Election Pays (2026 Math)", lang: "en", slug: "/en/sole-proprietor-llc-s-corp-salary-share-math-2026.html", tag: "Business", cat: "artisans", min: 6, desc: "An LLC changes nothing on your federal tax. The S-corp election helps only while salary stays under about 65% of profit: 2026 math at $60K, $120K and $200K." },
    // Dim 22 — Réseaux sociaux → MayaPilot
    { date: "2026-11-22", title: "Fréquence de publication SaaS : ce que disent les données", lang: "fr", slug: "/fr/frequence-publication-saas-linkedin-donnees-2026.html", tag: "Réseaux sociaux", cat: "saas", min: 7, desc: "Combien de posts LinkedIn par semaine pour un SaaS ? Trois études (Buffer, Socialinsider) comparées : 2 à 5 posts, portée par post en baisse, calcul à refaire." },
    { date: "2026-11-22", title: "SaaS Founder LinkedIn Posting Frequency: What the Data Says", lang: "en", slug: "/en/saas-founder-linkedin-posting-frequency-timing-data-2026.html", tag: "Social Media", cat: "saas", min: 7, desc: "How often should a SaaS founder post on LinkedIn? Buffer's regression table, 4.8M-post timing data and a reach-per-hour calculation you can redo yourself." },

    // ── SEMAINE 48 (23–29 nov) ───────────────────────────────────────────────
    // Lun 23 — Airbnb & gestion locative → residencemanager.online
    { date: "2026-11-23", title: "Conciergerie Airbnb ou gestion seul : le seuil en €/heure", lang: "fr", slug: "/fr/conciergerie-airbnb-ou-seul-seuil-euros-par-heure-2026.html", tag: "Gestion locative", cat: "hotes", min: 8, desc: "Gérer seul coûte plus cher qu'une conciergerie quand votre heure dépasse commission ÷ heures par séjour : 40 €/h à 20 %. Calcul refaisable et budget 2027." },
    { date: "2026-11-23", title: "Self-Managing Airbnb vs. a Manager: The Hours Break-Even", lang: "en", slug: "/en/self-manage-airbnb-vs-property-manager-hours-break-even-2026.html", tag: "Airbnb Management", cat: "hotes", min: 6, desc: "A 20% manager costs $12,000 on a $60,000 listing, enough to buy 490 hours at the median wage. The break-even math, 2026 fees and Airbnb's fall update changes." },
    // Mar 24 — IA & automatisation
    { date: "2026-11-24", title: "Relance de devis automatique : Make, Zapier ou à la main ?", lang: "fr", slug: "/fr/relance-devis-automatique-artisan-make-zapier-main-2026.html", tag: "Automatisation", cat: "artisans", min: 8, desc: "Relancer 3 fois chaque devis coûte 11,25 € de temps à la main : l'automatisation Make ou Zapier devient rentable dès 6 à 8 devis par mois. Calcul et tarifs." },
    { date: "2026-11-24", title: "Contractor Estimate Follow-Up: Zapier vs Make vs By Hand", lang: "en", slug: "/en/contractor-estimate-follow-up-zapier-vs-make-vs-by-hand-2026.html", tag: "Automation", cat: "artisans", min: 7, desc: "Following up each estimate three times costs about $15 in time by hand. Zapier or Make pays off from 6 to 8 estimates a month. Math, Nov. 2026 prices, FCC text rule." },
    // Mer 25 — Immobilier → residencemanager.online
    { date: "2026-11-25", title: "Loi Le Meur 2026 : ce qui s'applique aux hôtes Airbnb", lang: "fr", slug: "/fr/loi-le-meur-2026-regles-hotes-airbnb-amortissement-lmnp.html", tag: "Réglementation", cat: "hotes", min: 8, desc: "Loi Le Meur au 25 novembre 2026 : jours, amendes, numéro d'enregistrement, changement d'usage et coût chiffré du plafond d'amortissement LMNP 2027." },
    { date: "2026-11-25", title: "US Short-Term Rental Rules: 4 Checks Before You Buy", lang: "en", slug: "/en/us-short-term-rental-rules-4-checks-before-you-buy-2026.html", tag: "Regulation", cat: "hotes", min: 7, desc: "Before buying a US short-term rental in 2026: stress-test it at 7.28% mortgage rates, read the HOA covenant, track local votes and price new lodging taxes." },
    // Jeu 26 — Contractors & artisans
    { date: "2026-11-26", title: "Tarif horaire artisan 2026 : le calcul avant d'augmenter", lang: "fr", slug: "/fr/tarif-horaire-artisan-2026-calcul-avant-augmentation.html", tag: "Artisans", cat: "artisans", min: 7, desc: "Tarif horaire artisan : la formule sur les heures facturables, l'effet Smic et gazole de novembre 2026, et les chantiers que vous pouvez perdre." },
    { date: "2026-11-26", title: "Trade Pricing 2026: Set an Hourly Rate That Holds Margin", lang: "en", slug: "/en/trade-pricing-2026-hourly-rate-that-holds-margin.html", tag: "Contractors", cat: "artisans", min: 7, desc: "Trade pricing in 2026: a billable-hour rate formula using BLS data, fuel surcharge math, and how many jobs you can lose after raising prices." },
    // Ven 27 — Tech & outils
    { date: "2026-11-27", title: "Calendrier éditorial SaaS : Notion, Airtable ou tableur ?", lang: "fr", slug: "/fr/calendrier-editorial-saas-notion-airtable-tableur-2026.html", tag: "Marketing SaaS", cat: "saas", min: 8, desc: "Calendrier éditorial SaaS : coût de Notion, Airtable et Google Sheets pour 6 personnes, limites des offres gratuites et seuil de rentabilité (nov. 2026)." },
    { date: "2026-11-27", title: "SaaS Content Calendar: Notion vs Airtable vs Sheets", lang: "en", slug: "/en/saas-content-calendar-notion-vs-airtable-vs-sheets-2026.html", tag: "SaaS Marketing", cat: "saas", min: 7, desc: "Content calendar costs for a six-person SaaS team: Notion, Airtable and Google Sheets seat math, free-plan limits and break-even hours (November 2026)." },
    // Sam 28 — Business
    { date: "2026-11-28", title: "Comment facturer ce que vous valez vraiment (sans avoir peur)", lang: "fr", slug: null, tag: "Business" },
    { date: "2026-11-28", title: "How to Charge What You're Actually Worth (Without Flinching)", lang: "en", slug: null, tag: "Business" },
    // Dim 29 — Réseaux sociaux → MayaPilot
    { date: "2026-11-29", title: "Quand publier sur LinkedIn pour vendre un SaaS B2B : ce que disent les données", lang: "fr", slug: null, tag: "LinkedIn" },
    { date: "2026-11-29", title: "Best Time to Post on LinkedIn for a B2B SaaS: What the Data Says", lang: "en", slug: null, tag: "LinkedIn" },

    // ── SEMAINE 49 (30 nov–6 déc) ────────────────────────────────────────────
    // Lun 30 — Airbnb → residencemanager.online
    { date: "2026-11-30", title: "Check-in automatique Airbnb : guide complet 2026 (boîte à clés, Nuki, Igloohome)", lang: "fr", slug: null, tag: "Gestion locative" },
    { date: "2026-11-30", title: "Airbnb Self Check-In in 2026: Smart Locks, Key Boxes & the Best Options", lang: "en", slug: null, tag: "Airbnb" },
    // Mar 1 déc — IA
    { date: "2026-12-01", title: "Prospecter des chantiers par e-mail quand on est artisan : taux de réponse et limites légales", lang: "fr", slug: null, tag: "Prospection" },
    { date: "2026-12-01", title: "Cold Email for Contractors in 2026: Reply Rates and Where CAN-SPAM Draws the Line", lang: "en", slug: null, tag: "Prospecting" },
    // Mer 2 — Immobilier
    { date: "2026-12-02", title: "Investir dans un Airbnb rural en 2026 : les villes qui surperforment", lang: "fr", slug: null, tag: "Investissement" },
    { date: "2026-12-02", title: "Rural Airbnb Investing in 2026: The Markets That Are Still Growing", lang: "en", slug: null, tag: "Real Estate" },
    // Jeu 3 — Contractors
    { date: "2026-12-03", title: "CRM pour artisans : lequel choisir en 2026 (comparatif honnête)", lang: "fr", slug: null, tag: "Outils artisans" },
    { date: "2026-12-03", title: "Best CRM for Small Contractors in 2026: Jobber vs Housecall Pro vs ServiceTitan", lang: "en", slug: null, tag: "Contractor Tools" },
    // Ven 4 — Tech
    { date: "2026-12-04", title: "Outils IA gratuits pour produire le contenu d'un SaaS : ce qui tient la route en 2026", lang: "fr", slug: null, tag: "Marketing SaaS" },
    { date: "2026-12-04", title: "Free AI Tools for SaaS Content Marketing in 2026: What Holds Up", lang: "en", slug: null, tag: "SaaS Marketing" },
    // Sam 5 — Business
    { date: "2026-12-05", title: "Trouver ses premiers clients en freelance : ce qui marche vraiment en 2026", lang: "fr", slug: null, tag: "Freelance" },
    { date: "2026-12-05", title: "How to Land Your First Freelance Clients in 2026 (No Fluff Guide)", lang: "en", slug: null, tag: "Freelance" },
    // Dim 6 — Réseaux sociaux → MayaPilot
    { date: "2026-12-06", title: "Fondateur de SaaS : une présence LinkedIn en 30 minutes par semaine", lang: "fr", slug: null, tag: "LinkedIn" },
    { date: "2026-12-06", title: "SaaS Founder LinkedIn Presence in 30 Minutes a Week", lang: "en", slug: null, tag: "LinkedIn" },

    // ── SEMAINE 50 (7–13 déc) ────────────────────────────────────────────────
    // Lun 7 — Airbnb → residencemanager.online
    { date: "2026-12-07", title: "Comment augmenter son taux d'occupation Airbnb en hiver 2026", lang: "fr", slug: null, tag: "Airbnb" },
    { date: "2026-12-07", title: "How to Boost Your Airbnb Occupancy Rate in Winter 2026", lang: "en", slug: null, tag: "Airbnb" },
    // Mar 8 — IA
    { date: "2026-12-08", title: "Quel assistant IA pour un artisan : répondre aux clients et rédiger ses devis", lang: "fr", slug: null, tag: "IA & PME" },
    { date: "2026-12-08", title: "Which AI Assistant for a Contractor: Replying to Leads and Writing Estimates", lang: "en", slug: null, tag: "AI" },
    // Mer 9 — Immobilier
    { date: "2026-12-09", title: "Location meublée non professionnelle (LMNP) en 2026 : guide fiscal complet", lang: "fr", slug: null, tag: "Fiscalité" },
    { date: "2026-12-09", title: "Short-Term Rental Tax Guide for US Hosts in 2026", lang: "en", slug: null, tag: "Tax" },
    // Jeu 10 — Contractors
    { date: "2026-12-10", title: "Avis Google pour plombiers et électriciens : ce que montrent les données sur la visibilité locale", lang: "fr", slug: null, tag: "Artisans" },
    { date: "2026-12-10", title: "Google Reviews for Contractors: What the Data Shows About Local Visibility and Conversions", lang: "en", slug: null, tag: "Contractors" },
    // Ven 11 — Tech
    { date: "2026-12-11", title: "Mesurer ce que rapporte le contenu d'un SaaS : les indicateurs qui comptent", lang: "fr", slug: null, tag: "Marketing SaaS" },
    { date: "2026-12-11", title: "Measuring What SaaS Content Actually Earns: The Metrics That Matter", lang: "en", slug: null, tag: "SaaS Marketing" },
    // Sam 12 — Business
    { date: "2026-12-12", title: "Construire une offre à 1000€/mois récurrents : le modèle qui marche", lang: "fr", slug: null, tag: "Business" },
    { date: "2026-12-12", title: "How to Build a $1,000/Month Recurring Revenue Stream as a Freelancer", lang: "en", slug: null, tag: "Business" },
    // Dim 13 — Réseaux sociaux → MayaPilot
    { date: "2026-12-13", title: "Instagram pour un SaaS : ce qui fonctionne et ce qui ne marche pas en 2026", lang: "fr", slug: null, tag: "Réseaux sociaux" },
    { date: "2026-12-13", title: "Instagram for a SaaS Company in 2026: What Works and What Doesn't", lang: "en", slug: null, tag: "Social Media" },
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
