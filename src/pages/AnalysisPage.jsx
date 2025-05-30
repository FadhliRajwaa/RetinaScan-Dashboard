import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Analysis from '../components/dashboard/Analysis';
import { withPageTransition } from '../context/ThemeContext';
import { FiCpu, FiBarChart2, FiEye, FiFileText, FiInfo } from 'react-icons/fi';

function AnalysisPageComponent() {
  const [activeTab, setActiveTab] = useState('realtime');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        damping: 12,
        stiffness: 100
      }
    }
  };

  // Tabs for different analysis modes
  const tabs = [
    { id: 'realtime', label: 'Analisis Realtime', icon: <FiCpu /> },
    { id: 'batch', label: 'Analisis Batch', icon: <FiBarChart2 /> },
    { id: 'history', label: 'Riwayat Analisis', icon: <FiFileText /> },
    { id: 'info', label: 'Informasi', icon: <FiInfo /> },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Analisis Retina</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Analisis gambar retina menggunakan teknologi kecerdasan buatan untuk mendeteksi tanda-tanda retinopati diabetik
          </p>
        </div>

        {/* Tabs */}
        <motion.div 
          className="flex flex-wrap justify-center gap-2 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              variants={itemVariants}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          {activeTab === 'realtime' && (
            <div>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5">
                <h2 className="text-xl font-bold text-white text-center">Analisis Realtime</h2>
                <p className="text-indigo-100 text-center text-sm mt-1">
                  Analisis gambar retina secara langsung dan dapatkan hasil instan
                </p>
              </div>
              <div className="p-5 sm:p-8">
                <Analysis />
              </div>
            </div>
          )}

          {activeTab === 'batch' && (
            <div>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-5">
                <h2 className="text-xl font-bold text-white text-center">Analisis Batch</h2>
                <p className="text-blue-100 text-center text-sm mt-1">
                  Unggah dan analisis beberapa gambar retina sekaligus
                </p>
              </div>
              <div className="p-5 sm:p-8">
                <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <FiBarChart2 className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-1">Analisis Batch</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Fitur ini akan segera tersedia. Anda akan dapat mengunggah dan menganalisis beberapa gambar retina sekaligus.
                  </p>
                  <button 
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled
                  >
                    Segera Hadir
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-5">
                <h2 className="text-xl font-bold text-white text-center">Riwayat Analisis</h2>
                <p className="text-green-100 text-center text-sm mt-1">
                  Lihat dan bandingkan hasil analisis sebelumnya
                </p>
              </div>
              <div className="p-5 sm:p-8">
                <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <FiFileText className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-1">Riwayat Analisis</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Anda dapat melihat riwayat analisis pada halaman History. Klik tombol di bawah untuk melihat riwayat analisis.
                  </p>
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all"
                    onClick={() => window.location.href = '/history'}
                  >
                    Lihat Riwayat
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div>
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-5">
                <h2 className="text-xl font-bold text-white text-center">Informasi</h2>
                <p className="text-amber-100 text-center text-sm mt-1">
                  Pelajari lebih lanjut tentang retinopati diabetik dan analisis retina
                </p>
              </div>
              <div className="p-5 sm:p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Apa itu Retinopati Diabetik?</h3>
                    <p className="text-gray-600">
                      Retinopati diabetik adalah komplikasi diabetes yang mempengaruhi mata. Kondisi ini disebabkan oleh kerusakan pada pembuluh darah retina, lapisan jaringan yang peka terhadap cahaya di bagian belakang mata.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Tingkat Keparahan</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800">Tidak Ada DR / Ringan</h4>
                        <p className="text-green-700 text-sm mt-1">Tidak ada atau sedikit perubahan pada pembuluh darah retina</p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h4 className="font-medium text-yellow-800">Sedang</h4>
                        <p className="text-yellow-700 text-sm mt-1">Pembengkakan pembuluh darah retina yang menyebabkan kebocoran cairan</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h4 className="font-medium text-orange-800">Berat</h4>
                        <p className="text-orange-700 text-sm mt-1">Banyak pembuluh darah yang tersumbat, menyebabkan kurangnya aliran darah ke retina</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="font-medium text-red-800">Proliferatif</h4>
                        <p className="text-red-700 text-sm mt-1">Pertumbuhan pembuluh darah baru yang abnormal, dapat menyebabkan kebutaan</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Tentang Sistem Analisis</h3>
                    <p className="text-gray-600 mb-3">
                      Sistem analisis retina kami menggunakan model deep learning canggih yang dilatih dengan ribuan gambar retina. Sistem ini dapat mendeteksi tanda-tanda retinopati diabetik dengan akurasi tinggi.
                    </p>
                    <p className="text-gray-600">
                      <strong>Catatan penting:</strong> Hasil analisis dari sistem ini hanya bersifat informatif dan tidak menggantikan diagnosis medis profesional. Selalu konsultasikan dengan dokter mata untuk evaluasi menyeluruh.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

const AnalysisPage = withPageTransition(AnalysisPageComponent);
export default AnalysisPage;