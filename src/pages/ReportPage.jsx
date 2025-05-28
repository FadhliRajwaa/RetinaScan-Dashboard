import Report from '../components/dashboard/Report';
import { withPageTransition } from '../context/ThemeContext';

function ReportPageComponent() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mt-6">
        <Report />
      </div>
    </div>
  );
}

const ReportPage = withPageTransition(ReportPageComponent);
export default ReportPage;