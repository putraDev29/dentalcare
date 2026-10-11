# Frontend Dental Care System (fe_dentalcare)

Aplikasi antarmuka web modern untuk **Sistem Manajemen Klinik Gigi & Rekam Medis Odontogram Digital (Dental Care Platform)**. Dibangun menggunakan **Next.js 16 (App Router / Turbopack)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **TanStack Table**, **Recharts**, dan **Zustand**.

Aplikasi ini dirancang khusus untuk kemudahan operasional klinik gigi mandiri dengan alur yang ringkas dan efisien (dapat dioperasikan oleh 1 dokter gigi atau 1 petugas klinik), terhubung langsung ke **Laravel 11 REST API** dengan proteksi token **JWT**.

---

## 📋 Persyaratan Sistem

Sebelum menjalankan frontend, pastikan perangkat Anda telah terinstal:
- **Node.js** >= 18.18.0 atau LTS 20.x
- **npm** >= 9.x (atau pnpm / yarn)
- Backend Laravel (`be_dentalcare`) yang sedang berjalan di `http://127.0.0.1:8000`

---

## 🚀 Panduan Instalasi & Menjalankan dari Awal

### Langkah 1: Masuk ke Direktori Frontend
Buka terminal baru dan arahkan ke direktori frontend:
```bash
cd "c:\project\dental care\fe_dentalcare"
```

### Langkah 2: Instal Seluruh Dependensi Node.js
Jalankan perintah instalasi paket:
```bash
npm install
```

### Langkah 3: Konfigurasi File Environment (`.env.local`)
Pastikan file `.env.local` telah mengarah ke REST API backend Laravel:
```env
# Mode Pengambilan Data ("api" untuk Laravel Backend, "mock" untuk Offline Demo)
NEXT_PUBLIC_DATA_SOURCE="api"

# URL Endpoint Backend Laravel
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000/api"

# Pengaturan Klinik
NEXT_PUBLIC_APP_NAME="Dental Care Management System"
NEXT_PUBLIC_CLINIC_TYPE="Klinik Gigi Mandiri"
```

### Langkah 4: Jalankan Server Development
Mulai server frontend development dengan Next.js:
```bash
npm run dev
```
Aplikasi frontend akan aktif di: **`http://localhost:3000`**.

Buka browser Anda dan akses alamat tersebut untuk masuk ke halaman Login.

---

## 🏗️ Kompilasi & Menjalankan Mode Produksi (Production)

Untuk melakukan build optimasi produksi dan menghasilkan berkas deployment statis:
```bash
# 1. Jalankan pengecekan TypeScript
npx tsc --noEmit

# 2. Build aplikasi & kompresi otomatis
npm run build
```
Setelah proses build selesai, sistem akan menghasilkan:
- Direktori statis **`out/`** (seluruh halaman HTML/CSS/JS statis hasil export Next.js)
- File arsip terkompresi **`out.zip`** siap pakai untuk keperluan deployment / distribusi (informasi ukuran dan lokasi file otomatis ditampilkan di terminal).

---

## 🔑 Panduan Login & Akses Masuk

Akses halaman login di `http://localhost:3000/login`.

Tersedia akun default untuk pengujian:
1. **drg. Pratama Wijaya (Super Admin / Dokter Gigi)**
   - **Email:** `admin@dentalcare.local` *(atau `admin@ehealth.local`)*
   - **Password:** `password`
   - **Hak Akses:** Akses penuh seluruh modul klinis, Odontogram intraoral, master data, keuangan buku kas, dan laporan.
2. **Siti Nurhaliza, A.Md.Kes (Petugas Klinik / Resepsionis & Farmasi)**
   - **Email:** `petugas@dentalcare.local`
   - **Password:** `password`
   - **Hak Akses:** Pendaftaran pasien baru, panggilan antrean, penyiapan obat farmasi, stok barang masuk, dan pembayaran kasir.

> *Tip: Di halaman login, Anda dapat mengklik tombol quick-fill akun demo untuk mengisi form secara otomatis.*

---

## 🦷 Fitur Unggulan & Alur Klinik Gigi

### 1. Dashboard Eksekutif Dental (`/dashboard`)
- **Metrik Utama Real-time:** Pasien hari ini, janji temu terjadwal, antrean dental chair, prosedur selesai, pendapatan kasir hari ini, resep diserahkan, dan rontgen digital.
- **Monitoring Dental Chair Live:** Memantau status kursi gigi (Unit 1 s/d Unit 6) apakah sedang dalam tindakan, proses sterilisasi, atau siap pasien berikutnya.
- **Grafik Analitika:** Tren kunjungan mingguan, distribusi tindakan spesialisasi gigi, grafik omset bulanan, dan demografi usia pasien (anak/pedodonsia hingga geriatri).
- **Peringatan Bahan Dental Kritis:** Deteksi dini material tambal komposit, bonding agent, etchant, dan anestesi Pehacain ampul yang menipis.

