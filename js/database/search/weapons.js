/* Pencarian senjata. Nama dan rarity ada di tabel items; statistik di tabel weapons (id sama). */
(function (root) {
  'use strict';
  const S = root.MH4USearch, U = S.util;

  S.register({
    name: 'weapons',
    label: 'Senjata',
    needs: ['items', 'weapons'],
    defaultSort: 'name',
    sorts: {
      name: function (a, b) { return U.cmpStr(U.norm(a.name), U.norm(b.name)) || (a.id - b.id); },
      attack: function (a, b) { return (b.attack - a.attack) || U.cmpStr(U.norm(a.name), U.norm(b.name)); },
      rarity: function (a, b) { return (b.rarity - a.rarity) || (b.attack - a.attack); },
      affinity: function (a, b) { return (b.affinity - a.affinity) || (b.attack - a.attack); },
      slots: function (a, b) { return (b.slots - a.slots) || (b.attack - a.attack); }
    },
    filters: {
      wtype: { about: 'jenis senjata, mis. "Great Sword", "Bow" (boleh array)' },
      element: { about: 'elemen/status: Fire, Water, Thunder, Ice, Dragon, Poison, Paralysis, Sleep, Blastblight (cocok juga ke elemen kedua)' },
      minAttack: {}, maxAttack: {},
      minSlots: { about: 'minimal slot decoration (0-3)' },
      rarity: {}, rarityMin: {}, rarityMax: {},
      finalOnly: { about: 'true = hanya senjata akhir cabang (final = 1)' }
    },
    facets: function (ctx) {
      const w = {}, e = {};
      ctx.rows('weapons').forEach(function (r) {
        w[r.wtype] = (w[r.wtype] || 0) + 1;
        if (r.element) e[r.element] = (e[r.element] || 0) + 1;
      });
      return { wtype: w, element: e };
    },
    run: function (ctx, q, f) {
      const rows = ctx.rows('weapons'), items = ctx.index('items');
      const names = ctx.cache('wpn|name', function () { return rows.map(function (w) { return U.norm((items[w._id] || {}).name); }); });
      const wt = U.toSet(f.wtype), el = U.toSet(f.element);
      const rMin = U.present(f.rarityMin) ? +f.rarityMin : null, rMax = U.present(f.rarityMax) ? +f.rarityMax : null;
      const out = [];
      for (let i = 0; i < rows.length; i++) {
        const w = rows[i], it = items[w._id];
        if (!it || !it.name) continue;
        if (wt && !wt.has(U.strip(w.wtype))) continue;
        if (el && !el.has(U.strip(w.element)) && !el.has(U.strip(w.element_2))) continue;
        if (U.present(f.minAttack) && w.attack < +f.minAttack) continue;
        if (U.present(f.maxAttack) && w.attack > +f.maxAttack) continue;
        if (U.present(f.minSlots) && w.num_slots < +f.minSlots) continue;
        if (U.present(f.rarity) && it.rarity !== +f.rarity) continue;
        if (!U.inRange(it.rarity, rMin, rMax)) continue;
        if (f.finalOnly && w.final !== 1) continue;
        const s = U.match(names[i], '', q);
        if (!s) continue;
        out.push({
          id: w._id, name: it.name, wtype: w.wtype, rarity: it.rarity, attack: w.attack,
          element: w.element || '', elementAttack: U.num(w.element_attack),
          element2: w.element_2 || '', element2Attack: U.num(w.element_2_attack),
          affinity: U.num(w.affinity), defense: U.num(w.defense), slots: w.num_slots,
          sharpness: w.sharpness || '', parentId: w.parent_id || null, treeDepth: w.tree_depth, final: w.final === 1,
          score: s
        });
      }
      return out;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
