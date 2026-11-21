// Config centrale du site : nom, domaine, rubriques, textes FR/EN.
// Après choix du nom de marque : remplacer BRAND (et DOMAIN une fois le domaine acheté), puis `node scripts/build-site.js`.

const BRAND = 'Marge Brief';
const DOMAIN = 'https://www.margebrief.com';
const YEAR = 2026;
const READERS = '100+'; // audience hebdomadaire déclarée

// Rubriques = thématiques par jour de semaine (0 = dimanche)
const CATS = [
  { id: 'hotes',
    fr: { name: 'Hôtes & location courte durée', desc: 'Gestion, rentabilité nette, réglementation, fiscalité, investissement locatif : les calculs et les règles à connaître quand on loue en courte durée en France.' },
    en: { name: 'Hosts & short-term rentals', desc: 'Operations, net profitability, regulation, taxes and rental investing: the numbers and rules every short-term rental host in the US should know.' } },
  { id: 'artisans',
    fr: { name: 'Artisans & petites entreprises de services', desc: 'Appels manqués, devis, tarifs, visibilité, avis, statuts, trésorerie : le quotidien des artisans et des petites entreprises de services, chiffres à l’appui.' },
    en: { name: 'Contractors & small service businesses', desc: 'Missed calls, quotes, pricing, visibility, reviews, business structure and cash flow: the daily reality of US contractors and small service businesses, with the math.' } },
  { id: 'saas',
    fr: { name: 'Marketing & croissance SaaS', desc: 'Contenu, community management, réseaux sociaux, algorithmes : ce qui fait croître un éditeur de SaaS, avec des données et des méthodes applicables.' },
    en: { name: 'SaaS marketing & growth', desc: 'Content, community management, social media and algorithms: what grows a SaaS company, with data and methods you can apply this week.' } },
];

// Pilier d'une date (planning) : lun/mer = hôtes, mar/jeu/sam = artisans, ven/dim = SaaS
function pillarForDate(date) {
  const d = new Date(date + 'T12:00:00Z');
  const dow = d.getUTCDay();
  if (dow === 1 || dow === 3) return 'hotes';
  if (dow === 2 || dow === 4) return 'artisans';
  if (dow === 5 || dow === 0) return 'saas';
  return 'artisans';
}

// Pages statiques : chemin par langue (chaque langue a son équivalent)
const PAGES = {
  write: { fr: '/fr/ecrire-pour-nous', en: '/en/write-for-us' },
  reuse: { fr: '/fr/reutilisation-contenu', en: '/en/content-reuse' },
  method: { fr: '/fr/methode-editoriale', en: '/en/editorial-method' },
};
const catPath = (lang, id) => (lang === 'fr' ? `/fr/categorie/${id}` : `/en/category/${id}`);

