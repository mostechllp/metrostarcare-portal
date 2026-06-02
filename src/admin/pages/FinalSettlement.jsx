import React from "react";
import { Info, Check, X, Calculator, ArrowRight, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/common/Toast";
import OffboardingHeader from "../components/offboarding/OffboardingHeader";

const FinalSettlement = () => {
  const navigate = useNavigate();

  const handleApprove = () => {
    showToast("Final settlement approved successfully", "success");
    setTimeout(() => {
      navigate("/admin/employees/letters-and-clearance");
    }, 1500);
  };

  const handleReject = () => {
    showToast("Settlement rejected and sent for revision", "error");
  };

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
                Khalid Al Mansouri
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 rounded-lg text-xs font-bold tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Pending finance
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
                  <div className="text-xl font-black text-gray-900 dark:text-white">3 yrs 4 mo</div>
                </div>

                <div className="flex flex-col items-center justify-center text-center px-4 pt-4 sm:pt-0">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Basic salary (AED)</span>
                  <div className="text-xl font-black text-gray-900 dark:text-white font-mono">8,000</div>
                </div>

                <div className="flex flex-col items-center justify-center text-center px-4 pt-4 sm:pt-0">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Gratuity (AED)</span>
                  <div className="text-xl font-black text-green-600 dark:text-green-400 font-mono">18,667</div>
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
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">Pending salary (June 1-30)</td>
                    <td className="p-4 text-right font-mono font-medium">AED 8,000</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">Housing allowance (June)</td>
                    <td className="p-4 text-right font-mono font-medium">AED 2,500</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">Transport allowance (June)</td>
                    <td className="p-4 text-right font-mono font-medium">AED 500</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">Gratuity</td>
                    <td className="p-4 text-right font-mono font-medium">AED 18,667</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">Leave encashment (8 days)</td>
                    <td className="p-4 text-right font-mono font-medium">AED 2,133</td>
                  </tr>
                  <tr className="hover:bg-red-50/30 dark:hover:bg-red-900/10">
                    <td className="p-4 font-medium text-red-600 dark:text-red-400">Deductions-loan recovery</td>
                    <td className="p-4 text-right font-mono font-medium text-red-600 dark:text-red-400">- AED 3,000</td>
                  </tr>
                  <tr className="hover:bg-red-50/30 dark:hover:bg-red-900/10">
                    <td className="p-4 font-medium text-red-600 dark:text-red-400">Deductions-notice shortfall</td>
                    <td className="p-4 text-right font-mono font-medium text-red-600 dark:text-red-400">- AED 0</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-t-2 border-gray-200 dark:border-gray-700">
                    <td className="p-5 font-black text-gray-900 dark:text-white uppercase tracking-wider">Net payable</td>
                    <td className="p-5 text-right font-mono font-black text-lg text-green-600 dark:text-green-400">AED 28,800</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={handleReject}
              className="px-6 py-2.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
            >
              <X size={18} />
              Reject/revise
            </button>
            <button
              onClick={handleApprove}
              className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Check size={18} />
              Approve settlement
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FinalSettlement;
