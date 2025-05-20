# RetinaScan Dashboard - Deployment Guide

## Cara Deploy ke Render

### 1. Persiapan

Sebelum deploy, pastikan variabel lingkungan sudah diatur dengan benar:

- Buat file `.env` di direktori root dashboard dengan isi berikut:
```
VITE_API_URL=https://retinascan-backend-eszo.onrender.com
VITE_FRONTEND_URL=https://retinascan.onrender.com
```

### 2. Build Aplikasi

```bash
# Install dependencies (jika belum)
npm install

# Build untuk production
npm run build
```

### 3. Deploy ke Render

1. Login ke dashboard Render (https://dashboard.render.com)
2. Pilih "Web Services" dan klik "New Web Service"
3. Hubungkan dengan GitHub repository
4. Pilih branch yang ingin di-deploy
5. Konfigurasi deploy settings:
   - Name: retinascan-dashboard
   - Root Directory: dashboard
   - Environment: Static Site
   - Build Command: `npm run build`
   - Publish Directory: `dist`

6. Tambahkan Environment Variables:
   - VITE_API_URL=https://retinascan-backend-eszo.onrender.com
   - VITE_FRONTEND_URL=https://retinascan.onrender.com

7. Klik "Create Web Service"

### 4. Konfigurasi Lanjutan

1. **Redirect Settings**: 
   Tambahkan konfigurasi redirect di Render untuk SPA router. Di Render dashboard, pilih "Redirects/Rewrites":
   
   ```
   Source: /*
   Destination: /index.html
   Action: Rewrite
   ```

2. **CORS**: 
   Pastikan backend memiliki konfigurasi CORS yang mengizinkan domain dashboard:
   ```javascript
   app.use(cors({
     origin: ['https://retinascan.onrender.com', 'https://retinascan-dashboard.onrender.com'],
     credentials: true,
   }));
   ```

### 5. Troubleshooting

Jika terjadi masalah koneksi ke backend:

1. Periksa console browser untuk error
2. Pastikan VITE_API_URL sudah benar dan diakses dari aplikasi
3. Periksa CORS settings di backend
4. Pastikan backend berjalan dengan baik
5. Periksa Socket.io connection jika fitur real-time tidak berfungsi

### 6. Cara Update Deployment

Setelah melakukan perubahan kode:

1. Commit dan push perubahan ke GitHub
2. Render akan secara otomatis melakukan re-deploy (jika auto-deploy aktif)
3. Atau, untuk deploy manual, klik "Manual Deploy" > "Clear build cache & deploy"

## Konfigurasi Environment Variables

Environment variables yang dibutuhkan untuk dashboard:

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | URL dari backend API | http://localhost:5000 |
| VITE_FRONTEND_URL | URL dari frontend aplikasi | http://localhost:5173 |