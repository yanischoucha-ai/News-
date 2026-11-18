/* Publication directe d'un texte (sans compte) : appelle la fonction marge_publish_guest de la base. */
(function () {
  var URL = 'https://tucpoqyxtbxqqwtjmyqk.supabase.co/rest/v1/rpc/marge_publish_guest';
  var KEY = 'sb_publishable_AUE4MfiPR88DXuiY1FP9fg_pbHRWUUb';
  var form = document.querySelector('form.au-form');
  if (!form) return;
  var fr = form.getAttribute('data-lang') === 'fr';
  var msg = form.querySelector('.s-form-msg'), btn = form.querySelector('button[type=submit]'), count = form.querySelector('.au-count'), body = form.elements.body;
  var E = fr ? {
    email: 'Email invalide.', name: 'Indiquez un nom (2 à 80 caractères).', title: 'Le titre doit faire 15 caractères minimum.', too_long_meta: 'Résumé ou bio trop long (300 caractères max).',
    too_short: 'Texte trop court : 300 mots minimum.', too_long: 'Texte trop long.', too_many_links: '3 liens maximum dans le texte.', bad_url: 'Le lien du site doit commencer par https://.',
    spam: 'Texte refusé par le filtre anti-spam.', duplicate: 'Ce texte existe déjà.', daily_limit: 'Limite atteinte : 2 textes par jour et par email.', site_limit: 'Beaucoup de textes aujourd’hui, réessayez demain.',
    net: 'Envoi impossible pour le moment. Réessayez dans un instant.', ok: 'Publié ! Redirection…'
  } : {
    email: 'Invalid email.', name: 'Enter a name (2 to 80 characters).', title: 'Title must be at least 15 characters.', too_long_meta: 'Summary or bio too long (300 characters max).',
    too_short: 'Text too short: 300 words minimum.', too_long: 'Text too long.', too_many_links: '3 links maximum in the text.', bad_url: 'The site link must start with https://.',
    spam: 'Text rejected by the spam filter.', duplicate: 'This text already exists.', daily_limit: 'Limit reached: 2 pieces per day per email.', site_limit: 'Lots of pieces today, please try again tomorrow.',
    net: 'Could not send right now. Please try again shortly.', ok: 'Published! Redirecting…'
  };
  var words = function (t) { t = t.trim(); return t ? t.split(/\s+/).length : 0; };
  body.addEventListener('input', function () { count.textContent = words(body.value) + (fr ? ' mots' : ' words'); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    msg.className = 's-form-msg'; msg.textContent = ''; btn.disabled = true;
    fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + KEY },
      body: JSON.stringify({ p_lang: f.lang.value, p_title: f.title.value, p_summary: f.summary.value, p_body: f.body.value, p_name: f.name.value, p_bio: f.bio.value, p_url: f.url.value, p_email: f.email.value, p_hp: f.website.value })
    }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (r) {
        if (r.ok) {
          msg.className = 's-form-msg ok'; msg.textContent = E.ok;
          location.href = (r.lang === 'en' ? '/en/community/' : '/fr/tribune/') + r.slug;
        } else { msg.className = 's-form-msg err'; msg.textContent = E[r.reason] || E.net; btn.disabled = false; }
      })
      .catch(function () { msg.className = 's-form-msg err'; msg.textContent = E.net; btn.disabled = false; });
  });
})();
