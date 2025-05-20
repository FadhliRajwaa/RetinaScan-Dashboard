import Analysis from '../components/dashboard/Analysis';
import { withPageTransition } from '../context/ThemeContext';

function AnalysisPageComponent() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mt-6">
        <Analysis />
      </div>
    </div>
  );
}

const AnalysisPage = withPageTransition(AnalysisPageComponent);
export default AnalysisPage;