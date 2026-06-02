import React, { useState } from "react";
import { Laptop, AlertTriangle, Check, ArrowRight, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/common/Toast";
import OffboardingHeader from "../components/offboarding/OffboardingHeader";

const AssetReturn = () => {
  const navigate = useNavigate();

  const [assets, setAssets] = useState([
    { id: "AST-2011", name: "Laptop (HP EliteBook)", issuedOn: "10 Jan 2024", status: "Returned", condition: "Good" },
    { id: "AST-2045", name: "Access card", issuedOn: "10 Jan 2024", status: "Returned", condition: "Good" },
    { id: "AST-2089", name: "Mobile (iPhone 14)", issuedOn: "05 Mar 2025", status: "Pending", condition: "" },
    { id: "AST-2102", name: "Parking access fob", issuedOn: "05 Mar 2025", status: "Pending", condition: "" },
  ]);

  const [selectedAssets, setSelectedAssets] = useState([]);

  const pendingCount = assets.filter(a => a.status === "Pending").length;

  const toggleSelection = (id) => {
    setSelectedAssets(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleMarkAsReturned = () => {
    if (selectedAssets.length === 0) {
      showToast("Please select at least one pending asset", "error");
      return;
    }
    
    setAssets(assets.map(asset => 
      selectedAssets.includes(asset.id) && asset.status === "Pending"
        ? { ...asset, status: "Returned", condition: "Good" }
        : asset
    ));
    setSelectedAssets([]);
    showToast("Assets marked as returned successfully", "success");
  };

  const handleReportDamage = () => {
    if (selectedAssets.length === 0) {
      showToast("Please select at least one asset", "error");
      return;
    }
    showToast("Damage report initiated for selected assets", "info");
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* SaaS Offboarding Header */}
        <OffboardingHeader currentStep={4} />

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-6 sm:p-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Asset return
              </h1>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
                Khalid Al Mansouri
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider flex items-center gap-1.5 ${pendingCount > 0 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60' : 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border border-green-200/60 dark:border-green-900/60'}`}>
                {pendingCount > 0 ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                ) : (
                  <Check size={12} />
                )}
                {pendingCount} pending
              </span>
            </div>
          </div>

          {/* Asset Table */}
          <div className="overflow-hidden border border-gray-200/60 dark:border-gray-700/60 rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200/60 dark:border-gray-700/60 text-xs uppercase font-bold text-gray-500 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="p-4 w-12 text-center">
                      <div className="flex items-center justify-center">
                        #
                      </div>
                    </th>
                    <th scope="col" className="p-4">Asset</th>
                    <th scope="col" className="p-4">Asset ID</th>
                    <th scope="col" className="p-4">Issued on</th>
                    <th scope="col" className="p-4">Status</th>
                    <th scope="col" className="p-4">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
                  {assets.map((asset) => (
                    <tr 
                      key={asset.id} 
                      className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors ${selectedAssets.includes(asset.id) ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(asset.id)}
                          onChange={() => toggleSelection(asset.id)}
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                      <td className="p-4 font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Laptop size={16} className="text-gray-400" />
                        {asset.name}
                      </td>
                      <td className="p-4 font-mono text-xs">{asset.id}</td>
                      <td className="p-4">{asset.issuedOn}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1 ${asset.status === 'Returned' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-medium">
                        {asset.condition || <span className="text-gray-400 dark:text-gray-600">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <button
                onClick={handleReportDamage}
                className="px-5 py-2.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle size={18} />
                Report damage
              </button>
              
              <button
                onClick={handleMarkAsReturned}
                className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <Check size={18} />
                Mark as returned
              </button>
            </div>
            
            <button
              onClick={() => navigate("/admin/employees/exit-interview")}
              className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md ml-auto"
            >
              Proceed to Exit Interview
              <ArrowRight size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AssetReturn;
