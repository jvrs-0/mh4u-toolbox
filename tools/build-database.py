#!/usr/bin/env python3
"""Pecah database utama (tools/source/dbz.gz) menjadi satu file JSON per tabel.

Hasil:
  database/tables/<tabel>.json   -> {"columns": [...], "rows": [[...], ...]}
  database/manifest.json         -> daftar tabel, ukuran, kolom, grup, dan versi
  docs/AUDIT-DATABASE.md         -> audit 24 tabel + cek relasi antar tabel

Jalankan dari root project:  python3 tools/build-database.py
"""
import collections, gzip, hashlib, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'tools', 'source', 'dbz.gz')
OUT = os.path.join(ROOT, 'database')
TBL = os.path.join(OUT, 'tables')

# deskripsi + grup untuk loading terarah. pk = kunci utama (None = tabel relasi)
INFO = {
 'items':             ('Semua item, termasuk senjata/armor/decoration (nama, tipe, rarity, harga)', 'core', '_id'),
 'weapons':           ('Statistik senjata; _id sama dengan items._id', 'equipment', '_id'),
 'armor':             ('Statistik armor; _id sama dengan items._id', 'equipment', '_id'),
 'decorations':       ('Jumlah slot decoration; _id sama dengan items._id', 'equipment', '_id'),
 'skill_trees':       ('Daftar skill tree (nama)', 'skills', '_id'),
 'skills':            ('Level skill per skill tree beserta deskripsi', 'skills', '_id'),
 'item_to_skill_tree':('Poin skill dari item/armor/decoration', 'skills', None),
 'components':        ('Bahan untuk Create/Improve senjata dan armor', 'crafting', None),
 'combining':         ('Resep combining item', 'crafting', None),
 'locations':         ('Daftar lokasi/peta', 'core', '_id'),
 'monsters':          ('Daftar monster', 'monster', '_id'),
 'monster_damage':    ('Damage multiplier per bagian tubuh', 'monster', None),
 'monster_weakness':  ('Kelemahan elemen/status/trap per state', 'monster', None),
 'monster_status':    ('Resistensi status abnormal monster', 'monster', None),
 'monster_ailment':   ('Ailment yang bisa ditimbulkan monster', 'monster', None),
 'monster_habitat':   ('Habitat monster per lokasi dan area', 'monster', None),
 'monster_to_quest':  ('Relasi monster dengan quest', 'quest', None),
 'quests':            ('Daftar quest (hub, bintang, lokasi, hadiah)', 'quest', '_id'),
 'quest_prereqs':     ('Prasyarat quest', 'quest', None),
 'quest_rewards':     ('Hadiah quest per slot', 'quest', None),
 'hunting_rewards':   ('Drop dari monster (carve, break, capture, dll.)', 'monster', None),
 'gathering':         ('Titik gathering per lokasi/area', 'world', None),
 'wyporium':          ('Tukar item Wyporium', 'crafting', None),
 'horn_melodies':     ('Melodi Hunting Horn', 'equipment', None),
}
# (tabel, kolom, tabel_tujuan, kolom_tujuan)
FK = [
 ('weapons','_id','items','_id'),('weapons','parent_id','weapons','_id'),
 ('armor','_id','items','_id'),('decorations','_id','items','_id'),
 ('skills','skill_tree_id','skill_trees','_id'),
 ('item_to_skill_tree','item_id','items','_id'),('item_to_skill_tree','skill_tree_id','skill_trees','_id'),
 ('components','created_item_id','items','_id'),('components','component_item_id','items','_id'),
 ('combining','created_item_id','items','_id'),('combining','item_1_id','items','_id'),('combining','item_2_id','items','_id'),
 ('monster_damage','monster_id','monsters','_id'),('monster_weakness','monster_id','monsters','_id'),
 ('monster_status','monster_id','monsters','_id'),('monster_ailment','monster_id','monsters','_id'),
 ('monster_habitat','monster_id','monsters','_id'),('monster_habitat','location_id','locations','_id'),
 ('monster_to_quest','monster_id','monsters','_id'),('monster_to_quest','quest_id','quests','_id'),
 ('quests','location_id','locations','_id'),
 ('quest_prereqs','quest_id','quests','_id'),('quest_prereqs','prereq_id','quests','_id'),
 ('quest_rewards','quest_id','quests','_id'),('quest_rewards','item_id','items','_id'),
 ('hunting_rewards','item_id','items','_id'),('hunting_rewards','monster_id','monsters','_id'),
 ('gathering','item_id','items','_id'),('gathering','location_id','locations','_id'),
 ('wyporium','item_in_id','items','_id'),('wyporium','item_out_id','items','_id'),('wyporium','unlock_quest_id','quests','_id'),
]

def compact(o):
    return json.dumps(o, ensure_ascii=False, separators=(',', ':'))

def main():
    raw_bytes = gzip.decompress(open(SRC, 'rb').read())
    raw = json.loads(raw_bytes)
    assert len(raw) == 24, 'diharapkan 24 tabel, dapat %d' % len(raw)
    missing = set(raw) - set(INFO)
    assert not missing, 'tabel belum ada di INFO: %s' % missing

    os.makedirs(TBL, exist_ok=True)
    manifest = {'schema': 1, 'source': 'tools/source/dbz.gz',
                'sourceSha1': hashlib.sha1(raw_bytes).hexdigest(), 'tables': {}}
    rows_by = {}
    for name in sorted(raw):
        cols, rows = raw[name]
        rows_by[name] = (cols, rows)
        text = compact({'columns': cols, 'rows': rows})
        path = os.path.join(TBL, name + '.json')
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(text)
        desc, group, pk = INFO[name]
        manifest['tables'][name] = {'file': 'tables/%s.json' % name, 'rows': len(rows),
            'columns': cols, 'pk': pk, 'group': group, 'bytes': len(text.encode('utf-8')),
            'description': desc}
    with open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1); f.write('\n')

    write_audit(manifest, rows_by)
    tot = sum(t['bytes'] for t in manifest['tables'].values())
    print('OK: %d tabel, total %.2f MB' % (len(manifest['tables']), tot / 1e6))

