import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, UserIcon, KeyIcon, CheckIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProfileModal = ({ isOpen, onClose, userData, refreshUserData }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Effect untuk mengisi form dengan data pengguna
  useEffect(() => {
    if (userData) {
      setProfileForm({
        name: userData.name || userData.fullName || '',
        email: userData.email || ''
      });
    }
  }, [userData]);

  // Handle perubahan form profil
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle perubahan form password
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle submit form profil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Tidak dapat memverifikasi identitas Anda');
        return;
      }
      
      // Kirim data dengan properti name dan fullName untuk memastikan kompatibilitas
      const profileData = {
        name: profileForm.name,
        fullName: profileForm.name
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
        
        // Update userData langsung dari respons jika tersedia
        if (response.data && response.data.user) {
          // Jika respons berisi data user dalam properti user
          refreshUserData(response.data.user);
        } else if (response.data) {
          // Jika respons langsung berisi data user
          refreshUserData(response.data);
        } else {
          // Jika tidak ada data dalam respons, refresh data dari API
          refreshUserData();
        }
        
        // Tutup modal setelah berhasil
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  // Handle submit form password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validasi password match
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error('Konfirmasi password baru tidak cocok');
        setLoading(false);
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Tidak dapat memverifikasi identitas Anda');
        return;
      }
      
      // Kirim request ke API
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
        
        // Tutup modal setelah berhasil
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.response && error.response.status === 401) {
        toast.error('Password saat ini tidak valid');
      } else {
        toast.error('Gagal memperbarui password');
      }
    } finally {
      setLoading(false);
    }
  };

  // Variasi animasi untuk modal
  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  // Glassmorphism style
  const glassEffect = {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  };

  // Mendapatkan inisial untuk avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md rounded-xl z-10 overflow-hidden"
            style={glassEffect}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Profil Pengguna</h3>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            {/* User Avatar */}
            <div className="flex justify-center mt-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(profileForm.name)}
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-2 p-5 pb-0">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'profile' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span>Edit Profil</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'password' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <KeyIcon className="h-5 w-5 mr-2" />
                  <span>Ganti Password</span>
                </div>
              </button>
            </div>
            
            {/* Content */}
            <div className="p-5">
              {activeTab === 'profile' ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileForm.email}
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full p-3 rounded-lg bg-blue-500 text-white font-medium flex items-center justify-center ${
                      loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
                    }`}
                  >
                    {loading ? (
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
                        Simpan Perubahan
                      </span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Saat Ini
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full p-3 rounded-lg bg-blue-500 text-white font-medium flex items-center justify-center ${
                      loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <KeyIcon className="h-5 w-5 mr-2" />
                        Simpan Password Baru
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal; 