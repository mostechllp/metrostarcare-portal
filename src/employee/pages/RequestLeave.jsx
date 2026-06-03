import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addLeaveRequest, fetchEmployeeLeaves, fetchLeaveBalance } from '../store/slices/leavesSlice';
import { FiChevronRight, FiCalendar, FiTag, FiMessageSquare, FiPaperclip, FiSend, FiX, FiAlertCircle } from 'react-icons/fi';
import { MdCalculate } from 'react-icons/md';
import apiClient from '../../utils/apiClient';

const RequestLeave = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const leavesState = useSelector((state) => state.EmpLeaves);
  
  // Add safety defaults
  const leaveBalances = leavesState?.leaveBalances || {};
  const submitting = leavesState?.submitting || false;
  const error = leavesState?.error || null;
  
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    leaveType: 'Annual Leave',
    reason: '',
    claimSalary: 'Yes',
  });
  const [totalDays, setTotalDays] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localError, setLocalError] = useState('');
  
  // Fetch leaves and balance on mount
  useEffect(() => {
    const fetchData = async () => {
      await dispatch(fetchEmployeeLeaves());
      await dispatch(fetchLeaveBalance());
    };
    fetchData();
  }, [dispatch]);

  // Add this temporary debug function in your component
const debugBackendBalance = async () => {
  try {
    const response = await apiClient.get("/employee/leave-balance");
    console.log("Backend leave balance check:", response.data);
  } catch (error) {
    console.error("Backend balance check error:", error);
  }
};

