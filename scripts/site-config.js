// Config centrale du site : nom, domaine, rubriques, textes FR/EN.
// Après choix du nom de marque : remplacer BRAND (et DOMAIN une fois le domaine acheté), puis `node scripts/build-site.js`.

const BRAND = 'Marge';
const DOMAIN = 'DOMAIN_PLACEHOLDER';
const YEAR = 2026;
const READERS = '100+'; // audience hebdomadaire déclarée

// Rubriques = thématiques par jour de semaine (0 = dimanche)
const CATS = [
  { id: 'airbnb', dow: 1,
    fr: { name: 'Airbnb & gestion locative', desc: 'Automatiser, optimiser, passer de 1 à 10 logements : ce qui marche vraiment pour les hôtes et conciergeries.' },
    en: { name: 'Airbnb & short-term rentals', desc: 'Systems, pricing and regulation: what actually works for hosts and property managers.' } },
  { id: 'ia', dow: 2,
    fr: { name: 'IA & automatisation', desc: 'Les outils IA et automatisations qui font vraiment gagner du temps, et ceux qui coûtent plus qu’ils ne rapportent.' },
    en: { name: 'AI & automation', desc: 'The AI tools and automations that really save time, and the ones that cost more than they return.' } },
  { id: 'immobilier', dow: 3,
    fr: { name: 'Immobilier & investissement', desc: 'Marché, fiscalité, rendement : les calculs à faire avant d’acheter, avec des chiffres sourcés.' },
    en: { name: 'Real estate & investing', desc: 'Market data, tax and yield: the numbers to run before you buy, with sources.' } },
  { id: 'artisans', dow: 4,
    fr: { name: 'Artisans & métiers', desc: 'Devis, tarifs, avis clients, outils : le quotidien des artisans et indépendants, de praticien à praticien.' },
    en: { name: 'Contractors & trades', desc: 'Quotes, pricing, reviews, tools: the daily reality of contractors and tradespeople.' } },
  { id: 'tech', dow: 5,
    fr: { name: 'Tech & productivité', desc: 'Tests d’outils honnêtes, comparatifs et vrais prix, pour choisir sans se faire piéger par la fiche marketing.' },
    en: { name: 'Tech & productivity', desc: 'Honest tool tests, comparisons and real pricing, so you can choose without falling for the marketing page.' } },
  { id: 'durable', dow: null, // thème transversal : publié le vendredi une semaine ISO sur deux (voir docs/EDITORIAL.md)
    fr: { name: 'Tech & développement durable', desc: 'Numérique responsable, énergie, rénovation, outils qui réduisent vraiment l’empreinte et la facture : chiffres sourcés, sans greenwashing.' },
    en: { name: 'Tech & sustainability', desc: 'Responsible tech, energy, retrofits and tools that really cut footprint and bills: sourced numbers, no greenwashing.' } },
  { id: 'business', dow: 6,
    fr: { name: 'Business & freelance', desc: 'Pricing, statut, premiers clients, revenus récurrents : l’analyse avant les slogans.' },
    en: { name: 'Business & freelance', desc: 'Pricing, legal structure, first clients, recurring revenue: analysis before slogans.' } },
  { id: 'social', dow: 0,
    fr: { name: 'Réseaux sociaux & marque', desc: 'Algorithmes, fréquence, formats : ce que disent les données, pas les gourous.' },
    en: { name: 'Social media & branding', desc: 'Algorithms, frequency, formats: what the data says, not the gurus.' } },
];

// Pages statiques : chemin par langue (chaque langue a son équivalent)
const PAGES = {
  write: { fr: '/fr/ecrire-pour-nous', en: '/en/write-for-us' },
  reuse: { fr: '/fr/reutilisation-contenu', en: '/en/content-reuse' },
};
const catPath = (lang, id) => (lang === 'fr' ? `/fr/categorie/${id}` : `/en/category/${id}`);

