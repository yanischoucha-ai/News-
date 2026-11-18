/* Mini convertisseur Markdown → HTML sûr (titres, listes, citations, gras, italique, liens http/https).
   Tout le HTML saisi est échappé ; tous les liens sont rel="nofollow ugc noopener". Utilisé par l'éditeur et par api/contrib.js. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.MargeMD = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  function inline(s) {
    s = esc(s);
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, function (m, t, u) { return '<a href="' + u + '" rel="nofollow ugc noopener" target="_blank">' + t + '</a>'; });
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
    return s;
  }
  function render(md) {
    var blocks = String(md || '').replace(/\r\n?/g, '\n').split(/\n{2,}/), out = [];
    blocks.forEach(function (b) {
      b = b.replace(/^\n+|\n+$/g, '');
      if (!b) return;
      var lines = b.split('\n');
      if (/^###\s+/.test(b)) out.push('<h3>' + inline(b.replace(/^###\s+/, '').split('\n')[0]) + '</h3>');
      else if (/^#{1,2}\s+/.test(b)) out.push('<h2>' + inline(b.replace(/^#{1,2}\s+/, '').split('\n')[0]) + '</h2>');
      else if (lines.every(function (l) { return /^\s*[-*]\s+/.test(l); })) out.push('<ul>' + lines.map(function (l) { return '<li>' + inline(l.replace(/^\s*[-*]\s+/, '')) + '</li>'; }).join('') + '</ul>');
      else if (lines.every(function (l) { return /^\s*\d+[.)]\s+/.test(l); })) out.push('<ol>' + lines.map(function (l) { return '<li>' + inline(l.replace(/^\s*\d+[.)]\s+/, '')) + '</li>'; }).join('') + '</ol>');
      else if (lines.every(function (l) { return /^>\s?/.test(l); })) out.push('<blockquote><p>' + lines.map(function (l) { return inline(l.replace(/^>\s?/, '')); }).join('<br>') + '</p></blockquote>');
      else out.push('<p>' + lines.map(inline).join('<br>') + '</p>');
    });
    return out.join('\n');
  }
  function words(md) { var t = String(md || '').trim(); return t ? t.split(/\s+/).length : 0; }
  return { render: render, words: words, esc: esc };
});
