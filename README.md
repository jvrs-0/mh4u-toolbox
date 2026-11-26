# MH4U Toolbox

**Buka editor:** https://jvrs-0.github.io/mh4u-toolbox/

Save editor dan database **tidak resmi** untuk **Monster Hunter 4 Ultimate** (3DS), berupa satu halaman HTML. Semuanya berjalan di browser kamu: file save tidak pernah diunggah ke mana pun.

> **v2.0.0 Beta.** Belum semua fitur teruji penuh. **Selalu backup save sebelum menimpanya.**

## Isi toolbox

Toolbox ini punya empat tab: **Save Editor**, **Salin Save**, **Database**, dan **Catatan**.

### Save Editor

- Profil hunter: nama, Zenny (ada tombol Zenny maksimal), Hunter Rank, dan HR Points
- Item Box: cari item, tambah atau ubah item, jadikan 99 per kategori, gabung item ganda, dan preset (Starter kit, semua Jewel, semua Amunisi)
- Item Pouch 1-3 dan Gunner Pouch: isi atau ubah slot, preset, kosongkan pouch
- Hapus massal: kosongkan pouch, Item Box, Equipment Box, atau semuanya
- Equipment Box: tambah atau ganti senjata, armor, dan talisman, atur slot jewel, serta koleksi set armor, senjata, dan talisman siap pakai
- Editor Palico: ubah nama dan EXP 56 Palico, pasang set equipment, dan salin Palico dari koleksi contoh
- Equipment yang sedang dipakai (loadout aktif)
- Editor Guild Quest (WIP)
- Urungkan perubahan terakhir dan reset semua perubahan

### Salin Save

Menyalin data dari satu file save MH4U ke file save lain, lengkap dengan ringkasan sebelum disalin.

- Bagian yang bisa disalin: info profil, Item Box, Equipment Box, Palico, dan pouch
- Mode **Gabung** (menambah ke tujuan tanpa menghapus isinya) atau **Ganti** (menimpa seluruh bagian di tujuan)
- Ada tombol backup untuk file tujuan

### Database

Data game yang bisa dibuka **tanpa file save**: Monsters, Weapons, Armor, Quests, Items, Combining, Locations, Decorations, Skills, dan Wyporium Trade.

### Bahasa

Ada tombol ganti bahasa Indonesia / Inggris.

## Cara pakai

1. Backup file save aslimu (`user1`, `user2`, atau `user3`).
2. Buka halaman, pilih file save, lalu ketuk **Unduh backup file asli**.
3. Lakukan perubahan, lalu ketuk **Terapkan perubahan** bila perlu.
4. Ketuk **Simpan & unduh file**, ganti nama file kembali ke nama aslinya jika browser mengubahnya, lalu timpa save asli.

Halaman memeriksa checksum save sebelum dan sesudah diedit. Jika verifikasi gagal, file tidak diunduh.

## Catatan

- Pakai file `userX`, bukan file `system`.
- Jika memindahkan satu file `userX` ke folder lain di 3DS, salin juga file lainnya (termasuk `system`), kalau tidak karakter atau pengaturan bisa hilang.
- ID item yang tidak dikenal, nilai ekstrem, atau edit pada senjata yang bukan relic bisa menghasilkan item tidak valid. Ubah sedikit demi sedikit dan uji di game.
- Nama item dan equipment berasal dari daftar komunitas dan mungkin ada yang keliru.
- Toolbox ini hanya untuk Monster Hunter 4 Ultimate, bukan untuk game Monster Hunter lain.

## Kredit

Proyek ini memakai informasi dan data dari proyek open source. Teks lisensi lengkap ada di [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

- **mh4edit** oleh Rokumaehn (MIT): format save, ikon equipment, daftar nama. https://github.com/Rokumaehn/mh4edit
- **MH4U Database** oleh Gathering Hall Studios / DavianCorp (MIT): data skill, batas stack item, dan seluruh isi tab Database. https://github.com/gatheringhallstudios/MonsterHunter4UDatabase

Monster Hunter beserta semua nama, gambar, dan ikon terkait adalah milik Capcom. Ini proyek penggemar tidak resmi dan tidak berafiliasi dengan Capcom.

Dibuat oleh Jvrs._

## Lisensi

MIT, lihat [LICENSE](LICENSE). Komponen pihak ketiga tetap memakai lisensinya masing-masing, lihat [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
