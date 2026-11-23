# API pencarian database

Semua fungsi async dan mengembalikan `{ module, query, total, offset, limit, sort, results, tablesUsed, ignoredFilters }`.

```js
MH4USearch.search(modul, kueri, { filters, sort, limit = 50, offset = 0 })
MH4USearch.searchAll(kueri, { modules, limit = 5 })   // hanya memuat tabel dasar tiap modul
MH4USearch.facets(modul)                              // hitungan per nilai untuk chip filter
MH4USearch.describe()                                 // daftar modul, filter, dan tabel yang dimuat
```

Kueri dinormalisasi (huruf kecil, tanpa aksen, simbol jadi spasi) dan **semua kata** harus cocok. Urutan relevansi: nama persis, diawali kueri, awal kata, substring, kata tersebar. `sort` bawaan: `relevance` bila ada kueri, selain itu sort bawaan modul. Filter yang tidak dikenal tidak error, tetapi dilaporkan di `ignoredFilters`.

Kolom "Tabel tambahan" hanya dimuat bila filter itu dipakai.

| Modul | Tabel dasar | Filter (tabel tambahan) | Sort |
|---|---|---|---|
| `monsters` | monsters | `class`; `weakness`, `weaknessMin` (monster_weakness); `ailment` (monster_ailment); `location` (monster_habitat, locations) | name, id |
| `items` | items | `type` ("none" = tanpa tipe), `rarity`, `rarityMin/Max`, `includeEquipment` | name, rarity, sell |
| `weapons` | items, weapons | `wtype`, `element` (juga elemen kedua), `minAttack/maxAttack`, `minSlots`, `rarity*`, `finalOnly` | name, attack, rarity, affinity, slots |
| `armor` | items, armor | `slot`, `hunterType`, `gender` (tipe `Both` ikut), `minDefense`, `minSlots`, `rarity*`; `skill`, `skillMin` (item_to_skill_tree, skill_trees) | name, defense, rarity, slots |
| `quests` | quests, locations | `hub`, `type`, `stars`, `starsMin/Max`, `location`; `monster` (monster_to_quest, monsters); `rewardItem` (quest_rewards, items) | stars, name, reward |
| `materials` | items | `type`, `rarity*`; `monster`, `condition` (hunting_rewards, monsters); `location` (gathering, locations); `rank` | name, rarity, sell |

Catatan perilaku:

- `weakness` memakai skala bintang 0-3 dari data; bawaan `weaknessMin` = 2. Monster dinilai dari state terbaiknya (Normal/Enraged/Charged).
- `materials` = item bertipe Flesh, Ore, Account, Bone, Bug, Sac/Fluid, Plant, Nectar, Fish, Coin/Ticket. Tipe lain (Scrap, Book, Ammo, Coating, Wystone, Tool, Consumable, Supply, Meat, Commodity) tidak dianggap material. Hasil dengan filter `monster`/`location` menyertakan `drops`/`gathering`.
- Nilai filter `monster`, `location`, `skill`, `rewardItem` boleh berupa id atau nama (persis dulu, lalu sebagian), atau array.
- Armor tanpa `hunter_type`/`gender` (id 3753) hanya muncul bila filter itu tidak dipakai.

Loader (`MH4UDatabaseLoader`): `manifest()`, `table(nama)`, `tables([nama])`, `loadGroup(grup)`, `index(tabel, kolom)`, `groupBy(tabel, kolom)`, `peek(nama)`, `isLoaded(nama)`, `loadedTables()`, `stats()`, `assetURL(path)`, `translations()`, `icons()`.
