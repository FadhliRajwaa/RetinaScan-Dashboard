import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSocket } from '../../context/SocketContext';
import { useNotification } from '../../context/NotificationContext';

const NotificationTest = () => {
  const { socket, connected, emit } = useSocket();
  const { notifications, unreadCount, markAllAsRead } = useNotification();
  const [selectedTest, setSelectedTest] = useState('patient_added');
  const [testResult, setTestResult] = useState(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  
  // Daftar tes yang tersedia
  const availableTests = [
    { id: 'patient_added', name: 'Notifikasi Pasien Baru' },
    { id: 'patient_updated', name: 'Notifikasi Update Pasien' },
    { id: 'patient_deleted', name: 'Notifikasi Hapus Pasien' },
    { id: 'new_analysis', name: 'Notifikasi Scan Retina Baru' },
    { id: 'general', name: 'Notifikasi Umum' },
    { id: 'socket_reconnect', name: 'Tes Reconnect Socket' },
    { id: 'local_notification', name: 'Notifikasi Lokal (Toast)' },
  ];
  
  // Data dummy untuk tes
  const dummyData = {
    patient_added: {
      patientId: 'test123',
      patientName: 'Pasien Test',
      timestamp: new Date().toISOString(),
      doctorId: 'doctor123'
    },
    patient_updated: {
      patientId: 'test123',
      patientName: 'Pasien Test (Updated)',
      timestamp: new Date().toISOString(),
      doctorId: 'doctor123'
    },
    patient_deleted: {
      patientId: 'test123',
      patientName: 'Pasien Test',
      timestamp: new Date().toISOString(),
      doctorId: 'doctor123'
    },
    new_analysis: {
      analysisId: 'analysis123',
      patientId: 'test123',
      patientName: 'Pasien Test',
      severity: 'Sedang',
      severityLevel: 2,
      timestamp: new Date().toISOString(),
      doctorId: 'doctor123'
    },
    general: {
      title: 'Notifikasi Test',
      message: 'Ini adalah notifikasi test umum',
      type: 'general',
      data: {
        timestamp: new Date().toISOString()
      }
    }
  };
  
  // Mencegah multiple test runs
  useEffect(() => {
    if (isTestRunning) {
      const timer = setTimeout(() => {
        setIsTestRunning(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isTestRunning]);
  
  const runTest = () => {
    // Mencegah multiple test runs
    if (isTestRunning) {
      setTestResult({
        success: false,
        message: 'Mohon tunggu, tes sedang berjalan...'
      });
      return;
    }
    
    setIsTestRunning(true);
    setTestResult(null);
    
    try {
      switch (selectedTest) {
        case 'patient_added':
        case 'patient_updated':
        case 'patient_deleted':
        case 'new_analysis':
          // Tes notifikasi melalui socket
          if (!connected) {
            setTestResult({
              success: false,
              message: 'Socket tidak terhubung. Pastikan Anda sudah login dan server berjalan.'
            });
            setIsTestRunning(false);
            return;
          }
          
          // Emit event ke server (ini akan dikirim kembali ke semua klien)
          const emitSuccess = emit(selectedTest, dummyData[selectedTest]);
          
          if (!emitSuccess) {
            setTestResult({
              success: false,
              message: 'Gagal mengirim event ke server. Socket mungkin tidak terhubung dengan baik.'
            });
            setIsTestRunning(false);
            return;
          }
          
          setTestResult({
            success: true,
            message: `Event ${selectedTest} berhasil dikirim ke server. Periksa notifikasi yang muncul.`
          });
          break;
          
        case 'general':
          // Tes notifikasi umum
          if (!connected) {
            setTestResult({
              success: false,
              message: 'Socket tidak terhubung. Pastikan Anda sudah login dan server berjalan.'
            });
            setIsTestRunning(false);
            return;
          }
          
          // Emit event ke server
          const generalSuccess = emit('notification', dummyData.general);
          
          if (!generalSuccess) {
            setTestResult({
              success: false,
              message: 'Gagal mengirim notifikasi umum. Socket mungkin tidak terhubung dengan baik.'
            });
            setIsTestRunning(false);
            return;
          }
          
          setTestResult({
            success: true,
            message: 'Notifikasi umum berhasil dikirim. Periksa notifikasi yang muncul.'
          });
          break;
          
        case 'socket_reconnect':
          // Tes reconnect socket
          if (!socket) {
            setTestResult({
              success: false,
              message: 'Socket tidak tersedia. Pastikan Anda sudah login.'
            });
            setIsTestRunning(false);
            return;
          }
          
          try {
            // Disconnect socket untuk memicu reconnect
            socket.disconnect();
            
            // Tunggu sebentar lalu connect kembali
            setTimeout(() => {
              try {
                socket.connect();
                
                setTestResult({
                  success: true,
                  message: 'Socket berhasil disconnect dan reconnect. Periksa notifikasi reconnect.'
                });
              } catch (reconnectError) {
                console.error('Error saat reconnect socket:', reconnectError);
                setTestResult({
                  success: false,
                  message: `Error saat reconnect socket: ${reconnectError.message || 'Unknown error'}`
                });
              } finally {
                setIsTestRunning(false);
              }
            }, 2000);
          } catch (disconnectError) {
            console.error('Error saat disconnect socket:', disconnectError);
            setTestResult({
              success: false,
              message: `Error saat disconnect socket: ${disconnectError.message || 'Unknown error'}`
            });
            setIsTestRunning(false);
          }
          return; // Early return karena kita menangani isTestRunning di callback
          
        case 'local_notification':
          // Tes toast notification lokal
          try {
            toast.info('Ini adalah notifikasi toast test', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              style: {
                fontSize: '14px',
                maxWidth: '100%',
                width: window.innerWidth < 640 ? '90%' : '400px'
              }
            });
            
            toast.success('Notifikasi sukses test', {
              position: "top-right",
              autoClose: 5000
            });
            
            toast.warning('Notifikasi peringatan test', {
              position: "top-right",
              autoClose: 5000
            });
            
            toast.error('Notifikasi error test', {
              position: "top-right",
              autoClose: 5000
            });
            
            setTestResult({
              success: true,
              message: 'Toast notifications berhasil ditampilkan.'
            });
          } catch (toastError) {
            console.error('Error saat menampilkan toast:', toastError);
            setTestResult({
              success: false,
              message: `Error saat menampilkan toast: ${toastError.message || 'Unknown error'}`
            });
          }
          break;
          
        default:
          setTestResult({
            success: false,
            message: 'Jenis tes tidak dikenali.'
          });
      }
    } catch (error) {
      console.error('Error saat menjalankan tes:', error);
      setTestResult({
        success: false,
        message: `Error saat menjalankan tes: ${error.message || 'Unknown error'}`
      });
    } finally {
      if (selectedTest !== 'socket_reconnect') {
        setIsTestRunning(false);
      }
    }
  };
  
  // Fungsi untuk memainkan suara notifikasi
  const playNotificationSound = () => {
    try {
      // Coba gunakan Audio API
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      
      // Tambahkan event listener untuk error
      audio.addEventListener('error', (e) => {
        console.error('Error loading audio:', e);
        setTestResult({
          success: false,
          message: `Error saat memuat file suara: ${e.target.error ? e.target.error.message : 'File tidak tersedia'}`
        });
      });
      
      // Play audio dengan promise handling
      const playPromise = audio.play();
      
      // Modern browsers return a promise
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setTestResult({
              success: true,
              message: 'Suara notifikasi berhasil diputar.'
            });
          })
          .catch(error => {
            console.error('Error playing audio:', error);
            // Fallback ke beep API jika tersedia
            if ('Audio' in window) {
              try {
                const beep = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");
                beep.volume = 0.5;
                beep.play()
                  .then(() => {
                    setTestResult({
                      success: true,
                      message: 'File suara utama tidak tersedia. Menggunakan suara beep alternatif.'
                    });
                  })
                  .catch(beepPlayError => {
                    setTestResult({
                      success: false,
                      message: `Tidak dapat memutar suara beep: ${beepPlayError.message || 'Unknown error'}`
                    });
                  });
              } catch (beepError) {
                setTestResult({
                  success: false,
                  message: `Tidak dapat memutar suara: ${error.message || 'Unknown error'}`
                });
              }
            } else {
              setTestResult({
                success: false,
                message: `Tidak dapat memutar suara: ${error.message || 'Unknown error'}`
              });
            }
          });
      } else {
        // Fallback untuk browser lama
        setTestResult({
          success: true,
          message: 'Mencoba memutar suara (browser lama tidak mendukung promise).'
        });
      }
    } catch (error) {
      console.error('Error in audio playback:', error);
      setTestResult({
        success: false,
        message: `Error saat memuat file suara: ${error.message || 'Unknown error'}`
      });
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Pengujian Sistem Notifikasi</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Status Koneksi Socket</h3>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{connected ? 'Terhubung' : 'Terputus'}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {connected 
            ? 'Socket terhubung dan siap menerima notifikasi real-time.' 
            : 'Socket tidak terhubung. Notifikasi real-time tidak akan berfungsi.'}
        </p>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Status Notifikasi</h3>
        <p>Total notifikasi: {notifications.length}</p>
        <p>Notifikasi belum dibaca: {unreadCount}</p>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
          >
            Tandai Semua Dibaca
          </button>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Pilih Jenis Tes</h3>
        <select 
          value={selectedTest}
          onChange={(e) => setSelectedTest(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          disabled={isTestRunning}
        >
          {availableTests.map(test => (
            <option key={test.id} value={test.id}>{test.name}</option>
          ))}
        </select>
      </div>
      
      <div className="flex space-x-2">
        <button 
          onClick={runTest}
          disabled={isTestRunning}
          className={`px-4 py-2 ${isTestRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md transition-colors`}
        >
          {isTestRunning ? 'Menjalankan Tes...' : 'Jalankan Tes'}
        </button>
        
        <button 
          onClick={playNotificationSound}
          disabled={isTestRunning}
          className={`px-4 py-2 ${isTestRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-md transition-colors`}
        >
          Tes Suara Notifikasi
        </button>
      </div>
      
      {testResult && (
        <div className={`mt-6 p-4 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h4 className={`font-medium ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {testResult.success ? 'Tes Berhasil' : 'Tes Gagal'}
          </h4>
          <p className={`mt-1 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
            {testResult.message}
          </p>
        </div>
      )}
      
      <div className="mt-8 border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Instruksi Pengujian</h3>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Pilih jenis tes yang ingin dijalankan dari dropdown di atas.</li>
          <li>Klik tombol "Jalankan Tes" untuk memulai pengujian.</li>
          <li>Perhatikan notifikasi yang muncul di pojok kanan atas (toast) dan di ikon notifikasi.</li>
          <li>Klik ikon notifikasi untuk melihat daftar notifikasi yang telah diterima.</li>
          <li>Verifikasi bahwa notifikasi muncul dengan benar, termasuk warna, ikon, dan pesan.</li>
          <li>Tes pada berbagai perangkat (desktop dan mobile) untuk memastikan tampilan responsif.</li>
          <li>Gunakan tombol "Tes Suara Notifikasi" untuk memverifikasi bahwa suara notifikasi berfungsi.</li>
        </ol>
      </div>
    </div>
  );
};

export default NotificationTest; 