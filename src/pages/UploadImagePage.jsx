import { useState } from 'react';
import Header from '../components/common/Header';
import UploadImage from '../components/dashboard/UploadImage';
import Analysis from '../components/dashboard/Analysis';
import { useNavigate } from 'react-router-dom';

function UploadImagePage({ toggleMobileMenu, isMobileMenuOpen }) {
  const [uploadCount, setUploadCount] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const navigate = useNavigate();

  const handleUploadSuccess = (result) => {
    console.log('Upload berhasil:', result);
    // Increment upload count to force component refresh
    setUploadCount(prev => prev + 1);
    
    // Set upload result untuk ditampilkan di komponen Analysis
    if (result) {
      try {
        // Validasi dan ambil data prediction dengan nilai default jika tidak ada
        const prediction = result.prediction || {};
        
        // Format data untuk komponen Analysis dengan validasi
        const analysisData = {
          severity: prediction.severity || 'Tidak diketahui',
          severityLevel: prediction.severityLevel !== undefined ? prediction.severityLevel : 0,
          confidence: prediction.confidence || 0,
          recommendation: prediction.recommendation || 'Tidak ada rekomendasi',
          image: {
            preview: result.preview || null
          },
          analysisId: prediction.analysisId || result.id || '',
          patientId: prediction.patientId || '',
          isSimulation: prediction.isSimulation || false
        };
        
        console.log('Data analisis yang diformat:', analysisData);
        setUploadResult(analysisData);
      } catch (error) {
        console.error('Error saat memproses data hasil upload:', error);
        // Tetap tampilkan hasil meskipun ada error dengan data minimal
        setUploadResult({
          severity: 'Tidak diketahui',
          severityLevel: 0,
          confidence: 0,
          recommendation: 'Terjadi kesalahan saat memproses data',
          image: {
            preview: result.preview || null
          }
        });
      }
    }
  };

  const handleViewResults = (analysis) => {
    // Navigasi ke halaman detail analisis
    if (analysis && analysis.analysisId) {
      navigate(`/analysis/${analysis.analysisId}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Header title="Unggah Citra" toggleMobileMenu={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
      <div className="mt-6">
        <UploadImage 
          key={`upload-${uploadCount}`} 
          autoUpload={true} 
          onUploadSuccess={handleUploadSuccess} 
        />
      </div>
      
      {/* Tampilkan hasil analisis jika ada */}
      {uploadResult && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Hasil Analisis</h2>
          <Analysis 
            image={uploadResult.image}
            analysis={uploadResult}
            onAnalysisComplete={handleViewResults}
          />
        </div>
      )}
    </div>
  );
}

export default UploadImagePage;