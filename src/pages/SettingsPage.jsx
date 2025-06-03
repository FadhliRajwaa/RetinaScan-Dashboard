import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  MoonIcon, 
  SunIcon, 
  UserCircleIcon, 
  ShieldCheckIcon, 
  PaintBrushIcon, 
  CogIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CheckIcon,
  UserIcon,
  KeyIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  LockClosedIcon,
  DocumentTextIcon,
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { withPageTransition } from '../context/ThemeContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { toast } from 'react-toastify';
import axios from 'axios';

function SettingsPageComponent() {
  const { theme, setTheme, isDarkMode, toggleDarkMode } = useTheme();
  const { unreadCount, notificationSettings, updateNotificationSettings } = useNotification();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // State untuk pengaturan
  const [settings, setSettings] = useState({
    notifications: {
      patient_added: true,
      patient_updated: true,
      patient_deleted: true,
      scan_added: true,
      scan_updated: true,
      system: true
    },
    appearance: {
      theme: 'blue',
      darkMode: isDarkMode,
      animations: true
    },
    privacy: {
      shareData: false,
      analytics: true
    },
    account: {
      name: '',
      email: '',
      avatar: null
    }
  });
  
  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState('notifications');
  
  // State untuk form password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // State untuk loading dan error
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState({
    profile: false,
    password: false,
    privacy: false,
    export: false
  });
  
  // State untuk user profile
  const [userProfile, setUserProfile] = useState(null);
  
  // State untuk export options
  const [exportOptions, setExportOptions] = useState({
    patientsData: true,
    analysisHistory: true,
    settings: true
  });
  
  // Efek untuk memperbarui pengaturan saat isDarkMode berubah
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        darkMode: isDarkMode
      }
    }));
  }, [isDarkMode]);
  
  // Efek untuk memperbarui pengaturan notifikasi dari API
  useEffect(() => {
    if (notificationSettings) {
      setSettings(prev => ({
        ...prev,
        notifications: notificationSettings
      }));
    }
  }, [notificationSettings]);
  
  // Efek untuk mendapatkan profil user
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) return;
        
        const response = await axios.get(`${API_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data) {
          setUserProfile(response.data);
          setSettings(prev => ({
            ...prev,
            account: {
              ...prev.account,
              name: response.data.name || response.data.fullName || '',
              email: response.data.email || ''
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Gagal memuat profil pengguna');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [API_URL]);
  
  // Fungsi untuk mengubah pengaturan notifikasi
  const handleNotificationChange = async (type) => {
    const newSettings = {
      ...settings.notifications,
      [type]: !settings.notifications[type]
    };
    
    setSettings(prev => ({
      ...prev,
      notifications: newSettings
    }));
    
    // Simpan ke API
    const success = await updateNotificationSettings(newSettings);
    
    if (success) {
      toast.success(`Notifikasi ${settings.notifications[type] ? 'dinonaktifkan' : 'diaktifkan'}`);
    } else {
      toast.error('Gagal memperbarui pengaturan notifikasi');
      
      // Kembalikan ke nilai sebelumnya jika gagal
      setSettings(prev => ({
        ...prev,
        notifications: notificationSettings
      }));
    }
  };
  
  // Fungsi untuk mengubah tema
  const handleThemeChange = (newTheme) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        theme: newTheme
      }
    }));
    
    setTheme(newTheme);
    toast.success(`Tema berhasil diubah`);
  };
  
  // Fungsi untuk mengubah mode gelap
  const handleDarkModeChange = () => {
    toggleDarkMode();
  };
  
  // Fungsi untuk mengubah pengaturan animasi
  const handleAnimationsChange = () => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        animations: !prev.appearance.animations
      }
    }));
    
    toast.success(`Animasi ${settings.appearance.animations ? 'dinonaktifkan' : 'diaktifkan'}`);
  };
  
  // Fungsi untuk mengubah pengaturan privasi
  const handlePrivacyChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [setting]: !prev.privacy[setting]
      }
    }));
    
    toast.success(`Pengaturan berhasil diubah`);
  };
  
  // Fungsi untuk update profil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(prev => ({ ...prev, profile: true }));
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Tidak dapat memverifikasi identitas Anda');
        return;
      }
      
      const profileData = {
        name: settings.account.name,
        // Tambahkan field lain yang ingin diupdate
      };
      
      const response = await axios.put(
        `${API_URL}/api/user/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        toast.success('Profil berhasil diperbarui');
        setUserProfile(response.data.user);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal memperbarui profil');
    } finally {
      setSaveLoading(prev => ({ ...prev, profile: false }));
    }
  };
  
  // Fungsi untuk update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSaveLoading(prev => ({ ...prev, password: true }));
    
    try {
      // Validasi password match
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('Konfirmasi password baru tidak cocok');
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Tidak dapat memverifikasi identitas Anda');
        return;
      }
      
      // Kirim request ke API (endpoint ini perlu dibuat di backend)
      const response = await axios.put(
        `${API_URL}/api/user/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        toast.success('Password berhasil diperbarui');
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response && error.response.status === 401) {
        toast.error('Password saat ini tidak valid');
      } else {
        toast.error('Gagal memperbarui password');
      }
    } finally {
      setSaveLoading(prev => ({ ...prev, password: false }));
    }
  };
  
  // Fungsi untuk handle perubahan form password
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Fungsi untuk export data
  const handleExportData = async () => {
    setSaveLoading(prev => ({ ...prev, export: true }));
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Tidak dapat memverifikasi identitas Anda');
        return;
      }
      
      // Ini adalah contoh, backend perlu menyediakan endpoint untuk export data
      const response = await axios.post(
        `${API_URL}/api/user/export-data`,
        exportOptions,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      );
      
      // Buat URL untuk file dan download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'retinascan_data_export.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Data berhasil diekspor');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Gagal mengekspor data');
    } finally {
      setSaveLoading(prev => ({ ...prev, export: false }));
    }
  };
  
  // Variasi animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };
  
  // Tema yang tersedia
  const availableThemes = [
    { name: 'blue', primary: '#3b82f6', accent: '#60a5fa' },
    { name: 'purple', primary: '#8b5cf6', accent: '#a78bfa' },
    { name: 'green', primary: '#10b981', accent: '#34d399' },
    { name: 'red', primary: '#ef4444', accent: '#f87171' },
    { name: 'orange', primary: '#f97316', accent: '#fb923c' },
    { name: 'pink', primary: '#ec4899', accent: '#f472b6' },
  ];
  
  // Render tab konten
  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Pengaturan Notifikasi</h2>
              <p className="text-gray-500 dark:text-gray-400">Atur jenis notifikasi yang ingin Anda terima.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-4">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} flex justify-between items-center shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center">
                  <div className="mr-3 p-3 rounded-full bg-green-100 dark:bg-green-900/60">
                    <UserCircleIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Pasien Baru</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat ada pasien baru ditambahkan</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('patient_added')}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.notifications.patient_added ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.patient_added ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} flex justify-between items-center shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center">
                  <div className="mr-3 p-3 rounded-full bg-blue-100 dark:bg-blue-900/60">
                    <PaintBrushIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Perubahan Data Pasien</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat data pasien diperbarui</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('patient_updated')}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.notifications.patient_updated ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.patient_updated ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} flex justify-between items-center shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center">
                  <div className="mr-3 p-3 rounded-full bg-red-100 dark:bg-red-900/60">
                    <UserCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Penghapusan Pasien</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat pasien dihapus</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('patient_deleted')}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.notifications.patient_deleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.patient_deleted ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} flex justify-between items-center shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center">
                  <div className="mr-3 p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/60">
                    <PhotoIcon className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Scan Retina Baru</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat ada scan retina baru ditambahkan</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('scan_added')}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.notifications.scan_added ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.scan_added ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} flex justify-between items-center shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center">
                  <div className="mr-3 p-3 rounded-full bg-teal-100 dark:bg-teal-900/60">
                    <DocumentTextIcon className="h-5 w-5 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Pembaruan Hasil Scan</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat hasil scan retina diperbarui</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('scan_updated')}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.notifications.scan_updated ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.scan_updated ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} flex justify-between items-center shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center">
                  <div className="mr-3 p-3 rounded-full bg-purple-100 dark:bg-purple-900/60">
                    <CogIcon className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Notifikasi Sistem</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi penting dari sistem</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('system')}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.notifications.system ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.system ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
            </motion.div>
          </motion.div>
        );
        
      case 'appearance':
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Tampilan</h2>
              <p className="text-gray-500 dark:text-gray-400">Sesuaikan tampilan aplikasi sesuai keinginan Anda.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mb-8">
              <h3 className="text-lg font-medium mb-4">Tema</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {availableThemes.map((themeOption) => (
                  <motion.button
                    key={themeOption.name}
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleThemeChange(themeOption.name)}
                    className={`p-5 rounded-xl border relative overflow-hidden ${
                      settings.appearance.theme === themeOption.name 
                        ? `border-2 border-${themeOption.name}-500 shadow-lg` 
                        : isDarkMode 
                          ? 'border-gray-700 hover:border-gray-600' 
                          : 'border-gray-200 hover:border-gray-300'
                    } flex flex-col items-center transition-all`}
                  >
                    <div 
                      className="w-12 h-12 rounded-full mb-3 shadow-inner"
                      style={{ background: `linear-gradient(135deg, ${themeOption.primary}, ${themeOption.accent})` }}
                    />
                    <span className="capitalize font-medium">{themeOption.name}</span>
                    {settings.appearance.theme === themeOption.name && (
                      <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-md">
                        <CheckIcon className="h-5 w-5 text-green-500" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mb-8">
              <h3 className="text-lg font-medium mb-4">Mode</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDarkModeChange}
                  className={`p-5 rounded-xl border relative overflow-hidden ${
                    !isDarkMode 
                      ? 'border-2 border-blue-500 shadow-lg' 
                      : isDarkMode 
                        ? 'border-gray-700 hover:border-gray-600' 
                        : 'border-gray-200 hover:border-gray-300'
                  } flex items-center transition-all`}
                >
                  <div className="w-12 h-12 rounded-full mr-4 bg-gradient-to-r from-blue-400 to-sky-300 flex items-center justify-center shadow-inner">
                    <SunIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium block">Mode Terang</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Tampilan cerah dengan latar putih</span>
                  </div>
                  {!isDarkMode && (
                    <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-md">
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDarkModeChange}
                  className={`p-5 rounded-xl border relative overflow-hidden ${
                    isDarkMode 
                      ? 'border-2 border-blue-500 shadow-lg' 
                      : isDarkMode 
                        ? 'border-gray-700 hover:border-gray-600' 
                        : 'border-gray-200 hover:border-gray-300'
                  } flex items-center transition-all`}
                >
                  <div className="w-12 h-12 rounded-full mr-4 bg-gradient-to-r from-gray-700 to-gray-900 flex items-center justify-center shadow-inner">
                    <MoonIcon className="h-7 w-7 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium block">Mode Gelap</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Tampilan gelap untuk mata yang nyaman</span>
                  </div>
                  {isDarkMode && (
                    <div className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-md">
                      <CheckIcon className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </motion.button>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mt-6">
              <div className={`p-5 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} flex justify-between items-center shadow-sm transition-all hover:shadow-md`}>
                <div className="flex items-center">
                  <div className="mr-4 p-3 rounded-full bg-purple-100 dark:bg-purple-900/60">
                    <DevicePhoneMobileIcon className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Animasi</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aktifkan atau nonaktifkan animasi UI</p>
                  </div>
                </div>
                <button
                  onClick={handleAnimationsChange}
                  className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.appearance.animations ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.appearance.animations ? 28 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
            </motion.div>
          </motion.div>
        );
        
      case 'privacy':
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Privasi & Keamanan</h2>
              <p className="text-gray-500 dark:text-gray-400">Kelola pengaturan privasi dan keamanan akun Anda.</p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="space-y-5">
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} shadow-sm transition-all hover:shadow-md`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start mb-4 sm:mb-0">
                    <div className="mr-4 p-3 rounded-full bg-blue-100 dark:bg-blue-900/60">
                      <ShieldCheckIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Bagikan Data Penggunaan</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                        Bantu kami meningkatkan aplikasi dengan berbagi data penggunaan anonim. 
                        Data ini tidak berisi informasi pribadi Anda.
                      </p>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handlePrivacyChange('shareData')}
                      className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.privacy.shareData ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <motion.div 
                        animate={{ x: settings.privacy.shareData ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-5 h-5 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} shadow-sm transition-all hover:shadow-md`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start mb-4 sm:mb-0">
                    <div className="mr-4 p-3 rounded-full bg-green-100 dark:bg-green-900/60">
                      <ComputerDesktopIcon className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Analitik</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                        Aktifkan analitik untuk membantu kami meningkatkan pengalaman pengguna.
                        Data ini membantu kami memahami bagaimana aplikasi digunakan.
                      </p>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handlePrivacyChange('analytics')}
                      className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${settings.privacy.analytics ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <motion.div 
                        animate={{ x: settings.privacy.analytics ? 28 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="w-5 h-5 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={`p-6 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} shadow-sm transition-all hover:shadow-md`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start mb-4 sm:mb-0">
                    <div className="mr-4 p-3 rounded-full bg-red-100 dark:bg-red-900/60">
                      <LockClosedIcon className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">Sesi Login</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                        Kelola sesi login aktif dan keluarkan perangkat lain yang mungkin mengakses akun Anda.
                      </p>
                    </div>
                  </div>
                  <div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium"
                      onClick={() => {
                        // Implementasi logout dari semua perangkat
                        toast.info('Fitur ini sedang dalam pengembangan');
                      }}
                    >
                      Keluar dari Semua Perangkat
                    </motion.button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  onClick={() => {
                    // Implementasi penyimpanan pengaturan privasi ke server
                    toast.success('Pengaturan privasi berhasil disimpan');
                  }}
                >
                  Simpan Pengaturan Privasi
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        );
        
      case 'account':
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Akun Pengguna</h2>
              <p className="text-gray-500 dark:text-gray-400">Kelola informasi dan keamanan akun Anda.</p>
            </motion.div>
            
            {/* Profil User */}
            <motion.div 
              variants={itemVariants} 
              className={`p-6 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} shadow-sm`}
            >
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-blue-500" />
                Informasi Profil
              </h3>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama</label>
                  <input
                    type="text"
                    value={settings.account.name}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      account: { ...prev.account, name: e.target.value }
                    }))}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-700'
                    } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={settings.account.email}
                    disabled
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700/50 text-gray-400' 
                        : 'border-gray-300 bg-gray-100 text-gray-500'
                    } cursor-not-allowed`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                </div>
                
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={`px-4 py-2 rounded-lg bg-blue-600 text-white font-medium flex items-center justify-center ${
                      saveLoading.profile ? 'opacity-75 cursor-wait' : 'hover:bg-blue-700'
                    }`}
                    disabled={saveLoading.profile}
                  >
                    {saveLoading.profile ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
            
            {/* Ubah Password */}
            <motion.div 
              variants={itemVariants} 
              className={`p-6 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} shadow-sm`}
            >
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <KeyIcon className="w-5 h-5 mr-2 text-purple-500" />
                Ubah Password
              </h3>
              
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Password Saat Ini</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-700'
                    } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Password Baru</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-700'
                    } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Konfirmasi Password Baru</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-700'
                    } focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                    required
                  />
                </div>
                
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={`px-4 py-2 rounded-lg bg-purple-600 text-white font-medium flex items-center justify-center ${
                      saveLoading.password ? 'opacity-75 cursor-wait' : 'hover:bg-purple-700'
                    }`}
                    disabled={saveLoading.password}
                  >
                    {saveLoading.password ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      'Ubah Password'
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        );
      
      case 'data':
        return (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Manajemen Data</h2>
              <p className="text-gray-500 dark:text-gray-400">Ekspor dan backup data aplikasi Anda.</p>
            </motion.div>
            
            <motion.div 
              variants={itemVariants} 
              className={`p-6 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} shadow-sm`}
            >
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <DocumentArrowDownIcon className="w-5 h-5 mr-2 text-green-500" />
                Ekspor Data
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ekspor data Anda dalam format yang dapat digunakan di aplikasi lain. Data yang diekspor berupa file terkompresi.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="patientsData"
                      checked={exportOptions.patientsData}
                      onChange={() => setExportOptions(prev => ({ ...prev, patientsData: !prev.patientsData }))}
                      className="h-4 w-4 text-blue-500 rounded focus:ring-blue-400"
                    />
                    <label htmlFor="patientsData" className="ml-2 text-sm font-medium">Data Pasien</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="analysisHistory"
                      checked={exportOptions.analysisHistory}
                      onChange={() => setExportOptions(prev => ({ ...prev, analysisHistory: !prev.analysisHistory }))}
                      className="h-4 w-4 text-blue-500 rounded focus:ring-blue-400"
                    />
                    <label htmlFor="analysisHistory" className="ml-2 text-sm font-medium">Riwayat Analisis</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="settings"
                      checked={exportOptions.settings}
                      onChange={() => setExportOptions(prev => ({ ...prev, settings: !prev.settings }))}
                      className="h-4 w-4 text-blue-500 rounded focus:ring-blue-400"
                    />
                    <label htmlFor="settings" className="ml-2 text-sm font-medium">Pengaturan Aplikasi</label>
                  </div>
                </div>
                
                <div className="pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportData}
                    className={`px-4 py-2 rounded-lg bg-green-600 text-white font-medium flex items-center ${
                      saveLoading.export ? 'opacity-75 cursor-wait' : 'hover:bg-green-700'
                    }`}
                    disabled={saveLoading.export}
                  >
                    {saveLoading.export ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Mengekspor...
                      </>
                    ) : (
                      <>
                        <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                        Ekspor Data
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants} 
              className={`p-6 rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'} shadow-sm opacity-60`}
            >
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/10">
                <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">Segera Hadir</span>
              </div>
              
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <ArrowPathIcon className="w-5 h-5 mr-2 text-orange-500" />
                Backup & Restore
              </h3>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Backup data Anda ke cloud dan kembalikan kapan saja. Fitur ini akan segera tersedia.
                </p>
                
                <div className="flex space-x-4">
                  <button disabled className="px-4 py-2 rounded-lg bg-gray-400 text-white font-medium flex items-center opacity-50">
                    <CloudArrowUpIcon className="w-5 h-5 mr-2" />
                    Backup
                  </button>
                  
                  <button disabled className="px-4 py-2 rounded-lg bg-gray-400 text-white font-medium flex items-center opacity-50">
                    <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                    Restore
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen py-6 px-4 sm:px-6">
      <motion.div 
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <motion.h1 
            className="text-2xl font-bold"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            Pengaturan
          </motion.h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <motion.div 
              className={`sticky top-20 rounded-xl p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'notifications' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <BellIcon className="h-5 w-5 mr-3" />
                  <span>Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('appearance')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'appearance' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <PaintBrushIcon className="h-5 w-5 mr-3" />
                  <span>Tampilan</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'account' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <UserIcon className="h-5 w-5 mr-3" />
                  <span>Akun</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('data')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'data' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <DocumentTextIcon className="h-5 w-5 mr-3" />
                  <span>Data</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'privacy' 
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ShieldCheckIcon className="h-5 w-5 mr-3" />
                  <span>Privasi & Keamanan</span>
                </button>
              </nav>
            </motion.div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <motion.div 
              className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800/60 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'} shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {renderTabContent()}
            </motion.div>
            
            <motion.div 
              className="mt-6 flex justify-end space-x-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 rounded-xl font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } transition-all`}
                onClick={() => {
                  // Reset semua pengaturan ke nilai default
                  toast.info('Pengaturan direset ke nilai default');
                }}
              >
                Reset Ke Default
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transition-all"
                onClick={() => {
                  // Simpan semua pengaturan
                  toast.success('Pengaturan berhasil disimpan');
                }}
              >
                Simpan Semua Pengaturan
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const SettingsPage = withPageTransition(SettingsPageComponent);
export default SettingsPage;