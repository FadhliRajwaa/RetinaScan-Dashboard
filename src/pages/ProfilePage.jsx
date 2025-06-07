import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import { withPageTransition } from '../context/ThemeContext';
import { useTheme } from '../context/ThemeContext';
import { 
  UserCircleIcon, 
  KeyIcon,
  CheckIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

function ProfilePageComponent() {
  const { theme, isDarkMode } = useTheme();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // State untuk data profil
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    fullName: ''
  });
  
  // State untuk form edit profil
  const [profileForm, setProfileForm] = useState({
    name: '',
    fullName: ''
  });
  
  // State untuk form password
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // State untuk loading dan error
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState({
    profile: false,
    password: false
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Efek untuk mendapatkan profil user
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          toast.error('Sesi login tidak valid');
          return;
        }
        
        const response = await axios.get(`${API_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data) {
          setProfile(response.data);
          setProfileForm({
            name: response.data.name || '',
            fullName: response.data.fullName || ''
          });
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
  
  // Handler untuk perubahan form profil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handler untuk perubahan form password
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Reset error untuk field ini
    setPasswordErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };
  
  // Validasi form password
  const validatePasswordForm = () => {
    let isValid = true;
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Password saat ini diperlukan';
      isValid = false;
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'Password baru diperlukan';
      isValid = false;
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = 'Password minimal 6 karakter';
      isValid = false;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok';
      isValid = false;
    }
    
    setPasswordErrors(errors);
    return isValid;
  };
  
  // Handler untuk submit form profil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(prev => ({ ...prev, profile: true }));
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Sesi login tidak valid');
        return;
      }
      
      const profileData = {
        name: profileForm.name,
        fullName: profileForm.fullName
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
        setProfile(prev => ({
          ...prev,
          name: profileForm.name,
          fullName: profileForm.fullName
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal memperbarui profil');
    } finally {
      setSaveLoading(prev => ({ ...prev, profile: false }));
    }
  };
  
  // Handler untuk submit form password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setSaveLoading(prev => ({ ...prev, password: true }));
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Sesi login tidak valid');
        return;
      }
      
      const response = await axios.post(
        `${API_URL}/api/auth/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          password: passwordForm.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.status === 200) {
        toast.success('Password berhasil diperbarui');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response && error.response.status === 401) {
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: 'Password saat ini tidak valid'
        }));
        toast.error('Password saat ini tidak valid');
      } else {
        toast.error('Gagal memperbarui password');
      }
    } finally {
      setSaveLoading(prev => ({ ...prev, password: false }));
    }
  };
  
  // Animation variants
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
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  };
  
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    },
    hover: {
      scale: 1.02,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      transition: { duration: 0.2 }
    }
  };
  
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-gray-500">Memuat profil pengguna...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto"
      >
        {/* Header */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center">
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => window.history.back()}
              className="mr-4 p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </motion.button>
            <h1 className="text-2xl font-bold text-gray-800">Profil Pengguna</h1>
          </div>
        </motion.div>
        
        {/* Profil Header */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-100"
        >
          <div className="relative h-32 bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="absolute -bottom-16 left-8 flex items-end">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white shadow-md flex items-center justify-center text-white text-3xl font-bold">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
          
          <div className="pt-20 pb-6 px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {profile.fullName || profile.name || 'Pengguna'}
                </h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <span>{profile.email}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Edit Profil */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-white text-lg font-bold flex items-center">
                <UserCircleIcon className="h-5 w-5 mr-2" />
                Edit Profil
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Pengguna
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama Pengguna"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={profileForm.fullName}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nama Lengkap"
                  />
                </div>
                
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  type="submit"
                  disabled={saveLoading.profile}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {saveLoading.profile ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Simpan Profil
                    </span>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
          
          {/* Form Ganti Password */}
          <motion.div
            variants={cardVariants}
            whileHover="hover"
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          >
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
              <h2 className="text-white text-lg font-bold flex items-center">
                <KeyIcon className="h-5 w-5 mr-2" />
                Ganti Password
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdatePassword}>
                <div className="mb-4">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan password saat ini"
                      required
                    />
                    {passwordErrors.currentPassword && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        passwordErrors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Masukkan password baru"
                      required
                    />
                    {passwordErrors.newPassword && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Konfirmasi password baru"
                      required
                    />
                    {passwordErrors.confirmPassword && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
                
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  type="submit"
                  disabled={saveLoading.password}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {saveLoading.password ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <ShieldCheckIcon className="h-5 w-5 mr-2" />
                      Perbarui Password
                    </span>
                  )}
                </motion.button>
                
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium text-purple-600">Tips keamanan:</span>{' '}
                    Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk password yang kuat.
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default withPageTransition(ProfilePageComponent); 