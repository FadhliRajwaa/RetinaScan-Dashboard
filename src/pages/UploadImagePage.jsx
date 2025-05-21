import { useState } from 'react';
import Header from '../components/common/Header';
import UploadImage from '../components/dashboard/UploadImage';

function UploadImagePage({ toggleMobileMenu, isMobileMenuOpen }) {
  const [uploadCount, setUploadCount] = useState(0);

  const handleUploadSuccess = () => {
    // Increment upload count to force component refresh
    setUploadCount(prev => prev + 1);
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
    </div>
  );
}

export default UploadImagePage;