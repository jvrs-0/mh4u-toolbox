/* Pencarian quest. Tabel dasar: quests + locations (kecil). Monster dan hadiah dimuat hanya saat filternya dipakai. */
(function (root) {
  'use strict';
  const S = root.MH4USearch, U = S.util;

  S.register({
    name: 'quests',
    label: 'Quest',
    needs: ['quests', 'locations'],
    defaultSort: 'stars',
    sorts: {
      name: function (a, b) { return U.cmpStr(U.norm(a.name), U.norm(b.name)) || (a.id - b.id); },
      stars: function (a, b) { return U.cmpStr(a.hub, b.hub) || (a.stars - b.stars) || U.cmpStr(U.norm(a.name), U.norm(b.name)); },
      reward: function (a, b) { return (b.reward - a.reward) || (a.id - b.id); }
    },
    filters: {
      hub: { about: 'Guild, Caravan, atau Event (boleh array)' },
      type: { about: 'Normal, Key, atau Urgent (boleh array)' },
      stars: { about: 'bintang persis (1-10)' }, starsMin: {}, starsMax: {},
      location: { about: 'id atau nama lokasi' },
      monster: { needs: ['monster_to_quest', 'monsters'], about: 'id atau nama monster yang ada di quest' },
      rewardItem: { needs: ['quest_rewards', 'items'], about: 'id atau nama item yang menjadi hadiah quest' }
    },
    facets: function (ctx) {
      const hub = {}, type = {}, stars = {};
      ctx.rows('quests').forEach(function (q) {
        hub[q.hub] = (hub[q.hub] || 0) + 1; type[q.type] = (type[q.type] || 0) + 1; stars[q.stars] = (stars[q.stars] || 0) + 1;
      });
      return { hub: hub, type: type, stars: stars };
    },
    run: function (ctx, q, f) {
      const rows = ctx.rows('quests'), locs = ctx.index('locations');
      const names = ctx.cache('qst|name', function () { return rows.map(function (r) { return U.norm(r.name); }); });
      const goals = ctx.cache('qst|goal', function () { return rows.map(function (r) { return U.norm(r.goal + ' ' + (r.sub_goal === 'None' ? '' : r.sub_goal)); }); });
      const hub = U.toSet(f.hub), type = U.toSet(f.type);
      const sMin = U.present(f.starsMin) ? +f.starsMin : null, sMax = U.present(f.starsMax) ? +f.starsMax : null;
      const locSet = U.present(f.location) ? ctx.resolve('locations', f.location) : null;
      let qByMon = null;
      if (U.present(f.monster)) {
        const ms = ctx.resolve('monsters', f.monster);
        qByMon = new Set();
        ctx.rows('monster_to_quest').forEach(function (x) { if (ms.has(x.monster_id)) qByMon.add(x.quest_id); });
      }
      let qByItem = null;
      if (U.present(f.rewardItem)) {
        const its = ctx.resolve('items', f.rewardItem);
        qByItem = new Set();
        ctx.rows('quest_rewards').forEach(function (x) { if (its.has(x.item_id)) qByItem.add(x.quest_id); });
      }
      const out = [];
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        if (hub && !hub.has(U.strip(r.hub))) continue;
        if (type && !type.has(U.strip(r.type))) continue;
        if (U.present(f.stars) && r.stars !== +f.stars) continue;
        if (!U.inRange(r.stars, sMin, sMax)) continue;
        if (locSet && !locSet.has(r.location_id)) continue;
        if (qByMon && !qByMon.has(r._id)) continue;
        if (qByItem && !qByItem.has(r._id)) continue;
        const s = U.match(names[i], goals[i], q);
        if (!s) continue;
        out.push({
          id: r._id, name: r.name, goal: r.goal, hub: r.hub, type: r.type, stars: r.stars,
          locationId: r.location_id, location: (locs[r.location_id] || {}).name || '',
          timeLimit: r.time_limit, fee: r.fee, reward: r.reward, hrp: r.hrp,
          subGoal: r.sub_goal === 'None' ? '' : r.sub_goal, subReward: r.sub_reward, subHrp: r.sub_hrp, score: s
        });
      }
      return out;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