const T = {
  fr: {
    locale: 'fr-FR',
    tagline: 'Tech · Business · Immobilier',
    siteTitle: 'Airbnb, artisans, IA, business : les chiffres avant les slogans',
    siteDesc: 'Un article en français et un en anglais chaque jour pour les hôtes Airbnb, artisans et indépendants. Données vérifiées, cas réels, zéro généralité.',
    heroTag: 'Airbnb · Artisans · IA · Business',
    heroH1: 'Hôtes Airbnb, artisans, indépendants : arrêtez de deviner. Lisez les chiffres.',
    heroSub: 'Chaque jour, un article en français et un en anglais, construits sur des données vérifiées et des cas réels. Pas de liste « 10 astuces », pas de généralités.',
    proof: ['1 article FR + 1 EN par jour', '8 rubriques', 'Gratuit, sans spam'],
    emailPh: 'votre@email.com', emailLabel: 'Votre email',
    heroCta: 'Recevoir le meilleur de la semaine',
    note: 'Gratuit. Votre email sert uniquement à vous envoyer la newsletter, désinscription en un clic.',
    nlTitle: 'Recevez le meilleur de la semaine, par email',
    nlLead: 'Les articles les plus utiles de la semaine, par email. Chiffres vérifiés, cas concrets, zéro blabla.',
    nlCta: 'Je m’abonne', nlOk: 'Merci ! Vous êtes inscrit.',
    cats: 'Explorer par rubrique', all: 'Toutes les rubriques',
    latest: 'Derniers articles', upcoming: 'Prochainement dans cette rubrique',
    emptyCat: 'Les premiers articles de cette rubrique arrivent. Abonnez-vous pour être prévenu dès la publication.',
    readMin: 'min de lecture', write: 'Écrire pour nous', other: 'English',
    footTitle1: 'Rubriques', footTitle2: 'Le média', reuse: 'Citer et réutiliser nos articles',
    footAbout: 'Un article en français et un en anglais chaque jour, pour celles et ceux qui font tourner un vrai business.',
    legal: `© ${YEAR} ${BRAND}. Tous droits réservés. Reproduction interdite sans autorisation écrite. Les courtes citations sont autorisées à condition de citer ${BRAND} et de placer un lien vers l’article source.`,
    legalMore: 'Conditions de citation et de réutilisation',
    gateway: 'Read in English →', gatewayLabel: 'English readers:',
    featured: 'À la une',
  },
  en: {
    locale: 'en',
    tagline: 'Tech · Business · Real Estate',
    siteTitle: 'Airbnb, contractors, AI, business: numbers before slogans',
    siteDesc: 'One article in English and one in French every day for Airbnb hosts, contractors and solo founders. Verified data, real cases, zero generalities.',
    heroTag: 'Airbnb · Contractors · AI · Business',
    heroH1: 'Airbnb hosts, contractors, solo founders: stop guessing. Read the numbers.',
    heroSub: 'Every day, one article in English and one in French, built on verified data and real cases. No “10 tips” lists, no generalities.',
    proof: ['One EN + one FR article daily', '8 topics', 'Free, no spam'],
    emailPh: 'you@email.com', emailLabel: 'Your email',
    heroCta: 'Get the best of the week',
    note: 'Free. Your email is only used to send the newsletter; unsubscribe in one click.',
    nlTitle: 'Get the best of the week, by email',
    nlLead: 'The most useful articles of the week, by email. Verified numbers, real cases, zero fluff.',
    nlCta: 'Subscribe', nlOk: 'Thanks! You’re subscribed.',
    cats: 'Browse by topic', all: 'All topics',
    latest: 'Latest articles', upcoming: 'Coming up in this topic',
    emptyCat: 'The first articles in this topic are on their way. Subscribe to get notified when they go live.',
    readMin: 'min read', write: 'Write for us', other: 'Français',
    footTitle1: 'Topics', footTitle2: 'The publication', reuse: 'Quoting and reusing our articles',
    footAbout: 'One article in English and one in French every day, for people running a real business.',
    legal: `© ${YEAR} ${BRAND}. All rights reserved. Reproduction is prohibited without written permission. Short quotations are allowed provided you credit ${BRAND} and link to the source article.`,
    legalMore: 'Quoting and reuse terms',
    gateway: 'Lire en français →', gatewayLabel: 'Lecteurs français :',
    featured: 'Featured',
  },
};

// ── Pages de contenu ─────────────────────────────────────────────────────────
const contribForm = (lang) => {
  const fr = lang === 'fr';
  return `<form class="s-form-stack" data-s-form="contribution" data-ok="${fr ? 'Merci ! Votre proposition est bien reçue, nous la lisons avec attention.' : 'Thank you! Your pitch has been received and we will read it carefully.'}">
  <div class="s-field"><label for="c-email">${fr ? 'Votre email' : 'Your email'}</label><input id="c-email" type="email" name="email" required maxlength="254" autocomplete="email" placeholder="${fr ? 'vous@exemple.com' : 'you@example.com'}"></div>
  <div class="s-field"><label for="c-title">${fr ? 'Sujet et angle' : 'Topic and angle'}</label><input id="c-title" name="title" required maxlength="200" placeholder="${fr ? 'Ex : j’ai réduit mes charges de 30 % en 6 mois' : 'Ex: I cut my overhead by 30% in 6 months'}"></div>
  <div class="s-field"><label for="c-pitch">${fr ? 'Votre proposition' : 'Your pitch'}</label><textarea id="c-pitch" name="pitch" required minlength="20" maxlength="8000" placeholder="${fr ? 'Ce que vous avez vécu ou mesuré. Vous pouvez aussi coller l’article complet.' : 'What you lived or measured. You can also paste the full article.'}"></textarea></div>
  <input type="text" name="website" class="s-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <p class="s-terms">${fr ? `En envoyant, vous confirmez que le texte est inédit et de vous. Vous gardez vos droits, ${BRAND} publie avec votre signature (FR/EN).` : `By submitting, you confirm the text is original and yours. You keep your rights; ${BRAND} publishes with your byline (EN/FR).`}</p>
  <button type="submit">${fr ? 'Envoyer' : 'Send'}</button>
  <p class="s-form-msg" role="status" aria-live="polite"></p>
</form>`;
};