### 2. Registrasi Pasien & Rekam Medis (`/patients`)
- Pendaftaran data demografis pasien, nomor rekam medis otomatis (format `RM-YYYY-XXXXXX`), NIK KTP, kontak darurat, dan riwayat penyakit sistemik (hipertensi, diabetes, alergi obat, kelainan perdarahan).

### 3. Workspace Odontogram Intraoral (`/encounters/[id]`)
- **Diagram Odontogram Interaktif:** Pemetaan 32 gigi tetap dewasa dan 20 gigi susu anak sesuai standar FDI World Dental Federation / Permenkes.
- **Kondisi Gigi:** Sound (sehat), Caries (karies dentin/email), Filling (tambal komposit/amalgam), Crown (mahkota tiruan), Missing (gigi tanggal), Impacted (gigi bungsu impaksi), Retained Root (sisa akar), dan Endodontic (perawatan saluran akar).
- **Pencarian Klinis Cepat:** Input diagnosis ICD-10 gigi dan tindakan ICD-9-CM otomatis menghitung biaya tagihan dan kebutuhan resep obat.

### 4. Farmasi & Logistik Bahan Dental (`/pharmacy`)
- **Telaah E-Resep:** Alur praktis penyiapan antibiotik amoxicillin, analgesik asam mefenamat, dan obat kumur klorheksidin.
- **Barang Masuk & Keluar:** Input penerimaan stok dari distributor dan pencatatan pemakaian bahan tindakan.
- **Sinkronisasi Otomatis:** Pembelian bahan medis langsung terhubung ke Buku Kas Pengeluaran.

### 5. Billing Kasir & Sinkronisasi Keuangan (`/billing`)
- Penerbitan invoice perawatan gigi dengan rincian jasa dokter, tindakan odontogram, dan obat.
- Pembayaran instan via **QRIS**, **Debit**, atau **Tunai**.
- Saat pembayaran dinyatakan lunas, sistem secara otomatis mencatatkan jurnal transaksi masuk ke **Buku Kas Keuangan (`/finance`)**.

### 6. Navigasi Pintas Global (Command Palette)
- Tekan **`Ctrl + K`** (atau `Cmd + K` di macOS) di halaman mana pun untuk membuka bilah pencarian universal:
  - Cari Pasien (berdasarkan Nama, NIK, atau No. Rekam Medis).
  - Cari Dokter Gigi & Jadwal Praktik.
  - Cari No. Booking Janji Temu.
  - Cari Katalog Obat & Bahan Gigi.

---

## 📁 Struktur Direktori Frontend

```
fe_dentalcare/
├── src/
│   ├── app/                      # Next.js App Router (34 Rute Halaman)
│   │   ├── (auth)/login/         # Autentikasi Login JWT
│   │   ├── (dashboard)/          # Modul Klinik Gigi
│   │   │   ├── dashboard/        # Dashboard Realtime
│   │   │   ├── patients/         # Pasien & Detail RM
│   │   │   ├── encounters/[id]/  # Workspace Odontogram Intraoral
│   │   │   ├── appointments/     # Janji Temu Pasien
│   │   │   ├── queue/            # Panggilan Antrean Dental Chair
│   │   │   ├── outpatient/       # Ruang Praktik Gigi
│   │   │   ├── pharmacy/         # Apotek Farmasi & Obat Masuk/Keluar
│   │   │   ├── billing/          # Kasir & Pembayaran Invoice
│   │   │   ├── inventory/        # Logistik Alat & BMHP Dental
│   │   │   ├── radiology/        # Rontgen Gigi Panoramik & Periapikal
│   │   │   ├── analytics/        # Analitika ICD-10 & Waktu Tunggu
│   │   │   ├── reports/          # Pusat Unduh Laporan
│   │   │   ├── staff/            # Staf & Perawat Dental
│   │   │   ├── insurance/        # Penjamin BPJS & Asuransi
│   │   │   └── audit-logs/       # Jejak Audit Aktivitas Medis
│   ├── components/               # Komponen UI Reusable
│   │   ├── dental/odontogram.tsx # Komponen Visualisasi Odontogram 5 Permukaan
│   │   ├── layout/               # Header, Sidebar, Command Palette
│   │   ├── shared/               # DataTable, StatCard, PageHeader
│   │   └── ui/                   # Button, Card, Badge, Modal, Input
│   ├── hooks/                    # React Hooks untuk Komunikasi API
│   ├── lib/api/client.ts         # Axios/Fetch Client dengan Bearer JWT Otomatis
│   ├── repositories/             # Layer Abstraksi API Repository
│   ├── services/                 # Layer Logika Bisnis & Layanan Domain
│   └── types/                    # Definisi TypeScript Schema
└── package.json
```

---

## 🛠️ Catatan Pemeliharaan

- **Penyelarasan Tipe Data:** Seluruh tipe data klinis dan entitas sistem didefinisikan secara tersentralisasi di `src/types/index.ts`.
- **Mode Offline/Demo:** Jika server backend sedang maintenance, Anda dapat beralih ke mode simulasi lokal dengan mengubah `NEXT_PUBLIC_DATA_SOURCE="mock"` pada file `.env.local`.