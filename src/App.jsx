import { Routes, Route, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTheme } from './context/ThemeContext';
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
import { Particles } from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [currentTitle, setCurrentTitle] = useState('Dashboard');
  const { theme } = useTheme();
  
  // API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

  // Particles initialization
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine);
  }, []);

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

  // Particle options
  const particlesOptions = {
    fpsLimit: 60,
    particles: {
      number: {
        value: 30,
        density: {
          enable: true,
          value_area: 800
        }
      },
      color: {
        value: theme.primary
      },
      shape: {
        type: "circle",
        stroke: {
          width: 0,
          color: "#000000"
        },
      },
      opacity: {
        value: 0.3,
        random: true,
        animation: {
          enable: true,
          speed: 0.5,
          minimumValue: 0.1,
          sync: false
        }
      },
      size: {
        value: 3,
        random: true,
        animation: {
          enable: true,
          speed: 2,
          minimumValue: 0.5,
          sync: false
        }
      },
      links: {
        enable: true,
        distance: 150,
        color: theme.primary,
        opacity: 0.2,
        width: 1
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: "none",
        random: true,
        straight: false,
        outMode: "bounce",
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200
        }
      }
    },
    interactivity: {
      detectsOn: "canvas",
      events: {
        onHover: {
          enable: true,
          mode: "grab"
        },
        onClick: {
          enable: true,
          mode: "push"
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 140,
          lineLinked: {
            opacity: 0.5
          }
        },
        push: {
          quantity: 4
        }
      }
    },
    detectRetina: true
  };

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
      console.error('Error checking auth:', error);
      localStorage.removeItem('token');
      setLoading(false);
      toast.error('Terjadi kesalahan saat verifikasi. Silakan login kembali.');
      return false;
    }
  };
  
  // Handle logout button click
  const handleLogout = () => {
    safeLogout(FRONTEND_URL);
  };
  
  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div 
            className="w-16 h-16 mb-4 mx-auto border-4 border-t-blue-500 border-blue-200 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600">Memuat dashboard...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center p-8 bg-white rounded-xl shadow-lg"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">Anda harus login terlebih dahulu untuk mengakses dashboard.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = FRONTEND_URL}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            Kembali ke Halaman Utama
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Background Particles */}
      <div className="fixed inset-0 -z-10 opacity-40">
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particlesOptions}
          className="absolute inset-0"
        />
      </div>
      
      {/* Sidebar */}
      <Sidebar 
        toggleMobileMenu={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-[260px]">
        <Header 
          title={currentTitle} 
          toggleMobileMenu={toggleMobileMenu}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patient-data" element={<PatientDataPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/patient-history/:id" element={<PatientHistoryPage />} />
              <Route path="/edit-patient/:id" element={<EditPatientPage />} />
              <Route path="/scan-retina" element={<ScanRetinaPage />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/add-patient" element={<AddPatientPage />} />
              <Route path="/patient-profile/:id" element={<PatientProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;