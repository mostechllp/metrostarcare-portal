import React from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { id: 1, label: "Initiation", subtitle: "Start Process", path: "/admin/employees/offboarding-initiation" },
  { id: 2, label: "Visa Cancel", subtitle: "Visa Processing", path: "/admin/employees/visa-cancellation" },
  { id: 3, label: "Checklist", subtitle: "Verification", path: "/admin/employees/offboarding-checklist" },
  { id: 4, label: "Assets", subtitle: "Asset Return", path: "/admin/employees/asset-return" },
  { id: 5, label: "Interview", subtitle: "Exit Session", path: "/admin/employees/exit-interview" },
  { id: 6, label: "Settlement", subtitle: "Final Payment", path: "/admin/employees/final-settlement" },
  { id: 7, label: "Letters", subtitle: "Clearance", path: "/admin/employees/letters-and-clearance" },
];

const OffboardingHeader = ({ currentStep }) => {
  const navigate = useNavigate();

  const canNavigateToStep = (stepId) => {
    // Can navigate to current step, previous steps, or next step only
    return stepId <= currentStep + 1;
  };

  const handleStepClick = (stepId) => {
    if (canNavigateToStep(stepId)) {
      navigate(STEPS[stepId - 1].path);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 px-6 py-6 sm:px-8 rounded-2xl shadow-soft">
      {/* Top Bar: Back Button */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/admin/employees")}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            Offboarding Process
          </h2>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between w-full">
        {STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Item */}
            <div 
              className="flex flex-col items-center relative z-10"
              onClick={() => handleStepClick(step.id)}
              style={{ cursor: canNavigateToStep(step.id) ? 'pointer' : 'not-allowed' }}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  currentStep > step.id
                    ? "bg-green-600 border-green-600 text-white shadow-sm shadow-green-500/20"
                    : currentStep === step.id
                    ? "bg-white dark:bg-gray-800 border-green-600 text-green-600 ring-4 ring-green-50 dark:ring-green-950/30"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400"
                } ${canNavigateToStep(step.id) ? 'hover:scale-105 hover:shadow-md' : 'opacity-60'}`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 size={20} strokeWidth={2} />
                ) : (
                  <span className="font-bold">{step.id}</span>
                )}
              </div>
              
              <div className="mt-3 text-center">
                <p className={`text-sm font-semibold transition-colors ${
                  currentStep >= step.id ? "text-gray-900 dark:text-white" : "text-gray-400"
                }`}>
                  {step.label}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                  {step.subtitle}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 -mt-10 bg-gray-100 dark:bg-gray-700">
                <div 
                  className="h-full bg-green-600 transition-all duration-500 ease-in-out" 
                  style={{ width: currentStep > step.id ? "100%" : "0%" }}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default OffboardingHeader;