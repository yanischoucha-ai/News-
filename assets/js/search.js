/* Recherche simple côté navigateur sur /assets/data/search.json */
(function () {
  var q = document.getElementById('q'), out = document.getElementById('results'); if (!q) return;
  var lang = (document.documentElement.lang || 'fr').slice(0, 2), idx = [];
  var norm = function (s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  fetch('/assets/data/search.json').then(function (r) { return r.json(); }).then(function (d) { idx = d.filter(function (x) { return x.l === lang; }); render(); });
  function render() {
    var words = norm(q.value).split(/\s+/).filter(Boolean); out.replaceChildren();
    var res = idx.filter(function (x) { var h = norm(x.t + ' ' + x.d); return words.every(function (w) { return h.indexOf(w) > -1; }); });
    if (!words.length) res = idx;
    res.slice(0, 30).forEach(function (x) {
      var li = document.createElement('li'), a = document.createElement('a'); a.href = x.u; a.textContent = x.t;
      var p = document.createElement('p'); p.textContent = x.d || ''; li.appendChild(a); li.appendChild(p); out.appendChild(li);
    });
    if (words.length && !res.length) { var li0 = document.createElement('li'); li0.textContent = lang === 'fr' ? 'Aucun résultat.' : 'No results.'; out.appendChild(li0); }
  }
  q.addEventListener('input', render);
})();
