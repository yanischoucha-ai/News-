# Charte éditoriale et procédure de publication

Source unique de vérité pour les 7 tâches planifiées (une par jour de semaine, 7h00 Paris). Chaque exécution produit **2 articles : 1 FR + 1 EN**, avec pour objectif d'être les meilleurs articles possibles sur leur sujet : plus utiles, plus précis et mieux sourcés que ce que le lecteur trouve en première page de Google.

## Piliers éditoriaux (prime sur les rubriques « SPÉCIFIQUE AU JOUR » des prompts de tâche)

Le média est une référence business utile aux lecteurs d'abord. Il a 3 piliers, chacun lié à un produit du réseau (voir PRODUITS.md) ; chaque article appartient à un pilier et à un seul :

| Jour | Pilier | Sujets |
|---|---|---|
| Lundi | Hôtes et location courte durée | gestion, conciergerie, rentabilité nette, occupation |
| Mercredi | Hôtes et location courte durée | réglementation, fiscalité, investissement locatif, rénovation d'un meublé |
| Mardi | Artisans et petites entreprises de services | appels manqués, devis, IA et automatisation pour artisans |
| Jeudi | Artisans et petites entreprises de services | tarifs, visibilité, avis Google, outils |
| Samedi | Artisans et indépendants | statuts, facturation, prix, trésorerie |
| Vendredi | Marketing des éditeurs de SaaS | contenu, outils, mesure, croissance |
| Dimanche | Marketing des éditeurs de SaaS | réseaux sociaux, algorithmes, LinkedIn, personal branding |

