import { Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import PatientDataPage from './pages/PatientDataPage';
import HistoryPage from './pages/HistoryPage';
import PatientHistoryPage from './pages/PatientHistoryPage';
import EditPatientPage from './pages/EditPatientPage';
import ScanRetinaPage from './pages/ScanRetinaPage';
import AnalysisPage from './pages/AnalysisPage';
import ReportPage from './pages/ReportPage';
import AddPatientPage from './pages/AddPatientPage';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
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
      
      // Remove token from URL for security
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('Token removed from URL');
      
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
              }
            } catch (error) {
              console.error('Failed to decode new token:', error);
            }
            
            checkProfile();
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error('Error verifying new token:', error);
          setLoading(false);
        }
      };
      
      verifyNewToken();
    }
  }, [searchParams]);

  const checkAuth = async () => {
    console.log('Checking authentication...');
    console.log('API URL:', API_URL);
    
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found in localStorage');
      setLoading(false);
      return false;
    }
    
    console.log('Token found in localStorage');
    
    try {
      // Pertama verifikasi token di sisi klien
      const decodedToken = jwtDecode(token);
      console.log('Token decoded successfully:', { id: decodedToken.id, exp: decodedToken.exp });
      
      const currentTime = Date.now() / 1000;
      console.log('Current time:', currentTime);
      
      if (decodedToken.exp < currentTime) {
        console.log('Token expired');
        localStorage.removeItem('token');
        setLoading(false);
        return false;
      }
      
      console.log('Token not expired, validating with server...');
      
      // Kemudian validasi dengan server untuk memastikan token masih valid
      try {
        const response = await axios.get(`${API_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Server validation successful:', response.status);
        return true;
      } catch (apiError) {
        console.error('Token tidak valid atau sesi telah berakhir:', apiError);
        
        // Coba dengan endpoint lain jika tersedia
        try {
          console.log('Trying alternative endpoint for validation...');
          const altResponse = await axios.get(`${API_URL}/api/auth/verify`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          console.log('Alternative validation successful:', altResponse.status);
          return true;
        } catch (altError) {
          console.error('Alternative validation failed:', altError);
          localStorage.removeItem('token');
          setLoading(false);
          return false;
        }
      }
    } catch (error) {
      console.error('Invalid token format:', error);
      localStorage.removeItem('token');
      setLoading(false);
      return false;
    }
  };

  // Check profile completion
  const checkProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Try get profile from the correct endpoint
      const response = await axios.get(`${API_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Check if profile has required fields
      console.log('Profile data:', response.data);
      if (response.data && response.data.fullName && response.data.dateOfBirth && response.data.gender) {
        console.log('Data pasien sudah lengkap');
        setIsProfileComplete(true);
      } else {
        console.log('Data pasien belum lengkap');
        setIsProfileComplete(false);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error memeriksa data pasien:', error);
      setLoading(false);
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
        
        checkProfile();
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

  const updateProfileStatus = () => {
    console.log('Memperbarui status data pasien menjadi lengkap');
    setIsProfileComplete(true);
  };

  // Logging profile status for debugging
  useEffect(() => {
    console.log('Status kelengkapan data pasien:', isProfileComplete);
  }, [isProfileComplete]);

  // Early return for loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to frontend');
    // Arahkan ke halaman landing page dengan parameter untuk menandai asal redirect
    window.location.href = `${FRONTEND_URL}/?from=dashboard&auth=failed`;
    return null;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
      <Sidebar toggleMobileMenu={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
      
      <main className="flex-1 p-0 lg:p-4 overflow-hidden transition-all duration-200" style={{ 
        marginLeft: isMobileMenuOpen ? '0' : '0',
        willChange: 'margin, padding',
      }}>
        {/* Global Header used in all pages */}
        <Header 
          title={currentTitle} 
          toggleMobileMenu={toggleMobileMenu} 
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard userId={userId} />} />
            <Route path="/dashboard" element={<Dashboard userId={userId} />} />
            <Route path="/patient-data" element={<PatientDataPage userId={userId} updateProfileStatus={updateProfileStatus} />} />
            <Route path="/add-patient" element={<AddPatientPage userId={userId} />} />
            <Route path="/edit-patient/:patientId" element={<EditPatientPage userId={userId} />} />
            <Route path="/scan-retina" element={<ScanRetinaPage userId={userId} />} />
            <Route path="/history" element={<HistoryPage userId={userId} />} />
            <Route path="/patient-history/:patientId" element={<PatientHistoryPage userId={userId} />} />
            <Route path="/analysis" element={<AnalysisPage userId={userId} />} />
            <Route path="/report" element={<ReportPage userId={userId} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;