# FrogzzBotZ

Base WhatsApp bot berbasis CJS dengan sistem plugin dan module yang dibuat supaya struktur project tetap ringan, jelas, dan mudah dikembangkan.

## Fitur

- CommonJS
- Pairing Code
- Multi-file session
- JID dan LID aware
- Central command handler dengan switch
- Plugin loader
- Module system di `lib/`
- Button menu
- List menu
- Reaction pada `.menu` dan `.allmenu`
- Self Mode
- Owner dan Premium access
- Blacklist
- Group administration helper
- Dynamic plugin add, edit, delete
- System information tanpa menampilkan IP
- Struktur database JSON

## Struktur

```text
FrogzzBotZ/
├── database/
│   ├── premium.json
│   ├── owner.json
│   ├── blacklist.json
│   └── selfmode.json
├── image/
│   ├── menu.png
│   ├── allmenu.png
│   ├── groupmenu.png
│   ├── ownermenu.png
│   ├── libmenu.png
│   └── pluginmenu.png
├── lib/
│   ├── FrogzzModule.js
│   ├── command.js
│   ├── function.js
│   ├── group.js
│   ├── lib.js
│   ├── loader.js
│   ├── menu.js
│   └── message.js
├── plugin/
│   ├── createby.js
│   ├── group.js
│   ├── libmenu.js
│   ├── owner.js
│   ├── ping.js
│   ├── plugin.js
│   ├── premium.js
│   └── self.js
├── session/
├── index.js
├── package.json
└── README.md
```

## Persiapan

Gunakan Node.js 20 atau versi yang lebih baru.

```bash
node -v
npm -v
```

## Instalasi

Extract project lalu masuk ke folder project.

```bash
cd FrogzzBotZ
npm install
```

Jalankan bot:

```bash
npm start
```

Pada first run bot akan meminta nomor WhatsApp untuk pairing. Masukkan nomor dengan format internasional tanpa tanda `+`, spasi, atau tanda baca.

Contoh:

```text
6281234567890
```

Setelah pairing berhasil, data login akan tersimpan di folder `session/`.

Jangan upload isi `session/` ke repository. Folder tersebut sudah masuk `.gitignore`.

## Database

### owner.json

Berisi nomor owner dalam format angka.

```json
[]
```

Nomor yang melakukan pairing pertama kali akan otomatis dimasukkan sebagai owner.

### premium.json

Berisi nomor premium.

```json
[]
```

### blacklist.json

Berisi nomor yang tidak boleh menggunakan bot.

```json
[]
```

### selfmode.json

Mengatur akses ketika Self Mode aktif.

```json
{
  "enabled": false
}
```

Saat Self Mode `ON`, command bot hanya dapat digunakan oleh **Owner dan Premium**. Saat `OFF`, bot kembali public sesuai permission masing-masing command.

## Command dasar

```text
.menu
.allmenu
.ownermenu
.createdby
.ping
.premium
.self
.public
.selfmode
```

## Self Mode

Owner dapat mengatur mode bot dengan:

```text
.self
```

Mengaktifkan Self Mode.

```text
.public
```

Mematikan Self Mode.

```text
.selfmode
```

Melihat status Self Mode.

Self Mode tidak mematikan akses Owner atau Premium.

## Premium

Owner dapat menambahkan nomor premium:

```text
.addprem 6281234567890
```

Menghapus premium:

```text
.delprem 6281234567890
```

## Group

Command group utama:

```text
.kick @user
.add 6281234567890
.gpclose
.groupclose
.gpopen
.groupopen
.infogp
```

Command administrasi group membutuhkan bot sebagai admin dan pengguna sebagai admin. Akses command group dibatasi untuk Owner atau Premium, sedangkan `.groupmenu` dapat dibuka secara umum melalui menu.

Target `.kick` dapat menggunakan mention atau reply. `.add` menerima nomor dengan country code.

## Plugin

Plugin berada di folder `plugin/`.

Format dasar plugin:

```js
module.exports = {
  command: ['hello'],
  category: 'main',
  description: 'Contoh command',
  async execute(ctx) {
    await ctx.reply('Hello')
  }
}
```

Plugin otomatis dibaca oleh loader ketika command dipanggil.

## Dynamic Plugin

Owner dapat membuat plugin sederhana dari chat:

```text
.addplugin contoh.js Halo dari plugin
```

Edit:

```text
.editplugin contoh.js Pesan baru
```

Alias edit:

```text
.eplugin contoh.js Pesan baru
```

Hapus:

```text
.delplugin contoh.js
```

Menu plugin:

```text
.pluginmenu
```

Plugin bawaan tidak dapat dihapus melalui command tersebut.

## Menu

`.menu` mengirim tampilan utama dengan gambar dan button:

```text
All Menu | Owner
```

`.allmenu` membuka list kategori. Setiap kategori dapat membuka daftar command yang tersedia.

Reaction otomatis diberikan pada command `.menu` dan `.allmenu` setelah command berhasil diproses.

## Module

`lib/FrogzzModule.js` berisi helper utama seperti database JSON, normalisasi nomor, JID/LID handling, command parsing, system information, permission, dan utility umum.

`lib/function.js` berisi fungsi umum yang dapat dipakai plugin.

`lib/group.js` berisi helper group seperti kick, add, close, open, dan informasi group.

`lib/lib.js` berisi module library yang dapat dipanggil oleh bagian lain dari bot.

`lib/command.js` adalah pusat routing command. Command utama diproses menggunakan `switch`, lalu command lain diteruskan ke plugin loader.

## JID dan LID

Base menggunakan beberapa sumber identity yang tersedia pada message key, termasuk participant, participantAlt, remoteJid, dan remoteJidAlt. Untuk group, identitas alternatif dipertimbangkan ketika mencari sender dan target.

WhatsApp dapat menggunakan LID sebagai identity internal, sehingga project tidak mengandalkan satu field JID saja.

## Ping

`.ping`, `.speed`, dan `.botinfo` menampilkan informasi runtime seperti Node.js, CPU, RAM, disk, uptime, platform, dan response time. Informasi IP tidak ditampilkan.

## Lisensi dan penggunaan

Project ini adalah base untuk pengembangan bot pribadi atau project sendiri. Sesuaikan fitur, identitas, dan konfigurasi sebelum digunakan pada project produksi.

## Catatan

Gunakan nomor WhatsApp yang memang menjadi milik atau berada dalam kendali Anda. Jangan menjalankan automation yang melanggar ketentuan layanan atau mengganggu pengguna lain.

## My Channel Whatsapp
https://whatsapp.com/channel/0029VawOm1WEgGfWF5R6v92y

## Connection Stability

FrogzzBotZ memakai satu koneksi aktif pada satu waktu. Session dibaca dari folder `session` dan tidak dibuat ulang setiap ada event `connecting`. Pairing code hanya diminta saat session belum terdaftar.

Jika koneksi terputus karena gangguan biasa, bot mencoba reconnect secara bertahap dengan jeda 5, 10, 20, 30, lalu 60 detik. Maksimal lima percobaan dilakukan untuk satu rangkaian kegagalan. Setelah lima percobaan gagal, proses berhenti melakukan reconnect otomatis dan menampilkan instruksi untuk memeriksa atau menghapus folder `session` sebelum pairing ulang.

Session yang valid tetap dipakai saat restart sehingga bot tidak meminta pairing code setiap kali proses dimulai.

Jika WhatsApp mengembalikan status logout atau session tidak valid, reconnect otomatis tidak dilanjutkan. Hapus isi folder `session`, jalankan bot kembali, lalu lakukan pairing baru.
