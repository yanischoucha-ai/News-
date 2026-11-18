# Produits du réseau : faits autorisés et planning de mentions

Source : pages officielles des produits (relevées le 18 nov. 2026). Le média est édité par ALTURA, qui développe aussi Résidence Manager et Maya Pilot. **On n'écrit sur un produit que ce qui figure dans la section « Faits autorisés » ci-dessous.** Tout le reste est interdit, même si c'est plausible.

## Planning : quand mentionner (règle dure)

Soit W le numéro de semaine ISO de la date de publication (`date +%V`, sans zéro initial). Une mention n'est autorisée que si **toutes** les conditions de sa ligne sont vraies. Sinon : aucune mention, l'article est écrit comme si ces produits n'existaient pas.

| Jour | Produit | Condition |
|---|---|---|
| Lundi | Résidence Manager | W pair, article **FR** uniquement |
| Mercredi | Résidence Manager | W = 1 modulo 4 (W = 1, 5, 9, 13…), article **FR** uniquement, et seulement si le sujet est la location courte durée ou la gestion locative |
| Jeudi | ALTURA | W impair, article **FR** uniquement, et seulement si le sujet touche à la visibilité en ligne, au site web, à la vidéo ou aux réseaux d'une petite entreprise |
| Dimanche | Maya Pilot | W impair, article **FR** uniquement, et seulement si le sujet concerne le marketing ou les réseaux sociaux d'un éditeur de logiciel / SaaS |
| Mardi, vendredi, samedi | aucun | jamais |

Les articles EN ne contiennent jamais de mention produit (en revanche ils portent le backlink de la section suivante). Résultat attendu : environ 1 à 2 mentions par semaine sur 14 articles. Si la condition de sujet n'est pas remplie, ne pas forcer : pas de mention.

## Backlinks : un lien contextuel dans environ 2 articles sur 3

