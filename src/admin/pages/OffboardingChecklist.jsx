import React, { useState } from "react";
import { CheckCircle2, Circle, Users, ShieldAlert, Monitor, ArrowRight, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/common/Toast";
import OffboardingHeader from "../components/offboarding/OffboardingHeader";

const OffboardingChecklist = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([
    {
      id: "hr-admin",
      title: "HR & Admin",
      icon: <Users size={18} className="text-gray-500 dark:text-gray-400" />,
      tasks: [
        { id: "hr-1", label: "Resignation letter received & acknowledged", assignee: "HR", checked: true },
        { id: "hr-2", label: "Notice period confirmed", assignee: "HR", checked: true },
        { id: "hr-3", label: "HR exit interview scheduled", assignee: "HR", checked: true },
        { id: "hr-4", label: "Experience & NOC letter prepared", assignee: "HR", checked: false },
      ]
    },
    {
      id: "pro-gov",
      title: "PRO/Government",
      icon: <ShieldAlert size={18} className="text-gray-500 dark:text-gray-400" />,
      tasks: [
        { id: "pro-1", label: "Visa cancellation submitted to GDRFA", assignee: "PRO", checked: true },
        { id: "pro-2", label: "Labour card cancelled at MOHRE", assignee: "PRO", checked: true },
        { id: "pro-3", label: "Exit permit issued (if required)", assignee: "PRO", checked: false },
        { id: "pro-4", label: "Emirates ID returned/reported to ICP", assignee: "PRID", checked: false },
      ]
    },
    {
      id: "fin-it",
      title: "Finance & IT",
      icon: <Monitor size={18} className="text-gray-500 dark:text-gray-400" />,
      tasks: [
        { id: "fin-1", label: "Full & final settlement calculated", assignee: "Finance", checked: true },
        { id: "fin-2", label: "WPS payroll deactivated", assignee: "Finance", checked: false },
        { id: "fin-3", label: "System access & email revoked", assignee: "IT", checked: false },
        { id: "fin-4", label: "Company assets returned", assignee: null, checked: false },
      ]
    }
  ]);

  // Calculate progress
  const allTasks = categories.flatMap(cat => cat.tasks);
  const completedTasks = allTasks.filter(task => task.checked).length;
  const totalTasks = allTasks.length;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  const toggleTask = (categoryId, taskId) => {
    setCategories(categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          tasks: cat.tasks.map(task => 
            task.id === taskId ? { ...task, checked: !task.checked } : task
          )
        };
      }
      return cat;
    }));
  };

  const handleSave = () => {
    showToast("Checklist progress saved successfully", "success");
    setTimeout(() => {
      navigate("/admin/employees/asset-return");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* SaaS Offboarding Header */}
        <OffboardingHeader currentStep={3} />

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-6 sm:p-8 space-y-8">
          
          {/* Header Title with Progress Summary */}
          <div className="space-y-4 border-b border-gray-100 dark:border-gray-700 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Offboarding checklist
                </h1>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1">
                  Khalid Al Mansouri checklist
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold tracking-wider">
                  {completedTasks} of {totalTasks} done
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-500 dark:text-gray-400 uppercase tracking-wide">Overall progress</span>
                <span className="text-green-600 dark:text-green-400">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 dark:bg-green-600 transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Checklist Sections */}
          <div className="space-y-6">
            {categories.map((category) => (
              <section key={category.id} className="space-y-4">
                <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                  {category.icon}
                  {category.title}
                </h2>
                
                <div className="border border-gray-100 dark:border-gray-700/50 rounded-xl divide-y divide-gray-100 dark:divide-gray-700/50 bg-white dark:bg-gray-800">
                  {category.tasks.map((task) => (
                    <div 
                      key={task.id} 
                      className={`flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/80 cursor-pointer ${task.checked ? 'bg-gray-50/50 dark:bg-gray-800/40' : ''}`}
                      onClick={() => toggleTask(category.id, task.id)}
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
                      
                      {task.assignee && (
                        <div className="flex items-center gap-2 pl-4">
                          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs font-bold tracking-wide">
                            {task.assignee}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Footer Action */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-2.5 rounded-full font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Save checklist
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OffboardingChecklist;
