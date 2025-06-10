# 📊 RetinaScan Dashboard

<div align="center">
  
  ![RetinaScan Dashboard](https://img.shields.io/badge/RetinaScan-Dashboard-purple?style=for-the-badge)
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  
  Dashboard admin untuk sistem RetinaScan yang dibangun dengan React, Vite, dan TailwindCSS.
</div>

## 📋 Daftar Isi
- [Pengenalan](#-pengenalan)
- [Fitur](#-fitur)
- [Teknologi](#-teknologi)
- [Memulai](#-memulai)
- [Struktur Proyek](#-struktur-proyek)
- [Konfigurasi](#-konfigurasi)
- [Deployment](#-deployment)

## 🔍 Pengenalan

Dashboard RetinaScan adalah panel admin untuk sistem deteksi retinopati diabetik. Dashboard ini menyediakan antarmuka untuk administrator untuk memantau aktivitas sistem, mengelola pengguna, dan melihat statistik penggunaan.

## ✨ Fitur

- **Autentikasi Admin** - Login aman untuk administrator
- **Manajemen Pengguna** - Tambah, edit, dan hapus pengguna
- **Analitik & Statistik** - Visualisasi data penggunaan dan hasil analisis
- **Monitoring Sistem** - Pantau status sistem dan layanan
- **Manajemen Konten** - Kelola konten informasi dan panduan
- **Log Aktivitas** - Lihat log aktivitas sistem dan pengguna
- **Konfigurasi Sistem** - Sesuaikan pengaturan sistem

## 🛠 Teknologi

- **React** - Library JavaScript untuk membangun antarmuka pengguna
- **Vite** - Build tool yang cepat untuk pengembangan modern
- **TailwindCSS** - Framework CSS untuk desain yang cepat dan responsif
- **React Router** - Routing untuk aplikasi React
- **Axios** - HTTP client untuk komunikasi dengan API
- **React Query** - Manajemen state dan fetching data
- **Recharts** - Library untuk visualisasi data
- **React Table** - Manajemen tabel data yang kompleks
- **React Hook Form** - Manajemen form dengan validasi
- **Zustand** - Manajemen state global yang ringan

## 🚀 Memulai

### Persyaratan

- Node.js (v14+)
- npm atau yarn

### Instalasi

1. Clone repository:
   ```bash
   git clone https://github.com/username/RetinaScan.git
   cd RetinaScan/dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   # atau
   yarn
   ```

3. Buat file `.env` di root folder:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_APP_NAME=RetinaScan Dashboard
   ```

4. Jalankan aplikasi:
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

5. Buka aplikasi di browser:
   ```
   http://localhost:3000
   ```

## 📂 Struktur Proyek

```
dashboard/
├── public/                # Asset publik
├── src/                   # Kode sumber
│   ├── assets/            # Asset statis (gambar, font, dll)
│   │   ├── charts/        # Komponen chart dan grafik
│   │   ├── common/        # Komponen umum (Button, Card, dll)
│   │   ├── layout/        # Komponen layout (Sidebar, Header, dll)
│   │   ├── tables/        # Komponen tabel
│   │   └── ui/            # Komponen UI khusus
│   ├── contexts/          # Context API untuk state management
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Komponen halaman
│   │   ├── auth/          # Halaman autentikasi
│   │   ├── dashboard/     # Halaman dashboard utama
│   │   ├── users/         # Halaman manajemen pengguna
│   │   ├── analytics/     # Halaman analitik dan statistik
│   │   └── settings/      # Halaman pengaturan
│   ├── services/          # Layanan API dan utilitas
│   ├── store/             # State management global
│   ├── styles/            # Style global dan utilitas
│   ├── utils/             # Fungsi utilitas
│   ├── App.jsx            # Komponen utama
│   ├── main.jsx           # Entry point
│   └── routes.jsx         # Konfigurasi rute
├── .env                   # Environment variables
├── .gitignore             # File yang diabaikan Git
├── index.html             # HTML template
├── package.json           # Dependencies dan scripts
├── tailwind.config.js     # Konfigurasi TailwindCSS
└── vite.config.js         # Konfigurasi Vite
```

## ⚙️ Konfigurasi

### Environment Variables

Buat file `.env` di root folder dengan variabel berikut:

```
VITE_API_URL=http://localhost:5000        # URL backend API
VITE_APP_NAME=RetinaScan Dashboard        # Nama aplikasi
VITE_FLASK_API_URL=http://localhost:5001  # URL Flask API (opsional)
```

### Scripts

- `npm run dev` - Menjalankan server pengembangan
- `npm run build` - Membangun aplikasi untuk production
- `npm run preview` - Preview build production
- `npm run lint` - Menjalankan linter
- `npm run test` - Menjalankan test

## 🚢 Deployment

### Build untuk Production

```bash
npm run build
# atau
yarn build
```

Build akan menghasilkan folder `dist` yang berisi file statis yang siap di-deploy.

### Deployment ke Render

1. Buat New Web Service di Render
2. Hubungkan dengan repository GitHub
3. Pilih direktori `dashboard`
4. Konfigurasi:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Output Directory: `dist`
5. Tambahkan environment variables yang diperlukan
6. Deploy!

### Akses Dashboard

Setelah deployment, dashboard dapat diakses di URL yang disediakan oleh Render. Untuk mengakses dashboard, Anda memerlukan kredensial admin yang valid.

Kredensial default untuk pengembangan:
- Username: admin@retinascan.com
- Password: admin123

**Catatan**: Pastikan untuk mengubah kredensial default sebelum deployment ke production!

---

<div align="center">
  <p>Bagian dari proyek RetinaScan - Sistem Deteksi Retinopati Diabetik</p>
</div>
