/* MH4U Toolbox - mesin pencarian (Stage 5)
 *
 * Mesin ini tidak mengambil data sendiri: ia meminta tabel ke MH4UDatabaseLoader hanya
 * untuk modul dan filter yang sedang dipakai. Tiap modul (monsters, items, weapons, armor,
 * quests, materials) mendaftar lewat MH4USearch.register({...}).
 *
 * Pemakaian:
 *   const r = await MH4USearch.search('weapons', 'rath', { filters:{ wtype:'Great Sword' }, limit:20 });
 *   r.results -> [{ id, name, ... , score }]
 */
(function (root) {
  'use strict';

  const modules = Object.create(null);
  const derived = Object.create(null); // cache hasil turunan (nama ter-normalisasi, indeks, dll.)

  const loader = function () {
    const l = root.MH4UDatabaseLoader;
    if (!l) throw new Error('MH4UDatabaseLoader belum dimuat (js/database/loader.js harus lebih dulu).');
    return l;
  };

  // ---------- normalisasi & skor ----------
  function strip(s) {
    s = String(s == null ? '' : s);
    if (s.normalize) s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return s.toLowerCase();
  }
  /** huruf kecil, tanpa aksen, simbol -> spasi ('+' dipertahankan: "Nectar: Dragon++"). */
  function norm(s) { return strip(s).replace(/[^a-z0-9+]+/g, ' ').trim(); }
  function tokens(q) { const n = norm(q); return n ? n.split(' ') : []; }
  function num(v, d) { const n = typeof v === 'number' ? v : parseFloat(v); return isFinite(n) ? n : (d === undefined ? 0 : d); }

  /**
   * Skor kecocokan nama ter-normalisasi `n` terhadap kueri. 0 = tidak cocok.
   * Semua token kueri harus muncul. Urutan: persis > diawali kueri > awal kata > substring > token tersebar.
   */
  function scoreName(n, q) {
    if (!q.n) return 1;
    if (!n) return 0;
    for (let i = 0; i < q.t.length; i++) if (n.indexOf(q.t[i]) < 0) return 0;
    let s;
    if (n === q.n) s = 1000;
    else if (n.indexOf(q.n) === 0) s = 800;
    else if (n.indexOf(' ' + q.n) >= 0) s = 600;
    else if (n.indexOf(q.n) >= 0) s = 400;
    else {
      s = 200;
      for (let i = 0; i < q.t.length; i++) if (n.indexOf(q.t[i]) === 0 || n.indexOf(' ' + q.t[i]) >= 0) s += 20;
    }
    return s - Math.min(150, Math.max(0, n.length - q.n.length)) * 0.5;
  }
  /** Cocokkan nama utama; kalau gagal, coba teks sekunder (deskripsi, goal) dengan skor rendah. */
  function match(primaryN, secondaryN, q) {
    const s = scoreName(primaryN, q);
    if (s > 0 || !secondaryN) return s;
    for (let i = 0; i < q.t.length; i++) if (secondaryN.indexOf(q.t[i]) < 0) return 0;
    return 50;
  }
  function parseQuery(query) { const n = norm(query); return { raw: query || '', n: n, t: n ? n.split(' ') : [] }; }

  // ---------- konteks sinkron untuk modul (semua tabel yang dibutuhkan sudah dimuat) ----------
  function makeCtx(needed) {
    const L = loader();
    const ctx = {
      norm: norm, num: num,
      rows(name) {
        const r = L.peek(name);
        if (!r) throw new Error('Tabel "' + name + '" belum dimuat; tambahkan ke needs/filters.needs modul.');
        return r;
      },
      /** {id: baris}; di-cache. */
      index(name, key) {
        key = key || '_id';
        const k = 'idx|' + name + '|' + key;
        if (derived[k]) return derived[k];
        const m = Object.create(null), rows = ctx.rows(name);
        for (let i = 0; i < rows.length; i++) m[rows[i][key]] = rows[i];
        return (derived[k] = m);
      },
      /** {nilai: [baris]}; di-cache. */
      group(name, key) {
        const k = 'grp|' + name + '|' + key;
        if (derived[k]) return derived[k];
        const m = Object.create(null), rows = ctx.rows(name);
        for (let i = 0; i < rows.length; i++) (m[rows[i][key]] || (m[rows[i][key]] = [])).push(rows[i]);
        return (derived[k] = m);
      },
      /** Hitung sekali per tabel/kunci, mis. array nama ter-normalisasi. */
      cache(key, fn) { return key in derived ? derived[key] : (derived[key] = fn()); },
      /**
       * Ubah nilai filter (id angka, nama, atau array keduanya) menjadi Set id di `table`.
       * Nama dicocokkan persis dulu, lalu sebagai substring.
       */
      resolve(table, value, nameCol) {
        nameCol = nameCol || 'name';
        const vals = Array.isArray(value) ? value : [value];
        const rows = ctx.rows(table), out = new Set();
        const names = ctx.cache('nm|' + table + '|' + nameCol, function () { return rows.map(function (r) { return norm(r[nameCol]); }); });
        vals.forEach(function (v) {
          if (v == null || v === '') return;
          if (typeof v === 'number' || /^\d+$/.test(String(v))) { out.add(+v); return; }
          const q = norm(v);
          let hit = false;
          for (let i = 0; i < rows.length; i++) if (names[i] === q) { out.add(rows[i]._id); hit = true; }
          if (!hit) for (let i = 0; i < rows.length; i++) if (names[i].indexOf(q) >= 0) out.add(rows[i]._id);
        });
        return out;
      }
    };
    return ctx;
  }

  // ---------- util filter ----------
  /** nilai filter -> Set huruf kecil, atau null bila filter tidak diisi. */
  function toSet(v) {
    if (v == null || v === '') return null;
    return new Set((Array.isArray(v) ? v : [v]).map(function (x) { return strip(x).trim(); }));
  }
  function inRange(v, lo, hi) { return (lo == null || v >= lo) && (hi == null || v <= hi); }
  const present = function (v) { return v != null && v !== '' && !(Array.isArray(v) && !v.length); };
  const cmpStr = function (a, b) { return a < b ? -1 : a > b ? 1 : 0; };

  // ---------- registrasi & pencarian ----------
  function register(mod) {
    if (!mod || !mod.name || typeof mod.run !== 'function') throw new Error('Modul pencarian tidak valid');
    mod.needs = mod.needs || [];
    mod.filters = mod.filters || {};
    mod.sorts = mod.sorts || {};
    modules[mod.name] = mod;
    return mod;
  }
  function getModule(name) {
    const m = modules[name];
    if (!m) throw new Error('Modul pencarian tidak dikenal: ' + name + ' (tersedia: ' + Object.keys(modules).join(', ') + ')');
    return m;
  }
  /** Daftar tabel yang akan dimuat untuk satu pencarian: dasar modul + tabel milik filter yang dipakai. */
  function tablesFor(mod, filters) {
    const need = new Set(mod.needs);
    const ignored = [];
    Object.keys(filters || {}).forEach(function (k) {
      if (!present(filters[k])) return;
      const f = mod.filters[k];
      if (!f) { ignored.push(k); return; }
      (f.needs || []).forEach(function (t) { need.add(t); });
    });
    return { tables: Array.from(need), ignored: ignored };
  }

  async function search(name, query, opts) {
    opts = opts || {};
    const mod = getModule(name);
    const filters = opts.filters || {};
    const plan = tablesFor(mod, filters);
    await loader().tables(plan.tables);
    const ctx = makeCtx(plan.tables);
    const q = parseQuery(query);
    const hits = mod.run(ctx, q, filters, opts);

    const sortKey = opts.sort || (q.n ? 'relevance' : mod.defaultSort || 'name');
    let cmp;
    if (sortKey === 'relevance') cmp = function (a, b) { return (b.score - a.score) || cmpStr(norm(a.name), norm(b.name)) || (a.id - b.id); };
    else if (mod.sorts[sortKey]) cmp = mod.sorts[sortKey];
    else throw new Error('Sort "' + sortKey + '" tidak ada di modul ' + name + ' (tersedia: relevance, ' + Object.keys(mod.sorts).join(', ') + ')');
    hits.sort(cmp);

    const offset = Math.max(0, opts.offset | 0);
    const limit = opts.limit == null ? 50 : Math.max(0, opts.limit | 0);
    return {
      module: name, query: q.raw, total: hits.length, offset: offset, limit: limit, sort: sortKey,
      results: hits.slice(offset, offset + limit),
      tablesUsed: plan.tables, ignoredFilters: plan.ignored
    };
  }

  /** Cari di beberapa modul sekaligus (default: semua). Hanya memuat tabel dasar tiap modul. */
  async function searchAll(query, opts) {
    opts = opts || {};
    const names = opts.modules || Object.keys(modules);
    const limit = opts.limit == null ? 5 : opts.limit;
    const list = await Promise.all(names.map(function (n) { return search(n, query, { limit: limit }); }));
    const out = {};
    names.forEach(function (n, i) { out[n] = list[i]; });
    return out;
  }

  /** Hitungan per nilai untuk membuat chip filter (mis. jenis senjata) tanpa hard-code. */
  async function facets(name) {
    const mod = getModule(name);
    if (typeof mod.facets !== 'function') return {};
    await loader().tables(mod.needs);
    return mod.facets(makeCtx(mod.needs));
  }

  /** Deskripsi modul: tabel dasar, filter + tabel tambahan, pilihan sort. Untuk UI/dokumentasi. */
  function describe() {
    const out = {};
    Object.keys(modules).forEach(function (n) {
      const m = modules[n];
      out[n] = {
        label: m.label || n, base: m.needs.slice(), defaultSort: m.defaultSort || 'name',
        sorts: ['relevance'].concat(Object.keys(m.sorts)),
        filters: Object.keys(m.filters).reduce(function (a, k) {
          a[k] = { needs: (m.filters[k].needs || []).slice(), about: m.filters[k].about || '' }; return a;
        }, {})
      };
    });
    return out;
  }

  /** Buang cache turunan (dipakai pengujian atau bila loader diganti). */
  function reset() { Object.keys(derived).forEach(function (k) { delete derived[k]; }); }

  root.MH4USearch = {
    register: register, search: search, searchAll: searchAll, facets: facets,
    describe: describe, modules: function () { return Object.keys(modules); }, tablesFor: function (n, f) { return tablesFor(getModule(n), f); },
    reset: reset,
    util: { norm: norm, tokens: tokens, num: num, strip: strip, scoreName: scoreName, match: match, toSet: toSet, inRange: inRange, present: present, cmpStr: cmpStr }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.MH4USearch;
})(typeof window !== 'undefined' ? window : globalThis);
