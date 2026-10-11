# Backend API Dental Care (be_dentalcare)

Aplikasi Backend REST API untuk **Sistem Manajemen Klinik Gigi & Rekam Medis Odontogram Digital (Dental Care System)**. Dibangun menggunakan framework **Laravel 11**, database **SQLite/MySQL**, dan sistem autentikasi **JWT (JSON Web Token)**.

Backend ini dirancang khusus untuk memenuhi kebutuhan operasional klinik gigi mandiri dengan alur yang disederhanakan (1 dokter gigi / 1 petugas klinik), mendukung odontogram, farmasi stok dental, billing kasir terintegrasi otomatis ke buku kas, serta dashboard analitika real-time.

---

## 📋 Persyaratan Sistem

Sebelum menjalankan backend, pastikan perangkat Anda telah terinstal:
- **PHP** >= 8.2 (dengan ekstensi: `pdo_sqlite`, `openssl`, `mbstring`, `curl`, `json`)
- **Composer** >= 2.x
- **SQLite 3** (default bawaan tanpa konfigurasi server database tambahan) atau **MySQL / PostgreSQL**

---

## 🚀 Panduan Instalasi & Menjalankan dari Awal

### Langkah 1: Masuk ke Direktori Backend
Buka terminal (PowerShell / Command Prompt / Bash) dan arahkan ke direktori backend:
```bash
cd "c:\project\dental care\be_dentalcare"
```

### Langkah 2: Instal Dependensi PHP
Jalankan composer untuk mengunduh seluruh vendor library:
```bash
composer install
```

### Langkah 3: Konfigurasi File Environment (`.env`)
Salin file `.env.example` menjadi `.env` jika belum ada:
```bash
# Windows PowerShell
cp .env.example .env
```
Generate Application Key:
```bash
php artisan key:generate
```

Sesuaikan konfigurasi database di file `.env` untuk **MySQL**:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dental_care
DB_USERNAME=root
DB_PASSWORD=
```
> *Catatan: Pastikan service MySQL Anda telah berjalan dan database `dental_care` sudah dibuat (misal via phpMyAdmin / MySQL CLI: `CREATE DATABASE dental_care;`).*

### Langkah 4: Jalankan Migrasi Database & Seeder Data Awal
Jalankan migrasi tabel beserta seeder lengkap untuk data master gigi, 20 pasien riil, obat & anestesi dental, odontogram awal, dan akun pengguna:
```bash
php artisan migrate:fresh --seed
```

### Langkah 5: Jalankan Server Development Laravel
Jalankan server REST API di port default 8000:
```bash
php artisan serve
```
Server backend akan aktif di: **`http://127.0.0.1:8000`** (Base URL API: `http://127.0.0.1:8000/api`).

---

## 🧪 Verifikasi & Pengujian API

Untuk memvalidasi bahwa seluruh controller, database, autentikasi JWT, dan routing berfungsi dengan baik:
```bash
php tests/test_api_auth.php
```
Jika sukses, terminal akan menampilkan konfirmasi `ALL BACKEND TESTS PASSED!` dengan status HTTP `200 OK` untuk Login, Profil Me, Dashboard Stats, Diagnosa ICD-10, Tindakan Gigi, Staf, dan Asuransi.

---

## 🔑 Kredensial Akun Pengguna Default

Database seeder telah menyediakan akun siap pakai:

| Nama Pengguna | Email | Kata Sandi | Peran (Role) | Akses Utama |
| :--- | :--- | :--- | :--- | :--- |
| **drg. Pratama Wijaya** | `admin@dentalcare.local` *(atau `admin@ehealth.local`)* | `password` | Super Admin / Dokter Gigi | Seluruh modul, Rekam Medis Odontogram, Billing, Pengaturan |
| **Siti Nurhaliza, A.Md.Kes** | `petugas@dentalcare.local` | `password` | Petugas Resepsionis & Farmasi | Registrasi Pasien, Antrean Dental Chair, Resep Farmasi, Kasir |

---

## 📡 Daftar Endpoint REST API Utama

Semua endpoint diawali dengan prefix: **`/api`**

### 1. Autentikasi (JWT)
- `POST /api/auth/login` : Login pengguna & pengembalian Bearer JWT token
- `GET /api/auth/me` : Informasi data pengguna yang sedang login
- `POST /api/auth/logout` : Logout sesi
- `GET /api/auth/users` : Daftar seluruh operator/staf klinik

