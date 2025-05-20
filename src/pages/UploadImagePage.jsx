import Header from '../components/common/Header';
import UploadImage from '../components/dashboard/UploadImage';

function UploadImagePage({ toggleMobileMenu, isMobileMenuOpen }) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Header title="Unggah Citra" toggleMobileMenu={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
      <div className="mt-6">
        <UploadImage />
      </div>
    </div>
  );
}

export default UploadImagePage;