Objectif : la majorité des articles envoient un lien normal vers un site du réseau, sans régularité visible. Distinguer deux choses : le **backlink** (un simple lien de référence, fréquent) et la **mention produit** (1-2 phrases qui présentent l'outil, rare, voir planning ci-dessus).

- **Règle de fréquence (prime sur le prompt de la tâche)** : environ **2 articles sur 3** portent un lien réseau, pas tous. Calcul : u = jour ISO (`date +%u`, lundi = 1 … dimanche = 7), W = semaine ISO (`date +%V`). L'article **FR** porte un lien si (W + u) n'est pas multiple de 3 ; l'article **EN** porte un lien si (W + u + 1) n'est pas multiple de 3. Sinon : aucun lien réseau dans cet article. Jamais plus de 1 lien réseau par article. Si l'article est autorisé mais qu'aucun endroit n'est vraiment naturel, ne pas forcer.
- **Variation obligatoire** : avant d'écrire, regarder les liens réseau des 5 derniers articles publiés (`grep -o 'href="https://[^"]*\(residencemanager\|mayapilot\|alturacom\)[^"]*"' fr/*.html en/*.html` avec leur ancre) puis varier : ne pas reprendre la même ancre, ne pas placer le lien dans le même type d'endroit (alterner : exemple dans le corps, outil cité dans une liste, renvoi dans un encadré de méthode, réponse de FAQ), ne pas viser deux fois de suite le même site si le sujet permet de choisir.
- **Se fondre dans les sources** : quand l'article cite des outils ou des ressources, le lien réseau figure dans une liste de 2 à 4 références **externes réelles** (concurrents, administration, étude), traitées avec la même loyauté et la même longueur. Jamais un lien isolé dans un paragraphe qui parle d'autre chose que de lui-même.
- **Ton** : aucun vocabulaire commercial (« solution », « découvrez », « essayez », « gagnez du temps »), aucune promesse, aucun appel à l'action. Le lien est un renvoi parmi d'autres, au même registre que les liens vers les sources.
- **Quel site** selon le sujet : Airbnb, location courte durée, gestion locative, conciergerie, immobilier locatif → https://www.residencemanager.online ; réseaux sociaux, marketing de contenu, SaaS, personal branding → https://mayapilot.com ; artisans, PME, site web, visibilité en ligne, vidéo, IA et automatisation en entreprise, business → https://alturacom-production.odoo.com. Si la mention produit du jour est autorisée et faite, elle tient lieu de lien : n'en ajouter aucun autre.
- **Forme** : lien HTML normal dans une phrase utile (exemple, ressource, outil à tester), sans `rel="nofollow"` ni `rel="sponsored"`, ouvert dans le même onglet. Texte d'ancre descriptif et **varié** d'un article à l'autre (« gestion des départs et du ménage », « un portail voyageur par QR code », « agence de communication digitale »…), jamais « cliquez ici », jamais deux fois la même ancre de suite.
- **Placement** : dans le corps, à l'endroit où le lecteur en a besoin, pas dans la conclusion ni dans un bloc à part, pas de bouton. Le lien reste un renvoi, pas un argumentaire : pas de superlatif ni de promesse. Les faits sur le produit restent limités à « Faits autorisés ». Un simple lien de référence n'exige pas de mention de l'éditeur dans la phrase (le pied de page indique « Marge est édité par ALTURA ») ; une phrase qui présente l'outil, elle, garde la transparence naturelle.
- **Compte rendu** : « backlink : oui/non, URL, ancre ».

## Comment mentionner

- Dans le corps de l'article, dans la section où le besoin apparaît, **1 à 2 phrases maximum**, avec **un seul lien** (inline, pas de bouton, pas de `cta-box`, pas de bloc séparé, pas de conclusion promotionnelle).
- La mention répond à un problème précis que l'article vient de décrire. Elle vient après le conseil, jamais à la place.
- Transparence naturelle, dans la même phrase : « un outil que nous éditons », « édité par la même société que ce média », « (nous éditons cet outil) ». Jamais présenté comme un avis indépendant, jamais de comparatif truqué : si l'article compare des outils, les concurrents sont décrits aussi loyalement que le nôtre.
- Aucun superlatif (« le meilleur », « imbattable »), aucune promesse de résultat, aucun chiffre de revenu ou de gain.
- Le reste de l'article doit rester utile **sans** la mention : si on la supprime, rien ne manque.
- Dans le compte rendu final : indiquer « mention produit : oui/non », le produit, et la règle du tableau qui l'autorisait.

## Faits autorisés

### Résidence Manager : https://www.residencemanager.online
- Plateforme pour hôtes et conciergeries : réunit Airbnb, Booking et le ménage au même endroit.
- Portail voyageur par QR code posé dans le logement : code d'accès, WiFi, guide du logement, météo, en 5 langues, sans application à télécharger.
- Ménage : chaque départ génère une tâche, la personne de ménage reçoit une checklist sur son téléphone, l'hôte voit en temps réel si c'est terminé.
- Services à la demande : le voyageur commande depuis son portail (ex. transfert, vélo, chef), l'hôte confirme.
- Formule Solo gratuite pour 1 logement, sans carte bancaire ; formules payantes avec 30 jours d'essai.
- Mise en place annoncée en environ 15 minutes (à présenter comme « annoncée par l'éditeur »).
- Interdit : « déjà adopté par 10 hôtes », « +380 € par logement et par mois », tout chiffre de revenu, toute promesse de « zéro appel / zéro SMS ».

### Maya Pilot : https://mayapilot.com
- « Community manager IA » **pour les SaaS** (pas pour tous les métiers) : lit le site du SaaS, comprend la cible, propose une stratégie de contenu en 3 étages (attirer / rapprocher / convertir, environ 70 / 20 / 10 %) et rédige posts, carrousels et stories.
- Rien n'est publié sans l'accord de l'utilisateur.
- Analyse de stratégie gratuite, sans carte ni compte, en environ 2 minutes.
- Tarifs affichés : à partir de 29 € par mois sans engagement (offre Démarrage), tout compris.
- Statut honnête à respecter : la publication sur Instagram est **en construction**, Facebook arrive ensuite, le paiement en ligne n'est pas encore ouvert. Ne jamais affirmer que l'outil publie déjà automatiquement.
- Interdit : les chiffres des exemples du site (visiteurs, abonnés, MRR : ils sont fictifs), « Kinélys / Devisimo / Coachéo » comme cas réels, toute promesse de clients gagnés.

### ALTURA (AlturaCom) : https://alturacom-production.odoo.com
- Agence de communication digitale : sites web et e-commerce, contenu et réseaux sociaux de marque, production vidéo, acquisition et SEO. Devis gratuit.
- Contact : formulaire sur https://alturacom-production.odoo.com/contactus
- Interdit : « tarifs imbattables », témoignage client cité, promesse de résultats chiffrés, numéro de téléphone ou adresse personnelle.
