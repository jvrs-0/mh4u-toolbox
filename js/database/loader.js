/* MH4U Toolbox - database loader (Stage 5)
 *
 * Tugas file ini HANYA mengambil data: manifest, tabel per file, terjemahan, dan manifest ikon.
 * Pencarian ada di js/database/search/*.js dan memakai loader ini.
 *
 * - Tiap tabel = satu file JSON di database/tables/<nama>.json, dimuat saat dibutuhkan lalu di-cache.
 * - Path dihitung relatif terhadap lokasi file ini (../../database/), jadi aman di GitHub Pages
 *   baik di https://user.github.io/ maupun https://user.github.io/nama-repo/.
 */
(function (root) {
  'use strict';

  function createLoader(opts) {
    opts = opts || {};
    const doFetch = opts.fetch || (typeof fetch === 'function' ? fetch.bind(root) : null);
    let base = opts.base;
    if (!base) {
      const cs = root.document && root.document.currentScript;
      if (cs && cs.src) base = new URL('../../database/', cs.src).href;
      else if (root.document) base = new URL('database/', root.document.baseURI).href;
      else base = 'database/';
    }
    if (base.slice(-1) !== '/') base += '/';

    const pending = Object.create(null);   // promise per kunci (dedupe request yang sedang berjalan)
    const rowsCache = Object.create(null); // nama tabel -> array objek
    const idxCache = Object.create(null);  // 'tabel|kolom' -> {id: baris}
    const grpCache = Object.create(null);  // 'tabel|kolom' -> {id: [baris]}
    let bytesLoaded = 0;

    async function getJSON(path) {
      if (!doFetch) throw new Error('fetch() tidak tersedia di lingkungan ini');
      const res = await doFetch(base + path);
      if (!res.ok) throw new Error('File database tidak ditemukan: ' + path + ' (HTTP ' + res.status + ')');
      return res.json();
    }
    function once(key, fn) {
      if (pending[key]) return pending[key];
      const p = fn().catch(function (e) { delete pending[key]; throw e; }); // gagal -> boleh dicoba lagi
      return (pending[key] = p);
    }

    const api = {
      base: base,
      /** Path aset dari manifest (relatif root project) -> URL penuh, aman untuk sub-path GitHub Pages. */
      assetURL(p) { try { return new URL('../' + p, base).href; } catch (e) { return p; } },

      manifest() { return once('manifest', function () { return getJSON('manifest.json'); }); },
      translations() { return once('dbtr', function () { return getJSON('dbtr.json'); }); },
      icons() { return once('icons', function () { return getJSON('icons-manifest.json'); }); },

      /** Daftar nama tabel (dari manifest). */
      async tableNames() { return Object.keys((await api.manifest()).tables); },

      /** Satu tabel sebagai array objek {kolom: nilai}. */
      table(name) {
        if (rowsCache[name]) return Promise.resolve(rowsCache[name]);
        return once('t:' + name, async function () {
          const man = await api.manifest();
          const info = man.tables[name];
          if (!info) throw new Error('Tabel tidak dikenal: ' + name);
          const j = await getJSON(info.file);
          const cols = j.columns, n = cols.length, out = new Array(j.rows.length);
          for (let i = 0; i < out.length; i++) {
            const r = j.rows[i], o = {};
            for (let c = 0; c < n; c++) o[cols[c]] = r[c];
            out[i] = o;
          }
          bytesLoaded += info.bytes || 0;
          return (rowsCache[name] = out);
        });
      },

      /** Beberapa tabel sekaligus (paralel). Hasil: {nama: rows}. */
      async tables(names) {
        const uniq = Array.from(new Set(names));
        const list = await Promise.all(uniq.map(function (n) { return api.table(n); }));
        const out = {};
        uniq.forEach(function (n, i) { out[n] = list[i]; });
        return out;
      },

      /** Muat semua tabel milik satu grup di manifest (mis. 'monster', 'quest'). */
      async loadGroup(groupName) {
        const man = await api.manifest();
        const names = Object.keys(man.tables).filter(function (n) { return man.tables[n].group === groupName; });
        return api.tables(names);
      },

      /** Peta {id: baris}. Memuat tabelnya kalau belum ada. */
      async index(name, key) {
        key = key || '_id';
        const k = name + '|' + key;
        if (idxCache[k]) return idxCache[k];
        const rows = await api.table(name);
        const m = Object.create(null);
        for (let i = 0; i < rows.length; i++) m[rows[i][key]] = rows[i];
        return (idxCache[k] = m);
      },

      /** Peta {nilai: [baris...]} untuk tabel relasi. */
      async groupBy(name, key) {
        const k = name + '|' + key;
        if (grpCache[k]) return grpCache[k];
        const rows = await api.table(name);
        const m = Object.create(null);
        for (let i = 0; i < rows.length; i++) (m[rows[i][key]] || (m[rows[i][key]] = [])).push(rows[i]);
        return (grpCache[k] = m);
      },

      // ---- akses sinkron setelah tabel dimuat ----
      isLoaded(name) { return !!rowsCache[name]; },
      peek(name) { return rowsCache[name]; },
      loadedTables() { return Object.keys(rowsCache); },
      stats() { return { loaded: Object.keys(rowsCache), approxBytes: bytesLoaded, base: base }; }
    };
    return api;
  }

  const loader = createLoader();
  loader.createLoader = createLoader;
  root.MH4UDatabaseLoader = loader;
  if (typeof module !== 'undefined' && module.exports) module.exports = { createLoader: createLoader };
})(typeof window !== 'undefined' ? window : globalThis);