// Call it in useEffect
useEffect(() => {
  debugBackendBalance();
}, []);
  
  // Calculate days when dates change
  useEffect(() => {
    calculateDays();
  }, [formData.fromDate, formData.toDate]);
  
  const calculateDays = () => {
    if (formData.fromDate && formData.toDate) {
      const from = new Date(formData.fromDate);
      const to = new Date(formData.toDate);
      if (to >= from) {
        const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
        setTotalDays(days);
      } else {
        setTotalDays(0);
      }
    } else {
      setTotalDays(0);
    }
  };
  
  const validateForm = () => {
    if (!formData.fromDate) {
      setLocalError('Please select from date');
      return false;
    }
    if (!formData.toDate) {
      setLocalError('Please select to date');
      return false;
    }
    if (totalDays <= 0) {
      setLocalError('Please select valid dates (to date must be after from date)');
      return false;
    }
    if (formData.reason.length < 10) {
      setLocalError('Please provide a reason (minimum 10 characters)');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!validateForm()) {
      return;
    }
    
    // Check if exceeds balance
    const selectedLeaveBalance = getLeaveBalanceForType(formData.leaveType);
    if (totalDays > selectedLeaveBalance.remaining && selectedLeaveBalance.remaining >= 0) {
      setLocalError(`Requested days (${totalDays}) exceed available balance (${selectedLeaveBalance.remaining} days)`);
      return;
    }
    
    const formDataToSend = {
      leaveType: formData.leaveType,
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      reason: formData.reason,
      claimSalary: formData.claimSalary,
      document: selectedFile
    };
    
    const result = await dispatch(addLeaveRequest(formDataToSend));
    
    if (addLeaveRequest.fulfilled.match(result)) {
      await dispatch(fetchEmployeeLeaves());
      await dispatch(fetchLeaveBalance());
      navigate('/employee/leaves');
    }
  };
  
  // Helper function to get leave balance for a specific type
  const getLeaveBalanceForType = (leaveTypeName) => {
    // First check if we have the specific leave type in the balances
    if (leaveBalances && leaveBalances[leaveTypeName]) {
      return leaveBalances[leaveTypeName];
    }
    
    // If not found, return total balance as fallback
    return leaveBalances.total || { allocated: 0, taken: 0, pending: 0, remaining: 0 };
  };
  
  // Get the current leave type balance
  const currentLeaveBalance = getLeaveBalanceForType(formData.leaveType);
  
  // Get total balance from the store
  const totalBalance = leaveBalances.total || { allocated: 0, taken: 0, pending: 0, remaining: 0 };
  
  const remaining = currentLeaveBalance?.remaining ?? 0;
  const usedLeaves = currentLeaveBalance?.taken ?? 0;
  const pendingLeaves = currentLeaveBalance?.pending ?? 0;
  const allocatedLeaves = currentLeaveBalance?.allocated ?? 0;
  
  // Check if requested days exceed balance
  const exceedsBalance = totalDays > remaining && remaining >= 0;
  
  // Log for debugging
  useEffect(() => {
    console.log("Leave Balances from store:", leaveBalances);
    console.log("Current leave type:", formData.leaveType);
    console.log("Current balance:", currentLeaveBalance);
  }, [leaveBalances, formData.leaveType, currentLeaveBalance]);
  
  return (
    <div className="p-4 md:p-6">
      {/* Breadcrumbs */}
      <div className="breadcrumbs flex items-center gap-2 text-sm mb-6 flex-wrap">
        <Link to="/employee/dashboard" className="text-green-500 hover:underline">Dashboard</Link>
        <FiChevronRight className="text-xs text-gray-400" />
        <Link to="/employee/leaves" className="text-green-500 hover:underline">My Leaves</Link>
        <FiChevronRight className="text-xs text-gray-400" />
        <span className="text-gray-500">Request Leave</span>
      </div>
      
      <div className="page-header mb-7">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-green-600 bg-clip-text text-transparent flex items-center gap-2">
          <FiCalendar /> Leave Application Form
        </h2>
      </div>
      
      {/* Error Display */}
      {(localError || error) && (
        <div className="error-message mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-3 text-red-600">
          <FiAlertCircle className="text-xl" />
          <span className="text-sm">{localError || error}</span>
        </div>
      )}
      
      <div className="split-container grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-7">
        {/* Form */}
        <div className="form-container bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="form-section-title text-lg font-bold text-green-600 mb-6 pb-3 border-b-2 border-green-100 flex items-center gap-2.5">
              <FiTag /> Leave Details
            </div>
            <div className="form-grid grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <div className="form-field flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <FiCalendar className="text-green-500" /> From Date <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fromDate}
                  onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                />
              </div>
              <div className="form-field flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <FiCalendar className="text-green-500" /> To Date <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  value={formData.toDate}
                  onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                  min={formData.fromDate || new Date().toISOString().split('T')[0]}
                  className="py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                />
              </div>
              <div className="form-field flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <FiTag className="text-green-500" /> Leave Type <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Paternity Leave">Paternity Leave</option>
                </select>
              </div>
              <div className="form-field flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <FiCalendar className="text-green-500" /> Claim Salary
                </label>
                <select
                  value={formData.claimSalary}
                  onChange={(e) => setFormData({ ...formData, claimSalary: e.target.value })}
                  className="py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="form-field flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <MdCalculate className="text-green-500" /> Total Days
                </label>
                <div className={`total-days-box p-3 rounded-lg text-center ${exceedsBalance ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                  <span className={`text-2xl md:text-3xl font-extrabold ${exceedsBalance ? 'text-red-600' : 'text-green-600'} block`}>
                    {totalDays}
                  </span>
                  <small className="text-[11px] text-gray-500">Days</small>
                </div>
              </div>
              <div className="form-field flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <FiPaperclip className="text-green-500" /> Supporting Document (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  className="py-2.5 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-500 file:text-white file:cursor-pointer hover:file:bg-green-600"
                />
              </div>
              <div className="form-field md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <FiMessageSquare className="text-green-500" /> Reason for Leave <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows="4"
                  placeholder="Please describe your reason for requesting leave (min 10 characters)..."
                  className="py-3 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                  required
                />
                <small className={`text-[11px] ${formData.reason.length >= 10 ? 'text-green-500' : 'text-red-500'}`}>
                  {formData.reason.length}/10 characters minimum
                </small>
              </div>
            </div>
            
            {exceedsBalance && (
              <div className="warning-message mb-6 p-3 bg-amber-500/10 border border-amber-500 rounded-lg text-amber-600 text-sm">
                ⚠️ Warning: Requested days ({totalDays}) exceed available balance ({remaining} days)
              </div>
            )}
            
            <div className="form-actions flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <Link to="/employee/leaves" className="cancel-btn py-3 px-7 rounded-full font-semibold text-center bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                <FiX /> Cancel
              </Link>
              <button 
                type="submit" 
                disabled={submitting || exceedsBalance}
                className="submit-btn py-3 px-8 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiSend /> Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Balance Card */}
        <div className="balance-card bg-white border border-gray-200 rounded-xl p-6 shadow-sm sticky top-24">
          <div className="balance-header text-center pb-5 border-b border-gray-200 mb-5">
            <h3 className="text-lg font-bold text-gray-800">Leave Balance</h3>
            <p className="text-xs text-gray-500 mt-1">Current allocation for {new Date().getFullYear()}</p>
          </div>
          
          <div className="balance-remaining text-center mb-6">
            <div className={`remaining-number text-4xl md:text-5xl font-extrabold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {remaining}
            </div>
            <div className="remaining-label text-xs text-gray-500 mt-2">Days Remaining</div>
          </div>
          
          <div className="balance-stats flex gap-4 mb-6">
            <div className="balance-stat flex-1 text-center p-3 bg-gray-50 rounded-lg">
              <div className="stat-value text-xl font-bold text-gray-800">{allocatedLeaves}</div>
              <div className="stat-label text-[10px] text-gray-500 mt-1">Allocated</div>
            </div>
            <div className="balance-stat flex-1 text-center p-3 bg-gray-50 rounded-lg">
              <div className="stat-value text-xl font-bold text-gray-800">{usedLeaves}</div>
              <div className="stat-label text-[10px] text-gray-500 mt-1">Used</div>
            </div>
            <div className="balance-stat flex-1 text-center p-3 bg-gray-50 rounded-lg">
              <div className="stat-value text-xl font-bold text-gray-800">{pendingLeaves}</div>
              <div className="stat-label text-[10px] text-gray-500 mt-1">Pending</div>
            </div>
          </div>
          
          <div className="leave-type-list mt-5">
            <div className="leave-type-item flex justify-between items-center py-3 border-b border-gray-200">
              <span className="leave-type-name text-xs font-medium text-gray-600 flex items-center gap-2">
                <FiCalendar className="text-green-500" />
                {formData.leaveType}
              </span>
              <span className="leave-type-days text-sm font-bold text-gray-800">
                {remaining}
              </span>
            </div>
          </div>
          
          <div className="info-note mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600">
              <FiAlertCircle className="inline mr-1" /> 
              Leave requests require approval from HR/Admin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestLeave;