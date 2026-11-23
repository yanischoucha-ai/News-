/* Calculateur de rentabilité d'une location courte durée : tout se calcule dans le navigateur. */
(function () {
  var root = document.querySelector('[data-tool="calc-lcd"]'); if (!root || !window.CALC_T) return;
  var C = window.CALC_T, T = C.t, fr = C.lang === 'fr';
  var form = root.querySelector('.calc-form');
  var loc = fr ? 'fr-FR' : 'en-US';
  var cur = new Intl.NumberFormat(loc, { style: 'currency', currency: fr ? 'EUR' : 'USD', maximumFractionDigits: 0 });
  var nf = new Intl.NumberFormat(loc, { maximumFractionDigits: 1 });
  var $ = function (id) { return root.querySelector('#' + id); };
  var defaults = {};
  Array.prototype.forEach.call(form.elements, function (e) { if (e.name) defaults[e.name] = e.value; });

  function read() {
    var p = {};
    Array.prototype.forEach.call(form.elements, function (e) { if (e.name) { var x = parseFloat(e.value); p[e.name] = isFinite(x) && x >= 0 ? x : 0; } });
    return p;
  }

  function loanCalc(p) {
    var n = Math.round(p.years * 12), r = p.irate / 100 / 12, P = p.loan;
    if (P <= 0 || n <= 0) return { pay: 0, interest: 0 };
    var pay = r > 0 ? P * r / (1 - Math.pow(1 + r, -n)) : P / n;
    var bal = P, interest = 0, k = Math.min(12, n);
    for (var i = 0; i < k; i++) { var it = bal * r; interest += it; bal -= pay - it; }
    return { pay: pay, interest: interest };
  }

  function compute(p) {
    var nights = 365 * Math.min(p.occ, 100) / 100, stays = p.stay > 0 ? nights / p.stay : 0;
    var rev = nights * p.rate + stays * p.cleanfee;
    var platform = rev * p.fee / 100, cleaning = stays * p.clean, util = 12 * p.util;
    var fixed = fr ? p.ins + p.copro + p.tf + p.compta + p.maint : p.ins + p.hoa + p.tax + p.acct + p.maint;
    var noi = rev - platform - cleaning - util - fixed;
    var L = loanCalc(p), debt = 12 * L.pay, cf = noi - debt;
    var r0 = rev - platform - cleaning - util - fixed - L.interest;
    var amortMax = p.price * p.bshare / 100 / (p.yb || 1) + p.furn / (p.yf || 1);
    var o = { nights: nights, stays: stays, rev: rev, platform: platform, cleaning: cleaning, util: util, fixed: fixed, noi: noi, debt: debt, interest: L.interest, cf: cf, r0: r0, amort: amortMax };
    var rate = fr ? (p.tmi + p.ps) / 100 : (p.fed + p.state) / 100;
    if (fr) {
      var amort = Math.min(Math.max(r0, 0), amortMax);
      o.reel = { base: Math.max(r0 - amort, 0), amort: amort, deficit: r0 < 0 }; o.reel.tax = o.reel.base * rate;
      var cl = p.classe === 1, cap = cl ? 83600 : 15000, ab = cl ? 0.5 : 0.3;
      o.micro = { base: rev * (1 - ab), cap: cap, ok: rev <= cap, ab: ab }; o.micro.tax = o.micro.base * rate;
      var best = o.micro.ok && o.micro.tax < o.reel.tax ? 'micro' : 'reel';
      o.best = best; o.tax = o[best].tax;
    } else {
      var taxable = r0 - amortMax; o.taxable = taxable; o.loss = taxable < 0;
      o.tax = Math.max(taxable, 0) * rate; o.taxNoDep = Math.max(r0, 0) * rate;
    }
    o.cfat = cf - o.tax;
    return o;
  }

  function breakEven(p) {
    var a = JSON.parse(JSON.stringify(p)); a.occ = 0; var z = compute(a);
    a.occ = 100; var h = compute(a);
    var slope = (h.noi - z.noi) / 100; if (slope <= 0) return null;
    return (z.debt - z.noi) / slope;
  }

  function row(label, val, cls) { return '<tr' + (cls ? ' class="' + cls + '"' : '') + '><th scope="row">' + label + '</th><td>' + val + '</td></tr>'; }
  function neg(x) { return x < 0 ? ' calc-neg' : ''; }

  function render() {
    var p = read(), o = compute(p);
    var yieldNet = p.price > 0 ? nf.format(o.noi / p.price * 100) + ' %' : '–';
    var cards = [[T.netm, o.noi / 12], [T.cfm, o.cf / 12], [T.cfa, o.cfat / 12]];
    var html = cards.map(function (c) { return '<div class="calc-card' + neg(c[1]) + '"><span>' + c[0] + '</span><strong>' + cur.format(c[1]) + '</strong></div>'; }).join('');
    html += '<div class="calc-card"><span>' + T.ny + '</span><strong>' + yieldNet + '</strong></div>';
    $('c-cards').innerHTML = html;

    var warn = [];
    if (p.occ > 90) warn.push(T.warnOcc);
    if (o.cf < 0) warn.push(T.warnNeg);
    if (!fr && o.loss) warn.push(T.lossNote);
    $('c-warn').innerHTML = warn.map(function (w) { return '<p class="calc-warn">' + w + '</p>'; }).join('');

    var segs = [[T.platform, o.platform, '#c9a227'], [T.cleaning, o.cleaning, '#6b8fb5'], [T.utilities + ' + ' + (fr ? 'charges' : 'costs'), o.util + o.fixed, '#8a8f98'], [T.debt, o.debt, '#9b6bb5'], [T.tax, o.tax, '#b5594f'], [fr ? 'Reste' : 'Left', Math.max(o.cfat, 0), '#0a7a44']];
    var tot = segs.reduce(function (s, x) { return s + x[1]; }, 0) || 1;
    $('c-bar').innerHTML = segs.map(function (s) { return '<span style="width:' + (s[1] / tot * 100).toFixed(2) + '%;background:' + s[2] + '"></span>'; }).join('');
    $('c-legend').innerHTML = segs.map(function (s) { return '<li><i style="background:' + s[2] + '"></i>' + s[0] + ' · ' + cur.format(s[1]) + ' (' + nf.format(s[1] / tot * 100) + ' %)</li>'; }).join('');

    $('c-split').innerHTML = row(T.rev, cur.format(o.rev)) + row('− ' + T.platform, cur.format(o.platform)) + row('− ' + T.cleaning, cur.format(o.cleaning)) + row('− ' + T.utilities, cur.format(o.util)) + row('− ' + T.fixed, cur.format(o.fixed)) + row(T.noi, cur.format(o.noi), 'calc-sum') + row('− ' + T.debt, cur.format(o.debt)) + row(T.cf, cur.format(o.cf), 'calc-sum' + neg(o.cf)) + row('− ' + T.tax, cur.format(o.tax)) + row(T.cfat, cur.format(o.cfat), 'calc-sum' + neg(o.cfat));

    var reg = '';
    if (fr) {
      var m = o.micro, r = o.reel;
      reg = '<table class="calc-table"><thead><tr><th></th><th>' + T.rMicro + '</th><th>' + T.rReel + '</th></tr></thead><tbody>' +
        '<tr><th scope="row">' + T.base + '</th><td>' + (m.ok ? cur.format(m.base) : '–') + '</td><td>' + cur.format(r.base) + '</td></tr>' +
        '<tr><th scope="row">' + T.taxl + '</th><td>' + (m.ok ? cur.format(m.tax) : '–') + '</td><td>' + cur.format(r.tax) + '</td></tr></tbody></table>';
      if (!m.ok) reg += '<p>' + T.notElig + ' ' + cur.format(m.cap) + ' (' + (p.classe === 1 ? 'classé' : 'non classé') + '). ' + T.onlyReel + '</p>';
      else {
        var bn = o.best === 'micro' ? T.rMicro : T.rReel, other = o.best === 'micro' ? r.tax : m.tax;
        reg += '<p><strong>' + bn + '</strong> : ' + T.verdictBest(cur.format(o.tax), cur.format(other)) + '</p>';
      }
      if (r.deficit) reg += '<p>' + T.notes.deficit + '</p>';
      else reg += '<p class="calc-small">' + T.notes.amort + ' : ' + cur.format(r.amort) + '</p>';
    } else {
      reg = '<table class="calc-table"><tbody>' + row(T.base + ' (' + (fr ? '' : 'after depreciation') + ')', cur.format(o.taxable)) + row(fr ? '' : 'Estimated tax with depreciation', cur.format(o.tax)) + row(fr ? '' : 'Estimated tax without depreciation', cur.format(o.taxNoDep)) + '</tbody></table><p>' +
        (o.taxNoDep - o.tax > 0 ? 'Depreciation lowers your estimated tax by ' + cur.format(o.taxNoDep - o.tax) + ' a year in this scenario. It is a deduction that may be partly recaptured when you sell: ask a CPA.' : 'With these inputs you owe no estimated tax even before depreciation, so depreciation changes nothing this year. Unused deductions may still matter later: ask a CPA.') + '</p>';
    }
    $('c-regime').innerHTML = reg;

    var be = breakEven(p);
    $('c-be').textContent = be === null ? '–' : be <= 0 ? T.beOk : be > 100 ? T.beOver : T.beTxt(nf.format(be) + ' %');

    var scen = [{}, { occ: p.occ - 10 }, { occ: p.occ - 20 }, { rate: p.rate * 0.9 }, { rate: p.rate * 1.1 }];
    var rows = scen.map(function (s, i) {
      var q = JSON.parse(JSON.stringify(p)); for (var k in s) q[k] = Math.max(s[k], 0);
      var r = compute(q); return '<tr><th scope="row">' + T.sc[i] + '</th><td>' + cur.format(r.rev) + '</td><td>' + cur.format(r.noi) + '</td><td class="' + neg(r.cf).trim() + '">' + cur.format(r.cf) + '</td></tr>';
    }).join('');
    $('c-sens').innerHTML = '<thead><tr>' + T.scCols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' + rows + '</tbody>';

    save();
  }

  /* état dans l'adresse (#...) pour partager un calcul ; rien n'est envoyé au serveur */
  function save() {
    var h = [];
    Array.prototype.forEach.call(form.elements, function (e) { if (e.name && e.value !== defaults[e.name]) h.push(e.name + '=' + encodeURIComponent(e.value)); });
    try { history.replaceState(null, '', h.length ? '#' + h.join('&') : location.pathname + location.search); } catch (e) {}
  }
  function load() {
    var h = location.hash.replace(/^#/, ''); if (!h) return;
    h.split('&').forEach(function (kv) { var a = kv.split('='); var e = form.elements[a[0]]; if (e && a[1] !== undefined) e.value = decodeURIComponent(a[1]); });
  }
  function msg(s) { var m = $('c-msg'); m.textContent = s; setTimeout(function () { m.textContent = ''; }, 2500); }

  T.verdictBest = function (a, b) { return fr ? 'régime le plus avantageux dans votre cas : environ ' + a + ' d’impôt par an contre ' + b + ' avec l’autre régime.' : ''; };
  T.beTxt = function (x) { return fr ? 'Il vous faut environ ' + x + ' d’occupation pour que le cash-flow avant impôt soit nul.' : 'You need about ' + x + ' occupancy for cash flow before tax to reach zero.'; };
  T.onlyReel = fr ? 'Le régime réel s’applique.' : '';
  T.notElig = fr ? 'Micro-BIC non ouvert : recettes au-dessus du plafond de' : '';

  form.addEventListener('submit', function (e) { e.preventDefault(); });
  form.addEventListener('input', render); form.addEventListener('change', render);
  $('c-copy').addEventListener('click', function () { if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { msg(T.copied); }, function () { msg(location.href); }); else msg(location.href); });
  $('c-print').addEventListener('click', function () { window.print(); });
  $('c-reset').addEventListener('click', function () { Array.prototype.forEach.call(form.elements, function (e) { if (e.name) e.value = defaults[e.name]; }); render(); });
  load(); render();
})();
