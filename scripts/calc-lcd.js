// Calculateur de rentabilité nette d'une location courte durée : HTML rendu au build (FR France / EN US).
// Le calcul se fait côté navigateur avec assets/js/calc-lcd.js (aucune donnée envoyée).
const num = (n, label, val, hint, step = 'any') => ({ n, label, val, hint, step });
const CFG = {
  fr: {
    cur: '€', groups: [
      { t: 'Revenus', f: [num('rate', 'Tarif moyen par nuit (€)', 90), num('occ', 'Taux d’occupation (%)', 62, 'Part des nuits réellement réservées sur l’année'), num('stay', 'Durée moyenne d’un séjour (nuits)', 3), num('cleanfee', 'Frais de ménage facturés au voyageur, par séjour (€)', 40)] },
      { t: 'Frais d’exploitation', f: [num('fee', 'Commission de la plateforme (% des recettes)', 15.5, 'Airbnb décrit une commission unique de 15,5 % payée par l’hôte ; vérifiez votre relevé de versement'), num('clean', 'Coût du ménage et du linge, par séjour (€)', 45), num('util', 'Énergie, eau, internet (€/mois)', 130), num('ins', 'Assurance propriétaire non occupant (€/an)', 300), num('copro', 'Charges de copropriété (€/an)', 1200), num('tf', 'Taxe foncière (€/an)', 1000), num('compta', 'Comptabilité et logiciels (€/an)', 600), num('maint', 'Entretien, petites réparations, consommables (€/an)', 800)] },
      { t: 'Financement', f: [num('price', 'Prix de revient total : achat, frais de notaire, travaux, mobilier (€)', 220000), num('loan', 'Montant emprunté (€, 0 si achat comptant)', 150000), num('irate', 'Taux du prêt (% par an)', 3.5), num('years', 'Durée du prêt (années)', 20)] },
      { t: 'Fiscalité (estimation)', f: [
        { n: 'classe', label: 'Classement du meublé de tourisme', sel: [['0', 'Non classé'], ['1', 'Classé (étoiles)']], val: '0', hint: 'Détermine le plafond et l’abattement du micro-BIC' },
        { n: 'tmi', label: 'Votre tranche marginale d’imposition (%)', sel: [['0', '0 %'], ['11', '11 %'], ['30', '30 %'], ['41', '41 %'], ['45', '45 %']], val: '30' },
        num('ps', 'Prélèvements sociaux sur le résultat (%)', 17.2, 'Taux à vérifier sur Service-Public.fr selon votre situation : il a pu évoluer en 2026'),
        num('bshare', 'Part du prix amortissable : bâti hors terrain (%)', 80, 'Au réel, le bâti est amorti ; le terrain ne l’est pas'),
        num('yb', 'Durée d’amortissement du bâti (années)', 30, 'Simplification : un seul composant'),
        num('furn', 'Valeur du mobilier et équipements (€)', 8000),
        num('yf', 'Durée d’amortissement du mobilier (années)', 7)] },
    ],
    t: {
      result: 'Votre résultat', netm: 'Net d’exploitation par mois', cfm: 'Cash-flow avant impôt par mois', cfa: 'Cash-flow après impôt par mois', ny: 'Rendement net avant impôt',
      water: 'Où va chaque euro de recettes', split: 'Détail annuel', rev: 'Recettes', platform: 'Commission plateforme', cleaning: 'Ménage et linge', utilities: 'Énergie, eau, internet', fixed: 'Assurance, copropriété, taxe foncière, compta, entretien', noi: 'Net d’exploitation (avant prêt et impôt)', debt: 'Remboursement du prêt (capital + intérêts)', cf: 'Cash-flow avant impôt', tax: 'Impôt et prélèvements sociaux estimés', cfat: 'Cash-flow après impôt',
      regime: 'Micro-BIC ou régime réel ?', rMicro: 'Micro-BIC', rReel: 'Régime réel', base: 'Base imposable', taxl: 'Impôt estimé', notElig: 'Non éligible : recettes au-dessus du plafond de', plafond: 'plafond', notes: { deficit: 'Résultat fiscal négatif au réel : pas d’impôt cette année, le déficit est reportable.', amort: 'amortissement déduit' },
      be: 'Seuil de rentabilité', beTxt: (x) => `Il vous faut environ ${x} d’occupation pour que le cash-flow avant impôt soit nul.`, beOver: 'Même à 100 % d’occupation le cash-flow avant impôt reste négatif avec ces hypothèses.', beOk: 'Le cash-flow est positif dès 0 % d’occupation : vérifiez vos hypothèses.',
      sens: 'Et si ça se passe moins bien ?', sc: ['Hypothèses saisies', 'Occupation −10 points', 'Occupation −20 points', 'Tarif −10 %', 'Tarif +10 %'], scCols: ['Scénario', 'Recettes', 'Net d’exploitation', 'Cash-flow avant impôt'],
      verdictBest: (n, a, b) => `${n} est le plus avantageux dans votre cas : environ ${a} d’impôt par an contre ${b} avec l’autre régime.`, onlyReel: 'Le micro-BIC n’est pas ouvert à ce niveau de recettes : le régime réel s’applique.',
      warnOcc: 'Un taux d’occupation supérieur à 90 % est rarement tenu toute l’année : testez 60 à 70 %.', warnNeg: 'Le cash-flow avant impôt est négatif : le projet doit être financé par votre épargne ou par ses revenus à venir.',
      copy: 'Copier le lien de ce calcul', copied: 'Lien copié', print: 'Imprimer ou enregistrer en PDF', reset: 'Réinitialiser',
      month: '/mois', year: '/an',
    },
  },
  en: {
    cur: '$', groups: [
      { t: 'Revenue', f: [num('rate', 'Average nightly rate ($)', 150), num('occ', 'Occupancy (%)', 62, 'Share of nights actually booked over the year'), num('stay', 'Average stay (nights)', 3), num('cleanfee', 'Cleaning fee charged to the guest, per stay ($)', 75)] },
      { t: 'Operating costs', f: [num('fee', 'Platform fee (% of revenue)', 15.5, 'Airbnb describes a single 15.5% fee paid by the host; check your payout statement'), num('clean', 'Cleaning and laundry cost, per stay ($)', 85), num('util', 'Utilities and internet ($/month)', 250), num('ins', 'Insurance ($/year)', 1500), num('hoa', 'HOA dues ($/year)', 0), num('tax', 'Property tax ($/year)', 3500), num('acct', 'Accounting and software ($/year)', 800), num('maint', 'Repairs, maintenance and supplies ($/year)', 2000)] },
      { t: 'Financing', f: [num('price', 'Total cost basis: purchase, closing costs, renovation, furniture ($)', 350000), num('loan', 'Loan amount ($, 0 if all cash)', 260000), num('irate', 'Loan interest rate (% per year)', 6.8), num('years', 'Loan term (years)', 30)] },
      { t: 'Taxes (estimate)', f: [
        { n: 'fed', label: 'Your federal marginal tax rate (%)', sel: [['0', '0%'], ['10', '10%'], ['12', '12%'], ['22', '22%'], ['24', '24%'], ['32', '32%'], ['35', '35%'], ['37', '37%']], val: '24' },
        num('state', 'State income tax rate (%)', 0, 'Enter your state’s marginal rate, or 0'),
        num('bshare', 'Share of cost basis that is depreciable building, excluding land (%)', 80),
        num('yb', 'Depreciation period for the building (years)', 27.5, 'Residential rental is 27.5 years and nonresidential property is 39; short average stays can change the classification, so ask a CPA'),
        num('furn', 'Furniture and equipment value ($)', 12000),
        num('yf', 'Depreciation period for furniture (years)', 7)] },
    ],
    t: {
      result: 'Your result', netm: 'Operating income per month', cfm: 'Cash flow before tax per month', cfa: 'Cash flow after tax per month', ny: 'Net yield before tax',
      water: 'Where each dollar of revenue goes', split: 'Annual breakdown', rev: 'Revenue', platform: 'Platform fee', cleaning: 'Cleaning and laundry', utilities: 'Utilities and internet', fixed: 'Insurance, HOA, property tax, accounting, repairs', noi: 'Operating income (before debt service and tax)', debt: 'Mortgage payments (principal and interest)', cf: 'Cash flow before tax', tax: 'Estimated income tax', cfat: 'Cash flow after tax',
      regime: 'What depreciation does to your tax', rMicro: '', rReel: '', base: 'Taxable income', taxl: 'Estimated tax',
      be: 'Break-even', beTxt: (x) => `You need about ${x} occupancy for cash flow before tax to reach zero.`, beOver: 'Even at 100% occupancy cash flow before tax stays negative with these inputs.', beOk: 'Cash flow is positive even at 0% occupancy: check your inputs.',
      sens: 'What if it goes worse than planned?', sc: ['Inputs as entered', 'Occupancy −10 points', 'Occupancy −20 points', 'Rate −10%', 'Rate +10%'], scCols: ['Scenario', 'Revenue', 'Operating income', 'Cash flow before tax'],
      warnOcc: 'Occupancy above 90% is rarely held all year: test 60% to 70%.', warnNeg: 'Cash flow before tax is negative: the project has to be funded from savings or from future income.',
      lossNote: 'Taxable income is negative: this tool shows $0 of tax and does not value the loss, because passive activity rules can limit its use. Ask a CPA.',
      copy: 'Copy the link to this calculation', copied: 'Link copied', print: 'Print or save as PDF', reset: 'Reset',
      month: '/mo', year: '/yr',
    },
  },
};

