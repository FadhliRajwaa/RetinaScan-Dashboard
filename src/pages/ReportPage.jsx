import { withPageTransition } from '../context/ThemeContext';
import Report from '../components/dashboard/Report';

function ReportPageComponent() {
  return (
    <div className="p-4">
      <Report />
    </div>
  );
}

// Menggunakan efek fade untuk halaman laporan
const ReportPage = withPageTransition(ReportPageComponent, "fade");
export default ReportPage;