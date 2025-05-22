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
    if (result && result.prediction) {
      // Format data untuk komponen Analysis
      const analysisData = {
        severity: result.prediction.severity,
        severityLevel: result.prediction.severityLevel,
        confidence: result.prediction.confidence,
        recommendation: result.prediction.recommendation,
        image: {
          preview: result.preview
        },
        analysisId: result.prediction.analysisId,
        patientId: result.prediction.patientId,
        isSimulation: result.prediction.isSimulation
      };
      
      setUploadResult(analysisData);
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