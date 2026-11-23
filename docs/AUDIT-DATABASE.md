# Audit database MH4U Toolbox (Stage 5)

Dibuat otomatis oleh `tools/build-database.py` dari `tools/source/dbz.gz`. Jangan edit manual; jalankan ulang skrip.

## 1. Ringkasan 24 tabel

| Tabel | Baris | Kolom | Ukuran JSON | Grup | Isi |
|---|---:|---:|---:|---|---|
| `armor` | 3087 | 12 | 151.3 KB | equipment | Statistik armor; _id sama dengan items._id |
| `combining` | 168 | 6 | 3.5 KB | crafting | Resep combining item |
| `components` | 23102 | 4 | 511.6 KB | crafting | Bahan untuk Create/Improve senjata dan armor |
| `decorations` | 289 | 2 | 2.6 KB | equipment | Jumlah slot decoration; _id sama dengan items._id |
| `gathering` | 7419 | 7 | 247.6 KB | world | Titik gathering per lokasi/area |
| `horn_melodies` | 143 | 6 | 10.5 KB | equipment | Melodi Hunting Horn |
| `hunting_rewards` | 4336 | 6 | 134.6 KB | monster | Drop dari monster (carve, break, capture, dll.) |
| `item_to_skill_tree` | 11947 | 3 | 145.7 KB | skills | Poin skill dari item/armor/decoration |
| `items` | 7324 | 9 | 432.4 KB | core | Semua item, termasuk senjata/armor/decoration (nama, tipe, rarity, harga) |
| `locations` | 20 | 2 | 0.4 KB | core | Daftar lokasi/peta |
| `monster_ailment` | 261 | 2 | 5.1 KB | monster | Ailment yang bisa ditimbulkan monster |
| `monster_damage` | 986 | 11 | 42.4 KB | monster | Damage multiplier per bagian tubuh |
| `monster_habitat` | 147 | 5 | 3.0 KB | monster | Habitat monster per lokasi dan area |
| `monster_status` | 784 | 7 | 21.2 KB | monster | Resistensi status abnormal monster |
| `monster_to_quest` | 912 | 3 | 12.7 KB | quest | Relasi monster dengan quest |
| `monster_weakness` | 112 | 16 | 4.8 KB | monster | Kelemahan elemen/status/trap per state |
| `monsters` | 106 | 6 | 6.6 KB | monster | Daftar monster |
| `quest_prereqs` | 319 | 2 | 2.9 KB | quest | Prasyarat quest |
| `quest_rewards` | 10300 | 5 | 192.5 KB | quest | Hadiah quest per slot |
| `quests` | 569 | 14 | 64.8 KB | quest | Daftar quest (hub, bintang, lokasi, hadiah) |
| `skill_trees` | 144 | 2 | 2.4 KB | skills | Daftar skill tree (nama) |
| `skills` | 277 | 5 | 24.1 KB | skills | Level skill per skill tree beserta deskripsi |
| `weapons` | 2324 | 30 | 414.7 KB | equipment | Statistik senjata; _id sama dengan items._id |
| `wyporium` | 128 | 3 | 1.9 KB | crafting | Tukar item Wyporium |

## 2. Kolom tiap tabel

