/* Uji modul database + pencarian dengan data asli. Jalankan: node tests/search.test.js */
'use strict';
const fs = require('fs'), path = require('path'), assert = require('assert');
const ROOT = path.join(__dirname, '..');
const DB = path.join(ROOT, 'database');

// fetch palsu yang membaca dari disk dan mencatat file yang diminta
const requested = [];
async function fakeFetch(url) {
  const rel = url.replace(/^.*database\//, '');
  requested.push(rel);
  const p = path.join(DB, rel);
  if (!fs.existsSync(p)) return { ok: false, status: 404, json: async () => { throw new Error('404'); } };
  return { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(p, 'utf8')) };
}
const { createLoader } = require(path.join(ROOT, 'js/database/loader.js'));
globalThis.MH4UDatabaseLoader = createLoader({ base: 'https://example.github.io/MH4U-Toolbox/database/', fetch: fakeFetch });
const S = require(path.join(ROOT, 'js/database/search/core.js'));
['monsters', 'items', 'weapons', 'armor', 'quests', 'materials'].forEach(function (m) { require(path.join(ROOT, 'js/database/search/' + m + '.js')); });
const L = globalThis.MH4UDatabaseLoader;

let pass = 0;
async function t(name, fn) {
  try { await fn(); pass++; console.log('  ok   ' + name); }
  catch (e) { console.log('  FAIL ' + name + '\n       ' + (e && e.stack || e)); process.exitCode = 1; }
}
const tbls = () => requested.filter(function (r) { return r.indexOf('tables/') === 0; }).map(function (r) { return r.replace(/^tables\/|\.json$/g, ''); });

