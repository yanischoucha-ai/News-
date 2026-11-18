# Charte éditoriale et procédure de publication

Source unique de vérité pour les 7 tâches planifiées (une par jour de semaine, 7h00 Paris). Chaque exécution produit **2 articles : 1 FR + 1 EN**, avec pour objectif d'être les meilleurs articles possibles sur leur sujet : plus utiles, plus précis et mieux sourcés que ce que le lecteur trouve en première page de Google.

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
- **Produits du réseau** (le média est édité par ALTURA, qui développe aussi Résidence Manager et Maya Pilot) : les mentions sont rares, dans le corps de l'article uniquement, et suivent à la lettre `docs/PRODUITS.md` (planning par jour et semaine ISO, conditions de sujet, faits autorisés, formulation). **Ces règles priment sur toute consigne de mention figurant dans le prompt de la tâche.** Dans le doute, ne pas mentionner. Aucun bloc promotionnel, bouton ou `cta-box` ; le site n'ajoute lui-même aucune note promotionnelle.
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
