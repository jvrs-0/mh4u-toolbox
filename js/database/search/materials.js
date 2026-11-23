/* Pencarian material (bahan crafting: bagian monster, bijih, tulang, serangga, tumbuhan, dll.).
 *
 * Definisi "material" berdasarkan audit data: tipe item yang benar-benar muncul sebagai bahan
 * (components) atau drop/gathering. Tipe tanpa pemakaian seperti Scrap, Book, Ammo, Coating, Wystone
 * tidak dianggap material. Daftar tipe bisa diganti lewat filters.type.
 *
 * Tabel dasar hanya items. Drop monster (hunting_rewards) dan gathering dimuat hanya
 * saat filter monster / location / source dipakai. */
(function (root) {
  'use strict';
  const S = root.MH4USearch, U = S.util;
  const MATERIAL_TYPES = ['Flesh', 'Ore', 'Account', 'Bone', 'Bug', 'Sac/Fluid', 'Plant', 'Nectar', 'Fish', 'Coin/Ticket'];
  const TYPESET = new Set(MATERIAL_TYPES.map(U.strip));

  S.register({
    name: 'materials',
    label: 'Material',
    needs: ['items'],
    defaultSort: 'name',
    materialTypes: MATERIAL_TYPES,
    sorts: {
      name: function (a, b) { return U.cmpStr(U.norm(a.name), U.norm(b.name)) || (a.id - b.id); },
      rarity: function (a, b) { return (b.rarity - a.rarity) || U.cmpStr(U.norm(a.name), U.norm(b.name)); },
      sell: function (a, b) { return (b.sell || 0) - (a.sell || 0) || (a.id - b.id); }
    },
    filters: {
      type: { about: 'Flesh (bagian monster), Ore, Account (mineral/misc), Bone, Bug, Sac/Fluid, Plant, Nectar, Fish, Coin/Ticket' },
      rarity: {}, rarityMin: {}, rarityMax: {},
      monster: { needs: ['hunting_rewards', 'monsters'], about: 'id/nama monster yang men-drop material ini' },
      condition: { about: 'dipakai bersama monster: Body Carve, Tail Carve, Capture, Shiny Drop, Break Head, Break Back, Break Wing, Virus Reward' },
      location: { needs: ['gathering', 'locations'], about: 'id/nama lokasi gathering' },
      rank: { about: 'LR, HR, atau G; berlaku untuk drop monster dan gathering' }
    },
    facets: function (ctx) {
      const c = {};
      ctx.rows('items').forEach(function (i) { if (TYPESET.has(U.strip(i.type))) c[i.type] = (c[i.type] || 0) + 1; });
      return { type: c, rank: ['LR', 'HR', 'G'] };
    },
    run: function (ctx, q, f) {
      const rows = ctx.rows('items');
      const names = ctx.cache('mat|name', function () { return rows.map(function (i) { return U.norm(i.name); }); });
      const types = U.toSet(f.type);
      const rank = U.toSet(f.rank), cond = U.toSet(f.condition);
      const rMin = U.present(f.rarityMin) ? +f.rarityMin : null, rMax = U.present(f.rarityMax) ? +f.rarityMax : null;

      // sumber: item_id -> daftar drop yang lolos filter (monster / gathering)
      let drops = null, spots = null;
      if (U.present(f.monster)) {
        const ms = ctx.resolve('monsters', f.monster), mons = ctx.index('monsters');
        drops = Object.create(null);
        ctx.rows('hunting_rewards').forEach(function (h) {
          if (!ms.has(h.monster_id)) return;
          if (rank && !rank.has(U.strip(h.rank))) return;
          if (cond && !cond.has(U.strip(h.condition))) return;
          (drops[h.item_id] || (drops[h.item_id] = [])).push({
            monsterId: h.monster_id, monster: (mons[h.monster_id] || {}).name, condition: h.condition,
            rank: h.rank, stack: h.stack_size, percent: h.percentage });
        });
      }
      if (U.present(f.location)) {
        const ls = ctx.resolve('locations', f.location), locs = ctx.index('locations');
        spots = Object.create(null);
        ctx.rows('gathering').forEach(function (g) {
          if (!ls.has(g.location_id)) return;
          if (rank && !rank.has(U.strip(g.rank))) return;
          (spots[g.item_id] || (spots[g.item_id] = [])).push({
            locationId: g.location_id, location: (locs[g.location_id] || {}).name, area: g.area, site: g.site,
            rank: g.rank, quantity: g.quantity, percent: g.percentage });
        });
      }
      const out = [];
      for (let i = 0; i < rows.length; i++) {
        const it = rows[i];
        if (!it.name) continue;
        const t = U.strip(it.type);
        if (types ? !types.has(t) : !TYPESET.has(t)) continue;
        if (U.present(f.rarity) && it.rarity !== +f.rarity) continue;
        if (!U.inRange(it.rarity, rMin, rMax)) continue;
        if (drops && !drops[it._id]) continue;
        if (spots && !spots[it._id]) continue;
        const s = U.match(names[i], '', q);
        if (!s) continue;
        const r = { id: it._id, name: it.name, type: it.type, rarity: it.rarity, carryCapacity: it.carry_capacity,
          buy: it.buy === '' ? null : it.buy, sell: it.sell === '' ? null : it.sell, description: it.description || '', score: s };
        if (drops) r.drops = drops[it._id];
        if (spots) r.gathering = spots[it._id];
        out.push(r);
      }
      return out;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
