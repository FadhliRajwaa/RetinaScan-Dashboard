import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiPrinter, FiExternalLink, FiCalendar, FiUser, FiInfo, FiAlertTriangle, FiCheck, FiShare2, FiFileText, FiEye, FiActivity, FiChevronRight, FiSettings, FiHelpCircle, FiBarChart2, FiTrendingUp, FiTarget, FiAlertCircle, FiThumbsUp, FiZoomIn, FiZoomOut, FiRotateCw, FiMaximize, FiMinimize, FiSearch, FiMessageSquare, FiPhone } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { getSeverityBgColor } from '../../utils/severityUtils';

// Glassmorphism style
const glassEffect = {
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '16px',
};

// Animasi untuk tab content
const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: 'easeOut',
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
};

// Animasi untuk item dalam tab
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  }
};

// Komponen ReportHeader yang baru
const ReportHeader = ({ result, onDownload, onPrint, onShare, isLoading, isShareLoading, shareSuccess }) => {
  return (
    <motion.div
      className="relative overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background gradient dengan efek animasi */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600"
        animate={{ 
          background: [
            'linear-gradient(90deg, rgba(37,99,235,1) 0%, rgba(79,70,229,1) 50%, rgba(124,58,237,1) 100%)',
            'linear-gradient(90deg, rgba(79,70,229,1) 0%, rgba(124,58,237,1) 50%, rgba(37,99,235,1) 100%)',
            'linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(37,99,235,1) 50%, rgba(79,70,229,1) 100%)',
            'linear-gradient(90deg, rgba(37,99,235,1) 0%, rgba(79,70,229,1) 50%, rgba(124,58,237,1) 100%)'
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "loop" }}
      />
      
      {/* Animated floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.1
            }}
            animate={{
              y: ["-10%", "110%"],
              opacity: [0, 0.7, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
      
      {/* Background pattern with parallax effect */}
      <motion.div 
        className="absolute inset-0 opacity-10"
        initial={{ backgroundPositionX: '0%' }}
        animate={{ backgroundPositionX: '100%' }}
        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          backgroundSize: '30px 30px'
        }}
      ></motion.div>
      
      {/* Content with staggered animations */}
      <div className="relative p-8 md:p-10 text-white z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, type: "spring" }}
            >
              Laporan Analisis Retina
            </motion.h2>
            <motion.div 
              className="flex items-center text-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <FiCalendar className="mr-2" />
              <span>{new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </motion.div>
          </div>
          
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -3px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onDownload}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium shadow-lg"
            >
              <FiDownload className="text-blue-100" />
              {isLoading ? 'Memproses...' : 'Unduh PDF'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onPrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium shadow-md"
              style={{background: 'rgba(255, 255, 255, 0.2)'}}
            >
              <FiPrinter className="text-white" />
              <span className="hidden sm:inline">Cetak</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-10 h-10 rounded-full"
              style={{background: 'rgba(255, 255, 255, 0.2)'}}
              onClick={onShare}
              disabled={isShareLoading}
            >
              {isShareLoading ? (
                <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              ) : shareSuccess ? (
                <FiCheck className="text-white" />
              ) : (
                <FiShare2 className="text-white" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Decorative bottom wave with animation */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.7 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-12">
          <motion.path 
            fill="rgba(255, 255, 255, 0.9)" 
            fillOpacity="1" 
            d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,53.3C672,43,768,21,864,16C960,11,1056,21,1152,32C1248,43,1344,53,1392,58.7L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
            animate={{
              d: [
                "M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,53.3C672,43,768,21,864,16C960,11,1056,21,1152,32C1248,43,1344,53,1392,58.7L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z",
                "M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,69.3C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z",
                "M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,53.3C672,43,768,21,864,16C960,11,1056,21,1152,32C1248,43,1344,53,1392,58.7L1440,64L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
              ]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
};

// Komponen ReportTabs yang baru
const ReportTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'ringkasan', label: 'Ringkasan', icon: <FiBarChart2 /> },
    { id: 'analisis', label: 'Detail Analisis', icon: <FiActivity /> },
    { id: 'gambar', label: 'Gambar Retina', icon: <FiEye /> },
    { id: 'rekomendasi', label: 'Rekomendasi', icon: <FiFileText /> },
    { id: 'bantuan', label: 'Bantuan', icon: <FiHelpCircle /> }
  ];

  return (
    <div className="relative z-10 px-4 -mt-6">
      <motion.div 
        className="flex overflow-x-auto hide-scrollbar gap-1 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`flex items-center gap-2 px-4 py-3 font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab(tab.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};

// Komponen PatientInfoCard yang baru
const PatientInfoCard = ({ patient }) => {
  // Safe extraction of patient data
  const patientName = patient?.fullName || patient?.name || 'Tidak ada nama';
  const patientGender = patient?.gender || '';
  const patientAge = patient?.age || '';
  const patientPhone = patient?.phone || '-';
  
  return (
    <motion.div 
      className="p-6 border-b"
      variants={itemVariants}
      style={{
        background: 'linear-gradient(to right, rgba(239, 246, 255, 0.8), rgba(224, 231, 255, 0.8))',
        borderBottom: '1px solid rgba(191, 219, 254, 0.5)'
      }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
        <h3 className="font-semibold text-gray-700 flex items-center text-lg">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-3 shadow-lg">
            <FiUser className="text-white" size={20} />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-xl">
            Informasi Pasien
          </span>
        </h3>
        
        <motion.div
          className="mt-3 md:mt-0"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <button className="flex items-center gap-2 text-sm text-blue-600 font-medium bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
            <FiSettings size={16} />
            <span>Edit Informasi</span>
          </button>
        </motion.div>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-xl"
        style={{...glassEffect, background: 'rgba(255, 255, 255, 0.7)'}}
        whileHover={{ boxShadow: '0 15px 30px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', background: 'rgba(255, 255, 255, 0.8)' }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="p-4 rounded-lg bg-white/60 border border-blue-100 shadow-sm"
          whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)' }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm text-blue-500 font-medium mb-1 flex items-center">
            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <FiUser size={12} className="text-blue-500" />
            </span>
            Nama Lengkap
          </p>
          <p className="font-semibold text-gray-800 text-lg ml-8">{patientName}</p>
        </motion.div>
        
        <motion.div 
          className="p-4 rounded-lg bg-white/60 border border-blue-100 shadow-sm"
          whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)' }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm text-blue-500 font-medium mb-1 flex items-center">
            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </span>
            Jenis Kelamin / Umur
          </p>
          <p className="font-semibold text-gray-800 text-lg ml-8">
            {patientGender === 'male' ? 'Laki-laki' : patientGender === 'female' ? 'Perempuan' : patientGender}, {patientAge} tahun
          </p>
        </motion.div>
        
        {patient?.dateOfBirth && (
          <motion.div 
            className="p-4 rounded-lg bg-white/60 border border-blue-100 shadow-sm"
            whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)' }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm text-blue-500 font-medium mb-1 flex items-center">
              <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <FiCalendar size={12} className="text-blue-500" />
              </span>
              Tanggal Lahir
            </p>
            <p className="font-semibold text-gray-800 text-lg ml-8">{new Date(patient.dateOfBirth).toLocaleDateString('id-ID')}</p>
          </motion.div>
        )}
        
        {patientPhone && (
          <motion.div 
            className="p-4 rounded-lg bg-white/60 border border-blue-100 shadow-sm"
            whileHover={{ y: -3, backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.1), 0 4px 6px -2px rgba(59, 130, 246, 0.05)' }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm text-blue-500 font-medium mb-1 flex items-center">
              <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </span>
              Nomor Telepon
            </p>
            <p className="font-semibold text-gray-800 text-lg ml-8">{patientPhone}</p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Komponen AnalysisResultsCard yang baru
const AnalysisResultsCard = ({ severity, confidence, formatPercentage, getSeverityColor, getSeverityGradient, getSeverityIcon, getSeverityBgColor }) => {
  // Helper function untuk mendapatkan deskripsi berdasarkan tingkat keparahan
  const getSeverityDescription = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'tidak ada' || level === 'normal') {
      return 'Tidak terdeteksi adanya tanda retinopati diabetik pada gambar retina.';
    } else if (level === 'ringan') {
      return 'Terdeteksi tanda-tanda ringan retinopati diabetik, seperti mikroaneurisma.';
    } else if (level === 'sedang') {
      return 'Terdeteksi tanda-tanda sedang retinopati diabetik, seperti perdarahan intraretinal atau cotton wool spots.';
    } else if (level === 'berat') {
      return 'Terdeteksi tanda-tanda berat retinopati diabetik, memerlukan perhatian medis segera.';
    } else {
      return 'Terdeteksi tanda-tanda sangat berat retinopati diabetik, memerlukan intervensi medis segera.';
    }
  };

  // Helper function untuk mendapatkan risk score berdasarkan tingkat keparahan
  const getRiskScore = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'tidak ada' || level === 'normal') return 0;
    if (level === 'ringan') return 25;
    if (level === 'sedang') return 50;
    if (level === 'berat') return 75;
    return 100;
  };

  // Helper function untuk mendapatkan warna risk score
  const getRiskColor = (score) => {
    if (score < 20) return 'bg-green-500';
    if (score < 40) return 'bg-lime-500';
    if (score < 60) return 'bg-yellow-500';
    if (score < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Helper function untuk mendapatkan label risk score
  const getRiskLabel = (score) => {
    if (score < 20) return 'Sangat Rendah';
    if (score < 40) return 'Rendah';
    if (score < 60) return 'Sedang';
    if (score < 80) return 'Tinggi';
    return 'Sangat Tinggi';
  };

  const riskScore = getRiskScore(severity);
  const riskColor = getRiskColor(riskScore);
  const riskLabel = getRiskLabel(riskScore);

  return (
    <motion.div variants={itemVariants} className="flex flex-col h-full">
      <h3 className="font-semibold mb-4 text-gray-700 text-lg flex items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg">
          <FiActivity className="text-white" size={20} />
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 text-xl">
          Hasil Analisis
        </span>
      </h3>
      
      {/* Severity Card dengan desain yang ditingkatkan */}
      <motion.div 
        className="p-6 rounded-xl mb-6 shadow-lg overflow-hidden relative"
        style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.7)' }}
        whileHover={{ 
          y: -5, 
          boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          background: 'rgba(255, 255, 255, 0.8)'
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated background gradient based on severity */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{
            background: [
              getSeverityGradient(severity),
              getSeverityGradient(severity) + '80', // Adding transparency
              getSeverityGradient(severity)
            ],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            zIndex: -1
          }}
        />
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Severity Icon with Animated Pulse */}
          <div className="relative">
            <motion.div 
              className="absolute inset-0 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              style={{ background: getSeverityBgColor(severity) }}
            />
            <div className="p-4 rounded-full relative z-10" style={{ background: getSeverityBgColor(severity) }}>
              {getSeverityIcon(severity)}
            </div>
          </div>
          
          {/* Severity Information */}
          <div className="flex-grow">
            <p className="text-sm text-gray-700 mb-1">Tingkat Keparahan</p>
            <motion.p 
              className={`text-2xl font-bold ${getSeverityColor(severity)}`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 10, delay: 0.2 }}
            >
              {severity}
            </motion.p>
            
            {/* Risk Score Meter */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Tingkat Risiko</span>
                <span className="text-xs font-semibold" style={{ color: getRiskColor(riskScore).replace('bg-', 'text-') }}>
                  {riskLabel}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full ${riskColor}`}
                  initial={{ width: '0%' }}
                  animate={{ width: `${riskScore}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Severity description */}
        <motion.div 
          className="mt-4 p-3 rounded-lg bg-white/50 border border-gray-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-sm text-gray-600">
            {getSeverityDescription(severity)}
          </p>
        </motion.div>
      </motion.div>
      
      {/* Confidence Card dengan desain yang ditingkatkan */}
      <motion.div 
        className="mb-6 p-6 rounded-xl shadow-lg"
        style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.7)' }}
        whileHover={{ 
          y: -5, 
          boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          background: 'rgba(255, 255, 255, 0.8)'
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between mb-3">
          <p className="text-sm text-gray-700 font-medium flex items-center">
            <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-2">
              <FiTarget size={12} className="text-indigo-500" />
            </span>
            Tingkat Kepercayaan
          </p>
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <span className="text-lg font-bold text-indigo-600">{formatPercentage(confidence)}</span>
            {confidence > 0.8 && (
              <motion.span 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="ml-2 text-green-500"
              >
                <FiThumbsUp />
              </motion.span>
            )}
          </motion.div>
        </div>
        
        {/* Confidence Progress Bar with Animation */}
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden relative">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent)',
            backgroundSize: '10px 10px'
          }}></div>
          
          <motion.div 
            className="h-full relative overflow-hidden rounded-full"
            style={{ width: '0%' }}
            animate={{ width: `${confidence * 100}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
              }}
              animate={{
                x: ['-100%', '100%'],
              }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
              }}
            />
          </motion.div>
        </div>
        
        {/* Confidence Interpretation */}
        <div className="mt-4 grid grid-cols-5 gap-1">
          {[0.2, 0.4, 0.6, 0.8, 1].map((threshold, index) => (
            <div key={index} className="text-center">
              <div 
                className={`mx-auto w-1 h-3 ${confidence >= threshold ? 'bg-indigo-500' : 'bg-gray-300'}`}
              ></div>
              <p className={`text-xs mt-1 ${confidence >= threshold ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                {threshold * 100}%
              </p>
            </div>
          ))}
        </div>
        
        {/* Confidence description */}
        <motion.div 
          className="mt-4 p-3 rounded-lg bg-white/50 border border-gray-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-start">
            <FiInfo className="text-indigo-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              {confidence < 0.5 
                ? "Tingkat kepercayaan rendah. Hasil analisis mungkin kurang akurat dan perlu konfirmasi lebih lanjut."
                : confidence < 0.8
                ? "Tingkat kepercayaan sedang. Hasil analisis cukup dapat diandalkan namun masih perlu pertimbangan klinis."
                : "Tingkat kepercayaan tinggi. Hasil analisis sangat dapat diandalkan, namun tetap perlu konfirmasi dari tenaga medis profesional."
              }
            </p>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Detection Features Card - Menampilkan fitur yang terdeteksi */}
      <motion.div 
        className="mb-6 p-6 rounded-xl shadow-lg"
        style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.7)' }}
        whileHover={{ 
          y: -5, 
          boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          background: 'rgba(255, 255, 255, 0.8)'
        }}
        transition={{ duration: 0.3 }}
      >
        <h4 className="font-semibold text-gray-700 mb-4 flex items-center">
          <FiAlertCircle className="mr-2 text-indigo-500" />
          Fitur Terdeteksi
        </h4>
        
        <div className="space-y-3">
          {[
            { name: 'Mikroaneurisma', detected: severity.toLowerCase() !== 'tidak ada' && severity.toLowerCase() !== 'normal' },
            { name: 'Perdarahan Intraretinal', detected: ['sedang', 'berat', 'sangat berat'].includes(severity.toLowerCase()) },
            { name: 'Cotton Wool Spots', detected: ['sedang', 'berat', 'sangat berat'].includes(severity.toLowerCase()) },
            { name: 'Hard Exudates', detected: ['berat', 'sangat berat'].includes(severity.toLowerCase()) },
            { name: 'Neovaskularisasi', detected: ['sangat berat'].includes(severity.toLowerCase()) }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className={`p-3 rounded-lg border ${feature.detected ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + (index * 0.1) }}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${feature.detected ? 'bg-red-500' : 'bg-gray-300'}`}>
                  {feature.detected && <FiCheck className="text-white text-xs" />}
                </div>
                <div>
                  <p className={`text-sm font-medium ${feature.detected ? 'text-red-700' : 'text-gray-500'}`}>{feature.name}</p>
                  {feature.detected && (
                    <p className="text-xs text-red-600 mt-0.5">Terdeteksi</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Komponen RetinaImageViewer yang baru
const RetinaImageViewer = ({ imageSource, handleImageError, imageError, setImageError }) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const viewerRef = useRef(null);

  // Zoom in function
  const zoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  // Zoom out function
  const zoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  // Reset zoom and position
  const resetView = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  // Rotate image
  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && viewerRef.current) {
      if (viewerRef.current.requestFullscreen) {
        viewerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Handle drag start
  const handleDragStart = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setStartPos({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  // Handle drag move
  const handleDragMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle mouse wheel for zooming
  const handleWheel = (e) => {
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
    e.preventDefault();
  };

  return (
    <motion.div 
      className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg"
      ref={viewerRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Loading overlay */}
      {!imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      
      {/* Image container with zoom and drag functionality */}
      <div 
        className="w-full h-full overflow-hidden cursor-move relative"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onWheel={handleWheel}
      >
        <motion.img
          src={imageSource}
          alt="Retina scan"
          className="w-full h-full object-contain"
          style={{ 
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            x: position.x,
            y: position.y,
            cursor: isDragging ? 'grabbing' : (zoom > 1 ? 'grab' : 'default')
          }}
          onLoad={(e) => {
            // Hide loading overlay
            if (e.target.previousSibling && e.target.previousSibling.previousSibling) {
              e.target.previousSibling.previousSibling.style.display = 'none';
            }
          }}
          onError={(e) => {
            handleImageError();
            if (e.target.previousSibling && e.target.previousSibling.previousSibling) {
              e.target.previousSibling.previousSibling.style.display = 'none';
            }
            e.target.onerror = null;
            e.target.src = '/images/default-retina.jpg';
          }}
          drag={zoom > 1}
          dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
          dragElastic={0.1}
        />
      </div>
      
      {/* Image controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-2 rounded-full bg-black bg-opacity-50 backdrop-blur-sm z-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button 
              className="p-2 rounded-full text-white hover:bg-white hover:bg-opacity-20 transition-colors"
              onClick={zoomOut}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={zoom <= 0.5}
            >
              <FiZoomOut />
            </motion.button>
            
            <div className="px-2 text-white text-sm font-medium">
              {Math.round(zoom * 100)}%
            </div>
            
            <motion.button 
              className="p-2 rounded-full text-white hover:bg-white hover:bg-opacity-20 transition-colors"
              onClick={zoomIn}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={zoom >= 3}
            >
              <FiZoomIn />
            </motion.button>
            
            <div className="w-px h-6 bg-white bg-opacity-30 mx-1"></div>
            
            <motion.button 
              className="p-2 rounded-full text-white hover:bg-white hover:bg-opacity-20 transition-colors"
              onClick={rotateImage}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiRotateCw />
            </motion.button>
            
            <motion.button 
              className="p-2 rounded-full text-white hover:bg-white hover:bg-opacity-20 transition-colors"
              onClick={resetView}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiCheck />
            </motion.button>
            
            <motion.button 
              className="p-2 rounded-full text-white hover:bg-white hover:bg-opacity-20 transition-colors"
              onClick={toggleFullscreen}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isFullscreen ? <FiMinimize /> : <FiMaximize />}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay text with image information */}
      <motion.div 
        className="absolute top-4 left-4 bg-black bg-opacity-50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <p className="font-medium">Citra Retina</p>
        <p className="text-gray-300">Klik dan seret untuk menggeser gambar</p>
      </motion.div>
      
      {/* Error overlay */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 bg-opacity-70 z-20">
          <FiAlertTriangle className="text-yellow-400 text-4xl mb-3" />
          <p className="text-white text-center">Gambar tidak dapat ditampilkan</p>
          <button 
            onClick={() => {
              setImageError(false);
              // Force reload image with timestamp
              const img = document.querySelector('img[alt="Retina scan"]');
              if (img) {
                const imgSrc = imageSource;
                img.src = imgSrc.includes('?') 
                  ? `${imgSrc}&reload=${new Date().getTime()}`
                  : `${imgSrc}?reload=${new Date().getTime()}`;
              }
            }}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}
    </motion.div>
  );
};

// Komponen RecommendationCard yang baru
const RecommendationCard = ({ severity, result }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Helper function untuk mendapatkan rekomendasi berdasarkan tingkat keparahan
  const getRecommendation = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'tidak ada' || level === 'normal') {
      return {
        primary: 'Lakukan pemeriksaan rutin setiap tahun.',
        steps: [
          'Pertahankan gaya hidup sehat dan kontrol gula darah',
          'Lakukan pemeriksaan mata rutin setiap tahun',
          'Konsultasikan dengan dokter jika ada perubahan penglihatan'
        ],
        urgency: 'low'
      };
    } else if (level === 'ringan') {
      return {
        primary: 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.',
        steps: [
          'Kontrol gula darah dengan ketat',
          'Pertahankan tekanan darah normal',
          'Konsumsi makanan sehat dan hindari makanan tinggi gula',
          'Lakukan pemeriksaan ulang dalam 9-12 bulan'
        ],
        urgency: 'medium'
      };
    } else if (level === 'sedang') {
      return {
        primary: 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.',
        steps: [
          'Buat janji dengan dokter spesialis mata dalam 1 bulan',
          'Kontrol gula darah dengan sangat ketat',
          'Ikuti semua rekomendasi pengobatan dari dokter',
          'Lakukan pemeriksaan ulang dalam 6 bulan'
        ],
        urgency: 'medium-high'
      };
    } else if (level === 'berat') {
      return {
        primary: 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.',
        steps: [
          'Segera buat janji dengan dokter spesialis mata (dalam 2 minggu)',
          'Persiapkan kemungkinan tindakan laser atau pengobatan lain',
          'Kontrol gula darah dengan sangat ketat di bawah pengawasan dokter',
          'Lakukan pemeriksaan ulang dalam 2-3 bulan'
        ],
        urgency: 'high'
      };
    } else {
      return {
        primary: 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.',
        steps: [
          'Segera buat janji dengan dokter spesialis mata (dalam 1 minggu)',
          'Diskusikan pilihan pengobatan seperti terapi laser atau operasi',
          'Kontrol gula darah dengan sangat ketat di bawah pengawasan dokter',
          'Ikuti semua instruksi medis dengan ketat',
          'Lakukan pemeriksaan ulang sesuai jadwal yang ditentukan dokter'
        ],
        urgency: 'very-high'
      };
    }
  };

  // Helper function untuk mendapatkan warna berdasarkan urgency
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'low':
        return 'from-green-500 to-teal-500';
      case 'medium':
        return 'from-blue-500 to-indigo-500';
      case 'medium-high':
        return 'from-yellow-500 to-amber-500';
      case 'high':
        return 'from-orange-500 to-red-500';
      case 'very-high':
        return 'from-red-600 to-rose-600';
      default:
        return 'from-blue-500 to-indigo-500';
    }
  };

  // Helper function untuk mendapatkan icon berdasarkan urgency
  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'low':
        return <FiCheck className="text-white" />;
      case 'medium':
        return <FiInfo className="text-white" />;
      case 'medium-high':
        return <FiAlertCircle className="text-white" />;
      case 'high':
        return <FiAlertTriangle className="text-white" />;
      case 'very-high':
        return <FiAlertTriangle className="text-white" />;
      default:
        return <FiInfo className="text-white" />;
    }
  };

  const recommendation = getRecommendation(severity);
  const urgencyColor = getUrgencyColor(recommendation.urgency);
  const urgencyIcon = getUrgencyIcon(recommendation.urgency);

  return (
    <motion.div 
      className="mb-6 rounded-xl overflow-hidden"
      variants={itemVariants}
    >
      <h3 className="font-semibold mb-4 text-gray-700 text-lg flex items-center">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${urgencyColor} flex items-center justify-center mr-3 shadow-lg`}>
          <FiFileText className="text-white" size={20} />
        </div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 text-xl">
          Rekomendasi Tindak Lanjut
        </span>
      </h3>

      <motion.div 
        className="p-6 rounded-xl shadow-lg relative overflow-hidden"
        style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.7)' }}
        whileHover={{ 
          y: -5, 
          boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
          background: 'rgba(255, 255, 255, 0.8)'
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-b from-blue-50 to-transparent rounded-full opacity-50 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-t from-indigo-50 to-transparent rounded-full opacity-50 -ml-20 -mb-20"></div>
        
        {/* Urgency indicator */}
        <div className="flex items-center mb-4">
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${urgencyColor} text-white text-xs font-medium flex items-center`}>
            {urgencyIcon}
            <span className="ml-1">
              {recommendation.urgency === 'low' && 'Prioritas Rendah'}
              {recommendation.urgency === 'medium' && 'Prioritas Sedang'}
              {recommendation.urgency === 'medium-high' && 'Prioritas Tinggi'}
              {recommendation.urgency === 'high' && 'Prioritas Sangat Tinggi'}
              {recommendation.urgency === 'very-high' && 'URGENSI MEDIS'}
            </span>
          </div>
          <div className="ml-auto text-sm text-gray-500">
            Berdasarkan tingkat keparahan: <span className="font-medium">{severity}</span>
          </div>
        </div>
        
        {/* Primary recommendation */}
        <div className="mb-4 p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
          <p className="text-lg font-medium text-gray-800">{recommendation.primary}</p>
        </div>
        
        {/* Steps to follow */}
        <motion.div
          initial={{ height: expanded ? 'auto' : '100px' }}
          animate={{ height: expanded ? 'auto' : '100px' }}
          className="overflow-hidden relative"
        >
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            <FiChevronRight className="mr-2 text-blue-500" />
            Langkah-langkah yang Disarankan
          </h4>
          
          <ul className="space-y-2 pl-6">
            {recommendation.steps.map((step, index) => (
              <motion.li 
                key={index}
                className="flex items-start"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <div className="min-w-[24px] h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-xs font-medium text-blue-700">{index + 1}</span>
                </div>
                <span className="text-gray-700">{step}</span>
              </motion.li>
            ))}
          </ul>
          
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
          )}
        </motion.div>
        
        {/* Expand/collapse button */}
        <div className="mt-2 text-center">
          <motion.button
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center mx-auto"
            onClick={() => setExpanded(!expanded)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {expanded ? (
              <>Lihat lebih sedikit <FiChevronRight className="ml-1 transform rotate-90" /></>
            ) : (
              <>Lihat semua langkah <FiChevronRight className="ml-1 transform -rotate-90" /></>
            )}
          </motion.button>
        </div>
      </motion.div>
      
      {/* Disclaimer */}
      <motion.div 
        className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-start">
          <div className="p-1.5 rounded-full bg-amber-100 mr-3 mt-0.5">
            <FiAlertCircle className="text-amber-600 w-4 h-4" />
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-1">Disclaimer Medis</h5>
            <p className="text-sm text-gray-600">
              Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. 
              Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Komponen HelpContent yang baru
const HelpContent = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  
  const faqs = [
    {
      id: 'faq-1',
      question: 'Apa itu RetinaScan?',
      answer: 'RetinaScan adalah aplikasi berbasis kecerdasan buatan (AI) yang dirancang untuk membantu mendeteksi tanda-tanda retinopati diabetik pada gambar retina. Aplikasi ini menggunakan algoritma deep learning untuk menganalisis gambar retina dan memberikan penilaian tingkat keparahan retinopati diabetik.'
    },
    {
      id: 'faq-2',
      question: 'Bagaimana cara membaca hasil analisis?',
      answer: 'Hasil analisis menunjukkan tingkat keparahan retinopati diabetik yang terdeteksi pada gambar retina, mulai dari "Tidak Ada" hingga "Sangat Berat". Tingkat kepercayaan menunjukkan seberapa yakin sistem dalam menentukan diagnosis. Fitur yang terdeteksi menunjukkan tanda-tanda spesifik retinopati diabetik yang ditemukan pada gambar.'
    },
    {
      id: 'faq-3',
      question: 'Apakah hasil analisis RetinaScan dapat diandalkan?',
      answer: 'RetinaScan dirancang sebagai alat bantu diagnostik dan tidak menggantikan diagnosis dari dokter spesialis mata. Hasil analisis harus selalu dikonfirmasi oleh tenaga medis profesional. Tingkat kepercayaan yang ditampilkan memberikan indikasi tentang keandalan hasil analisis.'
    },
    {
      id: 'faq-4',
      question: 'Bagaimana cara mengunduh atau membagikan laporan?',
      answer: 'Anda dapat mengunduh laporan dalam format PDF dengan mengklik tombol "Unduh PDF" di bagian atas laporan. Untuk mencetak laporan, klik tombol "Cetak". Untuk membagikan laporan, klik tombol "Bagikan" dan ikuti petunjuk yang muncul.'
    },
    {
      id: 'faq-5',
      question: 'Apa yang harus dilakukan jika terdeteksi retinopati diabetik?',
      answer: 'Jika terdeteksi retinopati diabetik, ikuti rekomendasi yang diberikan dalam laporan. Secara umum, Anda harus berkonsultasi dengan dokter spesialis mata untuk evaluasi lebih lanjut dan penanganan yang tepat. Semakin tinggi tingkat keparahan, semakin cepat Anda harus mencari bantuan medis.'
    },
    {
      id: 'faq-6',
      question: 'Bagaimana cara menggunakan fitur zoom pada gambar retina?',
      answer: 'Untuk memperbesar gambar retina, arahkan kursor ke gambar dan gunakan roda mouse atau tombol zoom yang muncul. Anda juga dapat mengklik dan menyeret gambar untuk melihat area tertentu dengan lebih detail. Tombol rotasi memungkinkan Anda memutar gambar, dan tombol reset mengembalikan gambar ke tampilan awal.'
    }
  ];
  
  const resources = [
    {
      title: 'Informasi Retinopati Diabetik',
      description: 'Pelajari lebih lanjut tentang retinopati diabetik, penyebab, gejala, dan pengobatannya.',
      icon: <FiInfo className="text-blue-500" size={24} />,
      link: 'https://www.example.com/retinopathy-info'
    },
    {
      title: 'Konsultasi Online',
      description: 'Konsultasikan hasil analisis Anda dengan dokter spesialis mata secara online.',
      icon: <FiMessageSquare className="text-green-500" size={24} />,
      link: 'https://www.example.com/online-consultation'
    },
    {
      title: 'Cari Dokter Spesialis Mata',
      description: 'Temukan dokter spesialis mata terdekat di lokasi Anda.',
      icon: <FiSearch className="text-purple-500" size={24} />,
      link: 'https://www.example.com/find-doctor'
    },
    {
      title: 'Hubungi Dukungan',
      description: 'Hubungi tim dukungan kami untuk bantuan teknis atau pertanyaan tentang aplikasi.',
      icon: <FiPhone className="text-red-500" size={24} />,
      link: 'https://www.example.com/support'
    }
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FiHelpCircle className="mr-3 text-blue-500" />
          Bantuan & Informasi
        </h3>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-8">
          <p className="text-blue-700">
            Halaman ini berisi informasi untuk membantu Anda memahami laporan analisis retina dan cara menggunakan fitur-fitur aplikasi RetinaScan.
          </p>
        </div>
      </motion.div>
      
      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <h4 className="text-xl font-semibold text-gray-700 mb-4">Pertanyaan Umum</h4>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                className={`w-full text-left p-4 flex justify-between items-center ${activeQuestion === faq.id ? 'bg-blue-50' : 'bg-white'}`}
                onClick={() => setActiveQuestion(activeQuestion === faq.id ? null : faq.id)}
              >
                <span className="font-medium text-gray-800">{faq.question}</span>
                <FiChevronRight 
                  className={`transform transition-transform ${activeQuestion === faq.id ? 'rotate-90' : ''}`} 
                />
              </button>
              
              <AnimatePresence>
                {activeQuestion === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Resources Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h4 className="text-xl font-semibold text-gray-700 mb-4">Sumber Daya Tambahan</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource, index) => (
            <motion.a
              key={index}
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 rounded-lg flex items-start hover:bg-blue-50 transition-colors"
              whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (0.1 * index) }}
            >
              <div className="p-2 rounded-full bg-gray-100 mr-3">
                {resource.icon}
              </div>
              <div>
                <h5 className="font-medium text-gray-800 mb-1">{resource.title}</h5>
                <p className="text-sm text-gray-600">{resource.description}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

function Report({ result }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const reportRef = useRef(null);

  // Effect untuk menangani responsivitas
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-xl" style={glassEffect}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="text-center p-10"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
            <FiFileText className="w-10 h-10 text-white" />
          </div>
          <p className="text-gray-500 text-lg mb-2">Belum ada data analisis tersedia</p>
          <p className="text-gray-400 text-sm">Silakan unggah dan analisis gambar retina terlebih dahulu</p>
        </motion.div>
      </div>
    );
  }

  const { severity, confidence, patient } = result;

  // Helper function untuk menampilkan gambar, prioritaskan imageData jika ada
  const getImageSource = () => {
    if (!result) {
      console.warn('Result object is undefined or null');
      return '/images/default-retina.jpg';
    }
    
    // Jika ada imageData (base64), gunakan itu
    if (result.imageData && result.imageData.startsWith('data:')) {
      return result.imageData;
    }
    
    // Jika ada preview (biasanya dari component UploadImage), gunakan itu
    if (result.preview && typeof result.preview === 'string') {
      return result.preview;
    }
    
    // Jika ada image yang berisi data URL
    if (result.image && typeof result.image === 'string') {
      if (result.image.startsWith('data:')) {
        return result.image;
      }
      
      // Jika image adalah path relatif, tambahkan base URL API
      if (result.image.startsWith('/')) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${API_URL}${result.image}`;
      }
      
      // Gunakan image sebagai URL
      return result.image;
    }
    
    // Jika ada imageUrl
    if (result.imageUrl) {
      // Jika imageUrl adalah path relatif, tambahkan base URL API
      if (result.imageUrl.startsWith('/')) {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${API_URL}${result.imageUrl}`;
      }
      return result.imageUrl;
    }
    
    // Fallback ke default image jika tidak ada source yang valid
    return '/images/default-retina.jpg';
  };

  // Handler untuk error gambar
  const handleImageError = () => {
    console.error('Gagal memuat gambar retina');
    setImageError(true);
  };

  // Format date dengan validasi
  const formatDate = (date) => {
    try {
      if (!date) return new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Format date error:', error);
      return 'Tanggal tidak valid';
    }
  };

  // Format percentage dengan validasi
  const formatPercentage = (value) => {
    if (value === undefined || value === null) return '0%';
    
    try {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '0%';
      
      // Jika nilai sudah dalam persentase (misal 78 bukan 0.78)
      if (numValue > 1) {
        return numValue.toFixed(1) + '%';
      }
      return (numValue * 100).toFixed(1) + '%';
    } catch (error) {
      return '0%';
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'ringan') return 'text-green-600';
    if (level === 'sedang') return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get severity card color
  const getSeverityCardColor = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'ringan') return 'bg-green-50 border-green-200';
    if (level === 'sedang') return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  // Get severity gradient
  const getSeverityGradient = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'tidak ada' || level === 'normal') return 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)';
    if (level === 'ringan') return 'linear-gradient(135deg, #34d399 0%, #10b981 100%)';
    if (level === 'sedang') return 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
    if (level === 'berat') return 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)';
    return 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)';
  };

  // Get severity icon
  const getSeverityIcon = (severity) => {
    const level = severity.toLowerCase();
    if (level === 'tidak ada' || level === 'normal') {
      return <FiCheck className="text-blue-500" size={24} />;
    } else if (level === 'ringan') {
      return <FiInfo className="text-green-500" size={24} />;
    } else if (level === 'sedang') {
      return <FiInfo className="text-yellow-500" size={24} />;
    } else {
      return <FiAlertTriangle className="text-red-500" size={24} />;
    }
  };

  // Download PDF
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      // Pendekatan baru: Buat PDF langsung dengan jsPDF tanpa html2canvas
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      
      // Fungsi untuk menambahkan teks dengan wrapping
      const addWrappedText = (text, x, y, maxWidth, lineHeight) => {
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * lineHeight);
      };
      
      // Header
      pdf.setFillColor(37, 99, 235); // Warna biru
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255); // Warna putih untuk teks header
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('Laporan Analisis Retina', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      const currentDate = formatDate(new Date());
      pdf.text(`Tanggal: ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
      
      let yPos = 50;
      
      // Logo RetinaScan (opsional - ganti dengan path logo yang sesuai)
      // pdf.addImage('path/to/logo.png', 'PNG', margin, yPos - 15, 40, 15);
      
      // Informasi pasien jika tersedia
      if (patient) {
        pdf.setFillColor(240, 249, 255); // Warna latar belakang biru muda
        pdf.rect(margin, yPos, pageWidth - (margin * 2), 30, 'F');
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text('Informasi Pasien', margin + 5, yPos + 10);
        
        pdf.setFontSize(11);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.text(`Nama: ${patient.fullName || patient.name}`, margin + 5, yPos + 20);
        pdf.text(`Jenis Kelamin: ${patient.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, Umur: ${patient.age} tahun`, pageWidth - margin - 5, yPos + 20, { align: 'right' });
        
        yPos += 40;
      } else {
        yPos += 10;
      }
      
      // Hasil analisis
      pdf.setFillColor(245, 250, 255); // Warna latar belakang biru sangat muda
      pdf.rect(margin, yPos, pageWidth - (margin * 2), 50, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Hasil Analisis', margin + 5, yPos + 10);
      
      // Tingkat keparahan
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text('Tingkat Keparahan:', margin + 5, yPos + 25);
      
      // Set warna berdasarkan tingkat keparahan
      const severityLevel = severity.toLowerCase();
      if (severityLevel === 'ringan') {
        pdf.setTextColor(39, 174, 96); // Hijau
      } else if (severityLevel === 'sedang') {
        pdf.setTextColor(241, 196, 15); // Kuning
      } else if (severityLevel === 'berat' || severityLevel === 'sangat berat') {
        pdf.setTextColor(231, 76, 60); // Merah
      } else {
        pdf.setTextColor(52, 152, 219); // Biru
      }
      
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.text(severity, margin + 50, yPos + 25);
      
      // Tingkat kepercayaan
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Tingkat Kepercayaan: ${formatPercentage(confidence)}`, margin + 5, yPos + 40);
      
      // Gambar bar untuk confidence
      const barWidth = 50;
      const confidenceWidth = barWidth * confidence;
      pdf.setFillColor(220, 220, 220); // Background bar
      pdf.rect(margin + 80, yPos + 37, barWidth, 5, 'F');
      pdf.setFillColor(37, 99, 235); // Filled bar
      pdf.rect(margin + 80, yPos + 37, confidenceWidth, 5, 'F');
      
      yPos += 60;
      
      // Gambar
      if (result.image && typeof result.image === 'string') {
        try {
          // Tambahkan gambar jika tersedia
          const imgWidth = 100;
          const imgHeight = 100;
          pdf.addImage(result.image, 'JPEG', pageWidth / 2 - imgWidth / 2, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 10;
          
          // Tambahkan label gambar
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          pdf.text('Gambar Retina yang Dianalisis', pageWidth / 2, yPos, { align: 'center' });
          yPos += 15;
        } catch (imgError) {
          console.error('Error adding image to PDF:', imgError);
          // Lanjutkan tanpa gambar jika gagal
          yPos += 10;
        }
      }
      
      // Rekomendasi
      pdf.setFillColor(245, 250, 255); // Warna latar belakang biru sangat muda
      pdf.rect(margin, yPos, pageWidth - (margin * 2), 40, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Rekomendasi', margin + 5, yPos + 10);
      
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(60, 60, 60);
      
      let recommendation = '';
      if (severity === 'Tidak ada') {
        recommendation = 'Lakukan pemeriksaan rutin setiap tahun.';
      } else if (severity === 'Ringan') {
        recommendation = 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.';
      } else if (severity === 'Sedang') {
        recommendation = 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.';
      } else if (severity === 'Berat') {
        recommendation = 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.';
      } else if (severity === 'Sangat Berat') {
        recommendation = 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.';
      } else {
        recommendation = 'Lakukan pemeriksaan rutin setiap tahun.';
      }
      
      yPos = addWrappedText(recommendation, margin + 5, yPos + 20, pageWidth - (margin * 2) - 10, 6);
      yPos += 15;
      
      // Disclaimer
      pdf.setFillColor(245, 245, 245); // Warna latar belakang abu-abu muda
      pdf.rect(margin, yPos, pageWidth - (margin * 2), 25, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const disclaimer = 'Disclaimer: Hasil analisis ini merupakan bantuan diagnostik berbasis AI dan tidak menggantikan diagnosis dari dokter. Selalu konsultasikan dengan tenaga medis profesional untuk diagnosis dan penanganan yang tepat.';
      yPos = addWrappedText(disclaimer, margin + 5, yPos + 10, pageWidth - (margin * 2) - 10, 5);
      
      // Footer
      pdf.setFillColor(37, 99, 235); // Warna biru
      pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`RetinaScan © ${new Date().getFullYear()} | AI-Powered Retinopathy Detection`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Simpan PDF
      pdf.save('retina-analysis-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  // Handle share report
  const handleShare = async () => {
    try {
      setIsShareLoading(true);
      
      // Cek apakah Web Share API tersedia
      if (navigator.share) {
        // Buat PDF untuk dishare
        const pdf = new jsPDF('p', 'mm', 'a4');
        // Gunakan fungsi yang sama dengan handleDownload untuk membuat PDF
        
        // Simpan PDF ke Blob
        const pdfBlob = pdf.output('blob');
        
        // Buat file dari blob
        const pdfFile = new File([pdfBlob], "retina-analysis-report.pdf", { 
          type: 'application/pdf' 
        });
        
        // Share file menggunakan Web Share API
        await navigator.share({
          title: 'Laporan Analisis Retina',
          text: `Laporan analisis retina dengan tingkat keparahan: ${result.severity}`,
          files: [pdfFile]
        });
        
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        // Fallback jika Web Share API tidak tersedia
        // Gunakan clipboard API untuk menyalin teks laporan
        const reportText = `Laporan Analisis Retina\n\nTingkat Keparahan: ${result.severity}\nTingkat Kepercayaan: ${(result.confidence * 100).toFixed(1)}%\n\nRekomendasi: ${
          result.severity === 'Tidak ada' 
            ? 'Lakukan pemeriksaan rutin setiap tahun.' 
            : result.severity === 'Ringan'
            ? 'Kontrol gula darah dan tekanan darah. Pemeriksaan ulang dalam 9-12 bulan.' 
            : result.severity === 'Sedang'
            ? 'Konsultasi dengan dokter spesialis mata. Pemeriksaan ulang dalam 6 bulan.'
            : result.severity === 'Berat'
            ? 'Rujukan segera ke dokter spesialis mata. Pemeriksaan ulang dalam 2-3 bulan.'
            : result.severity === 'Sangat Berat'
            ? 'Rujukan segera ke dokter spesialis mata untuk evaluasi dan kemungkinan tindakan laser atau operasi.'
            : 'Lakukan pemeriksaan rutin setiap tahun.'
        }`;
        
        await navigator.clipboard.writeText(reportText);
        alert('Laporan telah disalin ke clipboard.');
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      alert('Gagal membagikan laporan. Silakan coba lagi.');
    } finally {
      setIsShareLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', damping: 12 }
    }
  };

  // Safely extract values with defaults
  const extractValueWithDefault = (obj, path, defaultValue) => {
    try {
      const parts = path.split('.');
      let current = obj;
      
      for (const part of parts) {
        if (current === undefined || current === null) {
          return defaultValue;
        }
        current = current[part];
      }
      
      return current !== undefined && current !== null ? current : defaultValue;
    } catch (e) {
      console.error(`Error extracting ${path}:`, e);
      return defaultValue;
    }
  };

  // Safe extraction of patient data
  const patientName = extractValueWithDefault(patient, 'fullName', extractValueWithDefault(patient, 'name', 'Tidak ada nama'));
  const patientGender = extractValueWithDefault(patient, 'gender', '');
  const patientAge = extractValueWithDefault(patient, 'age', '');
  const patientPhone = extractValueWithDefault(patient, 'phone', '-');

  // Safe extraction of result data
  const resultDate = extractValueWithDefault(result, 'createdAt', new Date().toISOString());
  const resultSeverity = extractValueWithDefault(result, 'severity', 'Tidak diketahui');
  const resultConfidence = extractValueWithDefault(result, 'confidence', 0);
  const resultNotes = extractValueWithDefault(result, 'notes', extractValueWithDefault(result, 'recommendation', 'Tidak ada catatan'));

  // JSX for Image Viewer with improved error handling
  const ImageViewer = () => (
    <RetinaImageViewer
      imageSource={getImageSource()}
      handleImageError={handleImageError}
      imageError={imageError}
      setImageError={setImageError}
    />
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      <ReportHeader
        result={result}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onShare={handleShare}
        isLoading={isLoading}
        isShareLoading={isShareLoading}
        shareSuccess={shareSuccess}
      />

      {/* Tambahkan indikator mode simulasi */}
      {result && (result.isSimulation || result.simulation_mode || 
        (result.raw_prediction && result.raw_prediction.is_simulation)) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="mb-6 text-sm flex items-start rounded-xl overflow-hidden mx-4"
          style={{ ...glassEffect, background: 'rgba(254, 240, 199, 0.7)' }}
        >
          <div className="bg-amber-500 h-full w-2"></div>
          <div className="p-5">
            <div className="flex items-start">
              <FiAlertTriangle className="w-6 h-6 mr-3 flex-shrink-0 text-amber-600" />
              <div>
                <p className="font-bold mb-2 text-base text-amber-800">PERHATIAN: Laporan dalam Mode Simulasi</p>
                <p className="mb-2 text-amber-700">Hasil analisis ini menggunakan <span className="font-bold underline">data simulasi</span> karena layanan AI tidak tersedia saat ini.</p>
                <p className="text-amber-800 font-bold">Hasil ini TIDAK BOLEH digunakan untuk diagnosis klinis. Silakan konsultasikan dengan dokter mata untuk evaluasi yang akurat.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs Navigation */}
      <ReportTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Container */}
      <motion.div
        ref={reportRef}
        className="rounded-2xl overflow-hidden shadow-2xl pdf-container mx-4 mt-4 mb-8"
        style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.9)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Tab Content with AnimatePresence for smooth transitions */}
        <AnimatePresence mode="wait">
          {activeTab === 'ringkasan' && (
            <motion.div
              key="ringkasan"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              className="p-6"
            >
              {patient && <PatientInfoCard patient={patient} />}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                {/* Summary content will go here */}
                <motion.div variants={itemVariants} className="flex flex-col space-y-6">
                  <h3 className="font-semibold mb-4 text-gray-700 text-lg flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mr-3 shadow-lg">
                      <FiEye className="text-white" size={20} />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 text-xl">
                      Citra Retina
                    </span>
                  </h3>
                  
                  <motion.div 
                    className="p-6 mb-6 rounded-xl shadow-lg relative overflow-hidden"
                    style={{ ...glassEffect, background: 'rgba(255, 255, 255, 0.7)' }}
                    variants={itemVariants}
                    whileHover={{ 
                      y: -5, 
                      boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                      background: 'rgba(255, 255, 255, 0.8)'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Decorative corner elements */}
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-indigo-300 rounded-tl-lg opacity-60"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-indigo-300 rounded-br-lg opacity-60"></div>
                    
                    {/* Image Viewer Component */}
                    <ImageViewer />
                  </motion.div>
                </motion.div>

                {/* Right Column - Analysis Results */}
                <AnalysisResultsCard
                  severity={severity}
                  confidence={confidence}
                  formatPercentage={formatPercentage}
                  getSeverityColor={getSeverityColor}
                  getSeverityGradient={getSeverityGradient}
                  getSeverityIcon={getSeverityIcon}
                  getSeverityBgColor={getSeverityBgColor}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'analisis' && (
            <motion.div
              key="analisis"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              className="p-6"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Detail Analisis Retina</h3>
              {/* Detail analysis content will go here in future updates */}
              <p className="text-gray-600">Konten detail analisis akan ditampilkan di sini.</p>
            </motion.div>
          )}

          {activeTab === 'gambar' && (
            <motion.div
              key="gambar"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              className="p-6"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Gambar Retina</h3>
              {/* Image viewer content will go here in future updates */}
              <div className="w-full h-80 rounded-xl overflow-hidden">
                <ImageViewer />
              </div>
            </motion.div>
          )}

          {activeTab === 'rekomendasi' && (
            <motion.div
              key="rekomendasi"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              className="p-6"
            >
              <RecommendationCard severity={severity} result={result} />
            </motion.div>
          )}

          {activeTab === 'bantuan' && (
            <motion.div
              key="bantuan"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              className="p-6"
            >
              <HelpContent />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer with improved design */}
      <motion.div 
        className="p-8 text-center text-white relative overflow-hidden mx-4 mt-8 mb-8 rounded-xl"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
        <div className="relative z-10">
          <p className="text-sm mb-2">
            &copy; {new Date().getFullYear()} RetinaScan | AI-Powered Retinopathy Detection
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="text-blue-100 hover:text-white transition-colors">Kebijakan Privasi</a>
            <span className="text-blue-300">|</span>
            <a href="#" className="text-blue-100 hover:text-white transition-colors">Syarat Penggunaan</a>
            <span className="text-blue-300">|</span>
            <a href="#" className="text-blue-100 hover:text-white transition-colors">Kontak</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Report;