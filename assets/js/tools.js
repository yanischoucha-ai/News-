/* Calculateurs gratuits : tout se calcule dans le navigateur. */
(function () {
  var root = document.querySelector('[data-tool]'); if (!root) return;
  var id = root.getAttribute('data-tool'), fr = root.getAttribute('data-lang') === 'fr';
  var nf = new Intl.NumberFormat(fr ? 'fr-FR' : 'en-US', { maximumFractionDigits: 1 });
  var cur = new Intl.NumberFormat(fr ? 'fr-FR' : 'en-US', { style: 'currency', currency: fr ? 'EUR' : 'USD', maximumFractionDigits: 0 });
  var pct = function (x) { return nf.format(x * 100) + ' %'; };
  function v(n) { var e = root.querySelector('[name=' + n + ']'); var x = parseFloat(e && e.value); return isFinite(x) ? x : 0; }
  function set(i, s) { root.querySelector('#o' + i).textContent = s; }
  var na = '–';
  function run() {
    if (id === 'hotes') {
      var nights = 365 * v('occ') / 100, stays = v('stay') > 0 ? nights / v('stay') : 0;
      var gross = nights * v('rate') + stays * v('cleanfee');
      var net = gross - gross * v('fee') / 100 - stays * v('clean') - 12 * v('fixed');
      set(0, cur.format(gross)); set(1, cur.format(net)); set(2, cur.format(net / 12));
      set(3, v('price') > 0 ? pct(net / v('price')) : na);
    } else if (id === 'artisans') {
      var lostCalls = v('calls') * v('miss') / 100 * v('lost') / 100, jobs = lostCalls * v('close') / 100;
      var rev = jobs * v('job') * 52;
      set(0, nf.format(jobs * 52 / 12)); set(1, cur.format(rev)); set(2, cur.format(rev * v('margin') / 100));
      set(3, cur.format(v('close') / 100 * v('job') * v('lost') / 100 * v('margin') / 100));
    } else if (id === 'saas') {
      var cac = v('new') > 0 ? v('spend') / v('new') : 0, gp = v('arpa') * v('gm') / 100;
      var ltv = v('churn') > 0 ? gp / (v('churn') / 100) : 0;
      set(0, v('new') > 0 ? cur.format(cac) : na); set(1, gp > 0 && cac > 0 ? nf.format(cac / gp) : na);
      set(2, ltv > 0 ? cur.format(ltv) : na); set(3, ltv > 0 && cac > 0 ? nf.format(ltv / cac) + '×' : na);
    }
  }
  root.addEventListener('input', run); run();
})();
