# RetinaScan Dashboard

Dashboard untuk manajemen dan analisis data Retinopati Diabetik dari RetinaScan.

## PENTING: Dashboard Menggunakan Model ML (Bukan Simulasi)

**Dashboard ini dirancang untuk HANYA menggunakan model ML sebenarnya, bukan data simulasi.**

Jika Flask API dengan model ML tidak tersedia, dashboard akan menampilkan pesan error yang jelas daripada menggunakan data simulasi. Ini untuk memastikan bahwa analisis yang ditampilkan selalu menggunakan model ML yang sebenarnya, bukan data acak.

## Menjalankan Dashboard

1. Install dependencies:
   ```
   npm install
   ```

2. Jalankan dashboard:
   ```
   npm run dev
   ```

3. Buka browser di http://localhost:3000

## Memastikan Koneksi Flask API (Model ML)

Dashboard ini memerlukan koneksi ke Flask API yang memuat model machine learning untuk analisis gambar retina. 

### Menguji Koneksi Flask API

Untuk memastikan dashboard menggunakan model ML yang sebenarnya (bukan data simulasi), lakukan langkah-langkah berikut:

1. Pastikan backend Node.js dan Flask API berjalan:
   ```bash
   # Terminal 1: Jalankan backend Node.js
   cd backend
   npm run dev
   
   # Terminal 2: Jalankan Flask API
   cd backend/flask_service
   python app.py
   ```

2. Jalankan script pengujian koneksi Flask API:
   ```bash
   cd backend
   npm run test:flask
   ```

3. Perhatikan output dari script pengujian:
   - ✅ **Model nyata aktif**: Jika script menunjukkan "RECOMMENDED: URL with real model (non-simulation)"
   - ⚠️ **Mode simulasi aktif**: Jika script menunjukkan "RECOMMENDED: URL with simulation mode"

4. Jika perlu, perbarui variabel `FLASK_API_URL` di file `.env` dengan URL yang direkomendasikan.

### Indikator Mode Simulasi

Dashboard akan menampilkan indikator yang jelas ketika menggunakan data simulasi:

1. Banner peringatan berwarna kuning akan muncul di atas hasil analisis dan laporan.
2. Label "SIMULASI" akan ditampilkan pada gambar dan hasil.
3. Pesan peringatan menyatakan bahwa hasil simulasi tidak boleh digunakan untuk diagnosis.

### Memastikan Model ML Berjalan dengan Benar

Untuk memastikan model machine learning berjalan dengan benar:

1. Periksa output Flask API di terminal untuk memastikan model berhasil dimuat:
   ```
   Model loaded successfully!
   ```

2. Periksa apakah mode simulasi dinonaktifkan:
   ```
   Simulation mode: disabled
   ```

3. Jika terjadi masalah saat memuat model, pastikan:
   - File model tersedia di lokasi yang benar (`backend/flask_service/model-Retinopaty.h5`)
   - TensorFlow terinstal dengan benar
   - Memori sistem mencukupi untuk memuat model

## Troubleshooting

### Masalah Koneksi Flask API

1. **Flask API tidak tersedia**:
   - Pastikan Flask API berjalan (`python app.py`)
   - Periksa error di log Flask API
   - Periksa apakah port 5000 tersedia

2. **Hanya mode simulasi yang tersedia**:
   - Periksa apakah model berhasil dimuat di Flask API
   - Pastikan `SIMULATION_MODE_ENABLED=false` di environment Flask API
   - Jika model terlalu besar, pertimbangkan menggunakan model yang lebih kecil

3. **Error saat memuat model**:
   - Periksa ketersediaan file model
   - Periksa versi TensorFlow
   - Pastikan memiliki memori yang cukup

### Menguji API tanpa Model

Jika hanya ingin menguji API tanpa memuat model besar:

```bash
# Jalankan Flask API dengan mode simulasi
cd backend/flask_service
SIMULATION_MODE_ENABLED=true python app.py
```

Dalam mode ini, API akan memberikan prediksi acak tetapi masih dapat digunakan untuk pengembangan UI.

## Real-Time Data dengan WebSocket

Dashboard RetinaScan mendukung pembaruan data secara real-time menggunakan WebSocket. Ini memungkinkan dashboard untuk menampilkan data terbaru tanpa perlu me-refresh halaman.

### Fitur Real-Time

- **Indikator Koneksi Real-Time**: Menampilkan status koneksi WebSocket (online/offline)
- **Pembaruan Otomatis**: Data diperbarui secara otomatis saat ada perubahan di server
- **Fallback ke Polling**: Jika koneksi WebSocket tidak tersedia, sistem akan menggunakan polling setiap 30 detik
- **Pembaruan Manual**: Tombol refresh pada chart untuk meminta pembaruan data terbaru secara manual

### Event WebSocket yang Didukung

- `dashboard_update`: Memperbarui seluruh data dashboard
- `severity_update`: Memperbarui data distribusi tingkat keparahan
- `analysis_complete`: Memicu pembaruan dashboard saat analisis baru selesai

### Implementasi WebSocket

WebSocket diimplementasikan menggunakan socket.io-client dan tersedia melalui context API:

```jsx
import { useWebSocket } from '../../context/WebSocketContext';

function MyComponent() {
  const { connected, lastUpdate, requestUpdate } = useWebSocket();
  
  // Meminta pembaruan data secara manual
  const handleRefresh = () => {
    requestUpdate('dashboard');
  };
  
  return (
    <div>
      {connected ? 'Real-time aktif' : 'Offline'}
      <button onClick={handleRefresh}>Refresh</button>
    </div>
  );
}
```
