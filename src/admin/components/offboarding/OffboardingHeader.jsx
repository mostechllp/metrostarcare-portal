import React from "react";
import { ArrowLeft, User, Briefcase, CheckCircle2, MoreHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { id: 1, label: "Initiation", path: "/admin/employees/offboarding-initiation" },
  { id: 2, label: "Visa Cancel", path: "/admin/employees/visa-cancellation" },
  { id: 3, label: "Checklist", path: "/admin/employees/offboarding-checklist" },
  { id: 4, label: "Assets", path: "/admin/employees/asset-return" },
  { id: 5, label: "Interview", path: "/admin/employees/exit-interview" },
  { id: 6, label: "Settlement", path: "/admin/employees/final-settlement" },
  { id: 7, label: "Letters", path: "/admin/employees/letters-and-clearance" },
];

const OffboardingHeader = ({ currentStep, employeeName = "Khalid Al Mansouri", employeeId = "EMP-0088", role = "Operations Manager" }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 px-6 py-6 sm:px-8 rounded-2xl shadow-soft">
      {/* Top Bar: Back Button & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/admin/employees")}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 font-bold text-lg">
              {employeeName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                {employeeName}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 mt-0.5">
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {role}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {employeeId}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-white dark:bg-gray-800 text-amber-500 border border-amber-200 dark:border-amber-900/60 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Offboarding Active
          </span>
          <button className="p-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-400 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="relative pt-1">
        {/* The connecting line - positioned precisely behind the centers of the circles */}
        <div className="absolute top-[15px] left-[35px] right-[35px] h-[2px] bg-gray-100 dark:bg-gray-700 z-0 hidden sm:block"></div>
        
        <div className="relative z-10 flex items-start justify-between overflow-x-auto pb-2 sm:pb-0 hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {STEPS.map((step) => {
            const isCurrent = step.id === currentStep;

            return (
              <div 
                key={step.id} 
                onClick={() => navigate(step.path)}
                className="flex flex-col items-center gap-2 cursor-pointer min-w-[70px] group transition-opacity"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm bg-white dark:bg-gray-800 border-2 transition-colors relative z-10 ${
                  isCurrent 
                    ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500 shadow-sm ring-4 ring-blue-50 dark:ring-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 text-gray-300 dark:text-gray-500 group-hover:border-gray-300"
                }`}>
                  {step.id}
                </div>
                <span className={`text-[11px] sm:text-[11px] font-bold text-center whitespace-nowrap mt-1 ${
                  isCurrent 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-300 dark:text-gray-500 group-hover:text-gray-400"
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}} />
      </div>
    </div>
  );
};

export default OffboardingHeader;