- **armor**: `_id`, `slot`, `defense`, `max_defense`, `fire_res`, `thunder_res`, `dragon_res`, `water_res`, `ice_res`, `gender`, `hunter_type`, `num_slots`
- **combining**: `created_item_id`, `item_1_id`, `item_2_id`, `amount_made_min`, `amount_made_max`, `percentage`
- **components**: `created_item_id`, `component_item_id`, `quantity`, `type`
- **decorations**: `_id`, `num_slots`
- **gathering**: `item_id`, `location_id`, `area`, `site`, `rank`, `quantity`, `percentage`
- **horn_melodies**: `notes`, `song`, `effect1`, `effect2`, `duration`, `extension`
- **hunting_rewards**: `item_id`, `condition`, `monster_id`, `rank`, `stack_size`, `percentage`
- **item_to_skill_tree**: `item_id`, `skill_tree_id`, `point_value`
- **items**: `_id`, `name`, `type`, `sub_type`, `rarity`, `carry_capacity`, `buy`, `sell`, `description`
- **locations**: `_id`, `name`
- **monster_ailment**: `monster_id`, `ailment`
- **monster_damage**: `monster_id`, `body_part`, `cut`, `impact`, `shot`, `fire`, `water`, `ice`, `thunder`, `dragon`, `ko`
- **monster_habitat**: `monster_id`, `location_id`, `start_area`, `move_area`, `rest_area`
- **monster_status**: `monster_id`, `status`, `initial`, `increase`, `max`, `duration`, `damage`
- **monster_to_quest**: `monster_id`, `quest_id`, `unstable`
- **monster_weakness**: `monster_id`, `state`, `fire`, `water`, `thunder`, `ice`, `dragon`, `poison`, `paralysis`, `sleep`, `pitfall_trap`, `shock_trap`, `flash_bomb`, `sonic_bomb`, `dung_bomb`, `meat`
- **monsters**: `_id`, `class`, `name`, `signature_move`, `trait`, `sort_name`
- **quest_prereqs**: `quest_id`, `prereq_id`
- **quest_rewards**: `quest_id`, `item_id`, `reward_slot`, `percentage`, `stack_size`
- **quests**: `_id`, `name`, `goal`, `hub`, `type`, `stars`, `location_id`, `time_limit`, `fee`, `reward`, `hrp`, `sub_goal`, `sub_reward`, `sub_hrp`
- **skill_trees**: `_id`, `name`
- **skills**: `_id`, `skill_tree_id`, `required_skill_tree_points`, `name`, `description`
- **weapons**: `_id`, `parent_id`, `wtype`, `creation_cost`, `upgrade_cost`, `attack`, `max_attack`, `element`, `element_attack`, `element_2`, `element_2_attack`, `awaken`, `awaken_attack`, `defense`, `sharpness`, `affinity`, `horn_notes`, `shelling_type`, `phial`, `charges`, `coatings`, `recoil`, `reload_speed`, `rapid_fire`, `deviation`, `ammo`, `special_ammo`, `num_slots`, `tree_depth`, `final`
- **wyporium**: `item_in_id`, `item_out_id`, `unlock_quest_id`

## 3. Cek relasi (foreign key)

| Relasi | Baris yatim | Contoh nilai tanpa pasangan |
|---|---:|---|
| `weapons._id` -> `items._id` | 0 | - |
| `weapons.parent_id` -> `weapons._id` | 0 | - |
| `armor._id` -> `items._id` | 0 | - |
| `decorations._id` -> `items._id` | 0 | - |
| `skills.skill_tree_id` -> `skill_trees._id` | 0 | - |
| `item_to_skill_tree.item_id` -> `items._id` | 0 | - |
| `item_to_skill_tree.skill_tree_id` -> `skill_trees._id` | 0 | - |
| `components.created_item_id` -> `items._id` | 0 | - |
| `components.component_item_id` -> `items._id` | 0 | - |
| `combining.created_item_id` -> `items._id` | 0 | - |
| `combining.item_1_id` -> `items._id` | 0 | - |
| `combining.item_2_id` -> `items._id` | 0 | - |
| `monster_damage.monster_id` -> `monsters._id` | 0 | - |
| `monster_weakness.monster_id` -> `monsters._id` | 0 | - |
| `monster_status.monster_id` -> `monsters._id` | 0 | - |
| `monster_ailment.monster_id` -> `monsters._id` | 0 | - |
| `monster_habitat.monster_id` -> `monsters._id` | 0 | - |
| `monster_habitat.location_id` -> `locations._id` | 0 | - |
| `monster_to_quest.monster_id` -> `monsters._id` | 0 | - |
| `monster_to_quest.quest_id` -> `quests._id` | 0 | - |
| `quests.location_id` -> `locations._id` | 0 | - |
| `quest_prereqs.quest_id` -> `quests._id` | 0 | - |
| `quest_prereqs.prereq_id` -> `quests._id` | 0 | - |
| `quest_rewards.quest_id` -> `quests._id` | 0 | - |
| `quest_rewards.item_id` -> `items._id` | 0 | - |
| `hunting_rewards.item_id` -> `items._id` | 0 | - |
| `hunting_rewards.monster_id` -> `monsters._id` | 0 | - |
| `gathering.item_id` -> `items._id` | 0 | - |
| `gathering.location_id` -> `locations._id` | 0 | - |
| `wyporium.item_in_id` -> `items._id` | 0 | - |
| `wyporium.item_out_id` -> `items._id` | 0 | - |
| `wyporium.unlock_quest_id` -> `quests._id` | 0 | - |