### 2. Dashboard & Monitoring Dental
- `GET /api/dashboard/stats` : Statistik kumulatif pasien hari ini, utilisasi dental chair, tren kunjungan mingguan, grafik pendapatan, demografi usia, dan stok bahan dental kritis.

### 3. Pasien (Rekam Medis Pasien)
- `GET /api/patients` : Mengambil daftar pasien (dengan fitur filter pencarian nama/NIK/RM)
- `POST /api/patients` : Mendaftarkan pasien baru
- `GET /api/patients/{id}` : Detail data pasien & riwayat kunjungan
- `PUT /api/patients/{id}` : Pembaruan data demografis & riwayat sistemik pasien
- `DELETE /api/patients/{id}` : Menghapus data pasien

### 4. Janji Temu & Antrean Dental
- `GET /api/appointments` : Daftar janji temu konsultasi / perawatan gigi
- `POST /api/appointments` : Pembuatan booking jadwal janji temu
- `PATCH /api/appointments/{id}/status` : Update status kehadiran (confirmed, completed, cancelled)
- `GET /api/queues` : Daftar antrean live dental chair
- `PATCH /api/queues/{id}/status` : Update status antrean (waiting, called, in_progress, completed)
- `POST /api/queues/call-next` : Memanggil antrean pasien berikutnya secara otomatis

### 5. Rekam Medis Klinis & Odontogram
- `GET /api/encounters` : Riwayat kunjungan rekam medis klinik gigi
- `POST /api/encounters` : Simpan hasil pemeriksaan anamnesis, odontogram intraoral, diagnosis ICD-10, tindakan ICD-9, dan e-resep
- `GET /api/encounters/{id}` : Detail encounter dan pemetaan kondisi gigi dewasa/anak

### 6. Farmasi & Logistik Bahan Gigi
- `GET /api/medicines` : Daftar obat dan material consumable dental (komposit, etchant, anestesi)
- `POST /api/medicines` : Input item obat/material baru
- `GET /api/medicines/mutations` : Riwayat kartu stok masuk/keluar
- `POST /api/medicines/stock-in` : Input stok barang masuk dari supplier/distributor
- `POST /api/medicines/stock-out` : Input pemakaian material atau pengeluaran obat
- `GET /api/prescriptions` : Daftar antrean telaah e-resep farmasi
- `PATCH /api/prescriptions/{id}/status` : Update status penyiapan & penyerahan obat

### 7. Kasir & Buku Kas Keuangan
- `GET /api/billing/invoices` : Daftar tagihan faktur perawatan gigi
- `POST /api/billing/invoices` : Pembuatan tagihan kasir
- `POST /api/billing/payments` : Pembayaran tagihan (Tunai, QRIS, Debit, Transfer) yang **otomatis tersinkronisasi ke Buku Kas Masuk**
- `GET /api/finance/summary` : Ringkasan saldo kas, total pemasukan, dan total pengeluaran
- `GET /api/finance/transactions` : Catatan mutasi jurnal kas masuk/keluar

### 8. Referensi Klinis & Sistem
- `GET /api/clinical/diagnoses` : Master katalog diagnosis ICD-10 gigi
- `GET /api/clinical/procedures` : Master tarif & tindakan gigi
- `GET /api/staff` : Data dokter gigi, terapis, asisten perawat dental, dan kasir
- `GET /api/insurance` : Data asuransi penjamin (BPJS P-Care Dental, Mandiri Inhealth, Prudential, AdMedika)
- `GET /api/system/audit-logs` : Log jejak aktivitas keamanan & audit trail
- `GET /api/system/hospital-profile` : Profil identitas klinik gigi dan kepala klinik

---

## 🛠️ Troubleshooting

- **Error database locked pada SQLite**: Pastikan tidak ada proses lain yang mengunci file `database.sqlite`, atau restart server `php artisan serve`.
- **Class / Controller Not Found**: Jalankan perintah `composer dump-autoload` untuk memuat ulang daftar class PSR-4.
- **Port 8000 bentrok**: Jalankan di port alternatif menggunakan perintah:
  ```bash
  php artisan serve --port=8080
  ```
  *(Jika port berubah, perbarui juga nilai `NEXT_PUBLIC_API_URL` pada frontend).*