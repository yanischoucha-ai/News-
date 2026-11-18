/* Formulaires (newsletter, contributions, contact) + attribution automatique à la copie */
(function () {
  var SITE = 'Marge';
  var lang = (document.documentElement.lang || 'fr').slice(0, 2);
  var fr = lang === 'fr';

  document.querySelectorAll('form[data-s-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.s-form-msg');
      var btn = form.querySelector('button[type=submit]');
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.type = form.getAttribute('data-s-form');
      data.lang = lang;
      data.page = location.pathname;
      btn.disabled = true;
      msg.className = 's-form-msg';
      msg.textContent = '';
      fetch('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); msg.className = 's-form-msg ok'; msg.textContent = form.getAttribute('data-ok') || (fr ? 'Merci, c’est enregistré.' : 'Thanks, you’re in.'); })
        .catch(function () { msg.className = 's-form-msg err'; msg.textContent = fr ? 'Envoi impossible pour le moment. Réessayez dans un instant.' : 'Could not send right now. Please try again shortly.'; })
        .then(function () { btn.disabled = false; });
    });
  });

  // Copie d'un long passage depuis un article : ajoute la source au presse-papiers
  document.addEventListener('copy', function (e) {
    var sel = window.getSelection && window.getSelection();
    if (!sel || sel.isCollapsed) return;
    var node = sel.anchorNode && (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement);
    if (!node || !node.closest || !node.closest('.article-body')) return;
    var text = sel.toString();
    if (text.length < 150) return;
    var h1 = document.querySelector('h1');
    var credit = '\n\n— ' + (fr ? 'Source : ' : 'Source: ') + '« ' + (h1 ? h1.textContent.trim() : document.title) + ' », ' + SITE + ' — ' + location.href.split('#')[0] +
      '\n© ' + new Date().getFullYear() + ' ' + SITE + (fr ? '. Reproduction soumise à citation de la source.' : '. Reuse requires crediting the source.');
    e.clipboardData.setData('text/plain', text + credit);
    e.preventDefault();
  });
})();
