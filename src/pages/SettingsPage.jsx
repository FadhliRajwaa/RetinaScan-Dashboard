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
  CheckIcon
} from '@heroicons/react/24/outline';
import { withPageTransition } from '../context/ThemeContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { toast } from 'react-toastify';

function SettingsPageComponent() {
  const { theme, setTheme, isDarkMode, toggleDarkMode } = useTheme();
  const { unreadCount, notificationSettings, updateNotificationSettings } = useNotification();
  
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
    }
  });
  
  // State untuk tab aktif
  const [activeTab, setActiveTab] = useState('notifications');
  
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
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex justify-between items-center`}>
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-full bg-green-100 dark:bg-green-900">
                    <UserCircleIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Pasien Baru</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat ada pasien baru ditambahkan</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('patient_added')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.notifications.patient_added ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.patient_added ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex justify-between items-center`}>
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                    <PaintBrushIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Perubahan Data Pasien</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat data pasien diperbarui</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('patient_updated')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.notifications.patient_updated ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.patient_updated ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex justify-between items-center`}>
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-full bg-red-100 dark:bg-red-900">
                    <UserCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Penghapusan Pasien</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi saat pasien dihapus</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('patient_deleted')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.notifications.patient_deleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.patient_deleted ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex justify-between items-center`}>
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                    <CogIcon className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Notifikasi Sistem</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Notifikasi penting dari sistem</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNotificationChange('system')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.notifications.system ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.notifications.system ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-4 h-4 bg-white rounded-full shadow-md"
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
              <div className="grid grid-cols-3 gap-4">
                {availableThemes.map((themeOption) => (
                  <motion.button
                    key={themeOption.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleThemeChange(themeOption.name)}
                    className={`p-4 rounded-lg border ${
                      settings.appearance.theme === themeOption.name 
                        ? 'border-blue-500 ring-2 ring-blue-300' 
                        : isDarkMode 
                          ? 'border-gray-700' 
                          : 'border-gray-200'
                    } flex flex-col items-center`}
                  >
                    <div 
                      className="w-10 h-10 rounded-full mb-2"
                      style={{ background: `linear-gradient(135deg, ${themeOption.primary}, ${themeOption.accent})` }}
                    />
                    <span className="capitalize">{themeOption.name}</span>
                    {settings.appearance.theme === themeOption.name && (
                      <CheckIcon className="h-5 w-5 text-blue-500 absolute top-2 right-2" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-medium mb-4">Mode</h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDarkModeChange}
                  className={`p-4 rounded-lg border ${
                    !isDarkMode 
                      ? 'border-blue-500 ring-2 ring-blue-300' 
                      : isDarkMode 
                        ? 'border-gray-700' 
                        : 'border-gray-200'
                  } flex flex-col items-center`}
                >
                  <div className="w-10 h-10 rounded-full mb-2 bg-blue-50 flex items-center justify-center">
                    <SunIcon className="h-6 w-6 text-yellow-500" />
                  </div>
                  <span>Mode Terang</span>
                  {!isDarkMode && (
                    <CheckIcon className="h-5 w-5 text-blue-500 absolute top-2 right-2" />
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDarkModeChange}
                  className={`p-4 rounded-lg border ${
                    isDarkMode 
                      ? 'border-blue-500 ring-2 ring-blue-300' 
                      : isDarkMode 
                        ? 'border-gray-700' 
                        : 'border-gray-200'
                  } flex flex-col items-center`}
                >
                  <div className="w-10 h-10 rounded-full mb-2 bg-gray-800 flex items-center justify-center">
                    <MoonIcon className="h-6 w-6 text-gray-100" />
                  </div>
                  <span>Mode Gelap</span>
                  {isDarkMode && (
                    <CheckIcon className="h-5 w-5 text-blue-500 absolute top-2 right-2" />
                  )}
                </motion.button>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mt-6">
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex justify-between items-center`}>
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                    <DevicePhoneMobileIcon className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Animasi</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aktifkan atau nonaktifkan animasi UI</p>
                  </div>
                </div>
                <button
                  onClick={handleAnimationsChange}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.appearance.animations ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.appearance.animations ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-4 h-4 bg-white rounded-full shadow-md"
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
            
            <motion.div variants={itemVariants} className="space-y-4">
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex justify-between items-center`}>
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Bagikan Data Penggunaan</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bantu kami meningkatkan aplikasi dengan berbagi data penggunaan anonim</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePrivacyChange('shareData')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.privacy.shareData ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.privacy.shareData ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
              
              <div className={`p-4 rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} flex justify-between items-center`}>
                <div className="flex items-center">
                  <div className="mr-3 p-2 rounded-full bg-green-100 dark:bg-green-900">
                    <ComputerDesktopIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Analitik</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aktifkan analitik untuk membantu kami meningkatkan pengalaman pengguna</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePrivacyChange('analytics')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.privacy.analytics ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <motion.div 
                    animate={{ x: settings.privacy.analytics ? 24 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-4 h-4 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
            </motion.div>
          </motion.div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={`p-4 md:p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Pengaturan</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Kelola pengaturan aplikasi Anda</p>
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
          
          {/* Content */}
          <div className="md:col-span-3">
            <motion.div 
              className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const SettingsPage = withPageTransition(SettingsPageComponent);
export default SettingsPage; 