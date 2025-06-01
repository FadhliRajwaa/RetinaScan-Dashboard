import { Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import Dashboard from './pages/Dashboard';
import PatientDataPage from './pages/PatientDataPage';
import HistoryPage from './pages/HistoryPage';
import PatientHistoryPage from './pages/PatientHistoryPage';
import EditPatientPage from './pages/EditPatientPage';
import ScanRetinaPage from './pages/ScanRetinaPage';
import AnalysisPage from './pages/AnalysisPage';
import ReportPage from './pages/ReportPage';
import AddPatientPage from './pages/AddPatientPage';
import PatientProfilePage from './pages/PatientProfilePage';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import { safeLogout } from './utils/logoutHelper';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [currentTitle, setCurrentTitle] = useState('Dashboard');
  
  // API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

  // Update title based on current path
  useEffect(() => {
    const path = location.pathname;
    console.log('Current path:', path);
    
    if (path === '/' || path === '/dashboard') setCurrentTitle('Dashboard');
    else if (path === '/patient-data') setCurrentTitle('Data Pasien');
    else if (path === '/scan-retina') setCurrentTitle('Scan Retina');
    else if (path === '/history') setCurrentTitle('History');
    else if (path === '/analysis') setCurrentTitle('Analysis');
    else if (path === '/report') setCurrentTitle('Report');
  }, [location.pathname]);

  // Handle token from URL query parameter
  useEffect(() => {
    const tokenFromURL = searchParams.get('token');
    console.log('Token from URL:', tokenFromURL ? 'Present (hidden for security)' : 'Not present');
    
    if (tokenFromURL) {
      // Simpan token ke localStorage
      localStorage.setItem('token', tokenFromURL);
      console.log('Token saved to localStorage');
      
      // Remove token from URL for security using HashRouter compatible method
      const newUrl = window.location.pathname + window.location.hash.split('?')[0];
      window.history.replaceState({}, document.title, newUrl);
      console.log('Token removed from URL, new URL:', newUrl);
      
      // Verifikasi token yang baru disimpan
      const verifyNewToken = async () => {
        try {
          const authResult = await checkAuth();
          console.log('New token verification result:', authResult);
          setIsAuthenticated(authResult);
          
          if (authResult) {
            // Ambil dan simpan ID pengguna dari token
            try {
              const decodedToken = jwtDecode(tokenFromURL);
              console.log('Token decoded successfully');
              
              if (decodedToken && decodedToken.id) {
                setUserId(decodedToken.id);
                console.log('User ID set from new token:', decodedToken.id);
                
                // Tampilkan notifikasi sukses
                toast.success('Login berhasil! Selamat datang di dashboard admin.');
              }
            } catch (error) {
              console.error('Failed to decode new token:', error);
              toast.error('Terjadi kesalahan saat memproses token.');
            }
          } else {
            setLoading(false);
            toast.error('Token tidak valid. Silakan login kembali.');
            
            // Redirect ke halaman login jika token tidak valid
            setTimeout(() => {
              safeLogout(FRONTEND_URL);
            }, 2000);
          }
        } catch (error) {
          console.error('Error verifying new token:', error);
          setLoading(false);
          toast.error('Terjadi kesalahan saat verifikasi. Silakan login kembali.');
        }
      };
      
      verifyNewToken();
    } else {
      console.log('No token in URL, checking localStorage');
      // Jika tidak ada token di URL, periksa di localStorage
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        console.log('Token found in localStorage, verifying...');
        const verifyStoredToken = async () => {
          const authResult = await checkAuth();
          setIsAuthenticated(authResult);
          if (authResult) {
            try {
              const decodedToken = jwtDecode(storedToken);
              if (decodedToken && decodedToken.id) {
                setUserId(decodedToken.id);
                setLoading(false);
              }
            } catch (error) {
              console.error('Failed to decode stored token:', error);
              toast.error('Token tidak valid. Silakan login kembali.');
              setLoading(false);
            }
          } else {
            setLoading(false);
            toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
            
            // Redirect ke halaman login jika token tidak valid
            setTimeout(() => {
              safeLogout(FRONTEND_URL);
            }, 2000);
          }
        };
        verifyStoredToken();
      } else {
        console.log('No token found anywhere');
        setLoading(false);
        
        // Redirect ke halaman login jika tidak ada token
        safeLogout(FRONTEND_URL);
      }
    }
  }, [searchParams, API_URL, FRONTEND_URL]);

  const checkAuth = async () => {
    console.log('Checking authentication...');
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found in localStorage');
      setLoading(false);
      return false;
    }
    
    try {
      // Pertama verifikasi token di sisi klien
      try {
        const decodedToken = jwtDecode(token);
        
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          console.log('Token expired');
          localStorage.removeItem('token');
          setLoading(false);
          toast.error('Token Anda telah kadaluarsa. Silakan login kembali.');
          return false;
        }
      } catch (decodeError) {
        console.error('Failed to decode token');
      }
      
      // Validasi dengan server dengan timeout yang lebih panjang untuk cold start
      try {
        const response = await axios.get(`${API_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          timeout: 30000 // 30 detik timeout
        });
        
        setLoading(false);
        return true;
      } catch (apiError) {
        // Jika endpoint profile gagal, coba endpoint verify
        try {
          const altResponse = await axios.get(`${API_URL}/api/auth/verify`, {
            headers: {
              Authorization: `Bearer ${token}`
            },
            timeout: 30000 // 30 detik timeout
          });
          
          setLoading(false);
          return true;
        } catch (altError) {
          localStorage.removeItem('token');
          setLoading(false);
          toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
          return false;
        }
      }
    } catch (error) {
      localStorage.removeItem('token');
      setLoading(false);
      toast.error('Token tidak valid. Silakan login kembali.');
      return false;
    }
  };

  // Simpan userId dalam state untuk digunakan di seluruh aplikasi
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const authResult = await checkAuth();
      setIsAuthenticated(authResult);
      
      if (authResult) {
        // Ambil dan simpan ID pengguna dari token
        try {
          const token = localStorage.getItem('token');
          const decodedToken = jwtDecode(token);
          console.log('Token decoded:', decodedToken);
          
          if (decodedToken && decodedToken.id) {
            setUserId(decodedToken.id);
            console.log('User ID set:', decodedToken.id);
          }
        } catch (error) {
          console.error('Failed to extract user ID from token:', error);
        }
        
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    
    verifyAuth();
  }, []);

  const toggleMobileMenu = () => {
    console.log('Toggling mobile menu, current state:', isMobileMenuOpen);
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Early return for loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="relative h-16 w-16">
          <div className="absolute top-0 left-0 right-0 bottom-0 animate-spin rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-300 border-l-transparent"></div>
          <div className="absolute top-2 left-2 right-2 bottom-2 animate-ping rounded-full border-2 border-blue-500 opacity-30"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to frontend');
    // Arahkan ke halaman landing page dengan parameter untuk menandai asal redirect
    // Pastikan URL menggunakan format yang benar untuk HashRouter di frontend
    window.location.href = `${FRONTEND_URL}/#/?from=dashboard&auth=failed`;
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Sidebar toggleMobileMenu={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
      
      <main className="flex-1 overflow-x-hidden transition-all duration-300 relative" style={{ 
        willChange: 'transform',
        maxWidth: '100vw'
      }}>
        {/* Global Header used in all pages */}
        <Header 
          title={currentTitle} 
          toggleMobileMenu={toggleMobileMenu} 
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <div className="px-4 sm:px-6 md:px-8 pb-8 w-full max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Dashboard userId={userId} />} />
              <Route path="/dashboard" element={<Dashboard userId={userId} />} />
              <Route path="/patient-data" element={<PatientDataPage userId={userId} />} />
              <Route path="/add-patient" element={<AddPatientPage userId={userId} />} />
              <Route path="/edit-patient/:patientId" element={<EditPatientPage userId={userId} />} />
              <Route path="/patient-profile/:patientId" element={<PatientProfilePage userId={userId} />} />
              <Route path="/scan-retina" element={<ScanRetinaPage userId={userId} />} />
              <Route path="/history" element={<HistoryPage userId={userId} />} />
              <Route path="/patient-history/:patientId" element={<PatientHistoryPage userId={userId} />} />
              <Route path="/analysis" element={<AnalysisPage userId={userId} />} />
              <Route path="/analysis-result" element={<AnalysisPage userId={userId} />} />
              <Route path="/report" element={<ReportPage userId={userId} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;