// Pages de confiance (À propos, contact, mentions légales, financement) + outils gratuits + recherche.
const { BRAND, DOMAIN } = require('./site-config');
const ALTURA = 'https://alturacom-production.odoo.com';
const RM = 'https://www.residencemanager.online';
const MAYA = 'https://mayapilot.com';

const PAGES = {
  about: { fr: '/fr/a-propos', en: '/en/about' },
  contact: { fr: '/fr/contact', en: '/en/contact' },
  legal: { fr: '/fr/mentions-legales', en: '/en/legal-notice' },
  money: { fr: '/fr/comment-nous-gagnons-de-l-argent', en: '/en/how-we-make-money' },
  search: { fr: '/fr/recherche', en: '/en/search' },
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

const CONTENT = {
  about: {
    fr: { title: 'À propos', meta: `${BRAND} : un média indépendant pour les professionnels qui font tourner une petite activité. Qui l’édite, quels produits l’éditeur publie, et comment nous travaillons.`,
      html: () => `<h1>À propos de ${BRAND}</h1>
<p class="s-intro">${BRAND} est un média en ligne, en français pour la France et en anglais pour les États-Unis, destiné aux personnes qui font tourner une petite activité. Notre but : que vous repartiez avec un calcul, une source ou une méthode utilisables la semaine même, que vous achetiez quelque chose ou non.</p>
<h2>Trois sujets, rien d’autre</h2>
<ul>
<li><a href="/fr/categorie/hotes">Hôtes et location courte durée</a> : gestion, rentabilité nette, réglementation, fiscalité, investissement locatif.</li>
<li><a href="/fr/categorie/artisans">Artisans et petites entreprises de services</a> : appels manqués, devis, tarifs, visibilité, avis, statuts, trésorerie.</li>
<li><a href="/fr/categorie/saas">Marketing et croissance des éditeurs de SaaS</a> : contenu, community management, réseaux sociaux, algorithmes.</li>
</ul>
<h2>Qui édite ce site</h2>
<p>${BRAND} est édité par <a href="${ALTURA}" rel="noopener">AlturaCom</a>, qui publie aussi des produits :</p>
<ul>
<li><a href="${RM}" rel="noopener">Résidence Manager</a> : plateforme pour hôtes et conciergeries (portail voyageur par QR code, ménage, services à la demande).</li>
<li><a href="${ALTURA}" rel="noopener">AlturaCom</a> : agence de communication digitale pour artisans et petites entreprises de services (sites web, contenu, vidéo, acquisition et SEO).</li>
<li><a href="${MAYA}" rel="noopener">Maya Pilot</a> : community manager par IA pour les éditeurs de SaaS.</li>
</ul>
<p>Ces produits n’ont pas encore de clientèle : nous n’affichons donc ni clients, ni résultats chiffrés, ni témoignages. Quand un article cite l’un d’eux, il le dit dans la phrase (« un outil que nous éditons ») et ne le présente jamais comme un avis indépendant. Détails : <a href="${PAGES.money.fr}">comment nous gagnons de l’argent</a>.</p>
<h2>Comment nous travaillons</h2>
<p>Sources listées sur chaque article, calculs refaisables, dates de publication et de vérification visibles, et un recours assumé à l’IA pour la rédaction : voir la <a href="/fr/methode-editoriale">méthode éditoriale</a>.</p>
<h2>Nous écrire</h2>
<p>Une erreur, une question, une proposition : <a href="${PAGES.contact.fr}">page Contact</a>.</p>` },
    en: { title: 'About', meta: `${BRAND}: an independent publication for people running a small business. Who publishes it, which products the publisher makes, and how we work.`,
      html: () => `<h1>About ${BRAND}</h1>
<p class="s-intro">${BRAND} is an online publication, in French for France and in English for the United States, for people who run a small business. Our goal: you leave with a calculation, a source or a method you can use this week, whether or not you ever buy anything.</p>
<h2>Three subjects, nothing else</h2>
<ul>
<li><a href="/en/category/hotes">Hosts and short-term rentals</a>: operations, net profitability, regulation, taxes, rental investing.</li>
<li><a href="/en/category/artisans">Contractors and small service businesses</a>: missed calls, quotes, pricing, visibility, reviews, business structure, cash flow.</li>
<li><a href="/en/category/saas">SaaS marketing and growth</a>: content, community management, social media, algorithms.</li>
</ul>
<h2>Who publishes this site</h2>
<p>${BRAND} is published by <a href="${ALTURA}" rel="noopener">AlturaCom</a>, which also makes products:</p>
<ul>
<li><a href="${RM}" rel="noopener">Résidence Manager</a>: a platform for hosts and property managers (QR-code guest portal, cleaning, on-demand services).</li>
<li><a href="${ALTURA}" rel="noopener">AlturaCom</a>: a digital communications agency for tradespeople and small service businesses (websites, content, video, acquisition and SEO). Its website is currently in French.</li>
<li><a href="${MAYA}" rel="noopener">Maya Pilot</a>: an AI community manager for SaaS companies.</li>
</ul>
<p>These products do not have a customer base yet, so we show no clients, no figures from results and no testimonials. When an article mentions one, it says so in the sentence (“a tool we publish”) and never presents it as an independent review. Details: <a href="${PAGES.money.en}">how we make money</a>.</p>
<h2>How we work</h2>
<p>Sources listed on every article, calculations you can redo, visible publication and verification dates, and openly AI-assisted writing: see the <a href="/en/editorial-method">editorial method</a>.</p>
<h2>Write to us</h2>
<p>An error, a question, a proposal: <a href="${PAGES.contact.en}">Contact page</a>.</p>` },
  },
  money: {
    fr: { title: 'Comment nous gagnons de l’argent', meta: `${BRAND} ne vend ni publicité ni liens d’affiliation. Il est financé par son éditeur, qui publie aussi Résidence Manager, AlturaCom et Maya Pilot.`,
      html: () => `<h1>Comment nous gagnons de l’argent</h1>
<p class="s-intro">${BRAND} ne contient aucune publicité et aucun lien d’affiliation. Il est financé par son éditeur, AlturaCom, qui publie aussi Résidence Manager et Maya Pilot : si un lecteur découvre l’un de ces produits ici et choisit de l’acheter, l’éditeur en profite.</p>
<p>Pour cette raison, un produit n’apparaît dans un article que si le sujet le justifie, avec au plus un lien par article, signalé comme « un outil que nous éditons ». Le contenu reste utile sans lui. Si cela change (publicité, affiliation, sponsoring), nous l’écrirons ici avant de le faire.</p>
<p>Voir aussi : <a href="${PAGES.about.fr}">À propos</a> · <a href="/fr/methode-editoriale">Méthode éditoriale</a>.</p>` },
    en: { title: 'How we make money', meta: `${BRAND} carries no ads and no affiliate links. It is funded by its publisher, which also makes Résidence Manager, AlturaCom and Maya Pilot.`,
      html: () => `<h1>How we make money</h1>
<p class="s-intro">${BRAND} carries no advertising and no affiliate links. It is funded by its publisher, AlturaCom, which also makes Résidence Manager and Maya Pilot: if a reader finds one of these products here and chooses to buy it, the publisher benefits.</p>
<p>For that reason a product appears in an article only when the subject justifies it, with at most one link per article, flagged as “a tool we publish”. The content stays useful without it. If this changes (ads, affiliate links, sponsorship), we will write it here before we do it.</p>
<p>See also: <a href="${PAGES.about.en}">About</a> · <a href="/en/editorial-method">Editorial method</a>.</p>` },
  },
  contact: {
    fr: { title: 'Contact', meta: `Écrire à la rédaction de ${BRAND} : signaler une erreur, poser une question, proposer un sujet ou demander une autorisation.`,
      html: () => `<h1>Contact</h1>
<p class="s-intro">Une erreur à signaler, une question, un sujet à proposer, une autorisation de réutilisation à demander : écrivez-nous ci-dessous. Nous lisons tout et corrigeons les erreurs avec une date de correction.</p>
${contactForm('fr')}
<p>Pour proposer un texte complet : <a href="/fr/ecrire-pour-nous">écrire pour nous</a>.</p>` },
    en: { title: 'Contact', meta: `Write to the ${BRAND} team: report an error, ask a question, suggest a topic or request permission.`,
      html: () => `<h1>Contact</h1>
<p class="s-intro">An error to report, a question, a topic to suggest, a reuse permission to request: write to us below. We read everything and fix errors with a correction date.</p>
${contactForm('en')}
<p>To submit a full piece: <a href="/en/write-for-us">write for us</a>.</p>` },
  },
  legal: {
    fr: { title: 'Mentions légales', meta: `Mentions légales de ${BRAND} : éditeur, hébergeur, propriété intellectuelle, données personnelles et contact.`,
      html: () => `<h1>Mentions légales</h1>
<h2>Éditeur</h2>
<p>${BRAND} (margebrief.com) est édité par <a href="${ALTURA}" rel="noopener">AlturaCom</a>. Le directeur de la publication est le représentant légal de l’éditeur. Pour toute demande, utilisez la <a href="${PAGES.contact.fr}">page Contact</a>.</p>
<h2>Hébergeur</h2>
<p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
<h2>Propriété intellectuelle</h2>
<p>Les contenus sont protégés par le droit d’auteur. Conditions de citation et de réutilisation : <a href="${PAGES.reuse_fr || '/fr/reutilisation-contenu'}">page dédiée</a>. Les photographies sont libres de droits et créditées sous chaque image.</p>
<h2>Données personnelles</h2>
<p>Les adresses email recueillies (newsletter, contact) servent uniquement à envoyer la newsletter choisie ou à répondre à votre message ; elles ne sont pas revendues. Vous pouvez demander l’accès, la rectification ou la suppression de vos données via la <a href="${PAGES.contact.fr}">page Contact</a>. Les calculateurs fonctionnent dans votre navigateur : les valeurs saisies ne sont pas envoyées.</p>
<h2>Limite de responsabilité</h2>
<p>Les articles informent et ne remplacent pas un conseil juridique, fiscal, comptable ou financier. Vérifiez auprès d’un professionnel et de la source officielle citée avant toute décision.</p>` },
    en: { title: 'Legal notice', meta: `Legal notice for ${BRAND}: publisher, host, intellectual property, personal data and contact.`,
      html: () => `<h1>Legal notice</h1>
<h2>Publisher</h2>
<p>${BRAND} (margebrief.com) is published by <a href="${ALTURA}" rel="noopener">AlturaCom</a>. The publication director is the publisher’s legal representative. For any request, use the <a href="${PAGES.contact.en}">Contact page</a>.</p>
<h2>Hosting</h2>
<p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA.</p>
<h2>Intellectual property</h2>
<p>Content is protected by copyright. Terms for quoting and reuse: <a href="/en/content-reuse">dedicated page</a>. Photographs are royalty-free and credited under each image.</p>
<h2>Personal data</h2>
<p>Email addresses collected (newsletter, contact) are used only to send the newsletter you chose or to answer your message; they are not sold. You can request access, correction or deletion through the <a href="${PAGES.contact.en}">Contact page</a>. The calculators run in your browser: the values you enter are not sent anywhere.</p>
<h2>Disclaimer</h2>
<p>Articles inform and do not replace legal, tax, accounting or financial advice. Check with a professional and with the official source cited before any decision.</p>` },
  },
  search: {
    fr: { title: 'Recherche', meta: `Rechercher dans les articles et outils de ${BRAND}.`,
      html: () => `<h1>Recherche</h1><div class="s-field"><label for="q">Rechercher un article ou un outil</label><input id="q" type="search" placeholder="Ex : appels manqués, DPE, CAC" autocomplete="off"></div><ul class="s-results" id="results" aria-live="polite"></ul><script src="/assets/js/search.js" defer></script>` },
    en: { title: 'Search', meta: `Search ${BRAND} articles and tools.`,
      html: () => `<h1>Search</h1><div class="s-field"><label for="q">Search articles and tools</label><input id="q" type="search" placeholder="Ex: missed calls, CAC, Airbnb tax" autocomplete="off"></div><ul class="s-results" id="results" aria-live="polite"></ul><script src="/assets/js/search.js" defer></script>` },
  },
};

// ── Outils gratuits (un par pilier) ──────────────────────────────────────────
const F = (id, label, val, step = 'any') => `<div class="s-field"><label for="t-${id}">${label}</label><input id="t-${id}" name="${id}" type="number" inputmode="decimal" step="${step}" min="0" value="${val}"></div>`;
const TOOLS = [
  { id: 'hotes', slug: { fr: 'calculateur-rentabilite-location-courte-duree', en: 'short-term-rental-profit-calculator' },
    fr: { title: 'Calculateur de rentabilité nette d’une location courte durée', desc: 'Du tarif à la nuit au revenu net par mois et au rendement : refaites le calcul avec vos propres chiffres, sans inscription.',
      intro: 'Entrez vos chiffres (les valeurs affichées sont des exemples à remplacer). Rien n’est envoyé : le calcul se fait dans votre navigateur.',
      fields: [['rate', 'Tarif moyen par nuit (€)', 90], ['occ', 'Taux d’occupation (%)', 62], ['stay', 'Durée moyenne d’un séjour (nuits)', 3], ['fee', 'Commission plateforme (% du revenu)', 15.5], ['clean', 'Coût du ménage par séjour (€)', 45], ['cleanfee', 'Frais de ménage facturés au voyageur par séjour (€)', 40], ['fixed', 'Charges fixes mensuelles : emprunt ou loyer, énergie, internet, assurance (€)', 750], ['price', 'Prix d’acquisition ou capital investi (€, 0 si non applicable)', 180000]],
      out: ['Revenu brut annuel', 'Net annuel avant impôt', 'Net mensuel avant impôt', 'Rendement net avant impôt'],
      how: ['Nuits louées = 365 × occupation. Séjours = nuits louées ÷ durée moyenne.', 'Revenu brut = nuits louées × tarif + séjours × frais de ménage facturés.', 'Net = revenu brut − commission − séjours × coût du ménage − 12 × charges fixes.', 'Rendement net = net annuel ÷ capital investi.'],
      limits: 'Ne calcule ni impôts ni cotisations (régime de loyers, amortissement, taxe de séjour, taxe foncière à ajouter dans les charges fixes). Les valeurs d’exemple ne sont pas des moyennes de marché.' },
    en: { title: 'Short-term rental net profit calculator', desc: 'From nightly rate to monthly net income and yield: redo the math with your own numbers, no signup.',
      intro: 'Enter your numbers (the values shown are examples to replace). Nothing is sent: the math runs in your browser.',
      fields: [['rate', 'Average nightly rate ($)', 150], ['occ', 'Occupancy (%)', 62], ['stay', 'Average stay (nights)', 3], ['fee', 'Platform fee (% of revenue)', 15.5], ['clean', 'Cleaning cost per stay ($)', 80], ['cleanfee', 'Cleaning fee charged to the guest per stay ($)', 75], ['fixed', 'Monthly fixed costs: mortgage or rent, utilities, internet, insurance, property tax ($)', 1500], ['price', 'Purchase price or capital invested ($, 0 if n/a)', 300000]],
      out: ['Annual gross revenue', 'Annual net before tax', 'Monthly net before tax', 'Net yield before tax'],
      how: ['Nights booked = 365 × occupancy. Stays = nights booked ÷ average stay.', 'Gross revenue = nights booked × rate + stays × cleaning fee charged.', 'Net = gross − platform fee − stays × cleaning cost − 12 × fixed costs.', 'Net yield = annual net ÷ capital invested.'],
      limits: 'Does not compute income tax or depreciation, and occupancy taxes and local lodging taxes must be added to your costs. The example values are not market averages.' } },
  { id: 'artisans', slug: { fr: 'calculateur-cout-appel-manque', en: 'missed-call-cost-calculator' },
    fr: { title: 'Calculateur du coût d’un appel manqué', desc: 'Combien vous coûtent les appels sans réponse : chantiers perdus, chiffre d’affaires et marge, avec vos propres taux.',
      intro: 'Entrez vos chiffres (valeurs d’exemple à remplacer par les vôtres). Le calcul se fait dans votre navigateur.',
      fields: [['calls', 'Appels de prospects par semaine', 25], ['miss', 'Part d’appels manqués (%)', 30], ['lost', 'Part des appelants manqués qui vont chez un concurrent (%)', 60], ['close', 'Part des appels qui deviennent un chantier (%)', 30], ['job', 'Valeur moyenne d’un chantier (€)', 1800], ['margin', 'Marge sur un chantier (%)', 30]],
      out: ['Chantiers perdus par mois', 'Chiffre d’affaires perdu par an', 'Marge perdue par an', 'Coût d’un appel manqué'],
      how: ['Appels manqués perdus = appels × part manquée × part qui part chez un concurrent.', 'Chantiers perdus = appels manqués perdus × taux de transformation.', 'CA perdu = chantiers perdus × valeur moyenne ; marge perdue = CA perdu × marge.', 'Coût d’un appel manqué = taux de transformation × valeur moyenne × part qui part × marge.'],
      limits: 'Chaque taux est une estimation que vous devez mesurer chez vous (carnet d’appels, devis signés). Un service de réponse ou un outil coûte lui aussi : comparez son prix mensuel à la marge perdue.' },
    en: { title: 'Missed call cost calculator', desc: 'What unanswered calls cost you: lost jobs, revenue and margin, using your own rates.',
      intro: 'Enter your numbers (example values to replace). The math runs in your browser.',
      fields: [['calls', 'Prospect calls per week', 25], ['miss', 'Share of calls missed (%)', 30], ['lost', 'Share of missed callers who go to a competitor (%)', 60], ['close', 'Share of calls that become a job (%)', 30], ['job', 'Average job value ($)', 2500], ['margin', 'Margin on a job (%)', 30]],
      out: ['Jobs lost per month', 'Revenue lost per year', 'Margin lost per year', 'Cost of one missed call'],
      how: ['Lost missed calls = calls × share missed × share who go elsewhere.', 'Jobs lost = lost missed calls × close rate.', 'Revenue lost = jobs lost × average job value; margin lost = revenue lost × margin.', 'Cost of one missed call = close rate × average job × share who go elsewhere × margin.'],
      limits: 'Each rate is an estimate you should measure yourself (call log, signed quotes). An answering service or tool has a cost too: compare its monthly price to the margin lost.' } },
  { id: 'saas', slug: { fr: 'calculateur-cac-delai-recuperation', en: 'cac-payback-calculator' },
    fr: { title: 'Calculateur de CAC et de délai de récupération', desc: 'Coût d’acquisition client, délai de récupération et LTV/CAC d’un SaaS, calculés avec vos chiffres.',
      intro: 'Entrez vos chiffres (valeurs d’exemple à remplacer). Le calcul se fait dans votre navigateur.',
      fields: [['spend', 'Dépenses marketing et vente par mois (€)', 6000], ['new', 'Nouveaux clients payants par mois', 20], ['arpa', 'Revenu mensuel moyen par client (€)', 60], ['gm', 'Marge brute (%)', 80], ['churn', 'Churn mensuel (% de clients perdus par mois)', 3]],
      out: ['CAC', 'Délai de récupération (mois)', 'LTV', 'LTV / CAC'],
      how: ['CAC = dépenses ÷ nouveaux clients.', 'Délai de récupération = CAC ÷ (revenu mensuel × marge brute).', 'LTV = revenu mensuel × marge brute ÷ churn mensuel.', 'LTV/CAC = LTV ÷ CAC.'],
      limits: 'Suppose un churn constant et ignore l’expansion de revenu. Avec peu de clients, les chiffres bougent beaucoup d’un mois à l’autre : prenez une moyenne sur plusieurs mois.' },
    en: { title: 'CAC and payback period calculator', desc: 'Customer acquisition cost, payback period and LTV/CAC for a SaaS, computed from your own numbers.',
      intro: 'Enter your numbers (example values to replace). The math runs in your browser.',
      fields: [['spend', 'Sales and marketing spend per month ($)', 8000], ['new', 'New paying customers per month', 20], ['arpa', 'Average monthly revenue per customer ($)', 80], ['gm', 'Gross margin (%)', 80], ['churn', 'Monthly churn (% of customers lost per month)', 3]],
      out: ['CAC', 'Payback period (months)', 'LTV', 'LTV / CAC'],
      how: ['CAC = spend ÷ new customers.', 'Payback = CAC ÷ (monthly revenue × gross margin).', 'LTV = monthly revenue × gross margin ÷ monthly churn.', 'LTV/CAC = LTV ÷ CAC.'],
      limits: 'Assumes constant churn and ignores expansion revenue. With few customers the figures swing month to month: use an average over several months.' } },
];
const toolPath = (t, lang) => (lang === 'fr' ? '/fr/outils/' : '/en/tools/') + t.slug[lang];

function toolBody(t, lang) {
  const c = t[lang]; const fr = lang === 'fr';
  return `<main class="s-page s-tool" data-tool="${t.id}" data-lang="${lang}">
<h1>${c.title}</h1>
<p class="s-intro">${c.intro}</p>
<form class="s-form-stack s-tool-form" onsubmit="return false">
${c.fields.map((f) => F(f[0], f[1], f[2])).join('\n')}
</form>
<section class="s-tool-out" aria-live="polite"><h2>${fr ? 'Résultat' : 'Result'}</h2><dl>${c.out.map((o, i) => `<div><dt>${o}</dt><dd id="o${i}">–</dd></div>`).join('')}</dl></section>
<h2>${fr ? 'Comment c’est calculé' : 'How it is calculated'}</h2>
<ul>${c.how.map((h) => `<li>${h}</li>`).join('')}</ul>
<h2>${fr ? 'Limites' : 'Limits'}</h2>
<p>${c.limits}</p>
<p class="s-form-note">${fr ? 'Outil gratuit, sans inscription. Les valeurs saisies restent dans votre navigateur.' : 'Free tool, no signup. The values you enter stay in your browser.'} ${fr ? 'Publié le' : 'Published'} 2026-11-21.</p>
<script src="/assets/js/tools.js" defer></script>
</main>`;
}

module.exports = { PAGES, CONTENT, TOOLS, toolPath, toolBody, contactForm };
