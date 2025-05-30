import History from '../components/dashboard/History';
import { withPageTransition } from '../context/ThemeContext';

function HistoryPageComponent() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mt-6">
        <History />
      </div>
    </div>
  );
}

const HistoryPage = withPageTransition(HistoryPageComponent);
export default HistoryPage;