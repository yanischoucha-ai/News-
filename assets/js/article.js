/* Marge — Article interactivity */

// 1. Reading progress bar
(function() {
  const bar = document.createElement('div');
  bar.id = 'progress-bar';
  bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:#b8321f;width:0%;z-index:9999;transition:width .1s linear;';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop;
    const total = doc.scrollHeight - doc.clientHeight;
    bar.style.width = (scrolled / total * 100) + '%';
  }, { passive: true });
})();

// 2. Table of contents (auto-generated from h2)
(function() {
  const toc = document.getElementById('toc');
  if (!toc) return;
  const headings = document.querySelectorAll('.article-body h2');
  if (headings.length < 2) { toc.remove(); return; }

  const list = document.createElement('ol');
  headings.forEach((h, i) => {
    if (!h.id) h.id = 'section-' + i;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
  });
  toc.appendChild(list);
})();

// 3. Copy link button
(function() {
  const btn = document.getElementById('share-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      btn.textContent = '✓ Lien copié !';
      btn.style.background = '#2d6a4f';
      setTimeout(() => {
        btn.textContent = '🔗 Copier le lien';
        btn.style.background = '';
      }, 2000);
    });
  });
})();

// 4. Estimated read time (update from actual word count)
(function() {
  const el = document.getElementById('read-time');
  if (!el) return;
  const text = document.querySelector('.article-body')?.innerText || '';
  const words = text.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 220));
  el.textContent = mins + ' min de lecture';
})();
