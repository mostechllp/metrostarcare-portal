import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Users, ShieldAlert, Monitor, ArrowRight, Save, AlertCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { showToast } from "../common/Toast";
import OffboardingHeader from "./OffboardingHeader";
import { fetchOffboardingById, updateChecklist } from "../../store/slices/offboardingSlice";
import { fetchEmployeeById } from "../../store/slices/employeeSlice";

const OffboardingChecklist = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const offboardingId = searchParams.get("id");
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  
  // Redux state
  const { currentOffboarding, loading: offboardingLoading } = useSelector((state) => state.offboarding);
  const { currentEmployee } = useSelector((state) => state.employees);

  const [categories, setCategories] = useState([
    {
      id: "hr-admin",
      title: "HR & Admin",
      icon: <Users size={18} className="text-gray-500 dark:text-gray-400" />,
      tasks: [
        { id: "hr-1", label: "Resignation letter received & acknowledged", assignee: "HR", checked: false, apiField: "resignation_letter_received" },
        { id: "hr-2", label: "Notice period confirmed", assignee: "HR", checked: false, apiField: "notice_period_confirmed" },
        { id: "hr-3", label: "HR exit interview scheduled", assignee: "HR", checked: false, apiField: "exit_interview_scheduled" },
        { id: "hr-4", label: "Experience & NOC letter prepared", assignee: "HR", checked: false, apiField: "noc_letter_prepared" },
      ]
    },
    {
      id: "pro-gov",
      title: "PRO/Government",
      icon: <ShieldAlert size={18} className="text-gray-500 dark:text-gray-400" />,
      tasks: [
        { id: "pro-1", label: "Visa cancellation submitted to GDRFA", assignee: "PRO", checked: false, apiField: "visa_cancellation_submitted" },
        { id: "pro-2", label: "Labour card cancelled at MOHRE", assignee: "PRO", checked: false, apiField: "labour_card_cancelled" },
        { id: "pro-3", label: "Exit permit issued (if required)", assignee: "PRO", checked: false, apiField: "exit_permit_issued" },
        { id: "pro-4", label: "Emirates ID returned/reported to ICP", assignee: "PRO", checked: false, apiField: "emirates_id_returned" },
      ]
    },
    {
      id: "fin-it",
      title: "Finance & IT",
      icon: <Monitor size={18} className="text-gray-500 dark:text-gray-400" />,
      tasks: [
        { id: "fin-1", label: "Full & final settlement calculated", assignee: "Finance", checked: false, apiField: "settlement_calculated" },
        { id: "fin-2", label: "WPS payroll deactivated", assignee: "Finance", checked: false, apiField: "wps_deactivated" },
        { id: "fin-3", label: "System access & email revoked", assignee: "IT", checked: false, apiField: "system_access_revoked" },
        { id: "fin-4", label: "Company assets returned", assignee: "IT", checked: false, apiField: "assets_returned" },
      ]
    }
  ]);

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

  // Load checklist data from API
  useEffect(() => {
    if (currentOffboarding && !offboardingLoading) {
      // Load employee name
      if (currentOffboarding.employee_name) {
        setEmployeeName(currentOffboarding.employee_name);
      } else if (currentOffboarding.employee_id) {
        dispatch(fetchEmployeeById(currentOffboarding.employee_id));
      }
      
      // Load checklist tasks from API if available
      if (currentOffboarding.checklist_tasks) {
        const updatedCategories = categories.map(category => ({
          ...category,
          tasks: category.tasks.map(task => ({
            ...task,
            checked: currentOffboarding.checklist_tasks[task.apiField] || false
          }))
        }));
        setCategories(updatedCategories);
      }
      
      setLoading(false);
    }
  }, [currentOffboarding, offboardingLoading, dispatch]);

  // Update employee name when fetched
  useEffect(() => {
    if (currentEmployee) {
      setEmployeeName(`${currentEmployee.first_name} ${currentEmployee.last_name}`);
    }
  }, [currentEmployee]);

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

  const handleSave = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare checklist payload
      const checklistData = {
        checklist_tasks: categories.reduce((acc, category) => {
          category.tasks.forEach(task => {
            acc[task.apiField] = task.checked;
          });
          return acc;
        }, {}),
        checklist_progress: progressPercentage,
        checklist_status: progressPercentage === 100 ? "completed" : "in_progress",
        updated_at: new Date().toISOString()
      };

      // Update checklist via API
      const result = await dispatch(updateChecklist({ 
        id: offboardingId || localStorage.getItem("offboarding_id"), 
        checklistData 
      })).unwrap();

      console.log("Checklist updated:", result);

      showToast("Checklist progress saved successfully", "success");
      
      setTimeout(() => {
        navigate(`/admin/employees/asset-return?id=${offboardingId || localStorage.getItem("offboarding_id")}`);
      }, 1000);
    } catch (error) {
      console.error("Save checklist error:", error);
      showToast(error || "Failed to save checklist. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading || offboardingLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <OffboardingHeader currentStep={3} />
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading checklist...</p>
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
                  {employeeName || "Employee"} checklist
                </p>
                {currentOffboarding && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Offboarding ID: {currentOffboarding.id}
                  </p>
                )}
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
            {categories.map((category) => {
              const categoryCompleted = category.tasks.filter(t => t.checked).length;
              const categoryTotal = category.tasks.length;
              const categoryProgress = Math.round((categoryCompleted / categoryTotal) * 100);
              
              return (
                <section key={category.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-2">
                      {category.icon}
                      {category.title}
                    </h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {categoryCompleted}/{categoryTotal} tasks
                    </span>
                  </div>
                  
                  {/* Category Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 dark:bg-blue-600 transition-all duration-500 ease-out" 
                      style={{ width: `${categoryProgress}%` }}
                    ></div>
                  </div>
                  
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
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={() => navigate("/admin/employees/offboarding")}
              className="px-6 py-2.5 rounded-full font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full font-semibold bg-green-500 text-white hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save checklist
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OffboardingChecklist;