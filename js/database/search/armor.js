/* Pencarian armor. Nama/rarity dari items; statistik dari armor (id sama).
 * Catatan data: armor 3753 (Hawkeye Earring) tidak punya hunter_type/gender; ia hanya muncul
 * bila filter hunterType/gender tidak dipakai. */
(function (root) {
  'use strict';
  const S = root.MH4USearch, U = S.util;

  S.register({
    name: 'armor',
    label: 'Armor',
    needs: ['items', 'armor'],
    defaultSort: 'name',
    sorts: {
      name: function (a, b) { return U.cmpStr(U.norm(a.name), U.norm(b.name)) || (a.id - b.id); },
      defense: function (a, b) { return (b.maxDefense - a.maxDefense) || U.cmpStr(U.norm(a.name), U.norm(b.name)); },
      rarity: function (a, b) { return (b.rarity - a.rarity) || (b.maxDefense - a.maxDefense); },
      slots: function (a, b) { return (b.slots - a.slots) || (b.maxDefense - a.maxDefense); }
    },
    filters: {
      slot: { about: 'Head, Body, Arms, Waist, Legs (boleh array)' },
      hunterType: { about: "'Blade' atau 'Gunner'; armor bertipe 'Both' ikut muncul" },
      gender: { about: "'Male' atau 'Female'; armor bertipe 'Both' ikut muncul" },
      minDefense: { about: 'minimal defense awal' },
      minSlots: {},
      rarity: {}, rarityMin: {}, rarityMax: {},
      skill: { needs: ['item_to_skill_tree', 'skill_trees'], about: 'id atau nama skill tree, mis. "Attack Up"' },
      skillMin: { about: 'minimal poin skill, bawaan 1' }
    },
    facets: function (ctx) {
      const s = {}, h = {};
      ctx.rows('armor').forEach(function (a) { s[a.slot] = (s[a.slot] || 0) + 1; const k = a.hunter_type || 'unknown'; h[k] = (h[k] || 0) + 1; });
      return { slot: s, hunterType: h };
    },
    run: function (ctx, q, f) {
      const rows = ctx.rows('armor'), items = ctx.index('items');
      const names = ctx.cache('arm|name', function () { return rows.map(function (a) { return U.norm((items[a._id] || {}).name); }); });
      const slots = U.toSet(f.slot);
      const ht = U.present(f.hunterType) ? U.strip(f.hunterType).trim() : null;
      const gd = U.present(f.gender) ? U.strip(f.gender).trim() : null;
      const rMin = U.present(f.rarityMin) ? +f.rarityMin : null, rMax = U.present(f.rarityMax) ? +f.rarityMax : null;
      let skillIds = null, skillBy = null, skillMin = U.present(f.skillMin) ? +f.skillMin : 1, trees = null;
      if (U.present(f.skill)) {
        skillIds = ctx.resolve('skill_trees', f.skill);
        skillBy = ctx.group('item_to_skill_tree', 'item_id');
        trees = ctx.index('skill_trees');
      }
      const out = [];
      for (let i = 0; i < rows.length; i++) {
        const a = rows[i], it = items[a._id];
        if (!it || !it.name) continue;
        if (slots && !slots.has(U.strip(a.slot))) continue;
        if (ht) { const t = U.strip(a.hunter_type); if (t !== ht && t !== 'both') continue; }
        if (gd) { const g = U.strip(a.gender); if (g !== gd && g !== 'both') continue; }
        if (U.present(f.minDefense) && a.defense < +f.minDefense) continue;
        if (U.present(f.minSlots) && a.num_slots < +f.minSlots) continue;
        if (U.present(f.rarity) && it.rarity !== +f.rarity) continue;
        if (!U.inRange(it.rarity, rMin, rMax)) continue;
        let sk = null;
        if (skillIds) {
          sk = (skillBy[a._id] || []).filter(function (x) { return skillIds.has(x.skill_tree_id) && x.point_value >= skillMin; });
          if (!sk.length) continue;
        }
        const s = U.match(names[i], '', q);
        if (!s) continue;
        const r = {
          id: a._id, name: it.name, slot: a.slot, rarity: it.rarity, defense: a.defense, maxDefense: a.max_defense,
          resist: { fire: a.fire_res, water: a.water_res, thunder: a.thunder_res, ice: a.ice_res, dragon: a.dragon_res },
          slots: a.num_slots, hunterType: a.hunter_type, gender: a.gender, score: s
        };
        if (sk) r.skills = sk.map(function (x) { return { skillTreeId: x.skill_tree_id, skill: (trees[x.skill_tree_id] || {}).name, points: x.point_value }; });
        out.push(r);
      }
      return out;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