(async function () {
  console.log('Modul terdaftar:', S.modules().join(', '));

  await t('enam modul terdaftar', async function () {
    assert.deepStrictEqual(S.modules().sort(), ['armor', 'items', 'materials', 'monsters', 'quests', 'weapons']);
  });

  await t('manifest = 24 tabel dan jumlah baris sama dengan file', async function () {
    const man = await L.manifest();
    assert.strictEqual(Object.keys(man.tables).length, 24);
    for (const n of Object.keys(man.tables)) {
      const j = JSON.parse(fs.readFileSync(path.join(DB, man.tables[n].file), 'utf8'));
      assert.strictEqual(j.rows.length, man.tables[n].rows, n);
      assert.deepStrictEqual(j.columns, man.tables[n].columns, n);
    }
  });

  await t('monsters: hanya tabel monsters yang dimuat', async function () {
    requested.length = 0;
    const r = await S.search('monsters', 'rathalos');
    assert.ok(r.total >= 1 && /rathalos/i.test(r.results[0].name), JSON.stringify(r.results[0]));
    assert.deepStrictEqual(tbls(), ['monsters']);
  });

  await t('monsters: filter kelemahan memuat monster_weakness saja (tambahan)', async function () {
    requested.length = 0;
    const r = await S.search('monsters', '', { filters: { weakness: 'dragon', class: 'Boss' }, limit: 200 });
    assert.ok(r.total > 5);
    assert.ok(r.results.every(function (x) { return x.class === 'Boss' && x.weaknessStars >= 2; }));
    assert.deepStrictEqual(tbls(), ['monster_weakness']);
  });

  await t('monsters: filter lokasi memuat habitat + locations', async function () {
    const r = await S.search('monsters', '', { filters: { location: 'Volcanic Hollow' }, limit: 200 });
    assert.ok(r.total > 3, 'total ' + r.total);
  });

  await t('monsters: weakness tidak valid -> error jelas', async function () {
    await assert.rejects(S.search('monsters', '', { filters: { weakness: 'banana' } }), /weakness tidak dikenal/);
  });

  await t('items: tanpa senjata/armor/decoration; cocok dengan aturan menu Items', async function () {
    const r = await S.search('items', 'potion', { limit: 100 });
    assert.ok(r.total > 0);
    assert.ok(r.results.every(function (x) { return ['Weapon', 'Armor', 'Decoration'].indexOf(x.type) < 0; }));
    const all = await S.search('items', '', { limit: 1 });
    const man = await L.manifest();
    const rows = L.peek('items');
    const expect = rows.filter(function (i) { return i.name && ['Weapon', 'Armor', 'Decoration'].indexOf(i.type) < 0; }).length;
    assert.strictEqual(all.total, expect);
  });

  await t('items: item bertipe kosong (id 303) tetap bisa dicari', async function () {
    const r = await S.search('items', 'nectar dragon++');
    assert.ok(r.results.some(function (x) { return x.id === 303; }));
  });

  await t('items: relevansi (persis > awalan > substring)', async function () {
    const r = await S.search('items', 'Potion', { limit: 5 });
    assert.strictEqual(r.results[0].name, 'Potion');
  });

  await t('weapons: filter jenis + elemen + minimal attack', async function () {
    const r = await S.search('weapons', '', { filters: { wtype: 'Great Sword', element: 'Fire', minAttack: 400 }, sort: 'attack', limit: 500 });
    assert.ok(r.total > 0);
    assert.ok(r.results.every(function (x) { return x.wtype === 'Great Sword' && (x.element === 'Fire' || x.element2 === 'Fire') && x.attack >= 400; }));
    for (let i = 1; i < r.results.length; i++) assert.ok(r.results[i - 1].attack >= r.results[i].attack);
  });

  await t('weapons: total per jenis cocok dengan audit (2324 senjata)', async function () {
    const r = await S.search('weapons', '', { limit: 1 });
    assert.strictEqual(r.total, 2324);
    const f = await S.facets('weapons');
    assert.strictEqual(Object.keys(f.wtype).length, 14);
    assert.strictEqual(f.wtype['Great Sword'], 202);
  });

  await t('weapons: affinity string dikonversi ke angka', async function () {
    const r = await S.search('weapons', '', { limit: 3000 });
    assert.ok(r.results.every(function (x) { return typeof x.affinity === 'number' && typeof x.elementAttack === 'number'; }));
  });

  await t('armor: 3087 total; filter slot/hunterType (Both ikut)', async function () {
    assert.strictEqual((await S.search('armor', '', { limit: 1 })).total, 3087);
    const r = await S.search('armor', '', { filters: { slot: 'Head', hunterType: 'Blade' }, limit: 5000 });
    assert.ok(r.total > 0 && r.results.every(function (x) { return x.slot === 'Head' && (x.hunterType === 'Blade' || x.hunterType === 'Both'); }));
    assert.ok(!r.results.some(function (x) { return x.id === 3753; }), 'Hawkeye Earring (tipe kosong) tidak boleh muncul saat filter dipakai');
    const none = await S.search('armor', 'hawkeye earring');
    assert.ok(none.results.some(function (x) { return x.id === 3753; }));
  });

  await t('armor: filter skill memuat tabel skill hanya saat dipakai', async function () {
    requested.length = 0;
    const r = await S.search('armor', '', { filters: { skill: 'Attack', skillMin: 3 }, limit: 50 });
    assert.ok(r.total > 0, 'total ' + r.total);
    assert.ok(r.results.every(function (x) { return x.skills.some(function (s) { return /attack/i.test(s.skill) && s.points >= 3; }); }));
    assert.deepStrictEqual(tbls().sort(), ['item_to_skill_tree', 'skill_trees']);
    assert.ok(!L.isLoaded('components') && !L.isLoaded('gathering'));
  });

  await t('quests: 569 total; filter hub/bintang/lokasi', async function () {
    assert.strictEqual((await S.search('quests', '', { limit: 1 })).total, 569);
    const r = await S.search('quests', '', { filters: { hub: 'Guild', stars: 7 }, limit: 100 });
    assert.ok(r.total > 0 && r.results.every(function (x) { return x.hub === 'Guild' && x.stars === 7 && x.location; }));
    const l = await S.search('quests', '', { filters: { location: 'Sanctuary' }, limit: 600 });
    assert.ok(l.results.every(function (x) { return x.location === 'Sanctuary'; }));
  });

  await t('quests: filter monster', async function () {
    requested.length = 0;
    const r = await S.search('quests', '', { filters: { monster: 'Rathalos' }, limit: 100 });
    assert.ok(r.total > 3, 'total ' + r.total);
    assert.ok(tbls().indexOf('monster_to_quest') >= 0);
    assert.ok(!L.isLoaded('quest_rewards') && !L.isLoaded('hunting_rewards'), 'tabel hadiah tidak boleh ikut termuat');
  });

  await t('quests: filter hadiah item', async function () {
    const r = await S.search('quests', '', { filters: { rewardItem: 'Rathalos Plate' }, limit: 100 });
    assert.ok(r.total > 0);
  });

  await t('materials: hanya tipe material; Scrap/Book/Ammo tidak ikut', async function () {
    const r = await S.search('materials', '', { limit: 5000 });
    const types = new Set(r.results.map(function (x) { return x.type; }));
    ['Scrap', 'Book', 'Ammo', 'Coating', 'Wystone', 'Weapon', 'Armor'].forEach(function (b) { assert.ok(!types.has(b), b); });
    assert.ok(types.has('Flesh') && types.has('Ore'));
  });

  await t('materials: drop dari monster (+rank, condition)', async function () {
    const r = await S.search('materials', '', { filters: { monster: 'Rathalos', rank: 'HR', condition: 'Tail Carve' }, limit: 50 });
    assert.ok(r.total > 0, 'total ' + r.total);
    assert.ok(r.results.every(function (x) { return x.drops.every(function (d) { return d.rank === 'HR' && d.condition === 'Tail Carve' && /rathalos/i.test(d.monster); }); }));
  });

  await t('materials: gathering per lokasi', async function () {
    const r = await S.search('materials', '', { filters: { location: 'Ancestral Steppe', rank: 'LR' }, limit: 100 });
    assert.ok(r.total > 0 && r.results.every(function (x) { return x.gathering.length > 0; }));
  });

  await t('tidak ada pencarian yang memuat semua tabel', async function () {
    const loaded = L.loadedTables().length;
    assert.ok(loaded < 24, 'sudah memuat ' + loaded);
  });

  await t('searchAll memuat hanya tabel dasar modul', async function () {
    const fresh = createLoader({ base: 'x/database/', fetch: fakeFetch });
    globalThis.MH4UDatabaseLoader = fresh; S.reset(); requested.length = 0;
    const r = await S.searchAll('rathalos', { limit: 3 });
    assert.deepStrictEqual(Object.keys(r).sort(), ['armor', 'items', 'materials', 'monsters', 'quests', 'weapons']);
    assert.deepStrictEqual(tbls().sort(), ['armor', 'items', 'locations', 'monsters', 'quests', 'weapons']);
    assert.ok(r.weapons.total > 0 && r.armor.total > 0 && r.monsters.total > 0);
  });

  await t('loader: tabel yang sama tidak diambil dua kali', async function () {
    requested.length = 0;
    await Promise.all([globalThis.MH4UDatabaseLoader.table('monsters'), globalThis.MH4UDatabaseLoader.table('monsters')]);
    await globalThis.MH4UDatabaseLoader.table('monsters');
    assert.strictEqual(tbls().length, 0);
  });

  await t('loader: tabel tidak dikenal -> error, tidak crash dan bisa dicoba lagi', async function () {
    await assert.rejects(globalThis.MH4UDatabaseLoader.table('nope'), /Tabel tidak dikenal/);
    await assert.rejects(globalThis.MH4UDatabaseLoader.table('nope'), /Tabel tidak dikenal/);
  });

  await t('filter tak dikenal dilaporkan, bukan error', async function () {
    const r = await S.search('weapons', 'sword', { filters: { warna: 'merah' }, limit: 1 });
    assert.deepStrictEqual(r.ignoredFilters, ['warna']);
  });

  await t('base URL relatif: tidak ada path absolut dari root domain', async function () {
    const l = createLoader({ base: 'database', fetch: fakeFetch });
    assert.strictEqual(l.base, 'database/');
  });

  console.log('\n' + pass + ' pengujian lulus' + (process.exitCode ? ' (ADA YANG GAGAL)' : ''));
})();
