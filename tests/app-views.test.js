/* Menjalankan js/core/app.js asli dengan DOM palsu, lalu merender semua daftar dan halaman detail.
 * Sebelum tiap kasus, tabel non-inti dibuang supaya terbukti bahwa tabel yang diminta tampilan itu cukup.
 * Jalankan: node tests/app-views.test.js */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const ROOT = path.join(__dirname, '..'), DB = path.join(ROOT, 'database');

const fetched = [];
async function fakeFetch(url) {
  const rel = url.replace(/^.*database\//, ''); fetched.push(rel);
  const p = path.join(DB, rel);
  if (!fs.existsSync(p)) return { ok: false, status: 404, json: async () => ({}) };
  const txt = fs.readFileSync(p, 'utf8');
  return { ok: true, status: 200, json: async () => JSON.parse(txt) };
}

// ---- DOM palsu secukupnya ----
const els = {};
function el(id) {
  if (els[id]) return els[id];
  const o = { innerHTML: '', hidden: false, className: '', dataset: {}, style: {}, textContent: '',
    addEventListener() {}, querySelector() { return el('q'); }, querySelectorAll() { return []; }, closest() { return null; },
    appendChild() {}, setAttribute() {}, getAttribute() { return null; }, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } }, click() {}, insertAdjacentHTML() {} };
  return (els[id] = o);
}
const win = { scrollY: 0, scrollTo() {}, addEventListener() {} };
const sandbox = {
  window: win, console, URL, Promise, setTimeout, clearTimeout, Uint8Array, Blob: class {}, Response: class {}, TextDecoder,
  document: { documentElement: { lang: 'id' }, baseURI: 'https://x.github.io/MH4U-Toolbox/', currentScript: null,
    querySelector(s) { return el(s); }, querySelectorAll() { return []; }, getElementById(s) { return el('#' + s); },
    addEventListener() {}, createElement() { return el('new'); }, createTreeWalker() { return { nextNode() { return null; } }; }, head: el('head'), body: el('body') },
  MutationObserver: class { observe() {} }, navigator: {}, localStorage: { getItem() { return null; }, setItem() {} }
};
sandbox.globalThis = sandbox; win.document = sandbox.document; win.window = win;
vm.createContext(sandbox);

// loader asli dengan fetch palsu
const loaderSrc = fs.readFileSync(path.join(ROOT, 'js/database/loader.js'), 'utf8');
vm.runInContext(loaderSrc.replace("typeof window !== 'undefined' ? window : globalThis", 'window'), sandbox);
const realLoader = win.MH4UDatabaseLoader;
win.MH4UDatabaseLoader = realLoader.createLoader({ base: 'https://x.github.io/MH4U-Toolbox/database/', fetch: fakeFetch });

// app.js + hook internal (hanya untuk pengujian)
let app = fs.readFileSync(process.env.APP_JS || path.join(ROOT, 'js/core/app.js'), 'utf8');
assert.ok(app.includes('window.MHDB={'), 'hook MHDB tidak ditemukan');
app = app.replace('window.MHDB={', 'window.__I={get D(){return D},G:G,M:M,GSPEC:GSPEC,CORE:CORE,LISTS:LISTS,DET:DET,needOf:needOf,setStack:s=>{stack=s}};window.MHDB={');
// app.js memakai variabel global dari js/core/save-codec.js (EQN dsb.) hanya di dalam fungsi tertentu; stub agar tidak crash
vm.runInContext('var EQN={},EQKEY={},bn=x=>x,eqName=()=>"",S={d:null};', sandbox);
vm.runInContext(app, sandbox, { filename: 'app.js' });

let pass = 0, fail = 0; const failures = [];
function unloadNonCore() {
  const I = win.__I;
  Object.keys(I.D).forEach(function (n) { if (I.CORE.indexOf(n) < 0 && n !== '_ni') delete I.D[n]; });
  Object.keys(I.GSPEC).forEach(function (n) { if (I.CORE.indexOf(n) < 0) I.GSPEC[n].forEach(function (g) { delete I.G[g[0]]; }); });
}
async function view(label, stack) {
  unloadNonCore(); els['#dbv'] = undefined;
  const before = fetched.length;
  try {
    await win.MHDB._t(stack);
    const html = el('#dbv').innerHTML;
    assert.ok(html && html.length > 20, 'HTML kosong');
    assert.ok(!/Gagal memuat/.test(html), 'tampilan error: ' + html.slice(0, 200));
    pass++;
  } catch (e) { fail++; failures.push(label + ' -> ' + (e && e.message)); }
}