const contactForm = (lang) => {
  const fr = lang === 'fr';
  return `<form class="s-form-stack" data-s-form="contact" data-ok="${fr ? 'Message bien reçu, merci.' : 'Message received, thank you.'}">
  <div class="s-field"><label for="k-name">${fr ? 'Nom' : 'Name'}</label><input id="k-name" name="name" required maxlength="120" autocomplete="name"></div>
  <div class="s-field"><label for="k-email">Email</label><input id="k-email" type="email" name="email" required maxlength="254" autocomplete="email"></div>
  <div class="s-field"><label for="k-msg">Message</label><textarea id="k-msg" name="message" required minlength="10" maxlength="4000" style="min-height:140px"></textarea></div>
  <input type="text" name="website" class="s-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <button type="submit">${fr ? 'Envoyer' : 'Send'}</button>
  <p class="s-form-msg" role="status" aria-live="polite"></p>
</form>`;
};

const PAGE_CONTENT = {
  write: {
    fr: {
      title: `Écrire pour ${BRAND}`,
      meta: `Proposez un article à ${BRAND} : cas réels, chiffres, analyses de terrain. Vous gardez vos droits, nous publions avec votre signature et un lien vers votre site.`,
      html: () => `<h1>Écrire pour ${BRAND}</h1>
<p class="s-intro">Vous gérez des logements, des chantiers, une agence, un projet IA ? Vous avez vu ce qui marche et ce qui ne marche pas. Nous publions chaque jour en français et en anglais, et nous cherchons des auteurs qui parlent de ce qu’ils font réellement.</p>
<h2>Ce que nous publions</h2>
<ul>
<li>Des cas réels avec des chiffres : chiffre d’affaires, marges, délais, coûts, avant et après.</li>
<li>Des analyses qui contredisent l’idée reçue, appuyées sur des données ou une expérience vérifiable.</li>
<li>Des méthodes que vous avez appliquées vous-même, avec ce qui a raté.</li>
</ul>
<h2>Ce que nous refusons</h2>
<ul>
<li>Les contenus génériques qui pourraient être signés par n’importe qui.</li>
<li>Les articles sponsorisés déguisés et les liens d’affiliation non déclarés.</li>
<li>Les listes « 10 astuces » sans cas ni données.</li>
</ul>
<h2>Comment ça se passe</h2>
<ol>
<li>Vous nous envoyez le sujet et l’angle, ou l’article complet.</li>
<li>Nous lisons chaque proposition et revenons vers vous par email.</li>
<li>Nous éditons ensemble : vérification des chiffres, structure, titre.</li>
<li>Publication avec votre nom, une courte bio et un lien vers votre site ou votre profil.</li>
</ol>
<h2>Conditions</h2>
<p>Vous restez propriétaire de votre texte. Vous nous accordez une licence non exclusive pour le publier sur ${BRAND}, en français et en anglais (traduction comprise). Le texte doit être inédit. Un seul lien promotionnel vers votre activité est accepté, et il est assumé comme tel.</p>
${contribForm('fr')}`,
    },
    en: {
      title: `Write for ${BRAND}`,
      meta: `Pitch an article to ${BRAND}: real cases, numbers, field-level analysis. You keep your rights; we publish with your byline and a link to your site.`,
      html: () => `<h1>Write for ${BRAND}</h1>
<p class="s-intro">You run rentals, job sites, an agency, an AI project? You’ve seen what works and what doesn’t. We publish every day in English and French, and we’re looking for authors who write about what they actually do.</p>
<h2>What we publish</h2>
<ul>
<li>Real cases with numbers: revenue, margins, lead times, costs, before and after.</li>
<li>Analysis that challenges received wisdom, backed by data or verifiable experience.</li>
<li>Methods you applied yourself, including what went wrong.</li>
</ul>
<h2>What we turn down</h2>
<ul>
<li>Generic content anyone could have signed.</li>
<li>Disguised sponsored posts and undisclosed affiliate links.</li>
<li>“10 tips” lists with no case or data.</li>
</ul>
<h2>How it works</h2>
<ol>
<li>You send the topic and angle, or the full article.</li>
<li>We read every pitch and reply by email.</li>
<li>We edit together: number checks, structure, headline.</li>
<li>We publish with your name, a short bio and a link to your site or profile.</li>
</ol>
<h2>Terms</h2>
<p>You remain the owner of your text. You grant us a non-exclusive licence to publish it on ${BRAND}, in English and French (translation included). The text must be unpublished. One promotional link to your business is accepted and is presented as such.</p>
${contribForm('en')}`,
    },
  },
  reuse: {
    fr: {
      title: 'Citer et réutiliser nos articles',
      meta: `Conditions de citation et de réutilisation des contenus de ${BRAND} : ce que vous pouvez citer librement, ce qui demande notre accord, et comment nous contacter.`,
      html: () => `<h1>Citer et réutiliser nos articles</h1>
<p class="s-intro">Les textes, tableaux, calculs, schémas et titres publiés sur ${BRAND} sont protégés par le droit d’auteur. Voici ce que vous pouvez faire librement, et ce qui demande notre accord.</p>
<h2>Ce que vous pouvez faire librement</h2>
<ul>
<li>Citer un extrait court (150 mots maximum) pour illustrer ou commenter votre propos, en nommant ${BRAND} comme source et en plaçant un lien vers l’article d’origine.</li>
<li>Partager le lien d’un article, ou le résumer avec vos propres mots en citant la source.</li>
<li>Reprendre un chiffre en renvoyant à sa source d’origine, indiquée dans l’article, et à notre article si vous reprenez notre analyse.</li>
</ul>
<h2>Ce qui demande notre autorisation écrite</h2>
<ul>
<li>Republier un article, en entier ou en grande partie, y compris traduit ou réécrit à partir du nôtre.</li>
<li>Alimenter un site, une newsletter ou un contenu commercial avec nos textes.</li>
<li>Reproduire nos tableaux, calculs ou schémas sans citation.</li>
<li>Entraîner un modèle d’IA sur nos contenus. Les assistants et moteurs qui citent nos articles avec un lien vers la source sont les bienvenus.</li>
</ul>
<h2>Comment citer</h2>
<span class="s-quote">Source : « Titre de l’article », ${BRAND}, date de publication, https://…</span>
<p>Quand vous copiez un long passage depuis un article de ce site, la source s’ajoute automatiquement à votre presse-papiers. Merci de la conserver.</p>
<h2>Données personnelles</h2>
<p>Si vous vous abonnez, nous proposez un article ou nous écrivez, nous conservons votre email et les informations saisies uniquement pour envoyer la newsletter, répondre à votre message ou étudier votre proposition. Nous ne les revendons pas. Vous pouvez demander l’accès, la rectification ou la suppression de vos données à tout moment avec le formulaire ci-dessous.</p>
<h2>Demander une autorisation ou exercer vos droits</h2>
${contactForm('fr')}`,
    },
    en: {
      title: 'Quoting and reusing our articles',
      meta: `Terms for quoting and reusing ${BRAND} content: what you can quote freely, what needs our permission, and how to reach us.`,
      html: () => `<h1>Quoting and reusing our articles</h1>
<p class="s-intro">The texts, tables, calculations, diagrams and headlines published on ${BRAND} are protected by copyright. Here is what you can do freely, and what needs our permission.</p>
<h2>What you can do freely</h2>
<ul>
<li>Quote a short excerpt (150 words maximum) to illustrate or comment on your point, naming ${BRAND} as the source and linking to the original article.</li>
<li>Share an article’s link, or summarize it in your own words while crediting the source.</li>
<li>Use a figure by pointing to its original source, listed in the article, and to our article if you rely on our analysis.</li>
</ul>
<h2>What needs our written permission</h2>
<ul>
<li>Republishing an article, in full or in large part, including translated or rewritten from ours.</li>
<li>Feeding a website, newsletter or commercial content with our texts.</li>
<li>Reproducing our tables, calculations or diagrams without credit.</li>
<li>Training an AI model on our content. Assistants and search engines that cite our articles with a link to the source are welcome.</li>
</ul>
<h2>How to credit us</h2>
<span class="s-quote">Source: “Article title”, ${BRAND}, publication date, https://…</span>
<p>When you copy a long passage from an article on this site, the source is automatically added to your clipboard. Please keep it.</p>
<h2>Personal data</h2>
<p>If you subscribe, pitch an article or write to us, we keep your email and the details you enter only to send the newsletter, reply to your message or review your pitch. We do not sell them. You can request access, correction or deletion of your data at any time using the form below.</p>
<h2>Request permission or exercise your rights</h2>
${contactForm('en')}`,
    },
  },
};

module.exports = { BRAND, DOMAIN, YEAR, READERS, CATS, PAGES, catPath, T, PAGE_CONTENT };