Relasi bermasalah: **0** dari 32.

## 4. Distribusi data yang dipakai modul pencarian

- `items.type`: Armor (3087), Weapon (2324), Flesh (874), Decoration (289), Coin/Ticket (121), Scrap (118), Tool (62), Ore (61), Book (55), Account (47), Ammo (37), Plant (36), Nectar (28), Fish (27), Consumable (26), Sac/Fluid (25), Bug (24), Supply (24), Bone (20), Meat (10), Coating (9), Wystone (9), Bait (6), Commodity (4), (kosong) (1)
- `weapons.wtype`: Sword and Shield (204), Great Sword (202), Hammer (200), Dual Blades (187), Long Sword (181), Gunlance (180), Lance (174), Bow (164), Light Bowgun (161), Switch Axe (156), Hunting Horn (150), Insect Glaive (134), Heavy Bowgun (131), Charge Blade (100)
- `armor.slot`: Head (639), Body (625), Legs (613), Arms (611), Waist (599)
- `armor.hunter_type`: Blade (1518), Gunner (1517), Both (51), (kosong) (1)
- `monsters.class`: Boss (83), Minion (23)
- `quests.hub`: Guild (258), Caravan (193), Event (118)
- `quests.type`: Normal (435), Key (92), Urgent (42)
- `quests.stars`: 10 (92), 8 (81), 5 (59), 7 (59), 6 (55), 9 (55), 4 (53), 3 (47), 2 (35), 1 (33)
- `hunting_rewards.rank`: G (2102), HR (1566), LR (668)

## 5. Kolom yang sering kosong (>50% baris)

| Tabel.kolom | Terisi | Kosong |
|---|---:|---:|
| `items.buy` | 3087 | 4237 |
| `items.sell` | 1677 | 5647 |
| `items.description` | 484 | 6840 |
| `monsters.trait` | 0 | 106 |
| `weapons.creation_cost` | 628 | 1696 |
| `weapons.max_attack` | 0 | 2324 |
| `weapons.element_2` | 28 | 2296 |
| `weapons.element_2_attack` | 28 | 2296 |
| `weapons.awaken` | 375 | 1949 |
| `weapons.awaken_attack` | 375 | 1949 |
| `weapons.affinity` | 1009 | 1315 |
| `weapons.horn_notes` | 150 | 2174 |
| `weapons.shelling_type` | 180 | 2144 |
| `weapons.phial` | 256 | 2068 |
| `weapons.charges` | 164 | 2160 |
| `weapons.coatings` | 164 | 2160 |
| `weapons.recoil` | 456 | 1868 |
| `weapons.reload_speed` | 292 | 2032 |
| `weapons.rapid_fire` | 321 | 2003 |
| `weapons.deviation` | 292 | 2032 |
| `weapons.ammo` | 292 | 2032 |
| `weapons.special_ammo` | 282 | 2042 |

## 6. Catatan temuan

- `items` berisi 1 baris dengan `type` kosong (id: 303). Itu item asli (Nectar: Dragon++), bukan sampah; modul `items` tetap mencarinya dan filter tipe memakai nilai `none`.
- `armor` berisi 1 baris tanpa `hunter_type`/`gender` (id: 3753). Baris itu hanya muncul di pencarian bila filter hunterType/gender tidak dipakai.
- Tipe data campuran: `weapons.affinity` berupa string ("10", "-20", ""), `weapons.element_attack` bisa int atau "", `monster_weakness.paralysis` punya satu nilai "". Modul pencarian mengonversinya ke angka.
- `weapons.max_attack` dan `monsters.trait` kosong di semua baris: tidak dipakai modul pencarian.
- Senjata, armor, dan decoration disimpan di `items` (nama, rarity, harga) dan tabel khususnya (statistik). Nama senjata/armor **hanya ada di `items.name`**.
- `monsters` tidak memiliki ikon/gambar di tabelnya; ikon berasal dari `icons-manifest.json`.
- `monster_weakness` punya lebih dari satu baris untuk monster yang memiliki beberapa state (mis. Normal/Enraged).
- Tidak ada kolom deskripsi untuk monster, quest, atau senjata; deskripsi hanya ada pada `items.description` dan `skills.description`.
- Bahasa data: Inggris. Terjemahan label ada di `database/dbtr.json`.
