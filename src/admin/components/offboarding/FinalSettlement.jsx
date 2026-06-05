import React, { useState, useEffect } from "react";
import { Info, Check, X, Calculator, ArrowRight, DollarSign, Loader } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../common/Toast";
import OffboardingHeader from "./OffboardingHeader";
import { fetchOffboardingById, updateSettlement } from "../../store/slices/offboardingSlice";
import { fetchEmployeeById } from "../../store/slices/employeeSlice";

const FinalSettlement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const offboardingId = searchParams.get("id");
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [settlementData, setSettlementData] = useState({
    yearsOfService: 0,
    monthsOfService: 0,
    basicSalary: 0,
    gratuity: 0,
    pendingSalary: 0,
    housingAllowance: 0,
    transportAllowance: 0,
    leaveEncashment: 0,
    loanRecovery: 0,
    noticeShortfall: 0,
    otherDeductions: 0,
    otherAdditions: 0,
    netPayable: 0,
    status: "pending",
    approvedBy: null,
    approvedAt: null
  });
  
  // Redux state
  const { currentOffboarding, loading: offboardingLoading } = useSelector((state) => state.offboarding);
  const { currentEmployee } = useSelector((state) => state.employees);

  // Fetch offboarding details on component mount
  useEffect(() => {
    if (offboardingId) {
      dispatch(fetchOffboardingById(offboardingId));
    } else {
      const storedOffboardingId = localStorage.getItem("offboarding_id");
      if (storedOffboardingId) {
        dispatch(fetchOffboardingById(storedOffboardingId));
      } else {
        setLoading(false);
        showToast("No offboarding session found. Please start from initiation.", "warning");
      }
    }
  }, [dispatch, offboardingId]);

  // Load settlement data from API
  useEffect(() => {
    if (currentOffboarding && !offboardingLoading) {
      // Load employee name
      if (currentOffboarding.employee_name) {
        setEmployeeName(currentOffboarding.employee_name);
      } else if (currentOffboarding.employee_id) {
        dispatch(fetchEmployeeById(currentOffboarding.employee_id));
      }
      
      // Load settlement data from API if available
      if (currentOffboarding.settlement) {
        setSettlementData({
          yearsOfService: currentOffboarding.settlement.years_of_service || 0,
          monthsOfService: currentOffboarding.settlement.months_of_service || 0,
          basicSalary: currentOffboarding.settlement.basic_salary || 0,
          gratuity: currentOffboarding.settlement.gratuity || 0,
          pendingSalary: currentOffboarding.settlement.pending_salary || 0,
          housingAllowance: currentOffboarding.settlement.housing_allowance || 0,
          transportAllowance: currentOffboarding.settlement.transport_allowance || 0,
          leaveEncashment: currentOffboarding.settlement.leave_encashment || 0,
          loanRecovery: currentOffboarding.settlement.loan_recovery || 0,
          noticeShortfall: currentOffboarding.settlement.notice_shortfall || 0,
          otherDeductions: currentOffboarding.settlement.other_deductions || 0,
          otherAdditions: currentOffboarding.settlement.other_additions || 0,
          netPayable: currentOffboarding.settlement.net_payable || 0,
          status: currentOffboarding.settlement.status || "pending",
          approvedBy: currentOffboarding.settlement.approved_by || null,
          approvedAt: currentOffboarding.settlement.approved_at || null
        });
      } else {
        // Calculate settlement based on employee data
        calculateSettlement(currentOffboarding);
      }
      
      setLoading(false);
    }
  }, [currentOffboarding, offboardingLoading, dispatch]);

  // Update employee name when fetched
  useEffect(() => {
    if (currentEmployee) {
      setEmployeeName(`${currentEmployee.first_name} ${currentEmployee.last_name}`);
      
      // If we have employee data but no settlement, calculate
      if (currentOffboarding && !currentOffboarding.settlement) {
        calculateSettlement(currentOffboarding);
      }
    }
  }, [currentEmployee, currentOffboarding]);

  // Calculate settlement based on employee data
  const calculateSettlement = (offboarding) => {
    // Get basic salary from employee data or offboarding data
    const basicSalary = offboarding.basic_salary || 8000;
    const joiningDate = offboarding.joining_date || "2021-02-15";
    const lastWorkingDay = offboarding.last_working_day || new Date().toISOString().split('T')[0];
    
    // Calculate years of service
    const join = new Date(joiningDate);
    const end = new Date(lastWorkingDay);
    let years = end.getFullYear() - join.getFullYear();
    let months = end.getMonth() - join.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    
    // Calculate gratuity based on UAE labor law
    let gratuity = 0;
    if (years >= 1 && years <= 5) {
      // 21 days per year for first 5 years
      gratuity = (basicSalary / 30) * 21 * years;
      // Add remaining months
      if (months > 0) {
        gratuity += (basicSalary / 30) * 21 * (months / 12);
      }
    } else if (years > 5) {
      // First 5 years: 21 days per year
      gratuity = (basicSalary / 30) * 21 * 5;
      // Remaining years: 30 days per year
      const remainingYears = years - 5;
      gratuity += (basicSalary / 30) * 30 * remainingYears;
      // Add remaining months
      if (months > 0) {
        gratuity += (basicSalary / 30) * 30 * (months / 12);
      }
    }
    
    // Calculate pending salary (assuming last month)
    const pendingSalary = basicSalary;
    
    // Calculate allowances
    const housingAllowance = basicSalary * 0.25;
    const transportAllowance = basicSalary * 0.1;
    
    // Calculate leave encashment (assuming 8 days unused leave)
    const leaveEncashment = (basicSalary / 30) * 8;
    
    // Calculate net payable
    const totalEarnings = pendingSalary + housingAllowance + transportAllowance + gratuity + leaveEncashment;
    const totalDeductions = 0; // Add deductions if any
    const netPayable = totalEarnings - totalDeductions;
    
    setSettlementData({
      yearsOfService: years,
      monthsOfService: months,
      basicSalary: basicSalary,
      gratuity: Math.round(gratuity),
      pendingSalary: pendingSalary,
      housingAllowance: Math.round(housingAllowance),
      transportAllowance: Math.round(transportAllowance),
      leaveEncashment: Math.round(leaveEncashment),
      loanRecovery: 0,
      noticeShortfall: 0,
      otherDeductions: 0,
      otherAdditions: 0,
      netPayable: Math.round(netPayable),
      status: "pending",
      approvedBy: null,
      approvedAt: null
    });
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare settlement payload
      const settlementPayload = {
        settlement: {
          years_of_service: settlementData.yearsOfService,
          months_of_service: settlementData.monthsOfService,
          basic_salary: settlementData.basicSalary,
          gratuity: settlementData.gratuity,
          pending_salary: settlementData.pendingSalary,
          housing_allowance: settlementData.housingAllowance,
          transport_allowance: settlementData.transportAllowance,
          leave_encashment: settlementData.leaveEncashment,
          loan_recovery: settlementData.loanRecovery,
          notice_shortfall: settlementData.noticeShortfall,
          other_deductions: settlementData.otherDeductions,
          other_additions: settlementData.otherAdditions,
          net_payable: settlementData.netPayable,
          status: "approved",
          approved_by: "admin",
          approved_at: new Date().toISOString()
        }
      };

      // Update settlement via API
      const result = await dispatch(updateSettlement({ 
        id: offboardingId || localStorage.getItem("offboarding_id"), 
        settlementData: settlementPayload 
      })).unwrap();

      console.log("Settlement approved:", result);
;

      showToast("Final settlement approved successfully", "success");
      
      setTimeout(() => {
        navigate(`/admin/employees/letters-and-clearance?id=${offboardingId || localStorage.getItem("offboarding_id")}`);
      }, 1500);
    } catch (error) {
      console.error("Approve settlement error:", error);
      showToast(error || "Failed to approve settlement. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare rejection payload
      const rejectionPayload = {
        settlement: {
          ...settlementData,
          status: "rejected",
          rejected_at: new Date().toISOString(),
          rejection_notes: "Settlement needs revision"
        }
      };

      // Update settlement status via API
      await dispatch(updateSettlement({ 
        id: offboardingId || localStorage.getItem("offboarding_id"), 
        settlementData: rejectionPayload 
      })).unwrap();

      showToast("Settlement rejected and sent for revision", "info");
    } catch (error) {
      console.error("Reject settlement error:", error);
      showToast(error || "Failed to reject settlement. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `AED ${amount.toLocaleString()}`;
  };

  // Loading state
  if (loading || offboardingLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <OffboardingHeader currentStep={6} />
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading settlement details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* SaaS Offboarding Header */}
        <OffboardingHeader currentStep={6} />

        {/* Info Banner */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm">
          <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-400">Gratuity Guidelines</h3>
            <p className="text-sm text-blue-700 dark:text-blue-500 mt-1 font-medium">
              UAE gratuity: 21 days basic salary per year for first 5 years; 30 days per year thereafter. Prorated for partial years.
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-6 sm:p-8 space-y-8">
          
          {/* Header Title with Subtitle and Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                F&F settlement
              </h1>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
                {employeeName || "Employee"}
              </p>
              {currentOffboarding && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Offboarding ID: {currentOffboarding.id}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider flex items-center gap-1.5 ${
                settlementData.status === "approved" 
                  ? "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200/60 dark:border-green-900/60"
                  : settlementData.status === "rejected"
                  ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/60"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60"
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                {settlementData.status === "approved" ? "Approved" : settlementData.status === "rejected" ? "Rejected" : "Pending finance"}
              </span>
            </div>
          </div>

          {/* Gratuity Calculation Highlight Card */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Calculator size={16} />
              Gratuity Calculation
            </h2>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 dark:divide-gray-700">
                
                <div className="flex flex-col items-center justify-center text-center px-4 pt-4 sm:pt-0 first:pt-0">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Years of service</span>
                  <div className="text-xl font-black text-gray-900 dark:text-white">
                    {settlementData.yearsOfService} yrs {settlementData.monthsOfService} mo
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center text-center px-4 pt-4 sm:pt-0">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Basic salary (AED)</span>
                  <div className="text-xl font-black text-gray-900 dark:text-white font-mono">
                    {formatCurrency(settlementData.basicSalary)}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center text-center px-4 pt-4 sm:pt-0">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Gratuity (AED)</span>
                  <div className="text-xl font-black text-green-600 dark:text-green-400 font-mono">
                    {formatCurrency(settlementData.gratuity)}
                  </div>
                </div>
                
              </div>
            </div>
          </section>

          {/* Settlement Breakdown Table */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={16} />
              Settlement Breakdown
            </h2>
            
            <div className="border border-gray-100 dark:border-gray-700/50 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">Pending salary</td>
                    <td className="p-4 text-right font-mono font-medium">{formatCurrency(settlementData.pendingSalary)}</td>
                   </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">Housing allowance</td>
                    <td className="p-4 text-right font-mono font-medium">{formatCurrency(settlementData.housingAllowance)}</td>
                   </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">Transport allowance</td>
                    <td className="p-4 text-right font-mono font-medium">{formatCurrency(settlementData.transportAllowance)}</td>
                   </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">Gratuity</td>
                    <td className="p-4 text-right font-mono font-medium">{formatCurrency(settlementData.gratuity)}</td>
                   </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">Leave encashment</td>
                    <td className="p-4 text-right font-mono font-medium">{formatCurrency(settlementData.leaveEncashment)}</td>
                   </tr>
                  
                  {/* Deductions */}
                  {(settlementData.loanRecovery > 0 || settlementData.noticeShortfall > 0 || settlementData.otherDeductions > 0) && (
                    <>
                      <tr className="bg-red-50/30 dark:bg-red-900/10">
                        <td className="p-4 font-medium text-red-600 dark:text-red-400">Deductions - Loan recovery</td>
                        <td className="p-4 text-right font-mono font-medium text-red-600 dark:text-red-400">
                          - {formatCurrency(settlementData.loanRecovery)}
                        </td>
                       </tr>
                      <tr className="bg-red-50/30 dark:bg-red-900/10">
                        <td className="p-4 font-medium text-red-600 dark:text-red-400">Deductions - Notice shortfall</td>
                        <td className="p-4 text-right font-mono font-medium text-red-600 dark:text-red-400">
                          - {formatCurrency(settlementData.noticeShortfall)}
                        </td>
                       </tr>
                      <tr className="bg-red-50/30 dark:bg-red-900/10">
                        <td className="p-4 font-medium text-red-600 dark:text-red-400">Deductions - Other</td>
                        <td className="p-4 text-right font-mono font-medium text-red-600 dark:text-red-400">
                          - {formatCurrency(settlementData.otherDeductions)}
                        </td>
                       </tr>
                    </>
                  )}
                  
                  {/* Additions */}
                  {settlementData.otherAdditions > 0 && (
                    <tr className="bg-green-50/30 dark:bg-green-900/10">
                      <td className="p-4 font-medium text-green-600 dark:text-green-400">Other additions</td>
                      <td className="p-4 text-right font-mono font-medium text-green-600 dark:text-green-400">
                        + {formatCurrency(settlementData.otherAdditions)}
                      </td>
                     </tr>
                  )}
                  
                  {/* Net Payable */}
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-t-2 border-gray-200 dark:border-gray-700">
                    <td className="p-5 font-black text-gray-900 dark:text-white uppercase tracking-wider">Net payable</td>
                    <td className="p-5 text-right font-mono font-black text-lg text-green-600 dark:text-green-400">
                      {formatCurrency(settlementData.netPayable)}
                    </td>
                   </tr>
                </tbody>
               </table>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={handleReject}
              disabled={isSubmitting || settlementData.status === "approved"}
              className="px-6 py-2.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={18} />
              Reject/revise
            </button>
            <button
              onClick={handleApprove}
              disabled={isSubmitting || settlementData.status === "approved"}
              className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Approve settlement
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FinalSettlement;