const T = {
  fr: {
    locale: 'fr-FR',
    tagline: 'Tech · Business · Immobilier',
    siteTitle: 'Le brief quotidien pour développer son activité',
    siteDesc: 'Un article par jour pour les hôtes en location courte durée, les artisans et les éditeurs de SaaS. Données sourcées, calculs refaisables.',
    heroTag: 'Hôtes · Artisans · Croissance SaaS',
    heroH1: 'Hôtes, artisans, éditeurs de SaaS : arrêtez de deviner. Refaites les calculs.',
    heroSub: 'Chaque jour, un article en français et un en anglais, construits sur des données vérifiées et des cas réels. Pas de liste « 10 astuces », pas de généralités.',
    proof: ['1 article FR + 1 EN par jour', '3 piliers', 'Gratuit, sans spam'],
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
    siteTitle: 'The daily brief to grow your business',
    siteDesc: 'One article a day for short-term rental hosts, US contractors and SaaS founders. Sourced data, calculations you can redo.',
    heroTag: 'Hosts · Contractors · SaaS growth',
    heroH1: 'Hosts, contractors, SaaS founders: stop guessing. Run the numbers.',
    heroSub: 'Every day, one article in English and one in French, built on verified data and real cases. No “10 tips” lists, no generalities.',
    proof: ['One EN + one FR article daily', '3 pillars', 'Free, no spam'],
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
  return `<form class="s-form-stack au-form" novalidate data-lang="${lang}">
  <div class="s-field"><label for="a-name">${fr ? 'Votre nom (ou pseudo) affiché' : 'Your displayed name'}</label><input id="a-name" name="name" required maxlength="80" autocomplete="name"></div>
  <div class="s-field"><label for="a-email">${fr ? 'Votre email (jamais publié)' : 'Your email (never published)'}</label><input id="a-email" type="email" name="email" required maxlength="120" autocomplete="email" placeholder="${fr ? 'vous@exemple.com' : 'you@example.com'}"></div>
  <div class="s-field"><label for="a-lang">${fr ? 'Langue du texte' : 'Language of the text'}</label><select id="a-lang" name="lang"><option value="fr"${fr ? ' selected' : ''}>Français</option><option value="en"${fr ? '' : ' selected'}>English</option></select></div>
  <div class="s-field"><label for="a-title">${fr ? 'Titre' : 'Title'}</label><input id="a-title" name="title" required minlength="15" maxlength="140" placeholder="${fr ? 'Ex : j’ai réduit mes charges de 30 % en 6 mois' : 'Ex: I cut my overhead by 30% in 6 months'}"></div>
  <div class="s-field"><label for="a-summary">${fr ? 'Résumé en une phrase (facultatif)' : 'One-sentence summary (optional)'}</label><input id="a-summary" name="summary" maxlength="300"></div>
  <div class="s-field"><label for="a-body">${fr ? 'Votre texte (300 mots minimum)' : 'Your text (300 words minimum)'}</label><textarea id="a-body" name="body" required style="min-height:320px" placeholder="${fr ? 'Écrivez ici. Titres : ## Titre. Gras : **mot**. Lien : [texte](https://…)' : 'Write here. Headings: ## Title. Bold: **word**. Link: [text](https://…)'}"></textarea><small class="au-count" aria-live="polite">0 ${fr ? 'mot' : 'words'}</small></div>
  <div class="s-field"><label for="a-bio">${fr ? 'Courte bio (facultatif)' : 'Short bio (optional)'}</label><input id="a-bio" name="bio" maxlength="300"></div>
  <div class="s-field"><label for="a-url">${fr ? 'Lien vers votre site (facultatif, https://…)' : 'Link to your site (optional, https://…)'}</label><input id="a-url" name="url" type="url" maxlength="200" placeholder="https://"></div>
  <input type="text" name="website" class="s-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
  <p class="s-terms">${fr ? `En publiant, vous confirmez que le texte est de vous et que vous en êtes responsable. Il est publié immédiatement et sans relecture, sous votre nom, avec une licence non exclusive pour ${BRAND}. Les liens sont déclarés « nofollow ».` : `By publishing, you confirm the text is yours and that you are responsible for it. It goes live immediately, without editorial review, under your name, with a non-exclusive licence for ${BRAND}. Links are marked “nofollow”.`}</p>
  <button type="submit">${fr ? 'Publier maintenant' : 'Publish now'}</button>
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
      meta: `Publiez votre texte sur ${BRAND} en deux minutes, sans compte : renseignez votre email, écrivez, c’est en ligne tout de suite avec votre signature et un lien vers votre site.`,
      html: () => `<h1>Écrire pour ${BRAND}</h1>
<p class="s-intro">Pas de compte, pas de mot de passe. Vous renseignez votre email, vous écrivez, et votre texte est en ligne immédiatement, signé de votre nom, avec un lien vers votre site.</p>
<h2>Ce qui marche ici</h2>
<ul>
<li>Des cas réels avec des chiffres : revenus, marges, délais, coûts, avant et après.</li>
<li>Des méthodes que vous avez appliquées vous-même, avec ce qui a raté.</li>
<li>Des analyses appuyées sur des données ou une expérience vérifiable.</li>
</ul>
<h2>Les règles (appliquées automatiquement)</h2>
<ul>
<li>300 mots minimum, texte inédit et de vous.</li>
<li>3 liens maximum dans le texte, plus un lien vers votre site. Tous les liens sont en « nofollow ».</li>
<li>Pas de spam, pas de contenu dupliqué, pas de contenu illégal. 2 textes par jour et par email.</li>
<li>Vous gardez vos droits et restez responsable de ce que vous publiez. Un texte problématique peut être retiré à tout moment.</li>
</ul>
${contribForm('fr')}
<p>Voir les textes déjà publiés : <a href="/fr/tribune">Tribune des auteurs</a>. Un texte à retirer ou à signaler : <a href="${PAGES.reuse.fr}">nous écrire</a>.</p>`,
    },
    en: {
      title: `Write for ${BRAND}`,
      meta: `Publish your piece on ${BRAND} in two minutes, no account: enter your email, write, and it goes live right away with your byline and a link to your site.`,
      html: () => `<h1>Write for ${BRAND}</h1>
<p class="s-intro">No account, no password. Enter your email, write, and your piece goes live immediately under your name, with a link to your site.</p>
<h2>What works here</h2>
<ul>
<li>Real cases with numbers: revenue, margins, lead times, costs, before and after.</li>
<li>Methods you applied yourself, including what went wrong.</li>
<li>Analysis backed by data or verifiable experience.</li>
</ul>
<h2>The rules (applied automatically)</h2>
<ul>
<li>300 words minimum, original and yours.</li>
<li>3 links maximum in the text, plus a link to your site. All links are “nofollow”.</li>
<li>No spam, no duplicate content, nothing illegal. 2 pieces a day per email.</li>
<li>You keep your rights and remain responsible for what you publish. A problematic piece can be removed at any time.</li>
</ul>
${contribForm('en')}
<p>See published pieces: <a href="/en/community">Community voices</a>. To report or remove a piece: <a href="${PAGES.reuse.en}">write to us</a>.</p>`,
    },
  },
  method: {
    fr: {
      title: 'Comment nous travaillons',
      meta: `Qui publie ${BRAND}, comment les articles sont écrits et vérifiés, ce que nous ne faisons jamais et comment signaler une erreur.`,
      html: () => `<h1>Comment nous travaillons</h1>
<p class="s-intro">${BRAND} publie chaque jour des articles sourcés pour les hôtes de location courte durée, les artisans et les indépendants. Cette page dit qui publie, comment, avec quelles règles, et comment nous corriger.</p>
<h2>Qui publie</h2>
<p>${BRAND} est édité par <a href="https://alturacom-production.odoo.com" rel="noopener">AlturaCom</a>, une agence de communication digitale. L’éditeur développe aussi d’autres services, comme Résidence Manager (outil pour hôtes) et Maya Pilot (outil de marketing pour éditeurs de logiciels). Quand un article renvoie vers l’un de ces services, nous l’indiquons dans le texte : ce n’est jamais présenté comme un avis indépendant.</p>
<h2>Comment les articles sont faits</h2>
<p>Chaque article part de recherches sur des sources identifiées, dont au moins une source primaire (texte de loi, administration, étude, donnée publique). Les chiffres sont rattachés à leur source et à leur date, les calculs peuvent être refaits avec vos propres données, et tout ce qui est fiscal, légal ou réglementaire porte sa date de vérification. Nous n’inventons ni auteur fictif ni expérience personnelle.</p>
<h2>Les règles que chaque article doit respecter</h2>
<ul>
<li>Au moins trois sources, dont une source primaire (texte de loi, administration, étude d’origine), listées en bas de l’article avec leur lien.</li>
<li>Un calcul ou un critère chiffré que vous pouvez refaire avec vos propres chiffres, avec les hypothèses affichées.</li>
<li>Une date de vérification visible. Quand une information change, l’article est corrigé et la date mise à jour.</li>
<li>Les limites annoncées : quand les chiffres existants viennent d’éditeurs d’outils ou d’études fragiles, nous le disons.</li>
<li>Aucun chiffre, témoignage, prix ou expérience inventé. Aucune promesse de revenus ou de résultats.</li>
<li>Si un jour ne permet pas d’apporter un fait ou un calcul utile, nous publions moins plutôt que de remplir.</li>
</ul>
<h2>Ce que nous ne sommes pas</h2>
<p>Nos articles informent, ils ne remplacent pas un conseil juridique, fiscal, comptable ou financier. Pour une décision engageante, vérifiez auprès d’un professionnel et auprès de la source officielle citée.</p>
<h2>Les textes d’auteurs invités</h2>
<p>La <a href="/fr/tribune">Tribune</a> accueille des textes écrits par des lecteurs. Ils sont publiés immédiatement, après des contrôles automatiques, puis relus a posteriori ; nous retirons ceux qui ne respectent pas nos règles. Ils engagent leurs auteurs, pas la rédaction.</p>
<h2>Signaler une erreur</h2>
<p>Une erreur, un chiffre périmé, une source qui ne dit pas ce que nous écrivons ? Signalez-le via la page <a href="${PAGES.reuse.fr}">Citer et réutiliser nos articles</a>, où figure le moyen de nous contacter. Nous vérifions et corrigeons, et nous datons la correction.</p>`
    },
    en: {
      title: 'How we work',
      meta: `Who publishes ${BRAND}, how articles are written and checked, what we never do, and how to report an error.`,
      html: () => `<h1>How we work</h1>
<p class="s-intro">${BRAND} publishes sourced articles every day for short-term rental hosts, tradespeople and independents. This page says who publishes it, how, under which rules, and how to correct us.</p>
<h2>Who publishes</h2>
<p>${BRAND} is published by <a href="https://alturacom-production.odoo.com" rel="noopener">AlturaCom</a>, a digital communication agency. The publisher also develops other services, such as Résidence Manager (a tool for hosts) and Maya Pilot (a marketing tool for software companies). When an article points to one of them, we say so in the text: it is never presented as an independent review.</p>
<h2>How articles are made</h2>
<p>Every article starts from research on identified sources, including at least one primary source (statute, agency, study, public data). Figures are tied to their source and date, calculations can be redone with your own numbers, and anything tax, legal or regulatory carries its verification date. We never invent a fictional author or personal experience.</p>
<h2>Rules every article must meet</h2>
<ul>
<li>At least three sources, including a primary source (legislation, a public agency, the original study), listed at the bottom of the article with links.</li>
<li>A calculation or numerical test you can redo with your own numbers, with the assumptions shown.</li>
<li>A visible verification date. When something changes, the article is corrected and the date updated.</li>
<li>Limits stated: when existing figures come from tool vendors or weak studies, we say so.</li>
<li>No invented figure, testimonial, price or experience. No promise of income or results.</li>
<li>If a day does not yield a useful new fact or calculation, we publish less rather than fill space.</li>
</ul>
<h2>What we are not</h2>
<p>Our articles inform; they do not replace legal, tax, accounting or financial advice. For a binding decision, check with a professional and with the official source cited.</p>
<h2>Guest texts</h2>
<p>The <a href="/en/community">Community</a> section hosts texts written by readers. They are published immediately after automated checks, then reviewed afterwards; we remove those that break our rules. They represent their authors, not the editorial team.</p>
<h2>Report an error</h2>
<p>An error, an outdated figure, a source that does not say what we wrote? Report it through the <a href="${PAGES.reuse.en}">Citing and reusing our articles</a> page, which explains how to contact us. We check and correct, and we date the correction.</p>`
    }
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

// Articles mis en noindex tant qu'ils n'ont pas été réécrits au niveau des règles actuelles (docs/EDITORIAL.md)
const NOINDEX = [];

module.exports = { BRAND, DOMAIN, YEAR, READERS, CATS, pillarForDate, PAGES, catPath, T, PAGE_CONTENT, NOINDEX };
