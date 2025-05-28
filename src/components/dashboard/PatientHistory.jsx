import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiAlertTriangle, FiList, FiActivity, FiEye, FiDownload, FiUserPlus, FiSearch, FiTrash2, FiFilter, FiChevronDown, FiCheck, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getPatientHistory, deleteAnalysis } from '../../services/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ConfirmationModal from '../common/ConfirmationModal';
import { getSeverityBadge } from '../../utils/severityUtils';

// ... existing code ... 