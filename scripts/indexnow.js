#!/usr/bin/env node
// Notifie Bing/Yandex (IndexNow) des URLs du sitemap. Usage : node scripts/indexnow.js
const fs = require('fs'); const path = require('path');
const KEY = '0385c7fa6c3743a354f0cc88e09aa0c3', HOST = 'www.margebrief.com';
const sm = fs.readFileSync(path.join(__dirname, '..', 'sitemap.xml'), 'utf8');
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
fetch('https://api.indexnow.org/indexnow', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ host: HOST, key: KEY, keyLocation: 'https://' + HOST + '/' + KEY + '.txt', urlList: urls }) })
  .then((r) => console.log('IndexNow', r.status, urls.length + ' URLs')).catch((e) => { console.error(e.message); process.exit(1); });
