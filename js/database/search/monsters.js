/* Pencarian monster. Tabel dasar: monsters. Filter lain memuat tabelnya sendiri saat dipakai. */
(function (root) {
  'use strict';
  const S = root.MH4USearch, U = S.util;
  // kolom kelemahan yang benar-benar ada di monster_weakness (skala 0-3 bintang)
  const WEAK = ['fire', 'water', 'thunder', 'ice', 'dragon', 'poison', 'paralysis', 'sleep'];

  S.register({
    name: 'monsters',
    label: 'Monster',
    needs: ['monsters'],
    defaultSort: 'name',
    sorts: {
      name: function (a, b) { return U.cmpStr(a._sort, b._sort) || (a.id - b.id); },
      id: function (a, b) { return a.id - b.id; }
    },
    filters: {
      class: { about: "'Boss' atau 'Minion'" },
      weakness: { needs: ['monster_weakness'], about: 'fire|water|thunder|ice|dragon|poison|paralysis|sleep (boleh array); minimal bintang diatur weaknessMin, bawaan 2' },
      weaknessMin: { about: 'minimal bintang kelemahan (1-3), bawaan 2' },
      ailment: { needs: ['monster_ailment'], about: 'nama ailment, mis. "Fireblight" (cocok sebagian)' },
      location: { needs: ['monster_habitat', 'locations'], about: 'id atau nama lokasi' }
    },
    facets: function (ctx) {
      const c = {};
      ctx.rows('monsters').forEach(function (m) { c[m.class] = (c[m.class] || 0) + 1; });
      return { class: c, weakness: WEAK.slice() };
    },
    run: function (ctx, q, f) {
      const rows = ctx.rows('monsters');
      const names = ctx.cache('mon|name', function () { return rows.map(function (m) { return U.norm(m.name); }); });
      const sig = ctx.cache('mon|sig', function () { return rows.map(function (m) { return U.norm(m.signature_move); }); });
      const cls = U.toSet(f.class);

      let weakKeys = null, weakMin = 2, weakBy = null;
      if (U.present(f.weakness)) {
        weakKeys = (Array.isArray(f.weakness) ? f.weakness : [f.weakness]).map(function (k) { return U.strip(k).trim(); });
        weakKeys.forEach(function (k) { if (WEAK.indexOf(k) < 0) throw new Error('weakness tidak dikenal: ' + k + ' (pilihan: ' + WEAK.join(', ') + ')'); });
        weakMin = U.present(f.weaknessMin) ? +f.weaknessMin : 2;
        weakBy = ctx.group('monster_weakness', 'monster_id');
      }
      let ail = null, ailBy = null;
      if (U.present(f.ailment)) { ail = U.norm(f.ailment); ailBy = ctx.group('monster_ailment', 'monster_id'); }
      let locSet = null, habBy = null;
      if (U.present(f.location)) { locSet = ctx.resolve('locations', f.location); habBy = ctx.group('monster_habitat', 'monster_id'); }

      const out = [];
      for (let i = 0; i < rows.length; i++) {
        const m = rows[i];
        if (cls && !cls.has(U.strip(m.class))) continue;
        const s = U.match(names[i], sig[i], q);
        if (!s) continue;
        let weakStars = null;
        if (weakKeys) {
          // kelemahan dihitung dari state terbaik (Normal/Enraged/Charged) agar monster tidak hilang di state tertentu
          const st = weakBy[m._id] || [];
          let best = 0;
          st.forEach(function (w) { weakKeys.forEach(function (k) { best = Math.max(best, U.num(w[k])); }); });
          if (best < weakMin) continue;
          weakStars = best;
        }
        if (ail && !(ailBy[m._id] || []).some(function (a) { return U.norm(a.ailment).indexOf(ail) >= 0; })) continue;
        if (locSet && !(habBy[m._id] || []).some(function (h) { return locSet.has(h.location_id); })) continue;
        const r = { id: m._id, name: m.name, class: m.class, signatureMove: m.signature_move || '', score: s, _sort: U.norm(m.sort_name || m.name) };
        if (weakStars !== null) r.weaknessStars = weakStars;
        out.push(r);
      }
      return out;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
