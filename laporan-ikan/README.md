# Laporan Bisnis Ikan

Web laporan untuk bisnis ikan hias dan cupang: stok, penjualan, modal, biaya, laba rugi (harian, mingguan, bulanan), grafik tren, restock, dan unduh laporan CSV (bisa dibuka di Excel).

Tanpa build tool: HTML, CSS, dan JavaScript biasa.

## Struktur

```
index.html
css/style.css
js/config.js      pengaturan database (local / supabase)
js/db.js          adapter database
js/seed.js        data stok awal dari klien (73 produk)
js/app.js         logika dan tampilan
supabase/schema.sql
```

## Menjalankan

Buka `index.html` di browser, atau jalankan server lokal:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

Pertama kali dibuka, klik tombol **Isi stok awal** untuk memasukkan data stok dari klien.

## Mode database

### 1. Local (default)
`backend: 'local'` di `js/config.js`. Data tersimpan di browser perangkat itu saja. Cocok untuk mencoba, tapi data tidak sinkron antar perangkat dan hilang kalau cache dibersihkan.

### 2. Supabase (permanen, multi-perangkat)
1. Buat project gratis di https://supabase.com
2. Buka **SQL Editor**, jalankan isi `supabase/schema.sql`
3. Buka **Authentication > Users**, tambahkan user (email + password) untuk klien dan karyawan. Matikan sign-up publik di **Authentication > Providers > Email** supaya orang asing tidak bisa daftar sendiri.
4. Di **Project Settings > API**, salin Project URL dan anon public key ke `js/config.js`:

```js
var CONFIG = {
  backend: 'supabase',
  supabaseUrl: 'https://xxxx.supabase.co',
  supabaseKey: 'ANON_PUBLIC_KEY'
};
```

Anon key memang aman ada di frontend, selama Row Level Security aktif seperti di `schema.sql` (hanya user yang login yang bisa baca/tulis). Jangan pernah memakai `service_role` key di sini.

## Deploy ke GitHub Pages

Push ke GitHub, lalu **Settings > Pages > Deploy from a branch > main / (root)**. Situs akan tersedia di `https://<username>.github.io/<repo>/`.

## Catatan perhitungan

- **HPP** = harga modal x jumlah terjual (diambil saat transaksi dicatat).
- **Laba kotor** = penjualan - HPP. **Laba bersih** = laba kotor - biaya operasional.
- **Setoran modal** tidak dihitung sebagai biaya.
- **Estimasi kas** = setoran modal + penjualan - biaya operasional - restock. Nilai stok awal tidak termasuk.
- Restock dengan modal/satuan baru memperbarui harga modal produk, jadi berlaku untuk penjualan berikutnya.
- Harga jual alat belum ada di data klien (diisi 0). Isi di tab Stok.

## Struktur data

Setiap koleksi berisi dokumen dengan field `id`:
`items` (cat, name, size, qty, cost, sell), `tx` (date, itemId, name, qty, price, cost), `exp` (date, type `op`/`modal`, note, amt), `rs` (date, itemId, name, qty, amt).
