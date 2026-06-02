import React, { useState } from "react";
import { FileText, CheckCircle, Clock, Check, Download } from "lucide-react";
import { showToast } from "../components/common/Toast";
import { useNavigate } from "react-router-dom";
import OffboardingHeader from "../components/offboarding/OffboardingHeader";

const documentsData = [
  {
    id: 1,
    title: "No Objection Certificate (NOC)",
    description: "Required for new UAE employer",
    status: "Pending",
  },
  {
    id: 2,
    title: "Experience letter",
    description: "Confirms tenure & role",
    status: "Pending",
  },
  {
    id: 3,
    title: "Salary certificate",
    description: "Last 3 months - generated 20 jun 2026",
    status: "Ready",
  },
  {
    id: 4,
    title: "Visa cancellation letter",
    description: "Official letter for new employer",
    status: "Pending",
  },
  {
    id: 5,
    title: "Immigration status letter",
    description: "Confirms legal status - generated",
    status: "Ready",
  },
];

const LettersAndClearance = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState(documentsData);
  const [isGenerating, setIsGenerating] = useState(false);

  const pendingCount = documents.filter((doc) => doc.status === "Pending").length;

  const handleGenerateAll = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setDocuments(documents.map(doc => ({ ...doc, status: "Ready" })));
      setIsGenerating(false);
      showToast("All documents generated successfully", "success");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* SaaS Offboarding Header */}
        <OffboardingHeader currentStep={7} />

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-6 sm:p-8">
          {/* Header Title with Badge */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              Letters & clearance - Khalid
              {pendingCount > 0 && (
                <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60 rounded text-xs font-bold uppercase tracking-wider">
                  {pendingCount} pending
                </span>
              )}
            </h1>
          </div>

          {/* Document List */}
          <div className="space-y-4 mb-8">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <FileText className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {doc.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      doc.status === "Ready"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {doc.status === "Ready" ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {doc.status}
                  </span>
                  {doc.status === "Ready" && (
                    <button className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleGenerateAll}
              disabled={isGenerating || pendingCount === 0}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all flex items-center justify-center gap-2 ${
                pendingCount === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : pendingCount === 0 ? (
                <>
                  <Check className="w-4 h-4" />
                  All Generated
                </>
              ) : (
                "Generate all letters"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LettersAndClearance;
