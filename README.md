# CART3R AI — PWA Build 01

## Isi
- `index.html`: struktur aplikasi
- `styles.css`: tema hitam-merah responsif
- `app.js`: navigasi, chat demo, upload foto, install prompt
- `manifest.webmanifest`: metadata PWA
- `sw.js`: service worker/cache offline dasar
- `icons/`: ikon aplikasi

## Menjalankan
PWA perlu disajikan melalui HTTPS (atau localhost). Membuka `index.html` langsung dari file manager iPhone tidak cukup untuk mengaktifkan service worker dan instalasi PWA.

### Cara termudah: GitHub Pages
1. Buat akun / masuk ke GitHub.
2. Buat repository baru, misalnya `cart3r-ai`.
3. Upload seluruh isi folder proyek ini ke repository (bukan folder ZIP-nya).
4. Buka **Settings → Pages**.
5. Pada **Build and deployment**, pilih **Deploy from a branch**.
6. Pilih branch `main`, folder `/ (root)`, lalu Save.
7. Tunggu proses selesai. Buka alamat Pages yang diberikan GitHub.

### Pasang di iPhone
1. Buka alamat HTTPS website di Safari.
2. Tekan tombol Share.
3. Pilih **Add to Home Screen**.
4. Aktifkan **Open as Web App** bila tersedia, lalu tekan Add.

### Pasang di Android
Buka website HTTPS di Chrome, lalu pilih menu **Install app** atau **Add to Home screen**.

## Status
Build 01 adalah prototipe antarmuka. Balasan chat masih simulasi. Image Studio hanya memilih dan menampilkan file lokal; belum mengirim foto ke model AI.

## Tahap integrasi AI berikutnya
Buat backend HTTPS (misalnya FastAPI/Node) untuk meneruskan permintaan ke penyedia AI. Simpan API key hanya di server sebagai environment variable. Jangan pernah menaruh API key rahasia di `app.js`, HTML, atau kode frontend.
