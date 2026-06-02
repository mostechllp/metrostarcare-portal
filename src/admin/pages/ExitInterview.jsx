import React from "react";
import { Calendar, Save, CheckCircle2, MessageSquare, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/common/Toast";
import OffboardingHeader from "../components/offboarding/OffboardingHeader";

const ExitInterview = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast("Exit interview submitted successfully", "success");
    setTimeout(() => {
      navigate("/admin/employees/final-settlement");
    }, 1500);
  };

  const handleSaveDraft = () => {
    showToast("Exit interview saved as draft", "info");
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* SaaS Offboarding Header */}
        <OffboardingHeader currentStep={5} />

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-6 sm:p-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                <MessageSquare size={24} />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Exit interview form
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                <Calendar size={14} />
                Scheduled - 25 Jun 2026
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              
              {/* Interview Details Section (Left/Top) */}
              <div className="space-y-6 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Interviewer
                  </label>
                  <input
                    type="text"
                    defaultValue="Fatima Al Zaabi (HR)"
                    readOnly
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Interview date
                  </label>
                  <input
                    type="text"
                    defaultValue="25 Jun 2026"
                    readOnly
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Interview mode
                  </label>
                  <input
                    type="text"
                    defaultValue="In person"
                    readOnly
                    className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
                  />
                </div>
              </div>

              {/* Core Feedback Section */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Overall satisfaction
                </label>
                <select className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20">
                  <option value="Satisfied" selected>Satisfied</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Dissatisfied">Dissatisfied</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Primary reason for leaving
                </label>
                <select className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20">
                  <option value="Better opportunity" selected>Better opportunity</option>
                  <option value="Relocation">Relocation</option>
                  <option value="Career change">Career change</option>
                  <option value="Personal reasons">Personal reasons</option>
                </select>
              </div>

              {/* Ratings */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Work-life balance rating (Out of 5)
                </label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none">
                    <option value="4" selected>4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Terrible</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-0.5 text-amber-400">
                    <Star size={14} className="fill-amber-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Manager relationship rating (Out of 5)
                </label>
                <div className="relative">
                  <select className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 appearance-none">
                    <option value="5" selected>5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Terrible</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-0.5 text-amber-400">
                    <Star size={14} className="fill-amber-400" />
                  </div>
                </div>
              </div>

              {/* Free Text Answers */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  What did you enjoy most?
                </label>
                <textarea
                  rows={2}
                  defaultValue="Collaborative team, flexible hours, and a strong learning culture."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                ></textarea>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Areas for improvement
                </label>
                <textarea
                  rows={2}
                  defaultValue="Career growth paths and promotion timelines could be clearer."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 font-semibold focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                ></textarea>
              </div>

              {/* Recommendation */}
              <div className="space-y-2 md:col-span-2 pb-4 border-b border-gray-100 dark:border-gray-700">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Would you recommend us?
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="recommend" value="yes" defaultChecked className="w-4 h-4 text-green-600 focus:ring-green-500" />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="recommend" value="no" className="w-4 h-4 text-green-600 focus:ring-green-500" />
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">No</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-2.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Save draft
              </button>
              
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <CheckCircle2 size={18} />
                Submit interview
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};

export default ExitInterview;
