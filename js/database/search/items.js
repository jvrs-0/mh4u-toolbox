/* Pencarian item umum (potion, bom, peluru, buku, dll.).
 * Sama seperti menu Items di app: senjata/armor/decoration dikecualikan kecuali includeEquipment:true. */
(function (root) {
  'use strict';
  const S = root.MH4USearch, U = S.util;
  const EQUIP = { weapon: 1, armor: 1, decoration: 1 };

  S.register({
    name: 'items',
    label: 'Item',
    needs: ['items'],
    defaultSort: 'name',
    sorts: {
      name: function (a, b) { return U.cmpStr(U.norm(a.name), U.norm(b.name)) || (a.id - b.id); },
      rarity: function (a, b) { return (b.rarity - a.rarity) || U.cmpStr(U.norm(a.name), U.norm(b.name)); },
      sell: function (a, b) { return (b.sell || 0) - (a.sell || 0) || (a.id - b.id); }
    },
    filters: {
      type: { about: 'tipe item, mis. "Tool", "Ammo", "Consumable" (boleh array). Item tanpa tipe: gunakan "none"' },
      rarity: { about: 'rarity persis (1-10)' },
      rarityMin: {}, rarityMax: {},
      includeEquipment: { about: 'true = ikut sertakan Weapon/Armor/Decoration' }
    },
    facets: function (ctx) {
      const c = {};
      ctx.rows('items').forEach(function (i) {
        if (EQUIP[U.strip(i.type)]) return;
        const t = i.type || 'none'; c[t] = (c[t] || 0) + 1;
      });
      return { type: c };
    },
    run: function (ctx, q, f) {
      const rows = ctx.rows('items');
      const names = ctx.cache('item|name', function () { return rows.map(function (i) { return U.norm(i.name); }); });
      const desc = ctx.cache('item|desc', function () { return rows.map(function (i) { return U.norm(i.description); }); });
      const types = U.toSet(f.type);
      const out = [];
      for (let i = 0; i < rows.length; i++) {
        const it = rows[i];
        if (!it.name) continue;
        const t = U.strip(it.type);
        if (!f.includeEquipment && EQUIP[t]) continue;
        if (types && !types.has(t || 'none')) continue;
        if (U.present(f.rarity) && it.rarity !== +f.rarity) continue;
        if (!U.inRange(it.rarity, U.present(f.rarityMin) ? +f.rarityMin : null, U.present(f.rarityMax) ? +f.rarityMax : null)) continue;
        const s = U.match(names[i], desc[i], q);
        if (!s) continue;
        out.push({ id: it._id, name: it.name, type: it.type, subType: it.sub_type, rarity: it.rarity,
          carryCapacity: it.carry_capacity, buy: it.buy === '' ? null : it.buy, sell: it.sell === '' ? null : it.sell,
          description: it.description || '', score: s });
      }
      return out;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
