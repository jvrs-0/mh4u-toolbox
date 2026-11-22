# MH4U Toolbox

**Live / Buka editor:** https://jvrs-0.github.io/mh4u-toolbox/

🇬🇧 English | 🇮🇩 [Bahasa Indonesia](#-bahasa-indonesia)

An unofficial, offline save editor for **Monster Hunter 4 Ultimate**, built as a single HTML page. It runs entirely in your browser: your save file is never uploaded anywhere.

> **v1.1.1 Beta.** Not every feature has been fully tested. **Always back up your save before overwriting it.**

## Features

- Hunter name, Zenny, Hunter Rank and HR Points
- Item Box: add or change items, presets (Starter kit, all Jewels, all Ammo), merge duplicates
- Equipment Box: add or replace weapons, armor and talismans, armor sets from a database
- Palico editor: name and EXP, equipment sets
- Guild Quest editor (WIP)
- English / Indonesian language switch

## How to use

1. Back up your original save file (`user1`, `user2` or `user3`).
2. Open the page, choose your save file, and tap **Download backup of original file**.
3. Make your changes, then tap **Apply changes** where needed.
4. Tap **Save & download file**, rename it back to the original file name if your browser changed it, and replace the original save.

The page checks the save's checksum before and after editing. If verification fails, no file is downloaded.

**Notes**

- Use the `userX` files, not the `system` file.
- If you move a `userX` file to another folder on a 3DS, copy the other files too (including `system`), otherwise your character or settings may be lost.
- Unknown item IDs, extreme values or edits to weapons that are not relic weapons can create invalid items. Change a little at a time and test in the game.
- Item and equipment names come from community lists and may contain mistakes.

## Credits

This project uses information and data from open-source projects. Full license texts are in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

- **mh4edit** by Rokumaehn (MIT): save format, equipment icons, name lists. https://github.com/Rokumaehn/mh4edit
- **MH4U Database** by Gathering Hall Studios / DavianCorp (MIT): skill data and item stack limits. https://github.com/gatheringhallstudios/MonsterHunter4UDatabase

Monster Hunter and all related names, images and icons belong to Capcom. This is an unofficial fan project and is not affiliated with or endorsed by Capcom.

Made by Jvrs._

## License

MIT, see [LICENSE](LICENSE). Third-party components keep their own licenses, see [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

---

# 🇮🇩 Indonesia

Save editor **tidak resmi** untuk **Monster Hunter 4 Ultimate** berupa satu halaman HTML. Semuanya berjalan di browser kamu: file save tidak diunggah ke mana pun.

> **v1.1.1 Beta.** Belum semua fitur teruji penuh. **Selalu backup save sebelum menimpanya.**

## Fitur

- Nama hunter, Zenny, Hunter Rank, dan HR Points
- Item Box: tambah atau ubah item, preset (Starter kit, semua Jewel, semua Amunisi), gabung item duplikat
- Equipment Box: tambah atau ganti senjata, armor, dan talisman, set armor dari database
- Editor Palico: nama dan EXP, set equipment
- Editor Guild Quest (WIP)
- Tombol bahasa Inggris / Indonesia

## Cara pakai

1. Backup file save aslimu (`user1`, `user2`, atau `user3`).
2. Buka halaman, pilih file save, lalu ketuk **Unduh backup file asli**.
3. Lakukan perubahan, lalu ketuk **Terapkan perubahan** bila perlu.
4. Ketuk **Simpan & unduh file**, ganti nama file kembali ke nama aslinya jika browser mengubahnya, lalu timpa save asli.

Halaman memeriksa checksum save sebelum dan sesudah diedit. Jika verifikasi gagal, file tidak diunduh.

**Catatan**

- Pakai file `userX`, bukan file `system`.
- Jika memindahkan satu file `userX` ke folder lain di 3DS, salin juga file lainnya (termasuk `system`), kalau tidak karakter atau pengaturan bisa hilang.
- ID item yang tidak dikenal, nilai ekstrem, atau edit pada senjata yang bukan relic bisa menghasilkan item tidak valid. Ubah sedikit demi sedikit dan uji di game.
- Nama item dan equipment berasal dari daftar komunitas dan mungkin ada yang keliru.

## Kredit

Proyek ini memakai informasi dan data dari proyek open source. Teks lisensi lengkap ada di [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

- **mh4edit** oleh Rokumaehn (MIT): format save, ikon equipment, daftar nama.
- **MH4U Database** oleh Gathering Hall Studios / DavianCorp (MIT): data skill dan batas stack item.

Monster Hunter beserta semua nama, gambar, dan ikon terkait adalah milik Capcom. Ini proyek penggemar tidak resmi dan tidak berafiliasi dengan Capcom.

Dibuat oleh Jvrs._

## Lisensi

MIT, lihat [LICENSE](LICENSE). Komponen pihak ketiga tetap memakai lisensinya masing-masing, lihat [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