(async function () {
  await win.MHDB._load();
  const I = win.__I, D = I.D;
  console.log('Tabel inti dimuat:', Object.keys(D).filter(function (n) { return n !== '_ni'; }).join(', '));
  assert.strictEqual(Object.keys(D).filter(function (n) { return n !== '_ni'; }).length, I.CORE.length, 'load() hanya boleh memuat tabel inti');
  assert.ok(!fetched.some(function (f) { return /components|hunting_rewards|gathering|quest_rewards|item_to_skill_tree/.test(f); }), 'load() tidak boleh mengambil tabel relasi besar');

  // daftar
  for (const k of Object.keys(I.LISTS)) {
    const L = I.LISTS[k], tabs = L.tabs ? L.tabs.map(function (t) { return t[0]; }) : [undefined];
    if (k === 'weapon') {
      const wts = Array.from(new Set(D.weapons.map(function (w) { return w.wtype; })));
      for (const w of wts) { await view('daftar weapon ' + w, [{ k: k, sub: w }]); await view('cari weapon ' + w, [{ k: k, sub: w, ls: { q: 'a', n: 150 } }]); }
    } else {
      for (const tb of tabs) { await view('daftar ' + k + ' tab=' + tb, [{ k: k, tab: tb }]); await view('cari ' + k + ' tab=' + tb, [{ k: k, tab: tb, ls: { q: 'a', n: 150 }, open: {} }]); }
    }
  }
  // detail: semua tab untuk contoh id
  const tabsOf = { monster: ['sum', 'dmg', 'sts', 'hab', 'LR', 'HR', 'G', 'qst'], weapon: ['d', 'f', 'c'], armor: ['d', 's', 'c'], decoration: ['d', 's', 'c'],
    item: ['d', 'cb', 'u', 'm', 'q', 'l', 't'], quest: ['d', 'm', 'r'], location: ['m', 'LR', 'HR', 'G'], skill: ['d', 'Head', 'Body', 'Arms', 'Waist', 'Legs', 'J'] };
  const pick = (arr, n) => arr.filter(function (_, i) { return i % Math.max(1, Math.floor(arr.length / n)) === 0; });
  const items = D.items, nonEq = items.filter(function (i) { return ['Weapon', 'Armor', 'Decoration'].indexOf(i.type) < 0 && i.name; });
  const ids = {
    monster: D.monsters.map(function (m) { return m._id; }),
    weapon: pick(D.weapons, 45).map(function (w) { return w._id; }),
    armor: pick(D.armor, 25).map(function (a) { return a._id; }),
    decoration: pick(D.decorations, 8).map(function (a) { return a._id; }),
    item: pick(nonEq, 40).map(function (i) { return i._id; }),
    quest: pick(D.quests, 40).map(function (q) { return q._id; }),
    location: D.locations.map(function (l) { return l._id; }),
    skill: pick(D.skill_trees, 20).map(function (s) { return s._id; })
  };
  // pastikan juga ada senjata Hunting Horn dan item Flesh/Ore ikut diuji
  ids.weapon = ids.weapon.concat(D.weapons.filter(function (w) { return w.wtype === 'Hunting Horn'; }).slice(0, 4).map(function (w) { return w._id; }));
  for (const k of Object.keys(ids)) for (const id of ids[k]) for (const tb of tabsOf[k]) await view('detail ' + k + ' #' + id + ' tab=' + tb, [{ k: k, id: id, tab: tb }]);

  // navigasi bertingkat (tabel yang sudah dimuat tidak diambil ulang)
  fetched.length = 0;
  await win.MHDB._t([{ k: 'monster', id: D.monsters[10]._id, tab: 'sum' }]);
  const n1 = fetched.length; await win.MHDB._t([{ k: 'monster', id: D.monsters[11]._id, tab: 'HR' }]);
  assert.strictEqual(fetched.length, n1, 'tabel yang sama tidak boleh diambil dua kali');

  console.log('\nTampilan dirender: ' + pass + ' lulus, ' + fail + ' gagal');
  if (fail) { failures.slice(0, 25).forEach(function (f) { console.log('  FAIL ' + f); }); if (failures.length > 25) console.log('  ... +' + (failures.length - 25) + ' lainnya'); process.exitCode = 1; }
})().catch(function (e) { console.log('HARNESS ERROR', e && e.stack || e); process.exitCode = 1; });