def as_dicts(cols, rows):
    return [dict(zip(cols, r)) for r in rows]

def write_audit(manifest, rows_by):
    T = {n: as_dicts(*rows_by[n]) for n in rows_by}
    L = []
    w = L.append
    w('# Audit database MH4U Toolbox (Stage 5)\n')
    w('Dibuat otomatis oleh `tools/build-database.py` dari `tools/source/dbz.gz`. Jangan edit manual; jalankan ulang skrip.\n')
    w('## 1. Ringkasan 24 tabel\n')
    w('| Tabel | Baris | Kolom | Ukuran JSON | Grup | Isi |')
    w('|---|---:|---:|---:|---|---|')
    for n, t in manifest['tables'].items():
        w('| `%s` | %d | %d | %.1f KB | %s | %s |' % (n, t['rows'], len(t['columns']), t['bytes']/1024, t['group'], t['description']))
    w('')
    w('## 2. Kolom tiap tabel\n')
    for n, t in manifest['tables'].items():
        w('- **%s**: %s' % (n, ', '.join('`%s`' % c for c in t['columns'])))
    w('')
    # integritas relasi
    w('## 3. Cek relasi (foreign key)\n')
    w('| Relasi | Baris yatim | Contoh nilai tanpa pasangan |')
    w('|---|---:|---|')
    problems = 0
    for (t, c, rt, rc) in FK:
        ids = {r[rc] for r in T[rt]}
        bad = [r[c] for r in T[t] if r[c] not in ids and r[c] not in ('', None, 0)]
        if bad: problems += 1
        w('| `%s.%s` -> `%s.%s` | %d | %s |' % (t, c, rt, rc, len(bad), ', '.join(map(str, bad[:5])) or '-'))
    w('\nRelasi bermasalah: **%d** dari %d.\n' % (problems, len(FK)))
    # item
    w('## 4. Distribusi data yang dipakai modul pencarian\n')
    def dist(t, c, n=30):
        return ', '.join('%s (%d)' % (k or '(kosong)', v) for k, v in collections.Counter(r[c] for r in T[t]).most_common(n))
    w('- `items.type`: ' + dist('items', 'type'))
    w('- `weapons.wtype`: ' + dist('weapons', 'wtype'))
    w('- `armor.slot`: ' + dist('armor', 'slot'))
    w('- `armor.hunter_type`: ' + dist('armor', 'hunter_type'))
    w('- `monsters.class`: ' + dist('monsters', 'class'))
    w('- `quests.hub`: ' + dist('quests', 'hub'))
    w('- `quests.type`: ' + dist('quests', 'type'))
    w('- `quests.stars`: ' + dist('quests', 'stars'))
    w('- `hunting_rewards.rank`: ' + dist('hunting_rewards', 'rank'))
    w('')
    # kolom kosong
    w('## 5. Kolom yang sering kosong (>50% baris)\n')
    w('| Tabel.kolom | Terisi | Kosong |')
    w('|---|---:|---:|')
    for n in T:
        for c in manifest['tables'][n]['columns']:
            e = sum(1 for r in T[n] if r[c] in ('', None))
            if T[n] and e / len(T[n]) > 0.5:
                w('| `%s.%s` | %d | %d |' % (n, c, len(T[n]) - e, e))
    w('')
    # catatan khusus
    items = T['items']
    blank = [r for r in items if not r['type']]
    w('## 6. Catatan temuan\n')
    w('- `items` berisi %d baris dengan `type` kosong (id: %s). Itu item asli (%s), bukan sampah; modul `items` tetap mencarinya dan filter tipe memakai nilai `none`.' % (len(blank), ', '.join(str(r['_id']) for r in blank), ', '.join(r['name'] for r in blank)))
    noht = [r for r in T['armor'] if not r['hunter_type'] or not r['gender']]
    w('- `armor` berisi %d baris tanpa `hunter_type`/`gender` (id: %s). Baris itu hanya muncul di pencarian bila filter hunterType/gender tidak dipakai.' % (len(noht), ', '.join(str(r['_id']) for r in noht)))
    w('- Tipe data campuran: `weapons.affinity` berupa string ("10", "-20", ""), `weapons.element_attack` bisa int atau "", `monster_weakness.paralysis` punya satu nilai "". Modul pencarian mengonversinya ke angka.')
    w('- `weapons.max_attack` dan `monsters.trait` kosong di semua baris: tidak dipakai modul pencarian.')
    w('- Senjata, armor, dan decoration disimpan di `items` (nama, rarity, harga) dan tabel khususnya (statistik). Nama senjata/armor **hanya ada di `items.name`**.')
    w('- `monsters` tidak memiliki ikon/gambar di tabelnya; ikon berasal dari `icons-manifest.json`.')
    w('- `monster_weakness` punya lebih dari satu baris untuk monster yang memiliki beberapa state (mis. Normal/Enraged).')
    w('- Tidak ada kolom deskripsi untuk monster, quest, atau senjata; deskripsi hanya ada pada `items.description` dan `skills.description`.')
    w('- Bahasa data: Inggris. Terjemahan label ada di `database/dbtr.json`.')
    with open(os.path.join(ROOT, 'docs', 'AUDIT-DATABASE.md'), 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(L) + '\n')

if __name__ == '__main__':
    main()