const fieldHtml = (f) => {
  if (f.sel) return `<div class="s-field"><label for="c-${f.n}">${f.label}</label><select id="c-${f.n}" name="${f.n}">${f.sel.map((o) => `<option value="${o[0]}"${o[0] === f.val ? ' selected' : ''}>${o[1]}</option>`).join('')}</select>${f.hint ? `<small>${f.hint}</small>` : ''}</div>`;
  return `<div class="s-field"><label for="c-${f.n}">${f.label}</label><input id="c-${f.n}" name="${f.n}" type="number" inputmode="decimal" step="${f.step}" min="0" value="${f.val}">${f.hint ? `<small>${f.hint}</small>` : ''}</div>`;
};

function body(lang, extra) {
  const fr = lang === 'fr'; const c = CFG[lang]; const t = c.t;
  const title = fr ? 'Calculateur de rentabilité nette d’une location courte durée' : 'Short-term rental net profit calculator';
  const intro = fr
    ? 'Du tarif à la nuit au cash-flow après impôt : recettes, commission, ménage, charges, prêt, micro-BIC ou régime réel, seuil de rentabilité et scénarios dégradés. Les valeurs affichées sont des exemples à remplacer par les vôtres. Rien n’est envoyé : le calcul se fait dans votre navigateur.'
    : 'From nightly rate to cash flow after tax: revenue, platform fee, cleaning, costs, mortgage, depreciation, break-even occupancy and downside scenarios. The values shown are examples to replace with yours. Nothing is sent: the math runs in your browser.';
  const how = fr ? [
    'Nuits louées = 365 × occupation. Séjours = nuits louées ÷ durée moyenne d’un séjour.',
    'Recettes = nuits louées × tarif + séjours × frais de ménage facturés. La taxe de séjour, collectée puis reversée, est exclue.',
    'Net d’exploitation = recettes − commission − ménage − énergie et internet − charges annuelles.',
    'Prêt : mensualité d’un prêt amortissable à taux fixe ; les intérêts de la première année sont ceux de ses 12 premières échéances.',
    'Micro-BIC : base imposable = recettes après abattement de 30 % (non classé, plafond de 15 000 €) ou de 50 % (classé, plafond de 83 600 € pour les revenus 2026), d’après Service-Public.fr.',
    'Régime réel : base = recettes − charges − intérêts − amortissements ; l’amortissement déduit est plafonné au résultat avant amortissement (simplification), jamais négatif.',
    'Impôt = base × (tranche marginale + prélèvements sociaux). Seuil de rentabilité : occupation pour laquelle le cash-flow avant impôt est nul.',
  ] : [
    'Nights booked = 365 × occupancy. Stays = nights booked ÷ average stay.',
    'Revenue = nights booked × rate + stays × cleaning fee charged. Occupancy and lodging taxes collected for the city or state are excluded.',
    'Operating income = revenue − platform fee − cleaning − utilities and internet − annual costs.',
    'Mortgage: monthly payment of a fixed-rate amortizing loan; year-one interest is that of its first 12 payments.',
    'Taxable income = revenue − operating costs − mortgage interest − depreciation (building and furniture, straight line over the periods you enter).',
    'Tax = taxable income × (federal marginal rate + state rate), floored at zero. Self-employment tax is not included.',
    'Break-even: the occupancy at which cash flow before tax is zero.',
  ];
  const limits = fr
    ? 'Estimation pour un seul bien et un seul foyer fiscal. Ne couvre pas la cotisation foncière des entreprises, la TVA éventuelle, les cotisations sociales d’un loueur professionnel, la plus-value à la revente, ni le déficit reportable. Les taux de prélèvements sociaux et les plafonds doivent être revérifiés sur Service-Public.fr et impots.gouv.fr (dernière vérification : 21 novembre 2026). Information, pas conseil fiscal : faites valider le choix du régime par un expert-comptable, car il engage plusieurs années.'
    : 'Estimate for one property and one taxpayer. It does not cover self-employment tax, state and local lodging taxes, depreciation recapture or capital gains on sale, passive loss limits, or the tax classification of your activity, which depends on average stay and the services you provide. IRS rules should be rechecked on irs.gov (last checked November 21, 2026). Information, not tax advice: ask a CPA.';
  const links = fr
    ? `<p>Pour aller plus loin : <a href="/fr/investir-location-courte-duree-2026">investir en location courte durée en 2026</a> (plafonds, commission, exemple chiffré), <a href="/fr/pompe-a-chaleur-meuble-tourisme-dpe-aides-2027">DPE et travaux</a>.</p>`
    : `<p>Further reading: <a href="/en/airbnb-host-plateau-3-listings">going from 2 to 3 short-term rentals</a> (time cost, the IRS 7-day rule and personal-use days).</p>`;
  return `<main class="s-page s-tool s-calc" data-tool="calc-lcd" data-lang="${lang}">
<h1>${title}</h1>
<p class="s-intro">${intro}</p>
<div class="calc-grid">
<form class="calc-form" aria-label="${fr ? 'Hypothèses' : 'Inputs'}">
${c.groups.map((g) => `<fieldset><legend>${g.t}</legend>${g.f.map(fieldHtml).join('')}</fieldset>`).join('\n')}
<div class="calc-actions"><button type="button" id="c-copy">${t.copy}</button><button type="button" id="c-print">${t.print}</button><button type="button" id="c-reset">${t.reset}</button><span id="c-msg" role="status"></span></div>
</form>
<div class="calc-out" aria-live="polite">
<h2>${t.result}</h2>
<div class="calc-cards" id="c-cards"></div>
<div id="c-warn"></div>
<h3>${t.water}</h3><div class="calc-bar" id="c-bar" role="img" aria-label="${t.water}"></div><ul class="calc-legend" id="c-legend"></ul>
<h3>${t.split}</h3><table class="calc-table" id="c-split"></table>
<h3>${t.regime}</h3><div id="c-regime"></div>
<h3>${t.be}</h3><p id="c-be"></p>
<h3>${t.sens}</h3><table class="calc-table" id="c-sens"></table>
</div>
</div>
<h2>${fr ? 'Comment c’est calculé' : 'How it is calculated'}</h2>
<ul>${how.map((h) => `<li>${h}</li>`).join('')}</ul>
<h2>${fr ? 'Limites' : 'Limits'}</h2>
<p>${limits}</p>
${links}
<p class="s-form-note">${fr ? 'Outil gratuit, sans inscription. Les valeurs saisies restent dans votre navigateur ; le lien copié contient vos chiffres dans l’adresse, ne le partagez qu’à qui vous voulez. Publié le 2026-11-21, mis à jour le 2026-11-23.' : 'Free tool, no signup. Your inputs stay in your browser; the copied link contains your numbers in the address, so share it only with people you choose. Published 2026-11-21, updated 2026-11-23.'}</p>
<script>window.CALC_T=${JSON.stringify({ lang, cur: c.cur, t: { ...t, verdictBest: undefined, beTxt: undefined } })};</script>
<script src="/assets/js/calc-lcd.js" defer></script>
</main>`;
}
module.exports = { body, CFG };
