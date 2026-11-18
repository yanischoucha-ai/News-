// Vercel serverless : enregistre inscriptions newsletter, propositions d'articles et messages dans Supabase.
// Variables d'environnement requises (Vercel → Settings → Environment Variables) :
//   SUPABASE_URL, SUPABASE_ANON_KEY   (clé publique, ajout seul ; schéma : supabase/schema.sql)

const TABLES = { newsletter: 'marge_subscribers', contribution: 'marge_contributions', contact: 'marge_contacts' };
const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  let b = req.body;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } }
  b = b || {};

  if (b.website) return res.status(200).json({ ok: true }); // honeypot anti-bot

  const type = b.type;
  if (!TABLES[type]) return res.status(400).json({ error: 'type' });

  const email = clip(b.email, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'email' });

  const lang = String(b.lang || '').startsWith('en') ? 'en' : 'fr';
  let row;

  if (type === 'newsletter') {
    row = { email, lang, source: clip(b.page, 200) };
  } else if (type === 'contribution') {
    row = {
      name: clip(b.name, 120), email, lang, title: clip(b.title, 200),
      pitch: clip(b.pitch, 8000), link: clip(b.link, 300), status: 'new',
    };
    if (!row.name || !row.title || row.pitch.length < 80 || b.agree !== 'on') return res.status(400).json({ error: 'fields' });
  } else {
    row = { name: clip(b.name, 120), email, lang, message: clip(b.message, 4000) };
    if (!row.name || row.message.length < 10) return res.status(400).json({ error: 'fields' });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'not_configured' });

  try {
    const q = type === 'newsletter' ? '?on_conflict=email' : '';
    const r = await fetch(`${url}/rest/v1/${TABLES[type]}${q}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: type === 'newsletter' ? 'resolution=ignore-duplicates,return=minimal' : 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    if (!r.ok) return res.status(502).json({ error: 'storage' });
    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ error: 'storage' });
  }
};
