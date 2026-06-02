import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Circle, ShieldAlert, ArrowRight, Save, Info, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/common/Toast";
import OffboardingHeader from "../components/offboarding/OffboardingHeader";

const VisaCancellationAndExit = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([
    { id: "task-1", label: "Submit visa cancellation to GDRFA/ICP", assignee: "PRO", checked: true },
    { id: "task-2", label: "Cancel labour card at MOHRE", assignee: "PRO", checked: true },
    { id: "task-3", label: "Issue exit permit (if applicable)", assignee: "PRO", checked: false },
    { id: "task-4", label: "Return Emirates ID to ICP (or report lost)", assignee: "HR", checked: false },
    { id: "task-5", label: "Cancel WPS (payroll) registration", assignee: "Finance", checked: false },
    { id: "task-6", label: "ILOE (unemployment insurance) closure", assignee: "HR", checked: false },
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, checked: !task.checked } : task
    ));
  };

  const handleUpdateStatus = () => {
    showToast("Visa status updated successfully", "success");
    setTimeout(() => {
      navigate("/admin/employees/offboarding-checklist");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* SaaS Offboarding Header */}
        <OffboardingHeader currentStep={2} />

        {/* Warning Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3 shadow-sm">
          <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400">Important Legal Notice</h3>
            <p className="text-sm text-amber-700 dark:text-amber-500 mt-1 font-medium">
              UAE law requires employer to cancel the work visa within 30 days of last working day. Failure may result in fines.
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-6 sm:p-8 space-y-8">
          
          {/* Header Title with Action Required Badge */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Visa cancellation & exit
            </h1>
            <span className="px-3 py-1 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/60 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              Action required
            </span>
          </div>

          {/* VISA & RESIDENCY STATUS Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={16} />
              Visa & Residency Status
            </h2>
            
            <div className="bg-gray-50/50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-xl p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                
                {/* Data Fields */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Emirates ID number</span>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">784-1991-1234567-1</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Emirates ID expiry</span>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">15 Aug 2027</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Visa number</span>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">201/2024/1234567</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Visa expiry</span>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">20 Jul 2026</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Labour card number</span>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100 font-mono">MOL-2024-98765</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Visa type</span>
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">Employment visa</div>
                </div>
                
              </div>
            </div>
          </section>

          {/* CANCELLATION TASKS Section */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 size={16} />
              Cancellation Tasks
            </h2>
            
            <div className="border border-gray-100 dark:border-gray-700/50 rounded-xl divide-y divide-gray-100 dark:divide-gray-700/50 bg-white dark:bg-gray-800">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/80 cursor-pointer ${task.checked ? 'bg-gray-50/50 dark:bg-gray-800/40' : ''}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      className={`flex-shrink-0 transition-colors ${task.checked ? 'text-green-500' : 'text-gray-300 dark:text-gray-600 hover:text-green-500/50'}`}
                    >
                      {task.checked ? <CheckCircle2 size={20} className="fill-green-50 dark:fill-green-950/20" /> : <Circle size={20} />}
                    </button>
                    <span className={`text-sm font-medium transition-colors ${task.checked ? 'text-gray-500 dark:text-gray-400 line-through decoration-gray-300 dark:decoration-gray-600' : 'text-gray-900 dark:text-gray-100'}`}>
                      {task.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 pl-4">
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-bold tracking-wide">
                      {task.assignee}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Action */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button
              onClick={handleUpdateStatus}
              className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              Update visa status
              <ArrowRight size={18} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VisaCancellationAndExit;