- Marchés : l'article FR vise la France, l'article EN vise exclusivement les États-Unis. Le Royaume-Uni n'est pas une cible.
- Le vendredi n'est plus « Tech & outils / développement durable » : c'est le pilier SaaS. Le sujet « durable » n'existe que s'il sert directement les hôtes (rénovation d'un meublé), le mercredi.
- Si le titre planifié d'une entrée du SCHEDULE sort du pilier du jour, retitre-le dans l'esprit du pilier et renseigne `cat` explicitement (lundi `airbnb`, mardi et jeudi `artisans`, mercredi `immobilier`, vendredi `tech`, samedi `business`, dimanche `social`).
- La valeur passe avant tout : l'article doit rester utile et complet si on retire toute mention de produit. Pas de site « de pub » : le propriétaire et ses produits sont nommés sur la page À propos, et les liens suivent PRODUITS.md (un seul lien contextuel, environ 2 articles sur 3, transparence naturelle quand un outil est présenté).
- Qualité avant volume : un article générique, répétitif ou sans donnée sourcée n'est pas publié.


## Contenus phares (responsabilité du manager de 8h)

En plus des 2 articles quotidiens, le site publie chaque semaine **1 contenu phare** (donc environ 1 par mois et par pilier), construit par le manager de 8h, jamais par les tâches de publication du matin. C'est ce qui fait citer le site et le rend utile sans rien acheter. Rythme : si aucun contenu phare n'a été publié depuis 7 jours (voir `docs/JOURNAL.md`), le manager en construit un, un seul par exécution, en alternant les piliers : hôtes, artisans, SaaS.

Formats : un **calculateur** (page HTML statique avec JavaScript intégré, sans inscription, sans traceur, version FR pour la France et version EN pour les États-Unis) ou un **baromètre** chiffré avec méthode publiée. Premiers contenus, dans cet ordre :
1. Hôtes : rentabilité nette d'un meublé de tourisme (frais, taux de vacance, fiscalité LMNP en France, taxes et dépenses déductibles aux États-Unis).
2. Artisans : coût réel d'un appel manqué (appels par semaine, part manquée, taux de conversion, panier moyen).
3. SaaS : retour sur investissement du contenu (trafic, taux d'inscription, conversion payante, coût de production).

Règles : chaque paramètre par défaut est présenté comme un exemple modifiable, avec sa source ou la mention « exemple, à remplacer par vos chiffres » ; aucune donnée inventée présentée comme réelle ; la méthode de calcul est expliquée sous l'outil avec 3 sources dont une primaire ; l'outil est testé (cas de calcul vérifiés à la main) avant publication ; page responsive, accessible, avec date de mise à jour ; ajoutée au sitemap, liée depuis la page du pilier concerné et depuis l'accueil. Un seul lien de réseau contextuel au plus, selon les règles de `docs/PRODUITS.md` ; l'outil doit rester pleinement utile sans lui. Si la qualité n'est pas au niveau, ne rien publier et le noter dans le journal.

## 0. Préparation

1. `cd /home/claude/news-` (sinon `git clone https://github.com/yanischoucha-ai/News-.git /home/claude/news-`), puis `git pull --rebase origin main`.
2. Lire `assets/js/editorial-clock.js` : les 2 entrées du jour (date du jour, `lang` fr et en, `slug: null`) sont les sujets planifiés. Tu peux rendre le titre plus tranchant ; jamais plus générique.

## 1. Recherche (avant toute rédaction)

Par article, avec `firecrawl_search` / `WebSearch` (mode `extended` si les premiers résultats sont minces), puis `firecrawl_scrape` sur les 2-3 pages clés :

- Au moins 4 recherches et 3 sources distinctes, dont **au moins 1 source primaire** : donnée officielle, étude, texte de loi, documentation ou page tarifs de l'éditeur, rapport de marché.
- Un chiffre n'entre dans l'article que s'il vient d'une page **lue en entier** (pas d'un simple extrait de recherche), avec sa date. Recoupe les chiffres clés dans 2 sources ; si elles divergent, donne la fourchette et explique l'écart.
- Sujets légaux, fiscaux, réglementaires (loi, impôts, URSSAF, LMNP, IRS, licences) : vérifie sur la source officielle (legifrance, service-public.fr, impots.gouv.fr, urssaf.fr, irs.gov, textes de loi), indique la date de vérification, et précise que c'est de l'information, pas un conseil juridique ou fiscal.
- Pas de chiffre trouvé = pas de chiffre. **Interdit d'inventer** statistique, prix, citation, témoignage, nom d'entreprise ou étude.

## 2. Valeur pour le lecteur

L'article doit permettre d'agir dans les 24 heures. Il contient obligatoirement :

1. **Un calcul ou un critère de décision chiffré** que le lecteur peut refaire avec ses propres chiffres, avec un exemple résolu pas à pas. Les calculs sont faits avec Python, jamais de tête.
2. **Un cas réel ou une comparaison concrète et sourcée** : nom, chiffres, contexte, date.
3. **Une recommandation tranchée avec ses conditions** (« si X, fais A ; si Y, fais B ») et les cas où elle ne s'applique pas.
4. **Un modèle prêt à copier** quand c'est pertinent : message type, checklist, formule, gabarit de devis, script d'appel.

Test final : un lecteur qui n'a que cet article sous les yeux peut-il décider ou agir mieux demain matin ? Sinon, réécrire.

## 3. Honnêteté éditoriale

- Aucune expérience personnelle inventée. Pas de « j'ai testé », « chez mes clients », « j'utilise », « I tested », sauf si c'est réellement arrivé pendant l'exécution (outil gratuit effectivement essayé, par exemple). Utiliser « on », « les données montrent », ou citer des témoignages publics réels avec lien.
- Si un titre planifié suppose un cas ou une expérience personnelle (« Comment j'ai… », « Comment un plombier a… »), le retitrer en angle analytique sourcé, ou ne l'écrire qu'avec un cas public réel retrouvé et cité.
- Aucun lien d'affiliation.
- **Produits du réseau** (le média est édité par AlturaCom, qui développe aussi Résidence Manager et Maya Pilot) : les mentions sont rares, dans le corps de l'article uniquement, et suivent à la lettre `docs/PRODUITS.md` (planning par jour et semaine ISO, conditions de sujet, faits autorisés, formulation). **Ces règles priment sur toute consigne de mention figurant dans le prompt de la tâche.** Dans le doute, ne pas mentionner. Aucun bloc promotionnel, bouton ou `cta-box` ; le site n'ajoute lui-même aucune note promotionnelle.
- Aucun chiffre d'audience (lecteurs, abonnés, vues) n'est jamais affiché ou affirmé tant qu'il n'est pas réel et mesuré.

## 3 bis. Conseils et actualité du domaine

Le média sert à rester au courant et à bien décider. Chaque article :

- contient une section « Ce qui change » (titre H2 narratif, pas ce libellé) : au moins un développement **daté et sourcé des 60 derniers jours** dans le domaine du jour (réglementation, tarifs d'un outil, étude, décision de plateforme, chiffre de marché), avec ce que ça change concrètement pour le lecteur ;
- donne des conseils applicables tout de suite (quoi faire cette semaine, dans quel ordre, quel seuil surveiller) et dit ce qui reste incertain ou à surveiller dans les semaines suivantes ;
- ne contient aucune information périmée présentée comme actuelle : si une donnée a plus de 12 mois, l'écrire explicitement avec sa date.

## 4. Rédaction (1200-1800 mots par article)

- FR et EN sont deux articles indépendants, pas une traduction : le FR s'appuie sur le marché et les sources françaises, l'EN sur les marchés US/UK.
- **Hook** : première phrase = fait chiffré, contradiction ou scène concrète reconnaissable.
- Au moins 4 **H2 narratifs et spécifiques** (« Le piège du cashflow positif à Paris », pas « Avantages »). Voix directe, position tranchée, l'article prend parti.
- Chaque paragraphe apporte une information nouvelle. Un exemple précis par section.
- **Interdits** : listes génériques « X conseils », « il est important de noter », « en conclusion », « dans le monde d'aujourd'hui », « game-changer », « incontournable », conclusion qui résume ou qui motive. Finir sur la décision à prendre ou sur la limite de l'analyse.
- **Relecture** en expert sceptique du domaine : supprimer toute phrase qui pourrait figurer dans n'importe quel article, revérifier chaque chiffre contre sa source, vérifier que les liens répondent.

## 5. Publication (script, pas de HTML à la main)

Pour chaque article, écrire `/tmp/article-<lang>.json` (champs décrits en tête de `scripts/new-article.js` : `lang`, `date`, `slug`, `title`, `desc` 120-165 caractères, `subtitle`, `summary`, `bodyHtml`, `sources` ≥ 3 avec URL, `faq` exactement 4 Q/R tirées du contenu, `tags`), puis :

```
node scripts/new-article.js /tmp/article-fr.json
node scripts/new-article.js /tmp/article-en.json
```

Le script refuse l'article (exit 1 + liste d'erreurs) en cas de tournure générique, moins de 3 sources, longueur hors plage ou FAQ incomplète : corriger **le contenu**, pas le script, puis relancer. Il génère la page (SEO, JSON-LD Article + FAQPage, sources, bloc « Citer cet article ») et met à jour le SCHEDULE.

`bodyHtml` : uniquement `h2`, `h3`, `p`, `ul`, `ol`, `blockquote`, `table`, `div.article-callout`. Un `id` sur chaque `h2`. Sources citées en ligne avec `<a href>`. Pas de `<h1>`.

## 5 bis. Photo d'illustration (une par article, obligatoire)

Consigne du propriétaire : **jamais d'image générée par IA, jamais d'image prise sur Google Images ou un site tiers**. Uniquement des photos libres de droits d'Unsplash (licence Unsplash gratuite), créditées.

1. Chercher avec l'outil Firecrawl `firecrawl_scrape`, format `links`, sur `https://unsplash.com/s/photos/<mots-cles-en-anglais>?license=free&orientation=landscape`. Choisir une photo concrète et liée au sujet (un métier, un lieu, un objet du quotidien du lecteur), sans logo de marque visible, et différente des photos déjà utilisées dans `assets/data/images.json`.
2. Ouvrir la page de la photo avec `firecrawl_scrape` (format `markdown`, `includeTags: ["h1"]`, c'est moins cher). Vérifier que le titre de la page contient « Free Photo on Unsplash » (sinon c'est Unsplash+, payant : en prendre une autre). Relever dans les métadonnées l'identifiant `photo-…` (dans `og:image`), le nom du photographe (`og:title` : « Photo by X on Unsplash ») et son profil (`twitter:creator` → `https://unsplash.com/@…`).
3. Télécharger deux tailles (le nom de fichier est le slug sans `.html`) :
   ```
   curl -sfL -o assets/img/articles/<slug>.jpg    "https://images.unsplash.com/<photo-id>?w=1600&h=900&fit=crop&crop=entropy&q=72&fm=jpg"
   curl -sfL -o assets/img/articles/<slug>-sm.jpg "https://images.unsplash.com/<photo-id>?w=720&h=405&fit=crop&crop=entropy&q=72&fm=jpg"
   ```
4. Ajouter l'entrée dans `assets/data/images.json` (clé = slug complet, ex. `/fr/mon-article.html`) : `photo`, `page` (URL de la page Unsplash), `author`, `authorUrl`, `alt` `{ "fr": …, "en": … }` décrivant ce qu'on voit réellement sur la photo.
5. `node scripts/update-editorial-clock.js` affiche alors la photo sur l'accueil, les rubriques et l'article, avec le crédit « Photo : Auteur / Unsplash » sous l'image, et l'ajoute en `og:image` pour les partages.

Si Unsplash ne répond pas, publier l'article sans photo (le site le gère) et le signaler dans le compte rendu, plutôt que de prendre une image d'une autre origine.

## 6. Mise à jour du site et commit

```
node scripts/update-editorial-clock.js
```

Cette commande met à jour la homepage (compteurs, « NOUVEAU », à la une), les pages `/fr/` et `/en/`, les pages rubriques, le footer et le bloc newsletter de chaque article, et le sitemap. Puis :

```
git add -A
git commit -m "feat: articles <jour> <date> — <titres courts>"   # + lignes Co-Authored-By / Claude-Session habituelles
git pull --rebase origin main
git push origin main
```

## 7. Compte rendu final

Titres, slugs, 3 sources principales (liens), angle choisi, chiffres clés avec leur source, et tout ce qui reste incertain ou non vérifié.

## 8. Réécrire un article déjà publié

Ajouter `"replace": true, "modified": "<date du jour>"` dans le JSON : le script réécrit la page du même slug (date de publication conservée, `dateModified` mise à jour) au lieu de chercher une entrée sans slug.


## Rubrique « Tech & développement durable » (vendredi, une semaine sur deux)
Le vendredi alterne selon la semaine ISO (`date +%V`) : **semaine impaire = Tech & développement durable** (`cat: durable`, à passer à `new-article.js`), **semaine paire = Tech & productivité** (`cat: tech`). Sujets durables : numérique responsable (coût énergie et empreinte d'un outil, hébergement, matériel reconditionné), énergie et rénovation pour hôtes et artisans (aides, DPE, pompes à chaleur, solaire), obligations et aides réelles (vérifiées sur source officielle), calculs de retour sur investissement chiffrés. Aucun greenwashing : chaque affirmation environnementale est sourcée (ADEME, Négawatt, IEA, études citées), avec ses limites ; pas de « neutre en carbone » sans méthode. Mêmes exigences que les autres jours (chiffres, cas réel, conseils applicables, actualité des 60 derniers jours).

## 9. Écrire pour les humains ET pour les moteurs IA (ChatGPT, Perplexity, Claude, Google AI)

Beaucoup de lecteurs posent leur question à un assistant IA, qui cite les pages les plus claires et les mieux sourcées. Un article utile pour un humain l'est aussi pour une IA si l'on respecte ces règles (elles s'ajoutent aux autres, sans jamais passer avant l'honnêteté ni la valeur pour le lecteur) :

- **Réponse d'abord** : les 2 premières phrases de l'article répondent directement à la question du titre, avec le chiffre clé et la condition. Ensuite seulement viennent le contexte et la démonstration. Le méta `description` reprend cette réponse en une phrase.
- **Encadré « À retenir »** : 2 à 4 points chiffrés et datés, qui tiennent seuls s'ils sont cités hors de l'article (« Au 18 nov. 2026, X coûte Y selon [source] »).
- **Un fait = une phrase autonome** : sujet, chiffre, unité, année, source nommée dans la même phrase. Pas de « comme vu plus haut », pas de pronoms flous. Une IA qui extrait une phrase doit pouvoir la citer sans le reste.
- **Définitions et comparaisons visibles** : une définition claire du terme principal dès qu'il apparaît ; un tableau HTML pour toute comparaison de 3 options ou plus (colonnes : critère, valeur, source).
- **Titres H2/H3 sous forme de vraies questions ou d'énoncés précis** (« Combien coûte un appel manqué à un plombier ? »), pas de titres métaphoriques.
- **FAQ de 4 Q/R** reprenant des questions que les gens tapent réellement (formulation naturelle, réponse de 2 à 3 phrases avec un chiffre). Le balisage FAQPage existant est conservé.
- **Dates et fraîcheur** : toujours la date de vérification des chiffres sur source officielle, et `dateModified` mis à jour si l'article est corrigé.
- **Sources citables** : nom de l'organisme, titre du document, année, lien. Un lien primaire vaut mieux que dix liens secondaires.
- **Honnêteté sur les limites** : indiquer l'échantillon, le biais ou l'incertitude d'une étude. Les IA et les lecteurs font davantage confiance aux sources qui nuancent.
- **Pas de bourrage** : ni mots-clés répétés, ni paragraphes de remplissage, ni phrases génériques interchangeables. Un article plus court et plus dense vaut mieux qu'un article long et creux.

Le site publie déjà un `llms.txt` (régénéré à chaque build) et autorise les robots des assistants IA dans `robots.txt` : ne pas les modifier.

## 10. Une plume vivante, pas un texte générique

Un article doit se lire comme écrit par quelqu'un qui connaît le terrain et prend position. C'est une exigence de qualité : les lecteurs, Google et les assistants IA récompensent le contenu précis, singulier et utile, et ignorent les textes interchangeables. Règles :

- **Du concret avant tout** : noms réels, chiffres réels, lieux, montants, dates, citations courtes et attribuées tirées des sources. Une scène ou un exemple précis (sourcé) vaut mieux que trois généralités.
- **Une prise de position claire** : l'article tranche (« à ce prix, ne le prenez pas ») et dit dans quel cas il se trompe. Les nuances viennent des données, pas de formules de politesse.
- **Rythme varié** : mélanger phrases courtes et phrases plus longues, une idée par paragraphe, parfois une phrase d'une ligne. Pas de structure identique d'un article à l'autre.
- **Voix directe** : « vous », verbes concrets, vocabulaire du métier du lecteur. Pas de ton de communiqué ni de manuel.
- **Interdits** : les tournures passe-partout (« dans un monde où », « il est important de noter », « en conclusion », « plongeons dans », « un véritable game changer », « à l'ère du numérique »), les listes de trois adjectifs, les ouvertures et conclusions motivationnelles, les répétitions de la question, les « Voici X conseils » sans contenu.
- **Aucune fausse expérience** : jamais de « j'ai testé », « dans mon agence », « un client m'a dit » inventés, et aucun faux auteur ni faux témoignage. Le texte est signé du média ; les témoignages cités viennent de sources publiques avec lien. Ne pas chercher à imiter un humain précis, chercher à être utile et précis.
- **Relecture finale** : relire à voix haute mentalement ; si une phrase pourrait figurer dans n'importe quel article du même sujet, la remplacer par un fait précis ou la supprimer.

## 11. Date visible sur chaque article (consigne permanente du propriétaire)

Chaque article affiche sa date de publication : `new-article.js` l'écrit dans l'en-tête (`article-date`), dans le JSON-LD (`datePublished`, `dateModified`), dans « Citer cet article » et sur les cartes du site. Toujours renseigner `date` (jour d'exécution) ; ne jamais la laisser vide ni la modifier à la main. En cas de réécriture, renseigner `modified`. Le fonctionnement est 100 % autonome : aucune validation humaine, publication, commit et push chaque jour sans demander d'accord.

## 11. Page « Comment nous travaillons » : promesses publiques à tenir

La page `/fr/methode-editoriale` (`/en/editorial-method`) promet publiquement : trois sources dont une primaire, un calcul refaisable, une date de vérification visible, les limites annoncées, aucun fait inventé, et « publier moins plutôt que remplir ». Chaque article doit tenir ces promesses ; sinon ne pas le publier. Les articles en retard sur ce niveau sont listés dans `NOINDEX` (scripts/site-config.js) : ils restent visibles mais hors index Google, hors sitemap et hors llms.txt, jusqu'à réécriture ; une fois réécrits, les retirer de la liste.
